import React, { useState } from 'react';
import { StatusBadge, CopyButton } from '../components/UIComponents';
import { mockIntegrations } from '../mockData';
import { Integration } from '../types';
import { Settings, Check, Zap, ExternalLink, Play, Globe, HelpCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface IntegrationsViewProps {
  integrations: Integration[];
  onAddToast: (msg: string, type: 'success' | 'error' | 'info') => void;
  onUpdateIntegrations: (updated: Integration[]) => void;
}

export default function IntegrationsView({ integrations, onAddToast, onUpdateIntegrations }: IntegrationsViewProps) {
  const [testingId, setTestingId] = useState<string | null>(null);

  const handleToggleConnection = (id: string, currentlyConnected: boolean) => {
    const nextConnected = !currentlyConnected;
    const updated = integrations.map(item => {
      if (item.id === id) {
        return {
          ...item,
          connected: nextConnected,
          status: nextConnected ? 'connected' : 'disconnected' as 'connected' | 'disconnected',
          webhookUrl: nextConnected ? `https://api.trackify.com.br/v1/webhooks/${item.id}/wh-8239482` : undefined
        };
      }
      return item;
    });

    onUpdateIntegrations(updated);
    onAddToast(
      nextConnected
        ? `Integração com a ${id === 'hotmart' ? 'Hotmart' : id === 'kiwify' ? 'Kiwify' : 'Shopify'} ativada! URL de Webhook gerada.`
        : `Integração com a ${id === 'hotmart' ? 'Hotmart' : id === 'kiwify' ? 'Kiwify' : 'Shopify'} removida.`,
      nextConnected ? 'success' : 'info'
    );
  };

  const handleTestWebhook = (id: string, name: string) => {
    setTestingId(id);
    setTimeout(() => {
      setTestingId(null);
      onAddToast(`Evento de teste (Purchase) enviado com sucesso da plataforma ${name}! Verifique o Console de Webhooks.`, 'success');
    }, 1200);
  };

  return (
    <div className="space-y-8 max-w-5xl">
      <div>
        <span className="text-[11px] font-black text-blue-500 uppercase tracking-[0.2em] font-mono">Conectores de Transações</span>
        <h1 className="text-3xl font-extrabold tracking-tight text-[#FAFAFA] mt-1 font-display">Integrações de Plataforma</h1>
        <p className="text-sm text-[#A1A1AA] mt-0.5">Vincule seus gateways de pagamento e checkouts para receber notificações de compras instantâneas.</p>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {integrations.map((integration) => {
          const isConnected = integration.connected;
          const isTesting = testingId === integration.id;

          return (
            <motion.div
              key={integration.id}
              className="p-6 rounded-2xl bg-[#18181B] border border-[#27272A] hover:border-neutral-700/60 transition-all duration-300 flex flex-col space-y-6"
            >
              {/* Header section of individual card */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-[#111113] border border-neutral-800 flex items-center justify-center text-2xl shadow-inner select-none">
                    {integration.logo}
                  </div>
                  <div>
                    <div className="flex items-center gap-3">
                      <h3 className="text-base font-bold text-[#FAFAFA]">{integration.name}</h3>
                      <StatusBadge status={integration.status} />
                    </div>
                    <p className="text-xs text-neutral-400 mt-1 max-w-xl leading-relaxed">{integration.description}</p>
                  </div>
                </div>

                <button
                  onClick={() => handleToggleConnection(integration.id, isConnected)}
                  className={`px-4 py-2 text-xs font-semibold rounded-xl border transition-all duration-200 cursor-pointer ${
                    isConnected
                      ? 'bg-rose-950/20 hover:bg-rose-950/40 text-rose-400 border-rose-900/30'
                      : 'bg-blue-600 hover:bg-blue-500 text-white border-transparent shadow-lg shadow-blue-600/10'
                  }`}
                >
                  {isConnected ? 'Desconectar' : 'Conectar Plataforma'}
                </button>
              </div>

              {/* Connected Settings Panels (Displays only when connected) */}
              <AnimatePresence>
                {isConnected && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="pt-6 border-t border-neutral-800/80 space-y-5">
                      {/* Webhook Configuration fields */}
                      <div className="space-y-2">
                        <label className="text-[10px] uppercase font-bold tracking-wider font-mono text-neutral-400 flex items-center gap-1.5">
                          <Globe className="w-3.5 h-3.5 text-blue-500" />
                          Endereço do Webhook para Produção
                        </label>
                        <div className="flex items-center gap-2 bg-[#111113] border border-neutral-800 rounded-lg p-2.5">
                          <code className="text-xs text-neutral-300 font-mono flex-grow select-all truncate pr-4">
                            {integration.webhookUrl || `https://api.trackify.com.br/v1/webhooks/${integration.id}/wh-8239482`}
                          </code>
                          <CopyButton text={integration.webhookUrl || `https://api.trackify.com.br/v1/webhooks/${integration.id}/wh-8239482`} onCopySuccess={() => onAddToast('URL de Webhook copiada!', 'success')} />
                        </div>
                        <p className="text-[10px] text-neutral-500 font-mono">
                          Copie este endereço e cole nas configurações de Webhooks/Postbacks do painel oficial da {integration.name} para o evento "Compra Aprovada/Realizada".
                        </p>
                      </div>

                      {/* API credentials mock */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <span className="text-[10px] uppercase font-bold tracking-wider font-mono text-neutral-500">Credencial API Token</span>
                          <input
                            type="password"
                            readOnly
                            value="••••••••••••••••••••••••••••••••••••••••"
                            className="w-full px-3 py-2 bg-[#111113]/70 border border-neutral-800 rounded-lg text-xs font-mono text-neutral-400 focus:outline-none"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <span className="text-[10px] uppercase font-bold tracking-wider font-mono text-neutral-500">API Status</span>
                          <div className="h-[34px] border border-neutral-800/80 bg-[#111113]/40 rounded-lg px-3 flex items-center justify-between">
                            <span className="text-xs text-neutral-400">Canal de comunicação seguro</span>
                            <span className="inline-flex items-center gap-1 text-[10px] text-emerald-400 font-semibold bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                              Online
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Webhook Test Simulation controls */}
                      <div className="p-4 rounded-xl bg-neutral-900 border border-neutral-800 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <div className="space-y-0.5">
                          <h4 className="text-xs font-bold text-neutral-200">Testar Comunicação de Postback</h4>
                          <p className="text-[11px] text-[#A1A1AA] leading-relaxed">Dispare um payload artificial de compra para simular o recebimento de Webhook.</p>
                        </div>
                        <button
                          onClick={() => handleTestWebhook(integration.id, integration.name)}
                          disabled={isTesting}
                          className="px-4 py-2 bg-blue-600/10 hover:bg-blue-600/20 disabled:bg-neutral-800/40 text-blue-400 disabled:text-neutral-500 text-xs font-semibold rounded-lg border border-blue-500/15 disabled:border-transparent transition-colors flex items-center gap-1.5 cursor-pointer"
                        >
                          {isTesting ? (
                            <>
                              <svg className="w-3.5 h-3.5 animate-spin" viewBox="0 0 24 24" fill="none">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                              </svg>
                              Disparando...
                            </>
                          ) : (
                            <>
                              <Play className="w-3.5 h-3.5" />
                              Enviar Compra Teste (Purchase)
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>

      <div className="p-4 rounded-xl bg-[#18181B] border border-[#27272A] flex items-start gap-3">
        <HelpCircle className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" />
        <div>
          <h4 className="text-xs font-semibold text-neutral-200">Fluxo de Captura Inteligente</h4>
          <p className="text-xs text-[#A1A1AA] mt-1 leading-relaxed">
            Uma vez conectado o Webhook, nosso processador monitora parâmetros como <strong className="text-neutral-300">fbclid</strong> e os cookies <strong className="text-neutral-300">_fbp</strong> / <strong className="text-neutral-300">_fbc</strong> capturados pelo script do Trackify na página de vendas. Caso o comprador feche o navegador e finalize o boleto 3 dias depois, nós resgatamos as credenciais e enviamos o evento retroativo perfeitamente atrelado ao usuário inicial.
          </p>
        </div>
      </div>
    </div>
  );
}
