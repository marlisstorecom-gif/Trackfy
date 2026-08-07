import React, { useState, useEffect } from 'react';
import { Check, Copy, AlertCircle, TrendingUp, TrendingDown, RefreshCw, X, HelpCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

// Status Badge Component
interface StatusBadgeProps {
  status: string;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  let bg = 'bg-neutral-800/80 text-neutral-400 border-neutral-700';
  let dot = 'bg-neutral-500';
  let label = status;

  switch (status.toLowerCase()) {
    case 'active':
    case 'aprovado':
    case 'connected':
    case 'sent_to_facebook':
      bg = 'bg-emerald-950/40 text-emerald-400 border-emerald-500/30';
      dot = 'bg-emerald-400';
      label = status === 'sent_to_facebook' ? 'Enviado ao Meta' : status === 'aprovado' ? 'Aprovado' : status === 'connected' ? 'Conectado' : 'Ativo';
      break;
    case 'pending':
    case 'pendente':
    case 'processed':
    case 'received':
      bg = 'bg-amber-950/40 text-amber-400 border-amber-500/30';
      dot = 'bg-amber-400';
      label = status === 'processed' ? 'Processado' : status === 'received' ? 'Recebido' : 'Pendente';
      break;
    case 'refused':
    case 'recusado':
    case 'inactive':
    case 'disconnected':
    case 'failed':
      bg = 'bg-rose-950/40 text-rose-400 border-rose-500/30';
      dot = 'bg-rose-400';
      label = status === 'recusado' ? 'Recusado' : status === 'disconnected' ? 'Desconectado' : status === 'inactive' ? 'Inativo' : 'Falhou';
      break;
  }

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-[10px] font-extrabold uppercase tracking-widest border ${bg} transition-all duration-300`}>
      <span className={`w-1.5 h-1.5 rounded-full ${dot} animate-pulse`} />
      {label}
    </span>
  );
}

// Copy Button Component
interface CopyButtonProps {
  text: string;
  onCopySuccess?: () => void;
}

export function CopyButton({ text, onCopySuccess }: CopyButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      if (onCopySuccess) onCopySuccess();
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  return (
    <button
      onClick={handleCopy}
      type="button"
      className="p-1.5 hover:bg-neutral-800 text-neutral-400 hover:text-neutral-100 rounded-md transition-all duration-200 border border-transparent hover:border-neutral-700/60 active:scale-95"
      title="Copiar"
    >
      {copied ? <Check className="w-4 h-4 text-emerald-400 animate-scale" /> : <Copy className="w-4 h-4" />}
    </button>
  );
}

// Code Block Component
interface CodeBlockProps {
  code: string;
  language?: string;
  title?: string;
  onCopySuccess?: () => void;
}

export function CodeBlock({ code, language = 'javascript', title, onCopySuccess }: CodeBlockProps) {
  const lines = code.trim().split('\n');

  return (
    <div className="w-full rounded-xl overflow-hidden border border-[#27272A] bg-[#111113] transition-all duration-300 hover:border-neutral-700">
      <div className="flex items-center justify-between px-4 py-2.5 bg-[#18181B] border-b border-[#27272A]">
        <div className="flex items-center gap-2">
          <span className="flex gap-1.5">
            <span className="w-3 h-3 rounded-full bg-rose-500/60" />
            <span className="w-3 h-3 rounded-full bg-amber-500/60" />
            <span className="w-3 h-3 rounded-full bg-emerald-500/60" />
          </span>
          {title && <span className="text-xs text-neutral-400 font-medium ml-2 font-mono">{title}</span>}
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] px-2 py-0.5 rounded bg-neutral-800 text-neutral-400 font-mono uppercase">{language}</span>
          <CopyButton text={code} onCopySuccess={onCopySuccess} />
        </div>
      </div>
      <div className="p-4 overflow-x-auto font-mono text-sm leading-relaxed text-neutral-300 max-h-[350px]">
        <table>
          <tbody>
            {lines.map((line, idx) => (
              <tr key={idx} className="hover:bg-neutral-900/30">
                <td className="text-neutral-600 text-right pr-4 select-none text-xs w-6">{idx + 1}</td>
                <td className="whitespace-pre pr-4 text-neutral-200">{line}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// Stat Card Component
interface StatCardProps {
  title: string;
  value: string | number;
  change: number;
  trend: 'up' | 'down' | 'neutral';
  subtitle?: string;
  loading?: boolean;
}

export function StatCard({ title, value, change, trend, subtitle, loading = false }: StatCardProps) {
  if (loading) {
    return <LoadingSkeleton variant="card" />;
  }

  const isUp = trend === 'up';
  const isDown = trend === 'down';

  return (
    <motion.div
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      className="p-5 rounded-2xl bg-[#18181B] border border-[#27272A] transition-all duration-300 hover:border-blue-500/20 hover:shadow-[0_8px_30px_rgb(0,0,0,0.5)] flex flex-col justify-between"
    >
      <div>
        <div className="flex items-center justify-between mb-2">
          <span className="text-[11px] font-bold text-[#A1A1AA] uppercase tracking-[0.1em] font-display">{title}</span>
          {change !== 0 && (
            <div
              className={`flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-extrabold border ${
                isUp
                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                  : isDown
                  ? 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                  : 'bg-neutral-800 text-neutral-400 border-neutral-700'
              }`}
            >
              {isUp ? <TrendingUp className="w-2.5 h-2.5" /> : isDown ? <TrendingDown className="w-2.5 h-2.5" /> : null}
              <span>
                {isUp ? '↑' : '↓'} {Math.abs(change)}%
              </span>
            </div>
          )}
        </div>

        <div className="flex items-baseline gap-2 mt-1">
          <span className="text-3xl font-extrabold tracking-tight text-[#FAFAFA] font-display">{value}</span>
        </div>
      </div>

      <div>
        {subtitle && <p className="mt-2 text-[11px] text-[#A1A1AA] font-medium leading-normal">{subtitle}</p>}

        {/* Decorative miniature sparkline backplate */}
        <div className="mt-4 h-1.5 w-full bg-neutral-900 rounded-full overflow-hidden relative">
          <div
            className={`absolute left-0 top-0 h-full rounded-full ${
              isUp ? 'bg-[#16A34A]' : isDown ? 'bg-[#DC2626]' : 'bg-[#2563EB]'
            }`}
            style={{ width: `${Math.min(Math.abs(change) * 4 + 30, 100)}%` }}
          />
        </div>
      </div>
    </motion.div>
  );
}

// Step Card Component (Visual wizard layout indicator)
interface StepCardProps {
  key?: React.Key | number | string;
  number: number;
  title: string;
  description: string;
  active: boolean;
  completed: boolean;
  onClick?: () => void;
}

export function StepCard({ number, title, description, active, completed, onClick }: StepCardProps) {
  return (
    <div
      onClick={onClick}
      className={`p-4 rounded-xl border transition-all duration-300 cursor-pointer ${
        active
          ? 'bg-[#18181B] border-blue-500 text-[#FAFAFA] shadow-[0_4px_20px_rgba(37,99,235,0.15)]'
          : completed
          ? 'bg-[#18181B]/50 border-emerald-500/30 text-[#FAFAFA]'
          : 'bg-[#111113] border-[#27272A]/70 text-neutral-500 hover:border-neutral-700/60'
      }`}
    >
      <div className="flex items-start gap-3">
        <div
          className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold font-mono transition-colors ${
            completed
              ? 'bg-emerald-500 text-[#09090B]'
              : active
              ? 'bg-blue-500 text-[#FAFAFA]'
              : 'bg-neutral-800 text-neutral-400'
          }`}
        >
          {completed ? <Check className="w-3.5 h-3.5" /> : number}
        </div>
        <div>
          <h4 className={`text-sm font-semibold ${active ? 'text-[#FAFAFA]' : completed ? 'text-neutral-300' : 'text-neutral-400'}`}>
            {title}
          </h4>
          <p className="text-xs text-[#A1A1AA] mt-1 leading-relaxed">{description}</p>
        </div>
      </div>
    </div>
  );
}

