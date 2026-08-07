import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Pixel, Integration, WebhookLog, Purchase } from '../types';
import { mockPixels, mockIntegrations, mockWebhookLogs, mockPurchases } from '../mockData';

// Constants for LocalStorage keys
const STORAGE_PIXELS = 'trackify_local_pixels';
const STORAGE_INTEGRATIONS = 'trackify_local_integrations';
const STORAGE_WEBHOOK_LOGS = 'trackify_local_webhooks';
const STORAGE_ORDERS = 'trackify_local_orders';
const STORAGE_CONN_URL = 'trackify_supabase_url';
const STORAGE_CONN_KEY = 'trackify_supabase_anon_key';

export interface SupabaseConfig {
  url: string;
  anonKey: string;
}

// Global Supabase client instance holder
let supabaseClientInstance: SupabaseClient | null = null;

// Initialize Supabase if credentials are provided in env or localStorage
export function initSupabase(): SupabaseClient | null {
  const envUrl = (import.meta as any).env?.VITE_SUPABASE_URL;
  const envKey = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY;
  
  const savedUrl = localStorage.getItem(STORAGE_CONN_URL);
  const savedKey = localStorage.getItem(STORAGE_CONN_KEY);
  
  const url = savedUrl || envUrl || '';
  const anonKey = savedKey || envKey || '';
  
  if (url && anonKey) {
    try {
      supabaseClientInstance = createClient(url, anonKey, {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
        }
      });
      return supabaseClientInstance;
    } catch (e) {
      console.error('Falha ao inicializar Supabase Client:', e);
      supabaseClientInstance = null;
    }
  } else {
    supabaseClientInstance = null;
  }
  return supabaseClientInstance;
}

// Get active client instance
export function getSupabaseClient(): SupabaseClient | null {
  if (!supabaseClientInstance) {
    return initSupabase();
  }
  return supabaseClientInstance;
}

// Check if live Supabase database is connected
export function isSupabaseConnected(): boolean {
  return getSupabaseClient() !== null;
}

// Get current connection configuration details
export function getConnectionConfig(): SupabaseConfig {
  return {
    url: localStorage.getItem(STORAGE_CONN_URL) || (import.meta as any).env?.VITE_SUPABASE_URL || '',
    anonKey: localStorage.getItem(STORAGE_CONN_KEY) || (import.meta as any).env?.VITE_SUPABASE_ANON_KEY || ''
  };
}

// Save connection credentials and re-initialize
export function saveConnectionConfig(url: string, anonKey: string): boolean {
  if (!url || !anonKey) {
    localStorage.removeItem(STORAGE_CONN_URL);
    localStorage.removeItem(STORAGE_CONN_KEY);
    supabaseClientInstance = null;
    return false;
  }
  localStorage.setItem(STORAGE_CONN_URL, url.trim());
  localStorage.setItem(STORAGE_CONN_KEY, anonKey.trim());
  return initSupabase() !== null;
}

// Clear connection credentials
export function clearConnectionConfig() {
  localStorage.removeItem(STORAGE_CONN_URL);
  localStorage.removeItem(STORAGE_CONN_KEY);
  supabaseClientInstance = null;
}

// Ensure local storage has seed data if empty
function ensureLocalSeed() {
  if (!localStorage.getItem(STORAGE_PIXELS)) {
    localStorage.setItem(STORAGE_PIXELS, JSON.stringify(mockPixels));
  }
  if (!localStorage.getItem(STORAGE_INTEGRATIONS)) {
    localStorage.setItem(STORAGE_INTEGRATIONS, JSON.stringify(mockIntegrations));
  }
  if (!localStorage.getItem(STORAGE_WEBHOOK_LOGS)) {
    localStorage.setItem(STORAGE_WEBHOOK_LOGS, JSON.stringify(mockWebhookLogs));
  }
  if (!localStorage.getItem(STORAGE_ORDERS)) {
    localStorage.setItem(STORAGE_ORDERS, JSON.stringify(mockPurchases));
  }
}

