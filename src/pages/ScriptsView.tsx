import React, { useState } from 'react';
import { CodeBlock } from '../components/UIComponents';
import { Code, Download, RefreshCw, ChevronDown, ChevronUp, FileCode, CheckCircle2, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface ScriptsViewProps {
  selectedPixelId: string;
  onAddToast: (msg: string, type: 'success' | 'error' | 'info') => void;
}

export default function ScriptsView({ selectedPixelId, onAddToast }: ScriptsViewProps) {
  const [activePixelId, setActivePixelId] = useState(selectedPixelId || '843910582910482');
  const [activeAccordion, setActiveAccordion] = useState<string | null>(null);

  const getScript = (pixelId: string) => {
    return `<!-- Trackify Universal Global Pixel Tracking - v2.1.0 -->
<script>
  (function(t,r,a,c,k,i,f,y){
    t['TrackifyObject']=k;t[k]=t[k]||function(){
    (t[k].q=t[k].q||[]).push(arguments)},t[k].l=1*new Date();
    i=r.createElement(a),f=r.getElementsByTagName(a)[0];
    i.async=1;i.src=c;f.parentNode.insertBefore(i,f)
  })(window,document,'script','https://cdn.trackify.com.br/sdk/v2/trackify.min.js','trk');

  trk('init', '${pixelId}');
  trk('event', 'PageView');
</script>
<!-- End Trackify Global Code -->`;
  };

  const [scriptCode, setScriptCode] = useState(getScript(activePixelId));

  const handleRegenerate = () => {
    // Generate code with a newly shuffled mock tracking system
    const randomId = Math.floor(Math.random() * 900000000000000 + 100000000000000).toString();
    setActivePixelId(randomId);
    setScriptCode(getScript(randomId));
    onAddToast('Script do pixel universal regenerado e empacotado para o novo Pixel!', 'success');
  };

  const handleDownload = () => {
    onAddToast('Download iniciado! O arquivo trackify-pixel.js foi baixado.', 'success');
  };

  const toggleAccordion = (id: string) => {
    setActiveAccordion(prev => (prev === id ? null : id));
  };

  const installationGuides = [
    {
      id: 'wordpress',
      title: 'Wordpress',
      steps: [
        'Instale o plugin gratuito "Insert Headers and Footers" no painel do Wordpress.',
        'Acesse Configurações > Insert Headers and Footers.',
        'Cole o script de rastreamento do Trackify na caixa "Scripts in Header".',
        'Clique em Salvar para ativar o rastreamento em todas as páginas do site.'
      ]
    },
    {
      id: 'elementor',
      title: 'Elementor Pro',
      steps: [
        'No painel do WordPress, vá para Elementor > Custom Code.',
        'Clique em "Add New" no canto superior direito.',
        'Dê um título como "Trackify Universal Pixel" e selecione "Location: <head>".',
        'Cole o script na área de texto, defina "Priority: 1" e clique em "Publish".',
        'Defina as condições como "Entire Site" (todo o site) e clique em Salvar.'
      ]
    },
    {
      id: 'html',
      title: 'HTML Puro / Custom Stack',
      steps: [
        'Abra o arquivo principal do seu site (normalmente index.html ou header.php).',
        'Localize a tag de abertura <head> ou de fechamento </head>.',
        'Cole o script universal da Trackify logo antes da tag de fechamento </head>.',
        'Envie o arquivo atualizado para o seu servidor ou hospedeiro via FTP/Git.'
      ]
    },
    {
      id: 'webflow',
      title: 'Webflow',
      steps: [
        'Acesse o painel do seu projeto no Webflow e clique em "Project Settings".',
        'Navegue até a aba "Custom Code".',
        'Cole o código de rastreamento no campo "Head Code".',
        'Clique em Salvar alterações e publique o projeto em todos os domínios.'
      ]
    },
    {
      id: 'framer',
      title: 'Framer',
      steps: [
        'Abra o seu projeto no Framer e acesse "Settings" (Configurações).',
        'Navegue até a seção "General" > "Custom Code".',
        'Localize o bloco "Start of <head>" e cole o script universal.',
        'Clique em salvar e republique seu projeto para as tags entrarem em vigor.'
      ]
    }
  ];

  return (
    <div className="space-y-8 max-w-4xl">
      <div>
        <span className="text-[11px] font-black text-blue-500 uppercase tracking-[0.2em] font-mono">Instalação do Rastreamento</span>
        <h1 className="text-3xl font-extrabold tracking-tight text-[#FAFAFA] mt-1 font-display">Gerador de Script</h1>
        <p className="text-sm text-[#A1A1AA] mt-0.5">Instale o script universal em suas páginas para capturar automaticamente UTMs, FBCLID, cookies e visitas.</p>
      </div>

      {/* Main script generator panel */}
      <div className="p-6 rounded-2xl bg-[#18181B] border border-[#27272A] space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center gap-2 text-sm font-bold text-neutral-200">
            <FileCode className="w-5 h-5 text-blue-400" />
            Script Universal da Trackify
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleDownload}
              className="px-3.5 py-1.5 bg-neutral-900 hover:bg-neutral-800 text-neutral-300 rounded-lg border border-neutral-800 text-xs font-semibold flex items-center gap-1.5 cursor-pointer active:scale-95"
            >
              <Download className="w-3.5 h-3.5" />
              Baixar Código
            </button>
            <button
              onClick={handleRegenerate}
              className="px-3.5 py-1.5 bg-blue-600/10 hover:bg-blue-600/20 text-blue-400 rounded-lg border border-blue-500/10 text-xs font-semibold flex items-center gap-1.5 cursor-pointer active:scale-95"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Regerar Script
            </button>
          </div>
        </div>

        {/* Code display */}
        <CodeBlock
          code={scriptCode}
          language="html"
          title={`trackify_universal_script_${activePixelId}.html`}
          onCopySuccess={() => onAddToast('Script copiado com sucesso!', 'success')}
        />

        <div className="p-4 rounded-xl bg-blue-500/5 border border-blue-500/10 flex items-start gap-3">
          <CheckCircle2 className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" />
          <div className="space-y-0.5">
            <h4 className="text-xs font-bold text-neutral-200">Configurado para o Pixel Ativo: {activePixelId}</h4>
            <p className="text-[11px] text-[#A1A1AA] leading-relaxed">
              O script acima contém a chamada <code className="text-neutral-300 font-mono">trk(\'init\', \'{activePixelId}\')</code>, mapeando todos os dados a este ativo automaticamente. Se trocar de pixel de vendas, mude o ID no código acima.
            </p>
          </div>
        </div>
      </div>

      {/* Accordions installation guides */}
      <div className="space-y-4">
        <div>
          <h3 className="text-base font-semibold text-[#FAFAFA] flex items-center gap-2">
            <Code className="w-4 h-4 text-blue-400" />
            Como Instalar na sua Plataforma
          </h3>
          <p className="text-xs text-[#A1A1AA] mt-1">Siga o passo a passo correspondente ao construtor de páginas ou CMS que você utiliza.</p>
        </div>

        <div className="space-y-3">
          {installationGuides.map((guide) => {
            const isOpen = activeAccordion === guide.id;
            return (
              <div
                key={guide.id}
                className="rounded-xl border border-neutral-800 bg-[#111113]/30 overflow-hidden"
              >
                {/* Trigger */}
                <button
                  onClick={() => toggleAccordion(guide.id)}
                  className="w-full px-5 py-4 flex items-center justify-between text-left font-semibold text-xs text-neutral-200 hover:bg-[#18181B]/40 transition-colors"
                >
                  <span>Como instalar no {guide.title}</span>
                  {isOpen ? <ChevronUp className="w-4 h-4 text-neutral-400" /> : <ChevronDown className="w-4 h-4 text-neutral-400" />}
                </button>

                {/* Body panels */}
                <AnimatePresence>
                  {isOpen && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.2 }}
                      className="border-t border-neutral-800 bg-[#18181B]/15 px-5 py-4"
                    >
                      <ol className="list-decimal list-inside space-y-2.5 text-xs text-neutral-400">
                        {guide.steps.map((step, idx) => (
                          <li key={idx} className="leading-relaxed">
                            <span className="text-neutral-300 font-medium ml-1.5">{step}</span>
                          </li>
                        ))}
                      </ol>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </div>

      <div className="p-4 rounded-xl bg-neutral-900 border border-neutral-800 flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-amber-500 mt-0.5 flex-shrink-0" />
        <div>
          <h4 className="text-xs font-semibold text-neutral-200">Verificação do Script</h4>
          <p className="text-xs text-[#A1A1AA] mt-1 leading-relaxed">
            Após realizar a instalação, acesse seu site em uma janela anônima e realize ações. Logo em seguida, acerte o botão de sincronização no painel da Trackify ou verifique a tela de Webhooks/Logs para conferir se seu IP e as UTMs estão sendo escutados corretamente de forma realtime.
          </p>
        </div>
      </div>
    </div>
  );
}