// Empty State Component
interface EmptyStateProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  actionText?: string;
  onAction?: () => void;
}

export function EmptyState({ icon, title, description, actionText, onAction }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center border border-dashed border-[#27272A] rounded-2xl bg-[#18181B]/30 transition-all duration-300 hover:bg-[#18181B]/50">
      <div className="w-12 h-12 rounded-xl bg-[#111113] border border-[#27272A] flex items-center justify-center text-[#A1A1AA] mb-4">
        {icon}
      </div>
      <h3 className="text-base font-semibold text-[#FAFAFA] mb-1">{title}</h3>
      <p className="text-sm text-[#A1A1AA] max-w-sm mb-6 leading-relaxed">{description}</p>
      {actionText && onAction && (
        <button
          onClick={onAction}
          className="px-4 py-2 text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-all duration-200 active:scale-95 flex items-center gap-1.5"
        >
          {actionText}
        </button>
      )}
    </div>
  );
}

// Loading Skeleton Component
interface LoadingSkeletonProps {
  variant?: 'card' | 'table' | 'chart' | 'line';
}

export function LoadingSkeleton({ variant = 'line' }: LoadingSkeletonProps) {
  if (variant === 'card') {
    return (
      <div className="p-6 rounded-2xl bg-[#18181B] border border-[#27272A] animate-pulse">
        <div className="flex justify-between items-center mb-4">
          <div className="h-4 w-24 bg-neutral-800 rounded" />
          <div className="h-4 w-12 bg-neutral-800 rounded-full" />
        </div>
        <div className="h-8 w-32 bg-neutral-800 rounded mb-3" />
        <div className="h-2 w-full bg-neutral-800 rounded-full" />
      </div>
    );
  }

  if (variant === 'chart') {
    return (
      <div className="p-6 rounded-2xl bg-[#18181B] border border-[#27272A] animate-pulse h-80 flex flex-col justify-between">
        <div className="flex justify-between items-center mb-6">
          <div className="h-4 w-36 bg-neutral-800 rounded" />
          <div className="h-4 w-16 bg-neutral-800 rounded" />
        </div>
        <div className="flex items-end gap-3 h-48 w-full px-2">
          <div className="h-[20%] w-full bg-neutral-800/60 rounded-t" />
          <div className="h-[40%] w-full bg-neutral-800/60 rounded-t" />
          <div className="h-[35%] w-full bg-neutral-800/60 rounded-t" />
          <div className="h-[65%] w-full bg-neutral-800/60 rounded-t" />
          <div className="h-[50%] w-full bg-neutral-800/60 rounded-t" />
          <div className="h-[80%] w-full bg-neutral-800/60 rounded-t" />
          <div className="h-[95%] w-full bg-neutral-800/60 rounded-t" />
        </div>
        <div className="h-3 w-full bg-neutral-800 rounded mt-4" />
      </div>
    );
  }

  if (variant === 'table') {
    return (
      <div className="space-y-3 p-4 bg-[#18181B] border border-[#27272A] rounded-2xl animate-pulse">
        <div className="flex justify-between items-center pb-3 border-b border-neutral-800">
          <div className="h-4 w-40 bg-neutral-800 rounded" />
          <div className="h-4 w-16 bg-neutral-800 rounded" />
        </div>
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex justify-between items-center py-2">
              <div className="h-4 w-1/4 bg-neutral-800 rounded" />
              <div className="h-4 w-1/6 bg-neutral-800 rounded" />
              <div className="h-4 w-1/12 bg-neutral-800 rounded" />
              <div className="h-4 w-1/12 bg-neutral-800 rounded" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="h-4 w-full bg-neutral-800 rounded animate-pulse" />
  );
}

// Modal Component
interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export function Modal({ isOpen, onClose, title, children }: ModalProps) {
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleEscape);
    }
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-[#09090B]/80 backdrop-blur-sm"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 16 }}
            transition={{ type: 'spring', duration: 0.4 }}
            className="relative w-full max-w-lg overflow-hidden rounded-2xl bg-[#18181B] border border-[#27272A] shadow-2xl z-10"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-[#27272A] px-6 py-4">
              <h3 className="text-base font-semibold text-[#FAFAFA]">{title}</h3>
              <button
                onClick={onClose}
                className="rounded-lg p-1.5 hover:bg-neutral-800 text-neutral-400 hover:text-neutral-100 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Content */}
            <div className="px-6 py-6 max-h-[70vh] overflow-y-auto text-neutral-300">
              {children}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

// Floating Custom Toast System
export interface ToastMessage {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
}

interface ToasterProps {
  toasts: ToastMessage[];
  onRemove: (id: string) => void;
}

export function Toaster({ toasts, onRemove }: ToasterProps) {
  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3 max-w-sm w-full pointer-events-none">
      <AnimatePresence>
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, transition: { duration: 0.2 } }}
            className="pointer-events-auto flex items-start gap-3 p-4 rounded-xl border bg-[#18181B] shadow-2xl border-[#27272A]"
          >
            <div className="flex-shrink-0 mt-0.5">
              {toast.type === 'success' ? (
                <div className="w-5 h-5 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                  <Check className="w-3 h-3" />
                </div>
              ) : toast.type === 'error' ? (
                <div className="w-5 h-5 rounded-full bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400">
                  <AlertCircle className="w-3 h-3" />
                </div>
              ) : (
                <div className="w-5 h-5 rounded-full bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
                  <HelpCircle className="w-3 h-3" />
                </div>
              )}
            </div>
            <div className="flex-grow">
              <p className="text-xs font-medium text-neutral-200">{toast.message}</p>
            </div>
            <button
              onClick={() => onRemove(toast.id)}
              className="flex-shrink-0 text-neutral-500 hover:text-neutral-300 p-0.5 rounded-md hover:bg-neutral-800 transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
