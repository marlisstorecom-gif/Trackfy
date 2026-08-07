import React, { useState } from 'react';
import { StatusBadge, CodeBlock, StepCard } from '../components/UIComponents';
import { mockPixels } from '../mockData';
import { Sparkles, Check, ChevronRight, ChevronLeft, ShieldCheck, Zap, Laptop, FileText, Target, Activity } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface OnboardingViewProps {
  onComplete: () => void;
  onAddToast: (msg: string, type: 'success' | 'error' | 'info') => void;
}

export default function OnboardingView({ onComplete, onAddToast }: OnboardingViewProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [isMetaConnected, setIsMetaConnected] = useState(false);
  const [selectedPixelId, setSelectedPixelId] = useState('843910582910482');
  const [selectedGateway, setSelectedGateway] = useState('hotmart');
  const [isGatewayConnected, setIsGatewayConnected] = useState(false);

  const handleConnectMeta = () => {
    setIsMetaConnected(true);
    onAddToast('Meta Ads integrado ao onboarding!', 'success');
  };

  const handleConnectGateway = () => {
    setIsGatewayConnected(true);
    onAddToast('Gateway de pagamento conectado ao onboarding!', 'success');
  };

  const handleNextStep = () => {
    if (currentStep === 2 && !isMetaConnected) {
      onAddToast('Recomendado: Conecte sua conta Meta Ads para prosseguir ou pule.', 'info');
    }
    if (currentStep < 5) {
      setCurrentStep(prev => prev + 1);
    } else {
      onComplete();
      onAddToast('Boas-vindas ao Trackify! Setup inicial concluído com sucesso.', 'success');
    }
  };

  const handlePrevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    }
  };

  // Step information
  const steps = [
    { number: 1, title: 'Bem-vindo', desc: 'Introdução ao Trackify' },
    { number: 2, title: 'Conectar Meta', desc: 'Vincule seu Facebook' },
    { number: 3, title: 'Selecionar Pixel', desc: 'Escolha o Pixel de vendas' },
    { number: 4, title: 'Integrar Plataforma', desc: 'Ligue seu checkout de vendas' },
    { number: 5, title: 'Instalar Script', desc: 'Código universal de tracking' }
  ];

  return (
    <div className="min-h-screen bg-[#09090B] text-[#FAFAFA] flex flex-col justify-between py-10 px-4 sm:px-6 lg:px-8">
      {/* Top logo */}
      <div className="max-w-5xl w-full mx-auto flex justify-between items-center pb-6 border-b border-neutral-900">
        <div className="flex items-center gap-2">
          <span className="w-8 h-8 rounded-xl bg-blue-600 flex items-center justify-center font-bold font-mono tracking-tight text-white shadow-[0_4px_12px_rgba(37,99,235,0.3)]">T</span>
          <span className="text-base font-bold tracking-tight text-white">Trackify</span>
        </div>
        <button
          onClick={onComplete}
          className="text-xs text-neutral-400 hover:text-white transition-colors cursor-pointer"
        >
          Pular Onboarding
        </button>
      </div>

      {/* Main container */}
      <div className="max-w-5xl w-full mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 my-auto items-center py-8">
        {/* Left column indicators */}
        <div className="lg:col-span-4 space-y-3.5">
          <div className="space-y-1 mb-6">
            <span className="text-[11px] font-black text-blue-500 uppercase tracking-[0.2em] font-mono">Assistente de Setup</span>
            <h2 className="text-2xl font-extrabold text-[#FAFAFA] font-display">Configuração em 5 Passos</h2>
            <p className="text-xs text-neutral-400">Siga as etapas guiadas para ativar sua infraestrutura de atribuição.</p>
          </div>

          <div className="space-y-2">
            {steps.map((s) => (
              <StepCard
                key={s.number}
                number={s.number}
                title={s.title}
                description={s.desc}
                active={currentStep === s.number}
                completed={currentStep > s.number}
                onClick={() => {
                  if (s.number < currentStep || isMetaConnected) {
                    setCurrentStep(s.number);
                  }
                }}
              />
            ))}
          </div>
        </div>

        {/* Right column active card step content */}
        <div className="lg:col-span-8 p-8 rounded-2xl bg-[#18181B] border border-[#27272A] min-h-[440px] flex flex-col justify-between relative overflow-hidden shadow-2xl">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              {/* Step 1: Welcome Screen */}
              {currentStep === 1 && (
                <div className="space-y-5">
                  <div className="w-12 h-12 rounded-xl bg-blue-600/10 flex items-center justify-center border border-blue-500/20 text-blue-500">
                    <Sparkles className="w-6 h-6 animate-pulse" />
                  </div>
                  <div className="space-y-2">
                    <h2 className="text-2xl font-black text-white leading-tight">Sua jornada de atribuição de vendas começa aqui!</h2>
                    <p className="text-sm text-neutral-400 leading-relaxed">
                      Seja bem-vindo ao <strong className="text-white">Trackify</strong>. Desenvolvemos uma plataforma integrada server-to-server que cruza dados UTM do seu site com postbacks dos seus gateways de pagamento, encaminhando-os diretamente para a Conversions API (CAPI) do Facebook.
                    </p>
                  </div>

                  {/* Decorative minimalist vector mockup */}
                  <div className="p-4 rounded-xl bg-[#111113]/60 border border-neutral-800/80 flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg bg-neutral-900 border border-neutral-800 flex items-center justify-center text-lg">
                      📊
                    </div>
                    <div className="flex-grow">
                      <div className="text-xs font-bold text-neutral-200">Retorno médio sob investimentos (ROAS)</div>
                      <div className="text-[10px] text-[#A1A1AA] mt-1 flex items-center gap-2">
                        <span>Sem Trackify: <strong className="text-rose-400">1.8x</strong></span>
                        <span className="text-neutral-700">•</span>
                        <span>Com Trackify CAPI: <strong className="text-emerald-400">3.4x (atribuído)</strong></span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 2: Meta integration */}
              {currentStep === 2 && (
                <div className="space-y-5">
                  <div className="w-12 h-12 rounded-xl bg-blue-600/10 flex items-center justify-center border border-blue-500/20 text-blue-500">
                    <Target className="w-6 h-6" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-xl font-bold text-white">Conecte sua conta do Facebook Ads</h3>
                    <p className="text-xs text-[#A1A1AA] leading-relaxed">
                      Conceda autorização de acesso ao Facebook para listar suas contas comerciais e gerenciar a injeção do Conversions API de forma automática.
                    </p>
                  </div>

                  {!isMetaConnected ? (
                    <button
                      onClick={handleConnectMeta}
                      className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs rounded-xl transition-all shadow-lg shadow-blue-600/10 active:scale-98 flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                      </svg>
                      Conectar com Facebook Business
                    </button>
                  ) : (
                    <div className="p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/15 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="w-7 h-7 bg-emerald-500/10 rounded-full flex items-center justify-center text-emerald-400">
                          <Check className="w-4 h-4" />
                        </span>
                        <div>
                          <div className="text-xs font-bold text-neutral-200">Guilherme Ads Agency conectada</div>
                          <div className="text-[10px] text-neutral-500 font-mono mt-0.5">bm_92841029482910</div>
                        </div>
                      </div>
                      <StatusBadge status="connected" />
                    </div>
                  )}
                </div>
              )}

              {/* Step 3: Select default pixel */}
              {currentStep === 3 && (
                <div className="space-y-5">
                  <div className="w-12 h-12 rounded-xl bg-blue-600/10 flex items-center justify-center border border-blue-500/20 text-blue-500">
                    <Activity className="w-6 h-6" />
                  </div>
                  <div className="space-y-1.5">
                    <h3 className="text-xl font-bold text-white">Vincule seu Pixel ativo</h3>
                    <p className="text-xs text-neutral-400">Defina o pixel receptor primário das suas conversões.</p>
                  </div>

                  <div className="space-y-2 max-h-[160px] overflow-y-auto">
                    {mockPixels.map((p) => {
                      const isSelected = selectedPixelId === p.id;
                      return (
                        <div
                          key={p.id}
                          onClick={() => setSelectedPixelId(p.id)}
                          className={`p-3 rounded-lg border cursor-pointer flex justify-between items-center transition-all ${
                            isSelected ? 'bg-blue-500/5 border-blue-500' : 'bg-[#111113]/60 border-neutral-800 hover:border-neutral-700'
                          }`}
                        >
                          <div className="flex items-center gap-2.5">
                            <span className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${
                              isSelected ? 'bg-blue-600 border-blue-500 text-white' : 'border-neutral-700 bg-neutral-900'
                            }`}>
                              {isSelected && <span className="w-1.5 h-1.5 bg-white rounded-full" />}
                            </span>
                            <div className="text-xs font-bold text-neutral-200">{p.name}</div>
                          </div>
                          <span className="text-[10px] font-mono text-neutral-500">ID: {p.id}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Step 4: Platform integration */}
              {currentStep === 4 && (
                <div className="space-y-5">
                  <div className="w-12 h-12 rounded-xl bg-blue-600/10 flex items-center justify-center border border-blue-500/20 text-blue-500">
                    <Zap className="w-6 h-6" />
                  </div>
                  <div className="space-y-1.5">
                    <h3 className="text-xl font-bold text-white">Integrar seu Gateway de Vendas</h3>
                    <p className="text-xs text-neutral-400">Escolha o gateway que processa suas vendas para sincronizar os postbacks.</p>
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { id: 'hotmart', name: 'Hotmart', logo: '🔥' },
                      { id: 'kiwify', name: 'Kiwify', logo: '🥝' },
                      { id: 'shopify', name: 'Shopify', logo: '🛍️' }
                    ].map(g => {
                      const isSelected = selectedGateway === g.id;
                      return (
                        <div
                          key={g.id}
                          onClick={() => setSelectedGateway(g.id)}
                          className={`p-4 rounded-xl border cursor-pointer text-center space-y-2 transition-all ${
                            isSelected ? 'bg-blue-500/5 border-blue-500' : 'bg-[#111113]/60 border-neutral-800 hover:border-neutral-700'
                          }`}
                        >
                          <div className="text-2xl">{g.logo}</div>
                          <div className="text-xs font-semibold text-neutral-200">{g.name}</div>
                        </div>
                      );
                    })}
                  </div>

                  {!isGatewayConnected ? (
                    <button
                      onClick={handleConnectGateway}
                      className="w-full py-2.5 bg-[#111113] hover:bg-neutral-800 text-neutral-200 font-semibold text-xs rounded-xl border border-neutral-800 transition-colors cursor-pointer"
                    >
                      Conectar {selectedGateway === 'hotmart' ? 'Hotmart' : selectedGateway === 'kiwify' ? 'Kiwify' : 'Shopify'}
                    </button>
                  ) : (
                    <div className="p-3 bg-emerald-500/5 border border-emerald-500/15 rounded-lg text-center text-xs text-emerald-400 font-bold">
                      Integração com {selectedGateway.toUpperCase()} configurada com sucesso!
                    </div>
                  )}
                </div>
              )}

              {/* Step 5: Install Tracking Script */}
              {currentStep === 5 && (
                <div className="space-y-4">
                  <div className="w-10 h-10 rounded-xl bg-blue-600/10 flex items-center justify-center border border-blue-500/20 text-blue-500">
                    <Laptop className="w-5 h-5" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-lg font-bold text-white">Instale seu código universal</h3>
                    <p className="text-[11px] text-neutral-400 leading-relaxed">
                      Cole o script universal na tag <code className="text-neutral-300 font-mono">&lt;head&gt;</code> das suas páginas de captura e venda.
                    </p>
                  </div>

                  <div className="max-h-[160px] overflow-y-auto">
                    <CodeBlock
                      code={`<script>
  (function(t,r,a,c,k,i,f){
    t['TrackifyObject']=k;t[k]=t[k]||function(){
    (t[k].q=t[k].q||[]).push(arguments)},t[k].l=1*new Date();
    i=r.createElement(a),f=r.getElementsByTagName(a)[0];
    i.async=1;i.src=c;f.parentNode.insertBefore(i,f)
  })(window,document,'script','https://cdn.trackify.com.br/sdk/v2/trackify.min.js','trk');

  trk('init', '${selectedPixelId}');
  trk('event', 'PageView');
</script>`}
                      language="html"
                      onCopySuccess={() => onAddToast('Script copiado para área de transferência!', 'success')}
                    />
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>

          {/* Setup controls buttons at bottom */}
          <div className="flex items-center justify-between border-t border-neutral-800 pt-6 mt-6">
            <button
              onClick={handlePrevStep}
              disabled={currentStep === 1}
              className="px-4 py-2.5 text-xs font-semibold text-neutral-400 hover:text-white disabled:text-neutral-700 disabled:bg-transparent bg-neutral-900 rounded-lg border border-neutral-800 disabled:border-transparent transition-all cursor-pointer flex items-center gap-1.5"
            >
              <ChevronLeft className="w-4 h-4" />
              Voltar
            </button>
            <button
              onClick={handleNextStep}
              className="px-5 py-2.5 text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-all active:scale-95 flex items-center gap-1 cursor-pointer shadow-lg shadow-blue-600/15"
            >
              {currentStep === 5 ? 'Finalizar e Acessar' : 'Próximo'}
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Footer copyright */}
      <div className="max-w-5xl w-full mx-auto text-center pt-6 border-t border-neutral-900 text-[10px] text-neutral-600 font-mono">
        © 2026 Trackify attribution technologies. Todos os direitos reservados.
      </div>
    </div>
  );
}
