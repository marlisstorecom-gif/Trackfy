import React, { useState } from 'react';
import { StatusBadge, Modal } from '../components/UIComponents';
import { Settings, User, Building, CreditCard, Bell, Shield, Globe, Trash2, Check, AlertTriangle, ShieldCheck } from 'lucide-react';
import { motion } from 'motion/react';

interface SettingsViewProps {
  onAddToast: (msg: string, type: 'success' | 'error' | 'info') => void;
  userProfile: {
    name: string;
    email: string;
    company: string;
    plan: string;
  };
  onUpdateProfile: (name: string, company: string) => void;
}

export default function SettingsView({ onAddToast, userProfile, onUpdateProfile }: SettingsViewProps) {
  const [activeSubTab, setActiveSubTab] = useState('perfil');
  const [profileName, setProfileName] = useState(userProfile.name);
  const [profileCompany, setProfileCompany] = useState(userProfile.company);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Form states
  const [language, setLanguage] = useState('pt-BR');
  const [theme, setTheme] = useState('dark');
  const [notifications, setNotifications] = useState({
    emailWeekly: true,
    telegramRealtime: false,
    capiFailures: true,
  });

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateProfile(profileName, profileCompany);
    onAddToast('Informações cadastrais salvas com sucesso!', 'success');
  };

  const handleSaveNotifications = (e: React.FormEvent) => {
    e.preventDefault();
    onAddToast('Preferências de notificações atualizadas.', 'success');
  };

  const handleSaveSystem = (e: React.FormEvent) => {
    e.preventDefault();
    onAddToast('Preferências de Tema e Idioma salvas.', 'success');
  };

  const handleDeleteAccount = () => {
    setIsDeleting(true);
    setTimeout(() => {
      setIsDeleting(false);
      setDeleteModalOpen(false);
      onAddToast('Simulação: Conta sinalizada para exclusão agendada.', 'error');
    }, 1500);
  };

  const subTabs = [
    { id: 'perfil', label: 'Perfil Pessoal', icon: <User className="w-4 h-4" /> },
    { id: 'empresa', label: 'Dados da Empresa', icon: <Building className="w-4 h-4" /> },
    { id: 'plano', label: 'Assinatura & Plano', icon: <CreditCard className="w-4 h-4" /> },
    { id: 'notificacoes', label: 'Notificações', icon: <Bell className="w-4 h-4" /> },
    { id: 'sistema', label: 'Tema & Idioma', icon: <Globe className="w-4 h-4" /> },
    { id: 'seguranca', label: 'Zona de Perigo', icon: <Trash2 className="w-4 h-4 text-rose-500" /> },
  ];

  return (
    <div className="space-y-8 max-w-5xl">
      <div>
        <span className="text-[11px] font-black text-blue-500 uppercase tracking-[0.2em] font-mono">Ajustes da Plataforma</span>
        <h1 className="text-3xl font-extrabold tracking-tight text-[#FAFAFA] mt-1 font-display">Configurações Gerais</h1>
        <p className="text-sm text-[#A1A1AA] mt-0.5">Customize suas preferências de cobrança, acessos à API, notificações de postback e dados corporativos.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Side Sub-Navigation Tabs */}
        <div className="lg:col-span-3 flex flex-col gap-1.5">
          {subTabs.map(tab => {
            const isActive = activeSubTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveSubTab(tab.id)}
                className={`flex items-center gap-2.5 px-4 py-3 rounded-xl text-xs font-semibold transition-all duration-200 text-left cursor-pointer ${
                  isActive
                    ? 'bg-blue-600/10 text-blue-400 border border-blue-500/10 shadow-sm'
                    : 'text-neutral-400 hover:text-neutral-200 hover:bg-[#18181B]/40'
                }`}
              >
                {tab.icon}
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Right Side Content Panel */}
        <div className="lg:col-span-9 p-6 rounded-2xl bg-[#18181B] border border-[#27272A]">
          {/* SubTab 1: Personal Profile form */}
          {activeSubTab === 'perfil' && (
            <form onSubmit={handleSaveProfile} className="space-y-6">
              <div className="border-b border-neutral-800 pb-3">
                <h3 className="text-sm font-bold text-[#FAFAFA]">Perfil Pessoal</h3>
                <p className="text-xs text-neutral-400 mt-0.5">Atualize seus dados cadastrais para faturamento e suporte.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase font-bold tracking-wider font-mono text-neutral-400">Nome Completo</label>
                  <input
                    type="text"
                    value={profileName}
                    onChange={(e) => setProfileName(e.target.value)}
                    className="w-full px-4 py-2 bg-[#111113] border border-neutral-800 rounded-lg text-xs text-neutral-200 focus:outline-none focus:border-neutral-600"
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase font-bold tracking-wider font-mono text-neutral-400">E-mail Cadastrado</label>
                  <input
                    type="email"
                    value={userProfile.email}
                    disabled
                    className="w-full px-4 py-2 bg-[#111113]/40 border border-neutral-900 rounded-lg text-xs font-mono text-neutral-500 cursor-not-allowed"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer"
              >
                Salvar Alterações
              </button>
            </form>
          )}

          {/* SubTab 2: Company Profile form */}
          {activeSubTab === 'empresa' && (
            <form onSubmit={handleSaveProfile} className="space-y-6">
              <div className="border-b border-neutral-800 pb-3">
                <h3 className="text-sm font-bold text-[#FAFAFA]">Dados da Empresa</h3>
                <p className="text-xs text-neutral-400 mt-0.5">Configuração dos dados da pessoa jurídica para notas fiscais e relatórios corporativos.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase font-bold tracking-wider font-mono text-neutral-400">Razão Social / Nome da Empresa</label>
                  <input
                    type="text"
                    value={profileCompany}
                    onChange={(e) => setProfileCompany(e.target.value)}
                    className="w-full px-4 py-2 bg-[#111113] border border-neutral-800 rounded-lg text-xs text-neutral-200 focus:outline-none focus:border-neutral-600"
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase font-bold tracking-wider font-mono text-neutral-400">CNPJ</label>
                  <input
                    type="text"
                    defaultValue="12.345.678/0001-90"
                    className="w-full px-4 py-2 bg-[#111113] border border-neutral-800 rounded-lg text-xs text-neutral-200 focus:outline-none focus:border-neutral-600"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer"
              >
                Salvar Dados da Empresa
              </button>
            </form>
          )}

          {/* SubTab 3: Billing & Subscription details */}
          {activeSubTab === 'plano' && (
            <div className="space-y-6">
              <div className="border-b border-neutral-800 pb-3">
                <h3 className="text-sm font-bold text-[#FAFAFA]">Assinatura & Plano</h3>
                <p className="text-xs text-neutral-400 mt-0.5">Gerencie sua cota mensal de rastreamento de eventos e métodos de pagamento.</p>
              </div>

              <div className="p-5 rounded-xl bg-[#111113]/80 border border-neutral-800 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <div className="flex items-center gap-2.5">
                    <span className="text-sm font-bold text-[#FAFAFA]">{userProfile.plan}</span>
                    <StatusBadge status="active" />
                  </div>
                  <p className="text-xs text-neutral-400 mt-1 font-mono">Renovação programada para: <strong className="text-neutral-300">28 de agosto de 2026</strong> (R$ 197,00/mês)</p>
                </div>
                <button
                  onClick={() => onAddToast('Upgrade: Fluxo de checkout SaaS iniciado.', 'info')}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-lg transition-all active:scale-95 shadow-md shadow-emerald-600/10 cursor-pointer"
                >
                  Fazer Upgrade de Plano
                </button>
              </div>

              {/* Progress limit review */}
              <div className="space-y-3">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-neutral-400 font-semibold">Eventos atribuídos no mês atual</span>
                  <span className="font-mono font-bold text-neutral-200">142.109 / 500.000 eventos</span>
                </div>
                <div className="h-2 w-full bg-neutral-900 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-500 rounded-full" style={{ width: '28.4%' }} />
                </div>
                <p className="text-[10px] text-neutral-500 font-mono">Cota zera automaticamente no dia 28 de cada mês.</p>
              </div>
            </div>
          )}

          {/* SubTab 4: Notifications settings */}
          {activeSubTab === 'notificacoes' && (
            <form onSubmit={handleSaveNotifications} className="space-y-6">
              <div className="border-b border-neutral-800 pb-3">
                <h3 className="text-sm font-bold text-[#FAFAFA]">Configurações de Notificação</h3>
                <p className="text-xs text-neutral-400 mt-0.5">Defina como e quando deseja receber alertas de integridade do pixel.</p>
              </div>

              <div className="space-y-4">
                <label className="flex items-start gap-3 p-3.5 bg-[#111113]/40 border border-neutral-800/60 rounded-xl cursor-pointer hover:border-neutral-700/60">
                  <input
                    type="checkbox"
                    checked={notifications.emailWeekly}
                    onChange={(e) => setNotifications(prev => ({ ...prev, emailWeekly: e.target.checked }))}
                    className="mt-0.5 rounded border-neutral-700 bg-neutral-900 text-blue-600 focus:ring-blue-600/50"
                  />
                  <div>
                    <h4 className="text-xs font-semibold text-neutral-200">Relatório Semanal por E-mail</h4>
                    <p className="text-[11px] text-neutral-500 mt-0.5">Receba um resumo de faturamento atribuído e ROAS consolidado toda segunda-feira de manhã.</p>
                  </div>
                </label>

                <label className="flex items-start gap-3 p-3.5 bg-[#111113]/40 border border-neutral-800/60 rounded-xl cursor-pointer hover:border-neutral-700/60">
                  <input
                    type="checkbox"
                    checked={notifications.telegramRealtime}
                    onChange={(e) => setNotifications(prev => ({ ...prev, telegramRealtime: e.target.checked }))}
                    className="mt-0.5 rounded border-neutral-700 bg-neutral-900 text-blue-600 focus:ring-blue-600/50"
                  />
                  <div>
                    <h4 className="text-xs font-semibold text-neutral-200">Alertas de Vendas em tempo real via Telegram</h4>
                    <p className="text-[11px] text-neutral-500 mt-0.5">Conecte nosso Bot do Telegram para receber pings imediatos a cada venda atribuída de Meta Ads.</p>
                  </div>
                </label>

                <label className="flex items-start gap-3 p-3.5 bg-[#111113]/40 border border-neutral-800/60 rounded-xl cursor-pointer hover:border-neutral-700/60">
                  <input
                    type="checkbox"
                    checked={notifications.capiFailures}
                    onChange={(e) => setNotifications(prev => ({ ...prev, capiFailures: e.target.checked }))}
                    className="mt-0.5 rounded border-neutral-700 bg-neutral-900 text-blue-600 focus:ring-blue-600/50"
                  />
                  <div>
                    <h4 className="text-xs font-semibold text-neutral-200">Alertas críticos de quebra de CAPI</h4>
                    <p className="text-[11px] text-neutral-500 mt-0.5">Seu e-mail será notificado caso seu Token da Meta expire ou um pixel deixe de responder por mais de 10 min.</p>
                  </div>
                </label>
              </div>

              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer"
              >
                Salvar Notificações
              </button>
            </form>
          )}

          {/* SubTab 5: System settings (Theme & Language) */}
          {activeSubTab === 'sistema' && (
            <form onSubmit={handleSaveSystem} className="space-y-6">
              <div className="border-b border-neutral-800 pb-3">
                <h3 className="text-sm font-bold text-[#FAFAFA]">Tema & Idioma</h3>
                <p className="text-xs text-neutral-400 mt-0.5">Configure o visual padrão de exibição da interface do Trackify.</p>
              </div>

              <div className="space-y-4">
                {/* Language selection */}
                <div className="space-y-1.5 max-w-sm">
                  <label className="text-[10px] uppercase font-bold tracking-wider font-mono text-neutral-400">Idioma Principal</label>
                  <select
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                    className="w-full px-3 py-2 bg-[#111113] border border-neutral-800 rounded-lg text-xs text-neutral-200 focus:outline-none cursor-pointer"
                  >
                    <option value="pt-BR">Português (Brasil)</option>
                    <option value="en-US">English (US)</option>
                    <option value="es-ES">Español (Spain)</option>
                  </select>
                </div>

                {/* Theme setting info */}
                <div className="space-y-2">
                  <label className="text-[10px] uppercase font-bold tracking-wider font-mono text-neutral-400">Modo de Exibição (Tema)</label>
                  <div className="flex gap-4">
                    <label className="flex items-center gap-2 p-3 bg-[#111113] rounded-lg border border-blue-500 text-xs text-neutral-200 cursor-pointer flex-grow text-center justify-center">
                      <input type="radio" name="theme" value="dark" checked={theme === 'dark'} onChange={() => setTheme('dark')} className="text-blue-600 focus:ring-blue-600" />
                      <span>Tema Escuro (Padrão)</span>
                    </label>
                    <label className="flex items-center gap-2 p-3 bg-[#111113] rounded-lg border border-neutral-800 text-xs text-neutral-400 cursor-pointer hover:border-neutral-700 flex-grow text-center justify-center">
                      <input type="radio" name="theme" value="light" checked={theme === 'light'} onChange={() => {
                        setTheme('light');
                        onAddToast('Tema claro indisponível neste protótipo - Desenvolvido em Dark Premium por padrão.', 'info');
                      }} className="text-blue-600 focus:ring-blue-600" />
                      <span>Tema Claro</span>
                    </label>
                  </div>
                </div>
              </div>

              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer"
              >
                Salvar Preferências
              </button>
            </form>
          )}

          {/* SubTab 6: Danger Zone */}
          {activeSubTab === 'seguranca' && (
            <div className="space-y-6">
              <div className="border-b border-rose-950/40 pb-3">
                <h3 className="text-sm font-bold text-rose-400">Zona de Perigo</h3>
                <p className="text-xs text-neutral-500 mt-0.5">Ações irreversíveis relacionadas à sua conta cadastrada.</p>
              </div>

              <div className="p-4 rounded-xl bg-rose-500/5 border border-rose-500/10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="space-y-0.5">
                  <h4 className="text-xs font-bold text-rose-400 flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4 text-rose-400" />
                    Excluir Conta Permanentemente
                  </h4>
                  <p className="text-[11px] text-[#A1A1AA] leading-relaxed">Isso apagará todos os seus pixels cadastrados, registros de UTMs, logs de webhooks e histórico de atribuição.</p>
                </div>
                <button
                  type="button"
                  onClick={() => setDeleteModalOpen(true)}
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold rounded-lg transition-all active:scale-95 shadow-md shadow-rose-600/10 cursor-pointer"
                >
                  Excluir Conta
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Confirmation Modal overlay */}
      <Modal isOpen={deleteModalOpen} onClose={() => setDeleteModalOpen(false)} title="Confirmar exclusão de conta?">
        <div className="space-y-5">
          <div className="p-4 rounded-lg bg-rose-500/5 border border-rose-500/10 text-rose-400 flex items-start gap-2.5">
            <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <div className="text-xs leading-relaxed">
              <strong>Cuidado: Esta ação é completamente irreversível!</strong> Ao prosseguir, todos os dados de vendas atribuídas das suas lojas virtuais serão perdidos e a API de Conversões deixará de reportar postbacks.
            </div>
          </div>
          <p className="text-xs text-neutral-400 leading-relaxed">
            Se deseja prosseguir com a exclusão de conta para Marlis Store Ltda, confirme sua intenção abaixo para processar o cancelamento da sua assinatura de faturamento mensal.
          </p>
          <div className="flex justify-end gap-3 pt-3">
            <button
              onClick={() => setDeleteModalOpen(false)}
              className="px-4 py-2 bg-neutral-900 hover:bg-neutral-800 text-neutral-400 text-xs font-bold rounded-lg border border-neutral-800 cursor-pointer"
            >
              Cancelar
            </button>
            <button
              onClick={handleDeleteAccount}
              disabled={isDeleting}
              className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold rounded-lg cursor-pointer flex items-center gap-1"
            >
              {isDeleting ? 'Excluindo...' : 'Simular Exclusão'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
