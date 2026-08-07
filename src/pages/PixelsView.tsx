import React, { useState } from 'react';
import { StatusBadge, CopyButton } from '../components/UIComponents';
import { mockPixels } from '../mockData';
import { Pixel } from '../types';
import { Plus, Sliders, Activity, Copy, Check, Info, Trash2 } from 'lucide-react';
import { motion } from 'motion/react';

interface PixelsViewProps {
  pixels: Pixel[];
  onAddToast: (msg: string, type: 'success' | 'error' | 'info') => void;
  onUpdatePixels: (updated: Pixel[]) => void;
}

export default function PixelsView({ pixels, onAddToast, onUpdatePixels }: PixelsViewProps) {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isConfiguring, setIsConfiguring] = useState<string | null>(null);
  const [newPixelName, setNewPixelName] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  const handleCopy = (id: string) => {
    navigator.clipboard.writeText(id);
    setCopiedId(id);
    onAddToast('Pixel ID copiado para a área de transferência!', 'success');
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleAddPixel = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPixelName.trim()) return;

    const newPixel: Pixel = {
      id: Math.floor(Math.random() * 900000000000000 + 100000000000000).toString(),
      name: newPixelName,
      status: 'active',
      eventsCount: 0,
      lastActive: 'Inativo'
    };

    onUpdatePixels([...pixels, newPixel]);
    setNewPixelName('');
    setIsAdding(false);
    onAddToast(`Novo Pixel "${newPixel.name}" criado com sucesso!`, 'success');
  };

  const handleToggleStatus = (id: string) => {
    const updated = pixels.map(p => {
      if (p.id === id) {
        const nextStatus: 'active' | 'inactive' = p.status === 'active' ? 'inactive' : 'active';
        onAddToast(`Pixel "${p.name}" foi ${nextStatus === 'active' ? 'ativado' : 'desativado'}.`, 'info');
        return { ...p, status: nextStatus };
      }
      return p;
    });
    onUpdatePixels(updated);
  };

  const handleDeletePixel = (id: string, name: string) => {
    const updated = pixels.filter(p => p.id !== id);
    onUpdatePixels(updated);
    onAddToast(`Pixel "${name}" removido.`, 'error');
  };

  return (
    <div className="space-y-8 max-w-5xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[11px] font-black text-blue-500 uppercase tracking-[0.2em] font-mono">Gerenciamento de Ativos</span>
          <h1 className="text-3xl font-extrabold tracking-tight text-[#FAFAFA] mt-1 font-display">Pixels Cadastrados</h1>
          <p className="text-sm text-[#A1A1AA] mt-0.5">Visualize a integridade de recepção e status dos seus Pixels vinculados.</p>
        </div>
        <button
          onClick={() => setIsAdding(!isAdding)}
          className="px-4 py-2.5 text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white rounded-xl flex items-center gap-2 transition-all duration-200 active:scale-95 shadow-md shadow-blue-600/10 hover:shadow-blue-600/20 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Adicionar Pixel
        </button>
      </div>

      {isAdding && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-6 rounded-xl bg-[#18181B] border border-blue-500/20 space-y-4"
        >
          <h3 className="text-sm font-bold text-[#FAFAFA]">Cadastrar Novo Pixel</h3>
          <form onSubmit={handleAddPixel} className="flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              placeholder="Ex: Pixel de Leads - Ebook"
              value={newPixelName}
              onChange={(e) => setNewPixelName(e.target.value)}
              className="flex-grow px-4 py-2 bg-[#111113] border border-neutral-800 rounded-lg text-xs text-neutral-200 focus:outline-none focus:border-neutral-600"
              required
            />
            <div className="flex gap-2">
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer"
              >
                Salvar Pixel
              </button>
              <button
                type="button"
                onClick={() => setIsAdding(false)}
                className="px-4 py-2 bg-neutral-900 hover:bg-neutral-800 text-neutral-400 text-xs font-semibold rounded-lg border border-neutral-800 transition-colors cursor-pointer"
              >
                Cancelar
              </button>
            </div>
          </form>
        </motion.div>
      )}

      {/* Pixels Grid list */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {pixels.map((pixel) => {
          const isSelectedForConfig = isConfiguring === pixel.id;
          return (
            <motion.div
              key={pixel.id}
              whileHover={{ y: -2 }}
              className="p-6 rounded-2xl bg-[#18181B] border border-[#27272A] flex flex-col justify-between space-y-6 hover:border-neutral-700/60 transition-all duration-300"
            >
              {/* Card Header */}
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-base font-bold text-[#FAFAFA]">{pixel.name}</h3>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-xs text-neutral-500 font-mono">ID: {pixel.id}</span>
                    <button
                      onClick={() => handleCopy(pixel.id)}
                      className="p-1 hover:bg-neutral-800 rounded text-neutral-400 hover:text-neutral-200 transition-colors"
                      title="Copiar ID do Pixel"
                    >
                      {copiedId === pixel.id ? (
                        <Check className="w-3 h-3 text-emerald-400" />
                      ) : (
                        <Copy className="w-3 h-3" />
                      )}
                    </button>
                  </div>
                </div>
                <StatusBadge status={pixel.status} />
              </div>

              {/* Card Content Statistics */}
              <div className="grid grid-cols-2 gap-4 p-4 rounded-xl bg-[#111113]/60 border border-neutral-800/40">
                <div>
                  <span className="text-[10px] text-neutral-500 uppercase font-bold tracking-wider font-mono">Eventos Ativos</span>
                  <div className="text-lg font-bold text-[#FAFAFA] mt-1 font-mono">{pixel.eventsCount.toLocaleString('pt-BR')}</div>
                </div>
                <div>
                  <span className="text-[10px] text-neutral-500 uppercase font-bold tracking-wider font-mono">Último Sinal</span>
                  <div className="text-xs font-medium text-neutral-300 mt-1.5">{pixel.lastActive}</div>
                </div>
              </div>

              {/* Card Actions */}
              <div className="flex items-center justify-between pt-2 border-t border-neutral-800/60">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleToggleStatus(pixel.id)}
                    className="px-3 py-1.5 text-[11px] font-semibold bg-neutral-900 hover:bg-neutral-800 text-neutral-300 rounded-lg border border-neutral-800 transition-all cursor-pointer"
                  >
                    {pixel.status === 'active' ? 'Pausar Rastreamento' : 'Ativar Rastreamento'}
                  </button>
                  <button
                    onClick={() => setIsConfiguring(isSelectedForConfig ? null : pixel.id)}
                    className="px-3 py-1.5 text-[11px] font-semibold bg-blue-600/10 hover:bg-blue-600/20 text-blue-400 rounded-lg border border-blue-500/10 transition-all cursor-pointer"
                  >
                    Configurar
                  </button>
                </div>
                <button
                  onClick={() => handleDeletePixel(pixel.id, pixel.name)}
                  className="p-1.5 hover:bg-rose-950/20 text-neutral-600 hover:text-rose-400 rounded-lg transition-colors border border-transparent hover:border-rose-950/30"
                  title="Remover Pixel"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Config Overlay Simulator */}
              {isSelectedForConfig && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="pt-4 border-t border-neutral-800/60 space-y-3"
                >
                  <h4 className="text-xs font-bold text-neutral-300 flex items-center gap-1.5">
                    <Sliders className="w-3.5 h-3.5 text-blue-400" />
                    Eventos Habilitados (CAPI)
                  </h4>
                  <div className="grid grid-cols-2 gap-2">
                    {['PageView', 'Purchase', 'Lead', 'InitiateCheckout'].map(event => (
                      <label key={event} className="flex items-center gap-2 p-2 bg-[#111113] rounded-lg border border-neutral-800 text-[11px] text-neutral-400 cursor-pointer hover:border-neutral-700">
                        <input type="checkbox" defaultChecked className="rounded border-neutral-700 bg-neutral-900 text-blue-600 focus:ring-blue-600/50" />
                        <span>{event}</span>
                      </label>
                    ))}
                  </div>
                  <button
                    onClick={() => {
                      setIsConfiguring(null);
                      onAddToast(`Configurações de eventos salvas para "${pixel.name}"`, 'success');
                    }}
                    className="w-full py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-[11px] font-semibold rounded-lg transition-colors"
                  >
                    Aplicar Configurações
                  </button>
                </motion.div>
              )}
            </motion.div>
          );
        })}
      </div>

      <div className="p-4 rounded-xl bg-neutral-900 border border-neutral-800 flex items-start gap-3">
        <Info className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" />
        <div>
          <h4 className="text-xs font-semibold text-neutral-200">Recomendação de Rastreamento Híbrido</h4>
          <p className="text-xs text-[#A1A1AA] mt-1 leading-relaxed">
            Para maximizar o Match Quality, mantenha tanto o Pixel via script (client-side) quanto a Conversions API (server-side) ativos. Nosso sistema injeta automaticamente o <strong className="text-neutral-300">event_id</strong> para garantir a deduplicação automática no lado do Facebook Ads Manager, evitando compras duplicadas.
          </p>
        </div>
      </div>
    </div>
  );
}