// Fallback Local Storage Data Accessors
export const localDb = {
  getPixels(): Pixel[] {
    ensureLocalSeed();
    return JSON.parse(localStorage.getItem(STORAGE_PIXELS) || '[]');
  },
  savePixels(pixels: Pixel[]) {
    localStorage.setItem(STORAGE_PIXELS, JSON.stringify(pixels));
  },
  getIntegrations(): Integration[] {
    ensureLocalSeed();
    return JSON.parse(localStorage.getItem(STORAGE_INTEGRATIONS) || '[]');
  },
  saveIntegrations(integrations: Integration[]) {
    localStorage.setItem(STORAGE_INTEGRATIONS, JSON.stringify(integrations));
  },
  getWebhookLogs(): WebhookLog[] {
    ensureLocalSeed();
    return JSON.parse(localStorage.getItem(STORAGE_WEBHOOK_LOGS) || '[]');
  },
  saveWebhookLogs(logs: WebhookLog[]) {
    localStorage.setItem(STORAGE_WEBHOOK_LOGS, JSON.stringify(logs));
  },
  getOrders(): Purchase[] {
    ensureLocalSeed();
    return JSON.parse(localStorage.getItem(STORAGE_ORDERS) || '[]');
  },
  saveOrders(orders: Purchase[]) {
    localStorage.setItem(STORAGE_ORDERS, JSON.stringify(orders));
  }
};

// =========================================================================
// UNIFIED DATA SERVICE (MAPPED TO SUPABASE TABLES OR LOCAL FALLBACK)
// =========================================================================

