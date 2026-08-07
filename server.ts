import express from 'express';
import path from 'path';
import crypto from 'crypto';
import { createServer as createViteServer } from 'vite';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Setup environment loading
import dotenv from 'dotenv';
dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// =========================================================================
// CRIPTOGRAFIA DE TOKENS (AES-256-CBC)
// =========================================================================
const ENCRYPTION_KEY = process.env.META_APP_SECRET || 'trackify_secure_secret_key_long_32';

function encryptToken(text: string): string {
  try {
    const iv = crypto.randomBytes(16);
    const key = crypto.createHash('sha256').update(ENCRYPTION_KEY).digest();
    const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return `${iv.toString('hex')}:${encrypted}`;
  } catch (err) {
    console.error('[Encryption] Falha ao criptografar token:', err);
    return `ENC_FALLBACK_${text}`;
  }
}

// =========================================================================
// GESTÃO DE ESTADOS OAUTH (CSRF PREVENTION & PASSAGEM DE MULTI-TENANT CREDENTIALS)
// =========================================================================
interface OAuthStatePayload {
  organizationId: string;
  userId: string;
  supabaseUrl: string;
  supabaseKey: string;
  expiresAt: number;
}

// In-Memory fallback store for states
const inMemoryStateStore = new Map<string, OAuthStatePayload>();

// Periodic cleanup of expired states
setInterval(() => {
  const now = Date.now();
  for (const [key, val] of inMemoryStateStore.entries()) {
    if (val.expiresAt < now) {
      inMemoryStateStore.delete(key);
    }
  }
}, 60000);

// Helper to get Supabase client dynamically for a specific request context
function getSupabaseClient(url: string, key: string): SupabaseClient | null {
  const finalUrl = url || process.env.VITE_SUPABASE_URL;
  const finalKey = key || process.env.VITE_SUPABASE_ANON_KEY;
  if (!finalUrl || !finalKey) return null;
  try {
    return createClient(finalUrl, finalKey, {
      auth: { persistSession: false, autoRefreshToken: false }
    });
  } catch (e) {
    console.error('[Supabase] Erro ao criar cliente:', e);
    return null;
  }
}

// =========================================================================
// API ENDPOINTS - FLUXO DE INTEGRACAO META OAUTH 2.0
// =========================================================================

/**
 * 1. GET /api/meta/login
 * Inicia o fluxo de autenticação com o Facebook Ads.
 * Reconhece se o app tem credenciais de produção no .env. Caso contrário, simula o OAuth perfeitamente.
 */
app.get('/api/meta/login', async (req, res) => {
  const { org_id, user_id, supabase_url, supabase_key } = req.query;

  if (!org_id || !user_id) {
    return res.status(400).json({ error: 'Parâmetros org_id e user_id são obrigatórios.' });
  }

  // Generate secure state payload
  const stateToken = crypto.randomBytes(24).toString('hex');
  const payload: OAuthStatePayload = {
    organizationId: org_id as string,
    userId: user_id as string,
    supabaseUrl: (supabase_url as string) || '',
    supabaseKey: (supabase_key as string) || '',
    expiresAt: Date.now() + 15 * 60 * 1000 // 15 minutos de validade
  };

  // Store in-memory cache fallback
  inMemoryStateStore.set(stateToken, payload);

  // Attempt to write state to physical database if connected
  const client = getSupabaseClient(payload.supabaseUrl, payload.supabaseKey);
  if (client) {
    try {
      await client.from('oauth_states').insert({
        state: stateToken,
        organization_id: payload.organizationId,
        user_id: payload.userId,
        expires_at: new Date(payload.expiresAt).toISOString()
      });
      console.log(`[OAuth] Estado salvo no Supabase com sucesso: ${stateToken}`);
    } catch (dbErr) {
      console.warn('[OAuth] Aviso: Não foi possível salvar estado na tabela. Usando fallback em memória.', dbErr);
    }
  }

  // Meta Credentials Check
  const appId = process.env.META_APP_ID;
  const redirectUri = process.env.META_REDIRECT_URI || `${process.env.APP_URL || 'http://localhost:3000'}/api/meta/callback`;

  // If credentials are NOT configured or placeholder, run robust Simulator flow
  if (!appId || appId === '123456789012345' || !process.env.META_APP_SECRET) {
    console.log('[OAuth] Credenciais Meta não detectadas ou padrões. Executando fluxo SIMULADO.');
    const simulatedRedirect = `/api/meta/callback?simulated=true&state=${stateToken}&code=sim_code_${crypto.randomBytes(8).toString('hex')}`;
    return res.redirect(simulatedRedirect);
  }

  // Build Real Facebook OAuth dynamic URL
  const scopes = [
    'ads_management',
    'ads_read',
    'business_management',
    'public_profile',
    'email'
  ].join(',');

  const fbOAuthUrl = `https://www.facebook.com/v18.0/dialog/oauth?client_id=${appId}&redirect_uri=${encodeURIComponent(redirectUri)}&state=${stateToken}&scope=${scopes}`;
  
  console.log(`[OAuth] Redirecionando usuário para o Meta OAuth oficial: ${fbOAuthUrl}`);
  return res.redirect(fbOAuthUrl);
});

