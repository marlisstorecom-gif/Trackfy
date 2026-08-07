import React, { useState } from 'react';
import { CodeBlock } from '../components/UIComponents';
import { Target, HelpCircle, Copy, Check, CheckCircle2, Sliders, Info } from 'lucide-react';
import { motion } from 'motion/react';

interface UtmViewProps {
  onAddToast: (msg: string, type: 'success' | 'error' | 'info') => void;
}

export default function UtmView({ onAddToast }: UtmViewProps) {
  const utmString = `utm_source=facebook&utm_medium=cpc&utm_campaign={{campaign.name}}&utm_content={{adset.name}}&utm_term={{ad.name}}&pixel_id=843910582910482`;

  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(utmString);
    setCopied(true);
    onAddToast('Parâmetros UTM dinâmicos copiados para a área de transferência!', 'success');
    setTimeout(() => setCopied(false), 2000);
  };

  const parametersList = [
    { name: 'utm_source', val: 'facebook', desc: 'Identifica a origem do tráfego. Recomendado mapear como estático "facebook".' },
    { name: 'utm_medium', val: 'cpc', desc: 'Identifica o formato de mídia. Recomendado mapear como "cpc" (Custo por Clique) ou "paid-social".' },
    { name: 'utm_campaign', val: '{{campaign.name}}', desc: 'Facebook injeta dinamicamente o nome exato da sua Campanha.' },
    { name: 'utm_content', val: '{{adset.name}}', desc: 'Facebook injeta dinamicamente o nome exato do seu Conjunto de Anúncios.' },
    { name: 'utm_term', val: '{{ad.name}}', desc: 'Facebook injeta dinamicamente o nome exato do seu Anúncio individual.' },
    { name: 'pixel_id', val: '843910582910482', desc: 'ID do Pixel do Facebook configurado para receber as conversões.' },
  ];

  return (
    <div className="space-y-8 max-w-4xl">
      <div>
        <span className="text-[11px] font-black text-blue-500 uppercase tracking-[0.2em] font-mono">Atribuição de Campanhas</span>
        <h1 className="text-3xl font-extrabold tracking-tight text-[#FAFAFA] mt-1 font-display">Parâmetros UTM de Atribuição</h1>
        <p className="text-sm text-[#A1A1AA] mt-0.5">Configure os parâmetros dinâmicos oficiais nas URLs de seus anúncios do Facebook Ads.</p>
      </div>

      {/* Main code block and copy */}
      <div className="p-6 rounded-2xl bg-[#18181B] border border-[#27272A] space-y-6">
        <div className="flex justify-between items-center">
          <h3 className="text-xs font-bold text-neutral-300 uppercase tracking-wider font-mono flex items-center gap-1.5">
            <Target className="w-4 h-4 text-blue-400" />
            Parâmetros Recomendados para o Facebook Ads
          </h3>
          <button
            onClick={handleCopy}
            className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer active:scale-95"
          >
            {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            Copiar Suffix de URL
          </button>
        </div>

        <CodeBlock
          code={utmString}
          language="text"
          title="Meta_Ads_URL_Parameters_Template.txt"
          onCopySuccess={() => onAddToast('Suffix UTM copiado com sucesso!', 'success')}
        />

        <p className="text-xs text-neutral-400 leading-relaxed">
          Ao copiar este bloco de código e colar no campo <strong className="text-neutral-300">"Parâmetros de URL"</strong> no gerenciador de anúncios, o Facebook irá preencher de forma 100% automatizada os nomes das suas campanhas, anúncios e criativos.
        </p>
      </div>

      {/* Parameter dictionary */}
      <div className="space-y-4">
        <h3 className="text-base font-semibold text-[#FAFAFA]">O que cada parâmetro rastreia:</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {parametersList.map((p) => (
            <div key={p.name} className="p-4 rounded-xl bg-[#111113]/30 border border-neutral-800/80 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-blue-400">{p.name}</span>
                  <span className="text-[10px] font-mono text-neutral-500 bg-neutral-900 px-1.5 py-0.5 rounded border border-neutral-800">{p.val}</span>
                </div>
                <p className="text-xs text-[#A1A1AA] mt-2 leading-relaxed">{p.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Visual Tutorial */}
      <div className="p-6 rounded-2xl bg-[#18181B] border border-[#27272A] space-y-5">
        <h3 className="text-base font-bold text-[#FAFAFA] flex items-center gap-2 border-b border-neutral-800 pb-3">
          <Sliders className="w-4.5 h-4.5 text-blue-400" />
          Guia Visual de Instalação (Facebook Ads Manager)
        </h3>

        <div className="space-y-4">
          <div className="flex items-start gap-3">
            <span className="flex-shrink-0 w-5 h-5 rounded-full bg-neutral-800 text-neutral-300 text-xs font-bold flex items-center justify-center font-mono">1</span>
            <p className="text-xs text-[#A1A1AA] leading-relaxed">
              Crie ou edite uma campanha e navegue até a última etapa de configuração (nível de <strong className="text-neutral-200">Anúncio / Criativo</strong>).
            </p>
          </div>
          <div className="flex items-start gap-3">
            <span className="flex-shrink-0 w-5 h-5 rounded-full bg-neutral-800 text-neutral-300 text-xs font-bold flex items-center justify-center font-mono">2</span>
            <p className="text-xs text-[#A1A1AA] leading-relaxed">
              Role a página de edição até o rodapé final na caixa de seleção chamada <strong className="text-neutral-200">"Rastreamento"</strong>.
            </p>
          </div>
          <div className="flex items-start gap-3">
            <span className="flex-shrink-0 w-5 h-5 rounded-full bg-neutral-800 text-neutral-300 text-xs font-bold flex items-center justify-center font-mono">3</span>
            <p className="text-xs text-[#A1A1AA] leading-relaxed">
              Localize o campo de texto intitulado <strong className="text-neutral-200">"Parâmetros de URL"</strong> (URL Parameters) e cole o suffix que você copiou acima.
            </p>
          </div>
          <div className="flex items-start gap-3">
            <span className="flex-shrink-0 w-5 h-5 rounded-full bg-emerald-500 text-neutral-900 text-xs font-bold flex items-center justify-center font-mono">✓</span>
            <p className="text-xs text-emerald-400 leading-relaxed font-semibold">
              Pronto! Todas as vendas provenientes desse criativo agora carregarão UTMs estruturadas e serão reconciliadas retroativamente pelo motor do Trackify.
            </p>
          </div>
        </div>
      </div>

      <div className="p-4 rounded-xl bg-neutral-900 border border-neutral-800 flex items-start gap-3">
        <Info className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" />
        <div>
          <h4 className="text-xs font-semibold text-neutral-200 font-bold">Importante: Não use UTMs misturadas nas URLs das páginas</h4>
          <p className="text-xs text-[#A1A1AA] mt-1 leading-relaxed">
            Recomendamos fortemente colocar as UTMs estritamente no campo "Parâmetros de URL" do Facebook Ads, e não no campo "URL do Site". Isso garante que o pixel padrão do Facebook e os bots de carregamento do Trackify consigam higienizar a URL limpa de forma rápida sem quebras visuais para os compradores.
          </p>
        </div>
      </div>
    </div>
  );
}
