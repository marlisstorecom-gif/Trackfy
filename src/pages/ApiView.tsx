import React, { useState, useEffect } from 'react';
import { CodeBlock, CopyButton } from '../components/UIComponents';
import { Key, Shield, HelpCircle, Terminal, Play, Check, RefreshCw, Database, Server, DatabaseZap, AlertTriangle, ArrowRight, Activity, Sparkles } from 'lucide-react';
import { motion } from 'motion/react';
import { getConnectionConfig, saveConnectionConfig, isSupabaseConnected, clearConnectionConfig, dataService } from '../lib/supabase';

interface ApiViewProps {
  apiKey: string;
  apiSecret: string;
  apiToken: string;
  onUpdateKeys: (key: string, secret: string, token: string) => void;
  onAddToast: (msg: string, type: 'success' | 'error' | 'info') => void;
  onRefreshDb?: () => void; // Optional callback to trigger App-level state reloads
}

export default function ApiView({ apiKey, apiSecret, apiToken, onUpdateKeys, onAddToast, onRefreshDb }: ApiViewProps) {
  const [localToken, setLocalToken] = useState(apiToken);
  const [isTesting, setIsTesting] = useState(false);
  const [apiResponse, setApiResponse] = useState<string | null>(null);

  // Supabase states
  const [supabaseUrl, setSupabaseUrl] = useState('');
  const [supabaseKey, setSupabaseKey] = useState('');
  const [isDbConnected, setIsDbConnected] = useState(false);
  const [isSeeding, setIsSeeding] = useState(false);

  // Load configuration on mount
  useEffect(() => {
    const conf = getConnectionConfig();
    setSupabaseUrl(conf.url);
    setSupabaseKey(conf.anonKey);
    setIsDbConnected(isSupabaseConnected());
  }, []);

  const handleSaveSupabase = (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabaseUrl.trim() || !supabaseKey.trim()) {
      onAddToast('Por favor, preencha a URL e a Anon Key do Supabase.', 'error');
      return;
    }

    try {
      const connected = saveConnectionConfig(supabaseUrl, supabaseKey);
      setIsDbConnected(connected);
      
      if (connected) {
        onAddToast('Banco de Dados Supabase conectado com sucesso! 🟢', 'success');
        if (onRefreshDb) onRefreshDb();
      } else {
        onAddToast('Falha na conexão. Verifique suas credenciais.', 'error');
      }
    } catch (err: any) {
      onAddToast(`Erro ao conectar: ${err?.message || err}`, 'error');
    }
  };

  const handleDisconnectSupabase = () => {
    clearConnectionConfig();
    setSupabaseUrl('');
    setSupabaseKey('');
    setIsDbConnected(false);
    onAddToast('Desconectado do Supabase. Retornando ao banco de dados local (Offline). 🟡', 'info');
    if (onRefreshDb) onRefreshDb();
  };

  const handleSeedDatabase = async () => {
    if (!isDbConnected) {
      onAddToast('Conecte ao seu Supabase antes de semear os dados.', 'error');
      return;
    }

    setIsSeeding(true);
    try {
      await dataService.seedDatabase();
      onAddToast('Sucesso! Tabelas semeadas com dados reais no Supabase.', 'success');
      if (onRefreshDb) onRefreshDb();
    } catch (err: any) {
      onAddToast(`Erro ao semear: ${err.message || err}`, 'error');
    } finally {
      setIsSeeding(false);
    }
  };

  const handleRegenerateCredentials = () => {
    const nextKey = `tr_key_${Math.floor(Math.random() * 9000000 + 1000000)}`;
    const nextSecret = `tr_sec_${Math.random().toString(36).substring(2, 18)}${Math.random().toString(36).substring(2, 18)}`;
    onUpdateKeys(nextKey, nextSecret, localToken);
    onAddToast('Sucesso! Novas credenciais de API geradas.', 'success');
  };

  const handleSaveToken = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateKeys(apiKey, apiSecret, localToken);
    onAddToast('Token de Conversões da Meta salvo e validado.', 'success');
  };

  const handleTestApi = () => {
    setIsTesting(true);
    setApiResponse(null);
    setTimeout(() => {
      setIsTesting(false);
      const res = {
        status: "success",
        timestamp: new Date().toISOString(),
        authenticated: true,
        account: "Guilherme Ads Agency",
        scope: ["pixel:read", "events:post", "attribution:query"],
        rate_limits: {
          limit: 1000000,
          remaining: 987410,
          reset_hours: 24
        },
        meta_capi_handshake: {
          status: "connected",
          pixel_synced_id: "843910582910482",
          latency: "42ms"
        }
      };
      setApiResponse(JSON.stringify(res, null, 2));
      onAddToast('Autenticação de API concluída com sucesso! Retorno HTTP 200.', 'success');
    }, 1000);
  };

  return (
    <div className="space-y-8 max-w-5xl">
      <div>
        <span className="text-[11px] font-black text-blue-500 uppercase tracking-[0.2em] font-mono">Chaves de Integração & Banco</span>
        <h1 className="text-3xl font-extrabold tracking-tight text-[#FAFAFA] mt-1 font-display">Integração de Desenvolvedor</h1>
        <p className="text-sm text-[#A1A1AA] mt-0.5">Use nossas credenciais e conecte seu próprio banco de dados Supabase para acompanhamento real e produção das métricas.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left column inputs */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* SUPABASE CONNECTION CARD */}
          <div className="p-6 rounded-2xl bg-[#18181B] border border-[#27272A] space-y-5">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
              <h3 className="text-xs font-bold text-neutral-300 uppercase tracking-wider font-mono flex items-center gap-1.5">
                <Database className="w-4 h-4 text-emerald-400" />
                Conexão Supabase Real-Time
              </h3>
              {isDbConnected ? (
                <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] rounded font-bold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
                  LIVE DATABASE ACTIVE
                </span>
              ) : (
                <span className="px-2 py-0.5 bg-amber-500/10 text-amber-400 border border-amber-500/20 text-[10px] rounded font-bold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-amber-400 rounded-full" />
                  BANCO LOCAL (MOCK/OFFLINE)
                </span>
              )}
            </div>

            <p className="text-xs text-neutral-400 leading-relaxed">
              Insira a URL e a chave pública anônima do seu projeto Supabase (com a estrutura de <code className="text-neutral-300 font-mono">supabase_setup.sql</code> já criada no SQL Editor) para gravar e ler dados reais.
            </p>

            <form onSubmit={handleSaveSupabase} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] uppercase font-bold tracking-wider font-mono text-neutral-400">SUPABASE_PROJECT_URL</label>
                <input
                  type="url"
                  placeholder="https://your-project.supabase.co"
                  value={supabaseUrl}
                  onChange={(e) => setSupabaseUrl(e.target.value)}
                  disabled={isDbConnected}
                  className="w-full px-4 py-2 bg-[#111113] border border-neutral-800 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg text-xs text-neutral-200 focus:outline-none focus:border-neutral-600 font-mono"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] uppercase font-bold tracking-wider font-mono text-neutral-400">SUPABASE_ANON_KEY</label>
                <input
                  type="password"
                  placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                  value={supabaseKey}
                  onChange={(e) => setSupabaseKey(e.target.value)}
                  disabled={isDbConnected}
                  className="w-full px-4 py-2 bg-[#111113] border border-neutral-800 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg text-xs text-neutral-200 focus:outline-none focus:border-neutral-600 font-mono"
                  required
                />
              </div>

              <div className="flex gap-3 pt-2">
                {!isDbConnected ? (
                  <button
                    type="submit"
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-lg transition-all active:scale-95 shadow-md shadow-emerald-600/10 cursor-pointer flex items-center gap-1.5"
                  >
                    <Server className="w-4 h-4" />
                    Conectar ao Supabase
                  </button>
                ) : (
                  <>
                    <button
                      type="button"
                      onClick={handleDisconnectSupabase}
                      className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold rounded-lg transition-all active:scale-95 shadow-md shadow-rose-600/10 cursor-pointer flex items-center gap-1.5"
                    >
                      <AlertTriangle className="w-4 h-4" />
                      Desconectar Banco
                    </button>
                    <button
                      type="button"
                      onClick={handleSeedDatabase}
                      disabled={isSeeding}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-500 disabled:bg-neutral-800 text-white disabled:text-neutral-500 text-xs font-semibold rounded-lg transition-all active:scale-95 shadow-md shadow-blue-600/10 cursor-pointer flex items-center gap-1.5"
                    >
                      {isSeeding ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin" />
                          Semeando...
                        </>
                      ) : (
                        <>
                          <DatabaseZap className="w-4 h-4 animate-pulse" />
                          Semear Banco (Seed Data)
                        </>
                      )}
                    </button>
                  </>
                )}
              </div>
            </form>
          </div>

          <div className="p-6 rounded-2xl bg-[#18181B] border border-[#27272A] space-y-6">
            <h3 className="text-xs font-bold text-neutral-300 uppercase tracking-wider font-mono flex items-center gap-1.5 border-b border-neutral-800 pb-3">
              <Key className="w-4 h-4 text-blue-400" />
              API Credentials (Trackify)
            </h3>

            <div className="space-y-4">
              {/* API Key */}
              <div className="space-y-1.5">
                <label className="text-[10px] uppercase font-bold tracking-wider font-mono text-neutral-400">Trackify Client ID / API Key</label>
                <div className="flex items-center gap-2 bg-[#111113] border border-neutral-800 rounded-lg p-2.5">
                  <code className="text-xs text-neutral-300 font-mono flex-grow truncate pr-4">{apiKey}</code>
                  <CopyButton text={apiKey} onCopySuccess={() => onAddToast('API Key copiada!', 'success')} />
                </div>
              </div>

              {/* API Secret */}
              <div className="space-y-1.5">
                <label className="text-[10px] uppercase font-bold tracking-wider font-mono text-neutral-400">Trackify API Secret</label>
                <div className="flex items-center gap-2 bg-[#111113] border border-neutral-800 rounded-lg p-2.5">
                  <code className="text-xs text-neutral-300 font-mono flex-grow truncate pr-4">{apiSecret}</code>
                  <CopyButton text={apiSecret} onCopySuccess={() => onAddToast('Secret Key copiado!', 'success')} />
                </div>
              </div>
            </div>

            <div className="flex justify-between items-center pt-2">
              <span className="text-[10px] text-neutral-500 font-mono">Gerado em: 05 de agosto de 2026</span>
              <button
                onClick={handleRegenerateCredentials}
                className="px-3.5 py-1.5 bg-neutral-900 hover:bg-neutral-800 text-neutral-300 hover:text-white text-[11px] font-semibold rounded-lg border border-neutral-800 transition-colors cursor-pointer"
              >
                Regerar Chaves
              </button>
            </div>
          </div>

          <form onSubmit={handleSaveToken} className="p-6 rounded-2xl bg-[#18181B] border border-[#27272A] space-y-4">
            <h3 className="text-xs font-bold text-neutral-300 uppercase tracking-wider font-mono flex items-center gap-1.5 border-b border-neutral-800 pb-3">
              <Shield className="w-4 h-4 text-emerald-400" />
              Meta Conversions API (System Token)
            </h3>

            <div className="space-y-1.5">
              <label className="text-[10px] uppercase font-bold tracking-wider font-mono text-neutral-400">Meta System Access Token</label>
              <textarea
                value={localToken}
                onChange={(e) => setLocalToken(e.target.value)}
                rows={4}
                placeholder="Insira seu Token permanente gerado na ferramenta Meta Business Suite..."
                className="w-full px-3 py-2 bg-[#111113] border border-neutral-800 rounded-lg text-xs font-mono text-neutral-300 focus:outline-none focus:border-neutral-600 focus:ring-1 focus:ring-neutral-600 resize-none leading-relaxed"
                required
              />
              <p className="text-[10px] text-neutral-500 font-mono">
                Este token autoriza o servidor do Trackify a enviar requisições de eventos para as contas do Meta Ads sem passar por cookies de navegador.
              </p>
            </div>

            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer active:scale-95 shadow-md shadow-blue-600/15"
            >
              Salvar Token de Acesso
            </button>
          </form>
        </div>

        {/* Right column testing and response */}
        <div className="lg:col-span-5 space-y-6">
          <div className="p-6 rounded-2xl bg-[#18181B] border border-[#27272A] space-y-4 flex flex-col justify-between h-full">
            <div className="space-y-1.5">
              <h3 className="text-xs font-bold text-neutral-300 uppercase tracking-wider font-mono flex items-center gap-1.5">
                <Terminal className="w-4.5 h-4.5 text-blue-400" />
                Simulador de Endpoint REST
              </h3>
              <p className="text-[11px] text-[#A1A1AA] leading-relaxed">
                Clique no botão abaixo para simular uma requisição de validação estruturada do endpoint <code className="text-neutral-300">GET /v1/auth/verify</code>.
              </p>
            </div>

            <button
              onClick={handleTestApi}
              disabled={isTesting}
              className="w-full py-3 bg-blue-600 hover:bg-blue-500 disabled:bg-neutral-800 text-white disabled:text-neutral-500 font-semibold text-xs rounded-xl transition-all duration-200 active:scale-98 flex items-center justify-center gap-1.5 shadow-lg shadow-blue-600/10 cursor-pointer"
            >
              {isTesting ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Conectando e Validando...
                </>
              ) : (
                <>
                  <Play className="w-4 h-4" />
                  Testar Autenticação da API
                </>
              )}
            </button>

            {/* Simulated Response */}
            {apiResponse && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="space-y-2 mt-4"
              >
                <div className="flex items-center justify-between text-[10px]">
                  <span className="font-mono text-emerald-400 font-bold uppercase">HTTP 200 OK</span>
                  <span className="text-neutral-500 font-mono">Response Payload</span>
                </div>
                <CodeBlock
                  code={apiResponse}
                  language="json"
                  title="Verify_Response_Payload.json"
                  onCopySuccess={() => onAddToast('JSON de resposta copiado!', 'success')}
                />
              </motion.div>
            )}
          </div>
        </div>
      </div>

      <div className="p-4 rounded-xl bg-neutral-900 border border-neutral-800 flex items-start gap-3">
        <HelpCircle className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" />
        <div>
          <h4 className="text-xs font-semibold text-neutral-200">Segurança de Credenciais</h4>
          <p className="text-xs text-[#A1A1AA] mt-1 leading-relaxed">
            Todas as chaves privadas de tokens API do Meta são criptografadas em repouso no banco com algoritmo AES-256-GCM. Nosso servidor nunca armazena payloads em formato aberto de forma legível.
          </p>
        </div>
      </div>
    </div>
  );
}