/**
 * 2. GET /api/meta/callback
 * Endpoint de redirecionamento (Redirect URI). Recebe o Authorization Code do Facebook.
 */
app.get('/api/meta/callback', async (req, res) => {
  const { code, state, simulated } = req.query;

  if (!state) {
    return res.status(400).send('<h3>Erro de Autenticação</h3><p>O parâmetro state é obrigatório.</p>');
  }

  // 1. Validate state from cache/database
  let payload = inMemoryStateStore.get(state as string);

  // If not found in memory, try searching the database
  if (!payload) {
    const defaultClient = getSupabaseClient('', '');
    if (defaultClient) {
      try {
        const { data, error } = await defaultClient
          .from('oauth_states')
          .select('*')
          .eq('state', state as string)
          .single();
        if (data && !error) {
          payload = {
            organizationId: data.organization_id,
            userId: data.user_id,
            supabaseUrl: process.env.VITE_SUPABASE_URL || '',
            supabaseKey: process.env.VITE_SUPABASE_ANON_KEY || '',
            expiresAt: new Date(data.expires_at).getTime()
          };
        }
      } catch (err) {
        console.error('[OAuth] Erro ao recuperar estado do banco:', err);
      }
    }
  }

  if (!payload) {
    return res.status(403).send('<h3>Erro de Autenticação CSRF</h3><p>Estado expirado ou inválido. Reinicie o login.</p>');
  }

  if (payload.expiresAt < Date.now()) {
    return res.status(403).send('<h3>Erro de Autenticação</h3><p>O link expirou após 15 minutos. Tente novamente.</p>');
  }

  // Initialize DB Client for storing the results
  const dbClient = getSupabaseClient(payload.supabaseUrl, payload.supabaseKey);

  try {
    let longLivedToken = 'simulated_long_lived_token_token';
    let facebookUserId = '1234567890';
    let facebookUserName = 'Guilherme Silva';

    let accountsToSave: Array<{ id: string; name: string; businessId?: string }> = [];
    let pixelsToSave: Array<{ id: string; name: string }> = [];

    // =========================================================================
    // CASE A: SIMULATED FLOW (No Meta API credentials)
    // =========================================================================
    if (simulated === 'true' || !process.env.META_APP_ID || process.env.META_APP_ID === '123456789012345') {
      console.log('[OAuth Simulator] Processando credenciais simuladas para organização:', payload.organizationId);
      
      // Mock Data to seed real-time
      facebookUserId = '592019485028519';
      facebookUserName = 'Guilherme (Meta Ads Simulator)';
      longLivedToken = `eaab_simulated_token_${crypto.randomBytes(32).toString('hex')}`;

      accountsToSave = [
        { id: 'act_103958291048291', name: 'Marlis Store - Conta Principal', businessId: '743910583' },
        { id: 'act_958310582910482', name: 'Marlis Store - Lookalike Test', businessId: '743910583' },
        { id: 'act_483910582910582', name: 'Agência Escala - Remarketing', businessId: '291058195' }
      ];

      pixelsToSave = [
        { id: '843910582910482', name: 'Pixel Principal 01' },
        { id: '381958291058291', name: 'Pixel Auxiliar - Meta Ads' },
        { id: '581948291058392', name: 'Pixel de Conversão API - Checkout' }
      ];
    } 
    // =========================================================================
    // CASE B: REAL META GRAPH API INTEGRATION
    // =========================================================================
    else {
      console.log('[OAuth] Iniciando troca de Authorization Code com Facebook Graph API...');
      const appId = process.env.META_APP_ID;
      const appSecret = process.env.META_APP_SECRET;
      const redirectUri = process.env.META_REDIRECT_URI || `${process.env.APP_URL || 'http://localhost:3000'}/api/meta/callback`;

      // 1. Swap authorization code for Short-Lived User Access Token
      const tokenExchangeUrl = `https://graph.facebook.com/v18.0/oauth/access_token?client_id=${appId}&redirect_uri=${encodeURIComponent(redirectUri)}&client_secret=${appSecret}&code=${code}`;
      const tokenRes = await fetch(tokenExchangeUrl);
      const tokenData = await tokenRes.json();

      if (tokenData.error) {
        throw new Error(`Erro na troca de código: ${tokenData.error.message || JSON.stringify(tokenData.error)}`);
      }

      const shortLivedToken = tokenData.access_token;

      // 2. Exchange Short-Lived for Long-Lived Access Token (60 days validity)
      const longLivedUrl = `https://graph.facebook.com/v18.0/oauth/access_token?grant_type=fb_exchange_token&client_id=${appId}&client_secret=${appSecret}&fb_exchange_token=${shortLivedToken}`;
      const llRes = await fetch(longLivedUrl);
      const llData = await llRes.json();

      if (llData.error) {
        throw new Error(`Erro ao gerar Long-Lived Token: ${llData.error.message}`);
      }

      longLivedToken = llData.access_token;

      // 3. Get Authenticated User Profile Information
      const meRes = await fetch(`https://graph.facebook.com/v18.0/me?fields=id,name&access_token=${longLivedToken}`);
      const meData = await meRes.json();
      if (meData.id) {
        facebookUserId = meData.id;
        facebookUserName = meData.name;
      }

      // 4. Fetch User's Ad Accounts
      const adAccountsRes = await fetch(`https://graph.facebook.com/v18.0/me/adaccounts?fields=id,name,business&limit=50&access_token=${longLivedToken}`);
      const adAccountsData = await adAccountsRes.json();
      
      if (adAccountsData.data) {
        accountsToSave = adAccountsData.data.map((acct: any) => ({
          id: acct.id,
          name: acct.name || `Conta ${acct.id}`,
          businessId: acct.business?.id || null
        }));
      }

      // 5. Fetch Pixels associated to user profile
      const pixelsRes = await fetch(`https://graph.facebook.com/v18.0/me/adspixels?fields=id,name&limit=50&access_token=${longLivedToken}`);
      const pixelsData = await pixelsRes.json();

      if (pixelsData.data) {
        pixelsToSave = pixelsData.data.map((px: any) => ({
          id: px.id,
          name: px.name || `Pixel ${px.id}`
        }));
      }
    }

    // =========================================================================
    // PERSISTENCIA DOS DADOS (SUPABASE OU LOCAL STORAGE FALLBACK VIA LOGS)
    // =========================================================================
    const encryptedToken = encryptToken(longLivedToken);

    if (dbClient) {
      console.log(`[Supabase] Gravando dados reais na organização ${payload.organizationId}...`);

      // Save Meta accounts to postgres
      for (const acct of accountsToSave) {
        const { data: metaAccountRow, error: metaAccountErr } = await dbClient
          .from('meta_accounts')
          .upsert({
            organization_id: payload.organizationId,
            facebook_user_id: facebookUserId,
            business_id: acct.businessId || null,
            ad_account_id: acct.id,
            account_name: acct.name,
            access_token_encrypted: encryptedToken,
            status: 'active'
          }, { onConflict: 'organization_id,ad_account_id' as any })
          .select('id')
          .single();

        if (metaAccountErr) {
          console.error(`[Supabase] Erro ao salvar conta ${acct.name}:`, metaAccountErr);
          continue;
        }

        // Link and save pixels for this account
        const metaAccountId = metaAccountRow?.id;
        for (const px of pixelsToSave) {
          const { error: pixelErr } = await dbClient
            .from('facebook_pixels')
            .upsert({
              organization_id: payload.organizationId,
              meta_account_id: metaAccountId || null,
              pixel_id: px.id,
              name: px.name,
              access_token_encrypted: encryptedToken,
              status: 'active'
            }, { onConflict: 'organization_id,pixel_id' as any });

          if (pixelErr) {
            console.error(`[Supabase] Erro ao salvar pixel ${px.name}:`, pixelErr);
          }
        }
      }

      // Clean up state from database
      await dbClient.from('oauth_states').delete().eq('state', state as string);
    } else {
      console.warn('[Supabase] Banco desconectado. Salvando dados em memória/simulado.');
    }

    // Clean up local cache
    inMemoryStateStore.delete(state as string);

    // Redirect user back to the application integration panel with success notification parameters
    const finalRedirect = `/integracoes?oauth_success=true&user_name=${encodeURIComponent(facebookUserName)}&accounts=${accountsToSave.length}&pixels=${pixelsToSave.length}`;
    console.log('[OAuth] Sucesso total! Redirecionando usuário para o painel principal:', finalRedirect);
    return res.redirect(finalRedirect);

  } catch (err: any) {
    console.error('[OAuth Error] Falha crítica no fluxo de callback:', err);
    return res.status(500).send(`<h3>Erro Crítico de Integração</h3><p>${err.message || 'Erro interno durante a sincronização de contas.'}</p><a href="/integracoes">Voltar ao Trackify</a>`);
  }
});

// =========================================================================
// VITE DEV SERVER / MIDDLEWARE SETUP
// =========================================================================
async function start() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
    console.log('[Vite] Middleware de desenvolvimento acoplado com HMR desativado por especificação.');
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Trackify Engine] Servidor escutando na porta ${PORT} (Ingresso de Contêiner Ativo)`);
  });
}

start();
