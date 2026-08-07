import React from 'react';
import { StatusBadge } from '../components/UIComponents';
import { User, Mail, ShieldCheck, CreditCard, Activity, Layers, CheckCircle2 } from 'lucide-react';
import { motion } from 'motion/react';

interface ProfileViewProps {
  userProfile: {
    name: string;
    email: string;
    company: string;
    plan: string;
    usage: {
      eventsUsed: number;
      eventsLimit: number;
      pixelsUsed: number;
      pixelsLimit: number;
    };
  };
  onAddToast: (msg: string, type: 'success' | 'error' | 'info') => void;
}

export default function ProfileView({ userProfile, onAddToast }: ProfileViewProps) {
  const eventsPercentage = (userProfile.usage.eventsUsed / userProfile.usage.eventsLimit) * 100;
  const pixelsPercentage = (userProfile.usage.pixelsUsed / userProfile.usage.pixelsLimit) * 100;

  return (
    <div className="space-y-8 max-w-4xl">
      <div>
        <span className="text-[11px] font-black text-blue-500 uppercase tracking-[0.2em] font-mono">Resumo da Conta</span>
        <h1 className="text-3xl font-extrabold tracking-tight text-[#FAFAFA] mt-1 font-display">Perfil do Usuário</h1>
        <p className="text-sm text-[#A1A1AA] mt-0.5">Visualize as credenciais de assinatura do seu perfil de usuário e o consumo de recursos.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Profile Card Summary */}
        <div className="md:col-span-1 p-6 rounded-2xl bg-[#18181B] border border-[#27272A] flex flex-col items-center text-center space-y-4">
          <div className="relative">
            <div className="w-24 h-24 rounded-full bg-blue-600/10 border-2 border-blue-500 flex items-center justify-center text-4xl select-none font-bold">
              GS
            </div>
            <span className="absolute bottom-1 right-1 w-5 h-5 bg-emerald-500 border-2 border-[#18181B] rounded-full" title="Online" />
          </div>

          <div className="space-y-1">
            <h3 className="text-base font-bold text-[#FAFAFA]">{userProfile.name}</h3>
            <p className="text-xs text-neutral-400">{userProfile.company}</p>
          </div>

          <StatusBadge status="active" />

          <div className="w-full pt-4 border-t border-neutral-800 space-y-3.5 text-xs text-left">
            <div className="flex items-center gap-2.5 text-neutral-300">
              <Mail className="w-4 h-4 text-neutral-500" />
              <span className="truncate select-all">{userProfile.email}</span>
            </div>
            <div className="flex items-center gap-2.5 text-neutral-300">
              <ShieldCheck className="w-4 h-4 text-neutral-500" />
              <span>Gestor de Tráfego Admin</span>
            </div>
          </div>
        </div>

        {/* Quotas & Limits Metrics */}
        <div className="md:col-span-2 space-y-6">
          <div className="p-6 rounded-2xl bg-[#18181B] border border-[#27272A] space-y-6">
            <h3 className="text-sm font-bold text-[#FAFAFA] border-b border-neutral-800 pb-3 flex items-center gap-1.5">
              <Activity className="w-4 h-4 text-blue-400" />
              Consumo de Limites da Assinatura
            </h3>

            {/* Event quotas progress */}
            <div className="space-y-2.5">
              <div className="flex justify-between items-center text-xs">
                <span className="text-neutral-400 font-bold">Cota de Eventos CAPI</span>
                <span className="font-mono text-neutral-300">{userProfile.usage.eventsUsed.toLocaleString('pt-BR')} / {userProfile.usage.eventsLimit.toLocaleString('pt-BR')} (mensal)</span>
              </div>
              <div className="h-2.5 w-full bg-[#111113] border border-neutral-800/60 rounded-full overflow-hidden">
                <div className="h-full bg-blue-500 rounded-full" style={{ width: `${eventsPercentage}%` }} />
              </div>
              <div className="flex justify-between text-[10px] text-neutral-500 font-mono">
                <span>{eventsPercentage.toFixed(1)}% Consumidos</span>
                <span>Zera em 28 de ago de 2026</span>
              </div>
            </div>

            {/* Pixel quotas progress */}
            <div className="space-y-2.5 pt-2">
              <div className="flex justify-between items-center text-xs">
                <span className="text-neutral-400 font-bold">Limite de Pixels</span>
                <span className="font-mono text-neutral-300">{userProfile.usage.pixelsUsed} / {userProfile.usage.pixelsLimit} Pixels Ativos</span>
              </div>
              <div className="h-2.5 w-full bg-[#111113] border border-neutral-800/60 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${pixelsPercentage}%` }} />
              </div>
              <div className="flex justify-between text-[10px] text-neutral-500 font-mono">
                <span>{pixelsPercentage.toFixed(0)}% Consumidos</span>
                <span>Suporta criação ilimitada em upgrade</span>
              </div>
            </div>
          </div>

          {/* Active Subscription Details card */}
          <div className="p-6 rounded-2xl bg-[#18181B] border border-[#27272A] flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                <CreditCard className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-[#FAFAFA]">{userProfile.plan}</h4>
                <p className="text-[10px] text-[#A1A1AA] mt-0.5">Assinatura ativa e recorrente faturada via Cartão de Crédito.</p>
              </div>
            </div>
            <button
              onClick={() => onAddToast('Fluxo de mudança de assinatura iniciado.', 'info')}
              className="px-4 py-2 bg-neutral-900 hover:bg-neutral-800 text-neutral-300 text-xs font-semibold rounded-lg border border-neutral-800 transition-colors cursor-pointer"
            >
              Mudar Plano
            </button>
          </div>
        </div>
      </div>

      <div className="p-4 rounded-xl bg-[#18181B] border border-[#27272A] flex items-start gap-3">
        <CheckCircle2 className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" />
        <div>
          <h4 className="text-xs font-semibold text-neutral-200">Suporte Dedicado Ativo</h4>
          <p className="text-xs text-[#A1A1AA] mt-1 leading-relaxed">
            Seu plano inclui suporte direto de Account Manager prioritário via Telegram. Havendo dúvidas sobre configurações de deduplicação complexas em infoprodutos ou lojas de dropshipping, acione o chat de ajuda no cabeçalho ou clique em entrar em contato para ser atendido em menos de 10 min.
          </p>
        </div>
      </div>
    </div>
  );
}
