import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  Target,
  Activity,
  Link,
  Code,
  Sliders,
  Webhook,
  Key,
  BarChart3,
  Settings,
  User,
  HelpCircle,
  Bell,
  Search,
  Zap,
  Menu,
  X,
  Compass,
  ArrowUpRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

// Import views
import OnboardingView from './pages/OnboardingView';
import DashboardView from './pages/DashboardView';
import MetaView from './pages/MetaView';
import PixelsView from './pages/PixelsView';
import IntegrationsView from './pages/IntegrationsView';
import WebhookView from './pages/WebhookView';
import ApiView from './pages/ApiView';
import ScriptsView from './pages/ScriptsView';
import UtmView from './pages/UtmView';
import ReportsView from './pages/ReportsView';
import SettingsView from './pages/SettingsView';
import ProfileView from './pages/ProfileView';

// Import types & mock data
import { Pixel, Integration, WebhookLog } from './types';
import { mockPixels, mockIntegrations, mockWebhookLogs } from './mockData';
import { Toaster, ToastMessage } from './components/UIComponents';
import { dataService, isSupabaseConnected } from './lib/supabase';

export default function App() {
  // Global States
  const [isOnboarding, setIsOnboarding] = useState(true);
  const [currentTab, setCurrentTab] = useState('dashboard');
  const [isMetaConnected, setIsMetaConnected] = useState(() => localStorage.getItem('trackify_meta_connected') === 'true');
  const [selectedPixelId, setSelectedPixelId] = useState('843910582910482');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Dynamic assets lists
  const [pixels, setPixels] = useState<Pixel[]>(mockPixels);
  const [integrations, setIntegrations] = useState<Integration[]>(mockIntegrations);
  const [webhookLogs, setWebhookLogs] = useState<WebhookLog[]>(mockWebhookLogs);
  const [dbConnected, setDbConnected] = useState(isSupabaseConnected());

  const loadAllData = async () => {
    try {
      const live = isSupabaseConnected();
      setDbConnected(live);
      
      const loadedPixels = await dataService.getPixels();
      const loadedIntegrations = await dataService.getIntegrations();
      const loadedWebhookLogs = await dataService.getWebhookLogs();
      
      setPixels(loadedPixels);
      setIntegrations(loadedIntegrations);
      setWebhookLogs(loadedWebhookLogs);
    } catch (e) {
      console.warn('Erro ao carregar dados do Supabase/LocalDb:', e);
    }
  };

  useEffect(() => {
    loadAllData();
  }, [currentTab]);

  // Check for successful OAuth callback redirect
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('oauth_success') === 'true') {
      setIsMetaConnected(true);
      const userName = urlParams.get('user_name') || 'Guilherme Silva';
      const accountsCount = urlParams.get('accounts') || '0';
      const pixelsCount = urlParams.get('pixels') || '0';
      
      localStorage.setItem('trackify_meta_connected', 'true');
      localStorage.setItem('trackify_meta_user_name', userName);
      
      addToast(`Conexão com Meta Ads realizada com sucesso! Sincronizado ${accountsCount} contas e ${pixelsCount} pixels. 🟢`, 'success');
      
      // Clean query parameters dynamically
      window.history.replaceState({}, document.title, window.location.pathname);
      setCurrentTab('meta');
      loadAllData();
    }
  }, []);

  // API credentials states
  const [apiKey, setApiKey] = useState('tr_key_9284102');
  const [apiSecret, setApiSecret] = useState('tr_sec_841029481928401928');
  const [apiToken, setApiToken] = useState('EAAbz9104928104829104892019201928401928402198');

  // User details
  const [userProfile, setUserProfile] = useState({
    name: 'Guilherme Silva',
    email: 'marlisstore.com@gmail.com',
    company: 'Marlis Store Ltda',
    plan: 'Trackify Escala Pro',
    usage: {
      eventsUsed: 142109,
      eventsLimit: 500000,
      pixelsUsed: 2,
      pixelsLimit: 5,
    },
  });

  // Toasts management state
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const handleUpdateProfile = (name: string, company: string) => {
    setUserProfile(prev => ({
      ...prev,
      name,
      company
    }));
  };

  const handleUpdateKeys = (key: string, secret: string, token: string) => {
    setApiKey(key);
    setApiSecret(secret);
    setApiToken(token);
  };

  const handleAddLog = (newLog: WebhookLog) => {
    setWebhookLogs(prev => [newLog, ...prev]);
  };

  const sidebarOptions = [
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard className="w-4 h-4" /> },
    { id: 'meta', label: 'Meta Connection', icon: <Target className="w-4 h-4" /> },
    { id: 'pixels', label: 'Pixels', icon: <Activity className="w-4 h-4" /> },
    { id: 'integracoes', label: 'Integrações', icon: <Link className="w-4 h-4" /> },
    { id: 'scripts', label: 'Scripts', icon: <Code className="w-4 h-4" /> },
    { id: 'utms', label: 'UTMs', icon: <Sliders className="w-4 h-4" /> },
    { id: 'webhooks', label: 'Webhooks', icon: <Webhook className="w-4 h-4" /> },
    { id: 'api', label: 'API Integrations', icon: <Key className="w-4 h-4" /> },
    { id: 'relatorios', label: 'Relatórios', icon: <BarChart3 className="w-4 h-4" /> },
    { id: 'configuracoes', label: 'Configurações', icon: <Settings className="w-4 h-4" /> },
    { id: 'perfil', label: 'Perfil de Conta', icon: <User className="w-4 h-4" /> },
  ];

  const handleSidebarClick = (id: string) => {
    setCurrentTab(id);
    setMobileMenuOpen(false);
  };

  // Render subviews based on active tab state
  const renderTabContent = () => {
    switch (currentTab) {
      case 'dashboard':
        return <DashboardView onAddToast={addToast} />;
      case 'meta':
        return (
          <MetaView
            isMetaConnected={isMetaConnected}
            onConnectMeta={setIsMetaConnected}
            onAddToast={addToast}
            selectedPixelId={selectedPixelId}
            onSelectPixel={setSelectedPixelId}
          />
        );
      case 'pixels':
        return (
          <PixelsView
            pixels={pixels}
            onAddToast={addToast}
            onUpdatePixels={setPixels}
          />
        );
      case 'integracoes':
        return (
          <IntegrationsView
            integrations={integrations}
            onAddToast={addToast}
            onUpdateIntegrations={setIntegrations}
          />
        );
      case 'scripts':
        return <ScriptsView selectedPixelId={selectedPixelId} onAddToast={addToast} />;
      case 'utms':
        return <UtmView onAddToast={addToast} />;
      case 'webhooks':
        return (
          <WebhookView
            webhookLogs={webhookLogs}
            onAddToast={addToast}
            onAddLog={handleAddLog}
          />
        );
      case 'api':
        return (
          <ApiView
            apiKey={apiKey}
            apiSecret={apiSecret}
            apiToken={apiToken}
            onUpdateKeys={handleUpdateKeys}
            onAddToast={addToast}
            onRefreshDb={loadAllData}
          />
        );
      case 'relatorios':
        return <ReportsView onAddToast={addToast} />;
      case 'configuracoes':
        return (
          <SettingsView
            onAddToast={addToast}
            userProfile={userProfile}
            onUpdateProfile={handleUpdateProfile}
          />
        );
      case 'perfil':
        return <ProfileView userProfile={userProfile} onAddToast={addToast} />;
      default:
        return <DashboardView onAddToast={addToast} />;
    }
  };

  // If first open, render full-screen Onboarding Wizard
  if (isOnboarding) {
    return (
      <div className="bg-[#09090B]">
        <OnboardingView onComplete={() => setIsOnboarding(false)} onAddToast={addToast} />
        <Toaster toasts={toasts} onRemove={removeToast} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#09090B] text-[#FAFAFA] flex flex-col md:flex-row antialiased select-none font-sans">
      {/* Dynamic Toaster floating manager */}
      <Toaster toasts={toasts} onRemove={removeToast} />

      {/* MOBILE HEADER BAR */}
      <div className="md:hidden flex items-center justify-between p-4 bg-[#111113] border-b border-[#27272A] z-40 sticky top-0">
        <div className="flex items-center gap-2">
          <span className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center font-bold font-mono text-white text-xs">T</span>
          <span className="text-sm font-bold tracking-tight text-white">Trackify</span>
        </div>
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-1.5 hover:bg-neutral-800 rounded-lg text-neutral-400 hover:text-white transition-all cursor-pointer"
        >
          {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* SIDEBAR NAVIGATION PANEL */}
      <div
        className={`fixed md:sticky top-0 left-0 h-screen w-64 bg-[#111113] border-r border-[#27272A] flex flex-col justify-between z-30 transition-transform duration-300 md:translate-x-0 ${
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Top Logo & Options list */}
        <div className="flex flex-col space-y-7 p-5 overflow-y-auto max-h-[calc(100vh-140px)]">
          {/* Logo container */}
          <div className="flex items-center gap-3">
            <span className="w-8 h-8 rounded-xl bg-blue-600 flex items-center justify-center font-bold font-mono tracking-tight text-white shadow-[0_4px_12px_rgba(37,99,235,0.3)]">
              T
            </span>
            <div>
              <span className="text-sm font-extrabold tracking-tight text-white">Trackify</span>
              <span className="text-[9px] block text-neutral-500 font-mono font-bold tracking-wider -mt-0.5 uppercase">attribution saas</span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1">
            {sidebarOptions.map((opt) => {
              const isActive = currentTab === opt.id;
              return (
                <button
                  key={opt.id}
                  onClick={() => handleSidebarClick(opt.id)}
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all duration-150 text-left cursor-pointer ${
                    isActive
                      ? 'bg-blue-600 text-white font-bold shadow-lg shadow-blue-600/15'
                      : 'text-neutral-400 hover:text-neutral-200 hover:bg-[#18181B]/50'
                  }`}
                >
                  <span className={`${isActive ? 'text-white' : 'text-neutral-500'}`}>{opt.icon}</span>
                  {opt.label}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Bottom Upgrade Card & User card */}
        <div className="p-4 border-t border-[#27272A] space-y-4">
          {/* Upgrade Banner */}
          <div className="p-3.5 rounded-xl bg-[#18181B] border border-blue-500/10 space-y-2.5 shadow-md">
            <div className="flex items-center gap-1.5 text-[10px] font-bold text-blue-400 font-mono uppercase tracking-wider">
              <Zap className="w-3 h-3 fill-current" />
              Versão Escala Ativa
            </div>
            <p className="text-[10px] text-neutral-400 leading-relaxed">Atribua até 1M de eventos com 100% de Match Quality.</p>
            <button
              onClick={() => addToast('Direcionando para upgrade Pro (Simulado)...', 'info')}
              className="w-full py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-[10px] font-bold rounded-lg transition-colors flex items-center justify-center gap-1 cursor-pointer"
            >
              <span>Fazer Upgrade</span>
              <ArrowUpRight className="w-3 h-3" />
            </button>
          </div>

          {/* User Profile info card */}
          <div
            onClick={() => handleSidebarClick('perfil')}
            className="flex items-center gap-3 p-2 hover:bg-[#18181B]/50 rounded-xl cursor-pointer transition-colors"
          >
            <div className="w-8.5 h-8.5 rounded-lg bg-blue-600/10 border border-blue-500/20 flex items-center justify-center font-bold font-mono text-xs text-blue-400 select-none">
              GS
            </div>
            <div className="min-w-0 flex-grow">
              <h4 className="text-xs font-bold text-neutral-200 truncate leading-tight">{userProfile.name}</h4>
              <p className="text-[10px] text-neutral-500 truncate mt-0.5">{userProfile.plan}</p>
            </div>
          </div>
        </div>
      </div>

      {/* MAIN CONTAINER WORKSPACE */}
      <div className="flex-grow flex flex-col min-w-0">
        {/* GLOBAL TOP HEADER BAR */}
        <header className="hidden md:flex items-center justify-between px-8 py-4 border-b border-[#27272A] bg-[#09090B] z-20 sticky top-0 backdrop-blur-md bg-opacity-80">
          {/* Search bar mockup */}
          <div className="relative w-72">
            <Search className="w-4 h-4 text-neutral-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Pesquisar transações, pixels, campanhas..."
              readOnly
              onClick={() => addToast('Digite na caixa do relatório para realizar filtragens de logs.', 'info')}
              className="w-full pl-9 pr-4 py-1.5 bg-[#111113] border border-neutral-800 rounded-lg text-xs text-neutral-400 placeholder-neutral-500 focus:outline-none focus:border-neutral-700 transition-colors cursor-pointer"
            />
          </div>

          {/* Supabase connection badge */}
          <div className="flex items-center gap-2">
            {dbConnected ? (
              <span 
                onClick={() => setCurrentTab('api')}
                className="inline-flex items-center gap-1.5 bg-emerald-500/10 hover:bg-emerald-500/15 border border-emerald-500/20 text-emerald-400 text-[11px] px-3 py-1.5 rounded-full font-bold cursor-pointer transition-colors duration-150"
              >
                <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
                Supabase: Conectado 🟢
              </span>
            ) : (
              <span 
                onClick={() => setCurrentTab('api')}
                className="inline-flex items-center gap-1.5 bg-amber-500/10 hover:bg-amber-500/15 border border-amber-500/20 text-amber-400 text-[11px] px-3 py-1.5 rounded-full font-bold cursor-pointer transition-colors duration-150"
              >
                <span className="w-1.5 h-1.5 bg-amber-400 rounded-full" />
                Banco Local (Offline) 🟡
              </span>
            )}
          </div>

          {/* User navigation tools shortcuts */}
          <div className="flex items-center gap-4">
            {/* Simulation reset shortcut */}
            <button
              onClick={() => {
                setIsOnboarding(true);
                addToast('Onboarding de boas-vindas reativado para testes.', 'info');
              }}
              className="px-2.5 py-1 text-[10px] font-mono bg-blue-600/10 hover:bg-blue-600/20 text-blue-400 rounded border border-blue-500/20 transition-all duration-150 active:scale-95 cursor-pointer"
              title="Demonstrar fluxo inicial do zero"
            >
              Simular Primeira Entrada (Onboarding)
            </button>

            {/* Help */}
            <button
              onClick={() => addToast('Canal de ajuda ativo via chat prioritário Pro no Telegram!', 'success')}
              className="p-1.5 hover:bg-neutral-900 rounded-lg text-neutral-400 hover:text-white transition-colors cursor-pointer"
              title="Central de Suporte"
            >
              <HelpCircle className="w-4.5 h-4.5" />
            </button>

            {/* Notifications */}
            <button
              onClick={() => addToast('Nenhum erro de sincronização de CAPI nas últimas 24h. Integridade ideal!', 'success')}
              className="p-1.5 hover:bg-neutral-900 rounded-lg text-neutral-400 hover:text-white relative transition-colors cursor-pointer"
              title="Notificações"
            >
              <Bell className="w-4.5 h-4.5" />
              <span className="absolute top-1 right-1 w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
            </button>

            {/* Avatar shortcut */}
            <div
              onClick={() => handleSidebarClick('perfil')}
              className="w-8 h-8 rounded-lg bg-blue-600/10 border border-blue-500/20 flex items-center justify-center font-bold font-mono text-xs text-blue-400 cursor-pointer hover:border-blue-500 hover:shadow-[0_0_12px_rgba(37,99,235,0.2)] transition-all select-none"
              title="Acessar Perfil"
            >
              GS
            </div>
          </div>
        </header>

        {/* WORKSPACE VIEW CONTENT SCROLL */}
        <main className="flex-grow p-6 md:p-8 overflow-y-auto space-y-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentTab}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25 }}
            >
              {renderTabContent()}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}