export const dataService = {
  // 1. PIXELS
  async getPixels(): Promise<Pixel[]> {
    const client = getSupabaseClient();
    if (client) {
      try {
        const { data, error } = await client
          .from('facebook_pixels')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) throw error;
        
        if (data && data.length > 0) {
          return data.map(item => ({
            id: item.pixel_id,
            name: item.name || 'Pixel de Vendas',
            status: item.status === 'active' ? 'active' : 'inactive',
            eventsCount: Math.floor(Math.random() * 2000) + 100, // Dynamic placeholder count for preview
            lastActive: 'há poucos instantes'
          }));
        }
      } catch (e) {
        console.warn('Erro ao obter pixels do Supabase, usando local storage:', e);
      }
    }
    return localDb.getPixels();
  },

  async savePixel(pixel: Pixel): Promise<void> {
    const client = getSupabaseClient();
    if (client) {
      try {
        // Find organization to link (defaults to the mock seed org id)
        const orgId = '4ca02198-5bf4-4d22-a440-1eea8ada9931';
        const { error } = await client
          .from('facebook_pixels')
          .insert({
            organization_id: orgId,
            pixel_id: pixel.id,
            name: pixel.name,
            status: pixel.status,
            access_token_encrypted: 'ENC_TOKEN_CAPI_' + pixel.id
          });

        if (error) throw error;
        return;
      } catch (e) {
        console.warn('Erro ao inserir pixel no Supabase, inserindo localmente:', e);
      }
    }
    
    const local = localDb.getPixels();
    const updated = [pixel, ...local.filter(p => p.id !== pixel.id)];
    localDb.savePixels(updated);
  },

  async deletePixel(id: string): Promise<void> {
    const client = getSupabaseClient();
    if (client) {
      try {
        const { error } = await client
          .from('facebook_pixels')
          .delete()
          .eq('pixel_id', id);

        if (error) throw error;
        return;
      } catch (e) {
        console.warn('Erro ao remover pixel do Supabase, removendo localmente:', e);
      }
    }
    
    const local = localDb.getPixels();
    localDb.savePixels(local.filter(p => p.id !== id));
  },

  // 2. INTEGRAÇÕES
  async getIntegrations(): Promise<Integration[]> {
    const client = getSupabaseClient();
    if (client) {
      try {
        const { data, error } = await client
          .from('integrations')
          .select('*')
          .order('created_at', { ascending: true });

        if (error) throw error;

        if (data && data.length > 0) {
          // Merge connected states into mock structures to maintain beautiful UI presentation
          const base = localDb.getIntegrations();
          return base.map(b => {
            const dbMatch = data.find(d => d.type === b.id);
            if (dbMatch) {
              return {
                ...b,
                connected: dbMatch.status === 'active',
                status: dbMatch.status === 'active' ? 'connected' : 'disconnected',
                webhookUrl: `https://api.trackify.com.br/v1/webhooks/${dbMatch.type}/wh-${dbMatch.id.substring(0, 8)}`
              };
            }
            return b;
          });
        }
      } catch (e) {
        console.warn('Erro ao obter integrações do Supabase, usando local storage:', e);
      }
    }
    return localDb.getIntegrations();
  },

  async updateIntegration(integration: Integration): Promise<void> {
    const client = getSupabaseClient();
    if (client) {
      try {
        const orgId = '4ca02198-5bf4-4d22-a440-1eea8ada9931';
        if (integration.connected) {
          // Insert or update
          const { error } = await client
            .from('integrations')
            .upsert({
              organization_id: orgId,
              type: integration.id as any,
              name: integration.name,
              status: 'active',
              credentials: { connected_at: new Date().toISOString() }
            }, { onConflict: 'organization_id,type' as any });

          if (error) throw error;
        } else {
          // Delete
          const { error } = await client
            .from('integrations')
            .delete()
            .eq('organization_id', orgId)
            .eq('type', integration.id);

          if (error) throw error;
        }
        return;
      } catch (e) {
        console.warn('Erro ao atualizar integração no Supabase, atualizando localmente:', e);
      }
    }

    const local = localDb.getIntegrations();
    const updated = local.map(i => i.id === integration.id ? integration : i);
    localDb.saveIntegrations(updated);
  },

  // 3. PEDIDOS / TRANSAÇÕES (ORDERS)
  async getOrders(): Promise<Purchase[]> {
    const client = getSupabaseClient();
    if (client) {
      try {
        const { data, error } = await client
          .from('orders')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) throw error;

        if (data && data.length > 0) {
          return data.map(item => ({
            id: item.external_order_id,
            customerName: item.customer_name || 'Cliente Trackify',
            email: item.customer_email || 'email@cliente.com',
            value: Number(item.amount),
            currency: item.currency || 'BRL',
            campaign: item.utm_campaign && item.utm_campaign !== 'none' ? `🔥 ${item.utm_campaign}` : 'Organico / Direto',
            source: item.utm_source === 'facebook' ? 'fb' : item.utm_source || 'organic',
            status: item.status === 'approved' || item.status === 'aprovado' ? 'aprovado' : item.status === 'pending' || item.status === 'pendente' ? 'pendente' : 'recusado',
            timestamp: item.created_at,
            pixelId: '843910582910482', // standard bound pixel
            utmSource: item.utm_source || 'organic',
            utmMedium: 'cpc',
            utmCampaign: item.utm_campaign || 'none'
          }));
        }
      } catch (e) {
        console.warn('Erro ao obter pedidos do Supabase, usando local storage:', e);
      }
    }
    return localDb.getOrders();
  },

  async saveOrder(order: Purchase): Promise<void> {
    const client = getSupabaseClient();
    if (client) {
      try {
        const orgId = '4ca02198-5bf4-4d22-a440-1eea8ada9931';
        
        // Let's call the rpc/store function or do a direct insert
        const { error } = await client
          .from('orders')
          .insert({
            organization_id: orgId,
            platform: order.source === 'fb' ? 'facebook_manual' : 'manual_checkout',
            external_order_id: order.id,
            customer_name: order.customerName,
            customer_email: order.email,
            customer_phone: '+5511999998888',
            amount: order.value,
            currency: order.currency,
            utm_source: order.utmSource,
            utm_campaign: order.utmCampaign,
            status: order.status === 'aprovado' ? 'approved' : order.status === 'pendente' ? 'pending' : 'failed'
          });

        if (error) throw error;
        return;
      } catch (e) {
        console.warn('Erro ao inserir pedido no Supabase, inserindo localmente:', e);
      }
    }

    const local = localDb.getOrders();
    localDb.saveOrders([order, ...local]);
  },

  // 4. WEBHOOK LOGS
  async getWebhookLogs(): Promise<WebhookLog[]> {
    const client = getSupabaseClient();
    if (client) {
      try {
        const { data, error } = await client
          .from('webhooks')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(100);

        if (error) throw error;

        if (data && data.length > 0) {
          return data.map(item => {
            const payloadObj = typeof item.payload === 'string' ? JSON.parse(item.payload) : item.payload;
            return {
              id: item.id.substring(0, 8),
              timestamp: item.created_at,
              event: payloadObj?.event || 'purchase',
              source: item.platform || 'Webhook',
              status: item.processed ? 'sent_to_facebook' : 'processed',
              payload: JSON.stringify(payloadObj, null, 2)
            };
          });
        }
      } catch (e) {
        console.warn('Erro ao obter webhooks do Supabase, usando local storage:', e);
      }
    }
    return localDb.getWebhookLogs();
  },

  async saveWebhookLog(log: WebhookLog): Promise<void> {
    const client = getSupabaseClient();
    if (client) {
      try {
        const orgId = '4ca02198-5bf4-4d22-a440-1eea8ada9931';
        const parsedPayload = JSON.parse(log.payload);
        
        const { error } = await client
          .from('webhooks')
          .insert({
            organization_id: orgId,
            platform: log.source,
            payload: parsedPayload,
            processed: log.status === 'sent_to_facebook',
            status: log.status === 'sent_to_facebook' ? 'processed' : 'received'
          });

        if (error) throw error;
        return;
      } catch (e) {
        console.warn('Erro ao salvar webhook no Supabase, salvando localmente:', e);
      }
    }

    const local = localDb.getWebhookLogs();
    localDb.saveWebhookLogs([log, ...local]);
  },

  // 5. DATABASE SEED / INICIALIZAÇÃO
  async seedDatabase(): Promise<void> {
    const client = getSupabaseClient();
    if (!client) throw new Error("Supabase não configurado ou desconectado.");

    const orgId = '4ca02198-5bf4-4d22-a440-1eea8ada9931';
    const userId = '8c459a90-3cb8-4b21-872f-5707b1d6f1a4';

    try {
      // 1. Check/Insert User
      const { data: userRow } = await client.from('users').select('id').eq('id', userId);
      if (!userRow || userRow.length === 0) {
        await client.from('users').insert({
          id: userId,
          email: 'marlisstore.com@gmail.com',
          name: 'Guilherme Silva',
          avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb'
        });
      }

      // 2. Check/Insert Org
      const { data: orgRow } = await client.from('organizations').select('id').eq('id', orgId);
      if (!orgRow || orgRow.length === 0) {
        await client.from('organizations').insert({
          id: orgId,
          name: 'Marlis Store Ltda',
          slug: 'marlis-store-ltda',
          plan: 'professional',
          owner_id: userId
        });

        await client.from('organization_members').insert({
          organization_id: orgId,
          user_id: userId,
          role: 'owner'
        });
      }

      // 3. Insert Pixels
      for (const p of mockPixels) {
        await client.from('facebook_pixels').upsert({
          organization_id: orgId,
          pixel_id: p.id,
          name: p.name,
          status: p.status,
          access_token_encrypted: 'ENC_TOKEN_CAPI_' + p.id
        }, { onConflict: 'pixel_id' as any });
      }

      // 4. Insert Integrations
      for (const i of mockIntegrations) {
        await client.from('integrations').upsert({
          organization_id: orgId,
          type: i.id as any,
          name: i.name,
          status: i.connected ? 'active' : 'inactive',
          credentials: { seed: true }
        }, { onConflict: 'organization_id,type' as any });
      }

      // 5. Insert Orders
      for (const o of mockPurchases) {
        await client.from('orders').upsert({
          organization_id: orgId,
          platform: o.source === 'fb' ? 'facebook_manual' : 'manual_checkout',
          external_order_id: o.id,
          customer_name: o.customerName,
          customer_email: o.email,
          customer_phone: '+5511999998888',
          amount: o.value,
          currency: o.currency,
          utm_source: o.utmSource,
          utm_campaign: o.utmCampaign,
          status: o.status === 'aprovado' ? 'approved' : o.status === 'pendente' ? 'pending' : 'failed'
        }, { onConflict: 'platform,external_order_id' as any });
      }

      // 6. Insert Webhooks
      for (const w of mockWebhookLogs) {
        const parsedPayload = JSON.parse(w.payload);
        await client.from('webhooks').insert({
          organization_id: orgId,
          platform: w.source,
          payload: parsedPayload,
          processed: w.status === 'sent_to_facebook',
          status: w.status === 'sent_to_facebook' ? 'processed' : 'received'
        });
      }
    } catch (e: any) {
      console.error('Falha ao semear banco de dados Supabase:', e);
      throw new Error(`Erro de Semeação: ${e?.message || e}`);
    }
  }
};
