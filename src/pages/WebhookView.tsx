import React, { useState } from 'react';
import { StatusBadge, CopyButton, CodeBlock } from '../components/UIComponents';
import { mockWebhookLogs } from '../mockData';
import { WebhookLog } from '../types';
import { Terminal, Copy, Check, Play, Database, AlertCircle, RefreshCw, Send, HelpCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface WebhookViewProps {
  webhookLogs: WebhookLog[];
  onAddToast: (msg: string, type: 'success' | 'error' | 'info') => void;
  onAddLog: (newLog: WebhookLog) => void;
}

export default function WebhookView({ webhookLogs, onAddToast, onAddLog }: WebhookViewProps) {
  const [selectedLogId, setSelectedLogId] = useState<string | null>(webhookLogs[0]?.id || null);
  const [isSimulating, setIsSimulating] = useState(false);
  const [simulationSteps, setSimulationSteps] = useState<string[]>([]);

  const handleCopyUrl = () => {
    navigator.clipboard.writeText('https://api.trackify.com.br/v1/webhooks/receiver/wh-8239482');
    onAddToast('URL do Receptor Webhook copiada!', 'success');
  };

  const selectedLog = webhookLogs.find(l => l.id === selectedLogId);

  const runSimulation = () => {
    setIsSimulating(true);
    setSimulationSteps([]);

    const steps = [
      '🔌 [CONEXÃO] Nova requisição POST detectada do Gateway Kiwify IP: 104.22.4.150...',
      '📥 [RECEBIDO] Cabeçalho verificado. Assinatura x-kiwify-signature correspondente. Carregando payload de transação (ID: kw_92841029)...',
      '🔍 [PROCESSANDO] Buscando histórico de cookies para cliente marlisstore.com@gmail.com...',
      '✨ [ENRIQUECIDO] Match de usuário encontrado! fbclid = "IwAR3FpB_D_bU6_r9gU918-v-Z2g987q9Yt_z9-zR92", _fbc = "fb.1.16859381.IwAR3F...", _fbp = "fb.1.16859381.182401824".',
      '🔒 [CRIPTOGRAFIA] Criptografando hashes de identificação com algoritmo SHA-256 (e-mail, nome, telefone)...',
      '🚀 [CONVERSIONS API] Enviando payload estruturado ao Meta Conversions API (Graph API v17.0)...',
      '✅ [CONCLUÍDO] Meta respondeu com sucesso: { "events_received": 1, "fb_trace_id": "FpB_D_bU6_r9gU918" } (Status: HTTP 200 OK).'
    ];

    steps.forEach((step, idx) => {
      setTimeout(() => {
        setSimulationSteps(prev => [...prev, step]);
        if (idx === steps.length - 1) {
          setIsSimulating(false);
          // Insert actual mock log record
          const newLogRecord: WebhookLog = {
            id: `log_gen_${Math.floor(Math.random() * 900 + 100)}`,
            timestamp: new Date().toISOString(),
            event: 'purchase',
            source: 'Kiwify',
            status: 'sent_to_facebook',
            payload: JSON.stringify({
              event: 'purchase',
              transaction: 'kw_92841029',
              price: 197.00,
              buyer: {
                name: 'Cliente Simulador',
                email: 'marlisstore.com@gmail.com'
              },
              utm: {
                utm_source: 'facebook',
                utm_medium: 'cpc',
                utm_campaign: 'simulacao-kiwify',
                fbclid: 'IwAR3FpB_D_bU6_r9gU918'
              }
            }, null, 2)
          };
          onAddLog(newLogRecord);
          setSelectedLogId(newLogRecord.id);
          onAddToast('Webhook recebido, tratado e enviado ao Facebook Ads!', 'success');
        }
      }, (idx + 1) * 600);
    });
  };

  return (
    <div className="space-y-8 max-w-5xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[11px] font-black text-blue-500 uppercase tracking-[0.2em] font-mono">Monitor de Requisições</span>
          <h1 className="text-3xl font-extrabold tracking-tight text-[#FAFAFA] mt-1 font-display">Console de Webhooks</h1>
          <p className="text-sm text-[#A1A1AA] mt-0.5">Monitore requisições de postback recebidas e envie eventos de forma server-side imediatamente.</p>
        </div>
        <button
          onClick={runSimulation}
          disabled={isSimulating}
          className="px-4 py-2.5 text-xs font-semibold bg-blue-600 hover:bg-blue-500 disabled:bg-neutral-800 text-white disabled:text-neutral-500 rounded-xl flex items-center gap-2 transition-all duration-200 active:scale-95 shadow-md shadow-blue-600/10 hover:shadow-blue-600/20 disabled:shadow-none cursor-pointer"
        >
          {isSimulating ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
          Simular Postback Webhook
        </button>
      </div>

      {/* Global Endpoint Information Area */}
      <div className="p-6 rounded-2xl bg-[#18181B] border border-[#27272A] space-y-4">
        <h3 className="text-xs font-bold text-neutral-300 uppercase tracking-wider font-mono">URL Única de Integração Trackify</h3>
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-grow flex items-center bg-[#111113] border border-neutral-800 rounded-lg p-3">
            <code className="text-xs font-mono text-neutral-200 select-all truncate pr-4">
              https://api.trackify.com.br/v1/webhooks/receiver/wh-8239482
            </code>
          </div>
          <button
            onClick={handleCopyUrl}
            className="px-5 py-3 bg-neutral-900 hover:bg-neutral-800 text-neutral-300 rounded-lg border border-neutral-800 transition-colors flex items-center gap-2 text-xs font-semibold cursor-pointer active:scale-95"
          >
            <Copy className="w-4 h-4" />
            Copiar URL Receptor
          </button>
        </div>
        <p className="text-xs text-neutral-400 leading-relaxed">
          Esta URL aceita requisições JSON estruturadas do tipo POST. Seus parâmetros serão automaticamente mapeados para eventos equivalentes da API de Conversão.
        </p>
      </div>

      {/* Simulated Console Log Panel */}
      {simulationSteps.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-5 rounded-xl border border-neutral-800 bg-[#09090B] font-mono text-xs space-y-2 text-neutral-300"
        >
          <div className="flex items-center justify-between border-b border-neutral-900 pb-2 mb-3">
            <span className="text-neutral-400 font-bold flex items-center gap-1.5 text-[10px] uppercase">
              <Terminal className="w-3.5 h-3.5 text-blue-500" />
              Depurador de Postback Realtime (Trackify Process Engine)
            </span>
            <span className="text-[10px] text-neutral-500">Log em execução...</span>
          </div>
          <div className="space-y-1.5 max-h-[220px] overflow-y-auto leading-relaxed">
            {simulationSteps.map((step, idx) => (
              <div key={idx} className="transition-all duration-300 animate-fade-in">
                {step.includes('✅') || step.includes('SUCESSO') ? (
                  <span className="text-emerald-400 font-bold">{step}</span>
                ) : step.includes('🚀') ? (
                  <span className="text-blue-400 font-semibold">{step}</span>
                ) : step.includes('🔍') || step.includes('📥') ? (
                  <span className="text-amber-400">{step}</span>
                ) : (
                  <span>{step}</span>
                )}
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Main logs display - Split Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left side list */}
        <div className="lg:col-span-5 p-5 rounded-2xl bg-[#18181B] border border-[#27272A] space-y-4">
          <h3 className="text-xs font-bold text-[#FAFAFA] flex items-center gap-1.5">
            <Database className="w-4 h-4 text-blue-400" />
            Postbacks Recebidos
          </h3>

          <div className="space-y-2 max-h-[350px] overflow-y-auto pr-1">
            {webhookLogs.map((log) => {
              const isSelected = selectedLogId === log.id;
              return (
                <div
                  key={log.id}
                  onClick={() => setSelectedLogId(log.id)}
                  className={`p-3 rounded-lg border cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-[#111113] border-blue-500/50 text-[#FAFAFA] shadow-inner'
                      : 'bg-neutral-900/30 border-neutral-800/80 hover:border-neutral-700/60'
                  }`}
                >
                  <div className="flex justify-between items-center text-[10px]">
                    <span className="font-mono text-neutral-400">{log.id}</span>
                    <span className="text-neutral-500 font-mono">
                      {new Date(log.timestamp).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                    </span>
                  </div>
                  <div className="flex justify-between items-center mt-2">
                    <span className="text-xs font-bold text-neutral-200 uppercase">{log.source} - {log.event}</span>
                    <StatusBadge status={log.status} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right side payload display */}
        <div className="lg:col-span-7 space-y-4">
          {selectedLog ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-neutral-300 uppercase tracking-wider font-mono">Estrutura Payload: {selectedLog.id}</h3>
                <span className="text-[10px] text-neutral-400 font-mono">Recebido via {selectedLog.source}</span>
              </div>
              <CodeBlock
                code={selectedLog.payload}
                language="json"
                title={`${selectedLog.source}_Webhook_Payload.json`}
                onCopySuccess={() => onAddToast('Payload copiado!', 'success')}
              />
            </div>
          ) : (
            <div className="h-full flex items-center justify-center p-8 border border-dashed border-[#27272A] rounded-2xl bg-[#18181B]/30 text-neutral-500 text-xs text-center">
              Selecione um postback da lista para depurar seu cabeçalho JSON.
            </div>
          )}
        </div>
      </div>

      <div className="p-4 rounded-xl bg-neutral-900 border border-neutral-800 flex items-start gap-3">
        <HelpCircle className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" />
        <div>
          <h4 className="text-xs font-semibold text-neutral-200">Por que usar a API de Conversões do Facebook?</h4>
          <p className="text-xs text-[#A1A1AA] mt-1 leading-relaxed">
            Bloqueadores de anúncios, iOS 14.5 e políticas estritas de cookies impedem que até 35% dos eventos de checkout cheguem ao Facebook de forma puramente client-side. Ao usar webhooks server-side, a Trackify garante que toda transação confirmada seja reportada ao Facebook Ads, otimizando suas campanhas inteligentes imediatamente.
          </p>
        </div>
      </div>
    </div>
  );
}
