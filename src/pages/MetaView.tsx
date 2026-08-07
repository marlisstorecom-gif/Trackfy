import React, { useState } from 'react';
import { StatusBadge } from '../components/UIComponents';
import { mockPixels } from '../mockData';
import { Check, LogOut, CheckCircle2, Sliders, LayoutGrid, HelpCircle, RefreshCw } from 'lucide-react';
import { motion } from 'motion/react';
import { getConnectionConfig } from '../lib/supabase';

interface MetaViewProps {
  isMetaConnected: boolean;
  onConnectMeta: (connected: boolean) => void;
  onAddToast: (msg: string, type: 'success' | 'error' | 'info') => void;
  selectedPixelId: string;
  onSelectPixel: (pixelId: string) => void;
}

export default function MetaView({
  isMetaConnected,
  onConnectMeta,
  onAddToast,
  selectedPixelId,
  onSelectPixel
}: MetaViewProps) {
  const [isConnecting, setIsConnecting] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState('act_1');

  const adAccounts = [
    { id: 'act_1', name: '🎯 Conta Principal - Ecom', idNumber: 'act_432901840192840', balance: 'R$ 15.000,00', status: 'Ativa' },
    { id: 'act_2', name: '🔄 Conta Backup - Remarketing', idNumber: 'act_982140182490182', balance: 'R$ 4.500,00', status: 'Ativa' },
    { id: 'act_3', name: '🧪 Conta de Testes - Públicos Frios', idNumber: 'act_710492841029482', balance: 'R$ 1.200,00', status: 'Ativa' },
  ];

  const handleConnect = () => {
    setIsConnecting(true);
    const conf = getConnectionConfig();
    const orgId = '4ca02198-5bf4-4d22-a440-1eea8ada9931';
    const userId = '8c459a90-3cb8-4b21-872f-5707b1d6f1a4';
    
    // Redirect browser to dynamic multi-tenant Express backend login
    window.location.href = `/api/meta/login?org_id=${orgId}&user_id=${userId}&supabase_url=${encodeURIComponent(conf.url)}&supabase_key=${encodeURIComponent(conf.anonKey)}`;
  };

  const handleDisconnect = () => {
    onConnectMeta(false);
    localStorage.removeItem('trackify_meta_connected');
    localStorage.removeItem('trackify_meta_user_name');
    onAddToast('Conta do Facebook Ads desconectada.', 'info');
  };

  const handleSelectAccount = (id: string, name: string) => {
    setSelectedAccount(id);
    onAddToast(`Conta de anúncios "${name}" selecionada para atribuição.`, 'success');
  };

  const handleSelectPixelLocal = (pixelId: string, name: string) => {
    onSelectPixel(pixelId);
    onAddToast(`Pixel "${name}" vinculado à conta de anúncios selecionada.`, 'success');
  };

  return (
    <div className="space-y-8 max-w-4xl">
      <div>
        <span className="text-[11px] font-black text-blue-500 uppercase tracking-[0.2em] font-mono">Configuração do Facebook Ads</span>
        <h1 className="text-3xl font-extrabold tracking-tight text-[#FAFAFA] mt-1 font-display">Conexão Meta Ads</h1>
        <p className="text-sm text-[#A1A1AA] mt-0.5">Vincule sua conta de anúncios e configure o envio de eventos offline/online com segurança.</p>
      </div>

      {!isMetaConnected ? (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-8 rounded-2xl bg-[#18181B] border border-[#27272A] text-center flex flex-col items-center justify-center space-y-6"
        >
          <div className="w-16 h-16 rounded-2xl bg-blue-600/10 flex items-center justify-center border border-blue-500/20 text-blue-500">
            <svg className="w-8 h-8 fill-current" viewBox="0 0 24 24">
              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
            </svg>
          </div>
          <div className="max-w-md space-y-2">
            <h3 className="text-lg font-bold text-[#FAFAFA]">Vincule sua conta comercial do Facebook</h3>
            <p className="text-sm text-[#A1A1AA] leading-relaxed">
              O Trackify solicita permissão de leitura às suas contas de anúncios e permissão de gravação para a API de Conversões (CAPI) do seu Business Manager.
            </p>
          </div>

          <button
            onClick={handleConnect}
            disabled={isConnecting}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-500 disabled:bg-blue-800 text-white font-semibold text-sm rounded-xl transition-all duration-200 shadow-lg shadow-blue-600/15 hover:shadow-blue-600/25 active:scale-98 flex items-center gap-2 cursor-pointer"
          >
            {isConnecting ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                Conectando à Meta...
              </>
            ) : (
              'Conectar com Meta Ads / Facebook'
            )}
          </button>

          <div className="flex items-center gap-2 text-xs text-neutral-500 font-mono">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block animate-pulse" />
            Conexão segura via OAuth 2.0 oficial da Meta Corporation
          </div>
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-8"
        >
          {/* Connection Profile Card */}
          <div className="p-6 rounded-2xl bg-[#18181B] border border-[#27272A] flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-[#111113] border border-neutral-800 flex items-center justify-center text-xl shadow-inner">
                👤
              </div>
              <div>
                <div className="flex items-center gap-2.5">
                  <h3 className="text-base font-bold text-[#FAFAFA]">
                    {localStorage.getItem('trackify_meta_user_name') || 'Guilherme Ads Agency'}
                  </h3>
                  <StatusBadge status="active" />
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center gap-x-4 gap-y-1 mt-1 text-xs text-[#A1A1AA]">
                  <span>Business Manager: <strong className="text-neutral-300 font-semibold">Trackify BM LLC</strong></span>
                  <span className="hidden sm:inline text-neutral-700">•</span>
                  <span>ID Comercial: <strong className="text-neutral-300 font-semibold">bm_92841029482910</strong></span>
                </div>
              </div>
            </div>
            <button
              onClick={handleDisconnect}
              className="px-4 py-2 text-xs font-semibold bg-rose-950/20 hover:bg-rose-950/40 text-rose-400 rounded-xl border border-rose-900/30 transition-all duration-200 active:scale-95 flex items-center gap-1.5"
            >
              <LogOut className="w-3.5 h-3.5" />
              Desconectar Conta
            </button>
          </div>

          {/* Ad Accounts selection list */}
          <div className="space-y-4">
            <div>
              <h3 className="text-base font-semibold text-[#FAFAFA] flex items-center gap-2">
                <LayoutGrid className="w-4 h-4 text-blue-400" />
                1. Selecione a Conta de Anúncios Ativa
              </h3>
              <p className="text-xs text-[#A1A1AA] mt-1">Escolha qual conta de anúncios do Meta Ads deseja usar para atribuir o faturamento e vendas.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {adAccounts.map((account) => {
                const isSelected = selectedAccount === account.id;
                return (
                  <div
                    key={account.id}
                    onClick={() => handleSelectAccount(account.id, account.name)}
                    className={`p-4 rounded-xl border cursor-pointer transition-all duration-300 relative ${
                      isSelected
                        ? 'bg-[#18181B] border-blue-500 text-[#FAFAFA] shadow-[0_4px_20px_rgba(37,99,235,0.12)]'
                        : 'bg-[#111113] border-neutral-800 text-[#A1A1AA] hover:border-neutral-700 hover:bg-[#18181B]/40'
                    }`}
                  >
                    {isSelected && (
                      <span className="absolute top-3 right-3 w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center text-white scale-90">
                        <Check className="w-3.5 h-3.5" />
                      </span>
                    )}
                    <h4 className={`text-xs font-bold ${isSelected ? 'text-[#FAFAFA]' : 'text-neutral-300'}`}>
                      {account.name}
                    </h4>
                    <p className="text-[10px] text-neutral-500 mt-1 font-mono">{account.idNumber}</p>
                    <div className="mt-4 flex items-center justify-between text-[10px]">
                      <span>Saldo Diário: <strong className="text-neutral-300">{account.balance}</strong></span>
                      <span className="text-emerald-400 font-semibold">{account.status}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Pixels connection and status list */}
          <div className="space-y-4">
            <div>
              <h3 className="text-base font-semibold text-[#FAFAFA] flex items-center gap-2">
                <Sliders className="w-4 h-4 text-blue-400" />
                2. Selecione ou Vincule seu Pixel do Facebook
              </h3>
              <p className="text-xs text-[#A1A1AA] mt-1">Conecte um ou mais pixels do Facebook para receber imediatamente as conversões atribuídas.</p>
            </div>

            <div className="border border-[#27272A] rounded-xl overflow-hidden bg-[#111113]/30">
              {mockPixels.map((pixel) => {
                const isSelected = selectedPixelId === pixel.id;
                return (
                  <div
                    key={pixel.id}
                    onClick={() => handleSelectPixelLocal(pixel.id, pixel.name)}
                    className={`p-4 border-b border-neutral-800 last:border-b-0 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 cursor-pointer transition-all duration-200 ${
                      isSelected ? 'bg-blue-500/5' : 'hover:bg-[#18181B]/40'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`mt-1 w-4.5 h-4.5 rounded border flex items-center justify-center transition-colors ${
                        isSelected ? 'bg-blue-600 border-blue-500 text-white' : 'border-neutral-700 bg-[#111113]'
                      }`}>
                        {isSelected && <Check className="w-3.5 h-3.5" />}
                      </div>
                      <div>
                        <h4 className="text-xs font-semibold text-neutral-200">{pixel.name}</h4>
                        <div className="flex items-center gap-2.5 mt-1 text-[10px] font-mono text-neutral-500">
                          <span>Pixel ID: <strong className="text-neutral-400">{pixel.id}</strong></span>
                          <span>•</span>
                          <span>Vazão acumulada: <strong className="text-neutral-400">{pixel.eventsCount.toLocaleString('pt-BR')} eventos</strong></span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-[10px] font-mono text-neutral-500">Ativo {pixel.lastActive}</div>
                      <StatusBadge status={pixel.status} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="p-4 rounded-xl bg-[#18181B] border border-[#27272A] flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 mt-0.5 flex-shrink-0" />
            <div>
              <h4 className="text-xs font-semibold text-neutral-200">Verificação de Atribuição Ativa</h4>
              <p className="text-[11px] text-[#A1A1AA] mt-0.5 leading-relaxed">
                Nossos robôs estão escutando UTMs parametrizadas em tempo real. Uma vez configurado, cada webhook de venda recebido será deduplicado (usando o <strong className="text-neutral-300">fb_deduplication_code</strong>) e enviado via CAPI com o maior Match Quality possível.
              </p>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}
