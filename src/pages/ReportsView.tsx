import React, { useState, useMemo } from 'react';
import { StatusBadge } from '../components/UIComponents';
import { mockPurchases } from '../mockData';
import { Purchase } from '../types';
import { Search, ListFilter, ArrowUpDown, Download, ArrowUpRight, Filter, ChevronLeft, ChevronRight, SlidersHorizontal } from 'lucide-react';
import { motion } from 'motion/react';

interface ReportsViewProps {
  onAddToast: (msg: string, type: 'success' | 'error' | 'info') => void;
}

export default function ReportsView({ onAddToast }: ReportsViewProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [campaignFilter, setCampaignFilter] = useState('all');
  const [sortField, setSortField] = useState<'timestamp' | 'value'>('timestamp');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const handleExport = () => {
    onAddToast('Sucesso! O relatório completo em CSV foi empacotado e baixado.', 'success');
  };

  const handleSort = (field: 'timestamp' | 'value') => {
    if (sortField === field) {
      setSortOrder(prev => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
  };

  // Filter & sort logic
  const processedPurchases = useMemo(() => {
    let result = [...mockPurchases];

    // Search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(p =>
        p.customerName.toLowerCase().includes(query) ||
        p.email.toLowerCase().includes(query) ||
        p.id.toLowerCase().includes(query) ||
        p.campaign.toLowerCase().includes(query)
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      result = result.filter(p => p.status === statusFilter);
    }

    // Campaign filter
    if (campaignFilter !== 'all') {
      result = result.filter(p => p.utmCampaign === campaignFilter);
    }

    // Sort
    result.sort((a, b) => {
      let comparison = 0;
      if (sortField === 'value') {
        comparison = a.value - b.value;
      } else {
        comparison = new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime();
      }
      return sortOrder === 'desc' ? -comparison : comparison;
    });

    return result;
  }, [searchQuery, statusFilter, campaignFilter, sortField, sortOrder]);

  // Pagination calculations
  const totalItems = processedPurchases.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage));
  const paginatedPurchases = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return processedPurchases.slice(startIndex, startIndex + itemsPerPage);
  }, [processedPurchases, currentPage]);

  const uniqueCampaigns = useMemo(() => {
    const campaigns = new Set<string>();
    mockPurchases.forEach(p => {
      if (p.utmCampaign) campaigns.add(p.utmCampaign);
    });
    return Array.from(campaigns);
  }, []);

  return (
    <div className="space-y-8">
      {/* Header row */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <span className="text-[11px] font-black text-blue-500 uppercase tracking-[0.2em] font-mono">Relatórios Analíticos</span>
          <h1 className="text-3xl font-extrabold tracking-tight text-[#FAFAFA] mt-1 font-display">Atribuição de Vendas</h1>
          <p className="text-sm text-[#A1A1AA] mt-0.5">Explore e exporte registros detalhados de transações reconciliadas do Facebook CAPI.</p>
        </div>
        <button
          onClick={handleExport}
          className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-xl flex items-center gap-2 transition-all duration-200 active:scale-95 shadow-md shadow-blue-600/10 hover:shadow-blue-600/20 cursor-pointer"
        >
          <Download className="w-4 h-4" />
          Exportar Relatório CSV
        </button>
      </div>

      {/* Query Filters row */}
      <div className="p-5 rounded-2xl bg-[#18181B] border border-[#27272A] space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search bar */}
          <div className="relative md:col-span-2">
            <Search className="w-4 h-4 text-neutral-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Pesquisar por transação, comprador ou e-mail..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-9 pr-4 py-2 bg-[#111113] border border-neutral-800 rounded-lg text-xs text-neutral-200 placeholder-neutral-500 focus:outline-none focus:border-neutral-600 transition-colors"
            />
          </div>

          {/* Status dropdown */}
          <div className="relative">
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-3 py-2 bg-[#111113] border border-neutral-800 rounded-lg text-xs text-neutral-200 focus:outline-none cursor-pointer"
            >
              <option value="all">Todos os Status</option>
              <option value="aprovado">Aprovados</option>
              <option value="pendente">Pendentes</option>
              <option value="recusado">Recusados</option>
            </select>
          </div>

          {/* Campaign dropdown */}
          <div className="relative">
            <select
              value={campaignFilter}
              onChange={(e) => {
                setCampaignFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-3 py-2 bg-[#111113] border border-neutral-800 rounded-lg text-xs text-neutral-200 focus:outline-none cursor-pointer"
            >
              <option value="all">Todas as Campanhas UTM</option>
              {uniqueCampaigns.map(camp => (
                <option key={camp} value={camp}>{camp}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Reports Table display */}
      <div className="p-6 rounded-2xl bg-[#18181B] border border-[#27272A] space-y-4">
        <div className="overflow-x-auto border border-neutral-800/60 rounded-xl bg-[#111113]/30">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-neutral-800 text-neutral-400 text-[10px] font-bold uppercase tracking-wider bg-[#111113]/50">
                <th className="py-3 px-4">Código Transação</th>
                <th className="py-3 px-4">Comprador</th>
                <th className="py-3 px-4">Campanha / UTM Suffix</th>
                <th className="py-3 px-4 text-right cursor-pointer select-none hover:text-white transition-colors" onClick={() => handleSort('value')}>
                  <div className="flex items-center justify-end gap-1.5">
                    Valor
                    <ArrowUpDown className="w-3.5 h-3.5" />
                  </div>
                </th>
                <th className="py-3 px-4 text-center">Canal</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-right cursor-pointer select-none hover:text-white transition-colors" onClick={() => handleSort('timestamp')}>
                  <div className="flex items-center justify-end gap-1.5">
                    Data / Hora
                    <ArrowUpDown className="w-3.5 h-3.5" />
                  </div>
                </th>
              </tr>
            </thead>
            <tbody>
              {paginatedPurchases.length > 0 ? (
                paginatedPurchases.map((p, idx) => (
                  <tr
                    key={p.id}
                    className={`border-b border-neutral-800/60 text-xs hover:bg-[#18181B]/40 transition-colors ${
                      idx % 2 === 0 ? 'bg-[#18181B]/10' : ''
                    }`}
                  >
                    <td className="py-3.5 px-4 font-mono font-semibold text-neutral-300">
                      {p.id}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-[#FAFAFA]">{p.customerName}</div>
                      <div className="text-[10px] text-neutral-500 mt-0.5">{p.email}</div>
                    </td>
                    <td className="py-3.5 px-4 max-w-[220px] truncate">
                      <div className="font-semibold text-neutral-300 truncate">{p.campaign}</div>
                      <div className="text-[10px] text-neutral-500 font-mono mt-0.5 truncate">
                        utm_source={p.utmSource}&utm_campaign={p.utmCampaign}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono font-bold text-neutral-100">
                      R$ {p.value.toFixed(2)}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span className="inline-flex items-center gap-1 bg-blue-500/10 text-blue-400 border border-blue-500/20 px-2.5 py-0.5 rounded text-[10px] font-semibold uppercase">
                        Meta CAPI
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <StatusBadge status={p.status} />
                    </td>
                    <td className="py-3.5 px-4 text-right text-neutral-400 font-mono text-[10px]">
                      {new Date(p.timestamp).toLocaleDateString('pt-BR')} às {new Date(p.timestamp).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-neutral-500 text-xs font-mono">
                    Nenhum registro encontrado correspondendo aos filtros ativos.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Row */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
          <span className="text-xs text-neutral-400 font-mono">
            Mostrando {totalItems > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0} a{' '}
            {Math.min(currentPage * itemsPerPage, totalItems)} de {totalItems} registros
          </span>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="p-1.5 bg-neutral-900 border border-neutral-800 rounded-lg text-neutral-400 hover:text-white disabled:text-neutral-700 disabled:border-neutral-900 transition-colors cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-xs font-bold text-neutral-300 px-3 font-mono">
              Pág. {currentPage} de {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
              className="p-1.5 bg-neutral-900 border border-neutral-800 rounded-lg text-neutral-400 hover:text-white disabled:text-neutral-700 disabled:border-neutral-900 transition-colors cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
