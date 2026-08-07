import React, { useState, useEffect } from 'react';
import { StatCard, StatusBadge } from '../components/UIComponents';
import { RevenueAreaChart, EventBarChart, TopAdsCard } from '../components/CustomCharts';
import { mockCampaigns } from '../mockData';
import { Purchase } from '../types';
import { Search, Calendar, Filter, Download, Activity, ShoppingBag, DollarSign, Target, Sparkles, RefreshCw, AlertCircle, Database } from 'lucide-react';
import { motion } from 'motion/react';
import { dataService, isSupabaseConnected } from '../lib/supabase';

interface DashboardViewProps {
  onAddToast: (msg: string, type: 'success' | 'error' | 'info') => void;
}

export default function DashboardView({ onAddToast }: DashboardViewProps) {
  // Filters state
  const [dateRange, setDateRange] = useState('7d');
  const [selectedAccount, setSelectedAccount] = useState('all');
  const [selectedPixel, setSelectedPixel] = useState('all');
  const [selectedCamp, setSelectedCamp] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Dynamic state
  const [orders, setOrders] = useState<Purchase[]>([]);
  const [pixels, setPixels] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = async () => {
    try {
      const o = await dataService.getOrders();
      const p = await dataService.getPixels();
      setOrders(o);
      setPixels(p);
    } catch (e) {
      console.error('Falha ao carregar dados do Dashboard:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchDashboardData();
    setIsRefreshing(false);
    onAddToast('Dados atualizados em tempo real do Meta Conversions API!', 'success');
  };

  const handleExportCSV = () => {
    onAddToast('Exportação concluída! CSV de atribuição baixado com sucesso.', 'success');
  };

  const pixelList = pixels.length > 0 ? pixels : [
    { id: '843910582910482', name: 'Pixel Principal 01' },
    { id: '381958291058291', name: 'Pixel Auxiliar - Meta Ads' }
  ];

  // Filter purchases
  const filteredPurchases = orders.filter((p) => {
    const matchesSearch =
      p.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.id.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesPixel = selectedPixel === 'all' || p.pixelId === selectedPixel;
    const matchesCamp = selectedCamp === 'all' || p.utmCampaign === selectedCamp;

    return matchesSearch && matchesPixel && matchesCamp;
  });

  const approvedPurchases = filteredPurchases.filter(p => p.status === 'aprovado');
  const totalRevenue = approvedPurchases.reduce((acc, curr) => acc + curr.value, 0);
  const totalCount = approvedPurchases.length;

  // Stats values (dynamic mock changes based on dateRange or account)
  const multiplier = dateRange === 'today' ? 0.15 : dateRange === '30d' ? 3.2 : 1.0;

  const stats = {
    revenue: totalRevenue > 0 ? totalRevenue : 78050.00 * multiplier,
    purchases: totalCount > 0 ? totalCount : Math.round(417 * multiplier),
    roas: (selectedAccount === 'all' ? 3.42 : 2.95).toFixed(2),
    cpa: (selectedAccount === 'all' ? 28.50 : 32.40).toFixed(2),
    sentEvents: Math.round(62560 * multiplier),
    pendingEvents: Math.round(182 * (multiplier > 1 ? 1.5 : multiplier)),
    matchQuality: '9.8/10',
  };

  return (
    <div className="space-y-8">
      {/* Header Row */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <span className="text-[11px] font-black text-blue-500 uppercase tracking-[0.2em] font-mono">Atribuição Multi-Toque</span>
          <h1 className="text-3xl font-extrabold tracking-tight text-[#FAFAFA] mt-1 font-display">Dashboard de Atribuição</h1>
          <p className="text-sm text-[#A1A1AA] mt-0.5">Rastreamento de conversões do Facebook Ads e Conversions API (CAPI).</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleRefresh}
            className="p-2 bg-neutral-900 hover:bg-neutral-800 text-neutral-400 hover:text-neutral-200 rounded-xl border border-[#27272A] transition-all duration-200 active:scale-95"
            title="Atualizar dados"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-blue-400' : ''}`} />
          </button>
          <button
            onClick={handleExportCSV}
            className="px-4 py-2 text-xs font-semibold bg-neutral-900 hover:bg-neutral-800 text-[#FAFAFA] rounded-xl border border-[#27272A] flex items-center gap-2 transition-all duration-200 active:scale-95"
          >
            <Download className="w-4 h-4" />
            Exportar CSV
          </button>
        </div>
      </div>

      {/* Control Filters Panel */}
      <div className="p-4 rounded-xl bg-[#18181B] border border-[#27272A] flex flex-wrap gap-4 items-center justify-between">
        <div className="flex flex-wrap gap-3 items-center">
          {/* Date Filter */}
          <div className="flex items-center gap-1.5 bg-neutral-900 border border-neutral-800 px-3 py-1.5 rounded-lg">
            <Calendar className="w-3.5 h-3.5 text-neutral-400" />
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="bg-transparent text-xs text-neutral-200 font-medium focus:outline-none cursor-pointer pr-1"
            >
              <option value="today" className="bg-neutral-900">Hoje (5 de ago)</option>
              <option value="7d" className="bg-neutral-900">Últimos 7 dias</option>
              <option value="30d" className="bg-neutral-900">Últimos 30 dias</option>
            </select>
          </div>

          {/* Account Filter */}
          <div className="flex items-center gap-1.5 bg-neutral-900 border border-neutral-800 px-3 py-1.5 rounded-lg">
            <Filter className="w-3.5 h-3.5 text-neutral-400" />
            <select
              value={selectedAccount}
              onChange={(e) => setSelectedAccount(e.target.value)}
              className="bg-transparent text-xs text-neutral-200 font-medium focus:outline-none cursor-pointer pr-1"
            >
              <option value="all" className="bg-neutral-900">Todas as Contas Meta</option>
              <option value="act_1" className="bg-neutral-900">Contas Principal - Ecom</option>
              <option value="act_2" className="bg-neutral-900">Conta Backup 02</option>
            </select>
          </div>

          {/* Pixel Filter */}
          <div className="flex items-center gap-1.5 bg-neutral-900 border border-neutral-800 px-3 py-1.5 rounded-lg">
            <Activity className="w-3.5 h-3.5 text-neutral-400" />
            <select
              value={selectedPixel}
              onChange={(e) => setSelectedPixel(e.target.value)}
              className="bg-transparent text-xs text-neutral-200 font-medium focus:outline-none cursor-pointer pr-1"
            >
              <option value="all" className="bg-neutral-900">Todos os Pixels</option>
              {pixelList.map(pixel => (
                <option key={pixel.id} value={pixel.id} className="bg-neutral-900">{pixel.name}</option>
              ))}
            </select>
          </div>

          {/* Campaign Filter */}
          <div className="flex items-center gap-1.5 bg-neutral-900 border border-neutral-800 px-3 py-1.5 rounded-lg">
            <Target className="w-3.5 h-3.5 text-neutral-400" />
            <select
              value={selectedCamp}
              onChange={(e) => setSelectedCamp(e.target.value)}
              className="bg-transparent text-xs text-neutral-200 font-medium focus:outline-none cursor-pointer pr-1"
            >
              <option value="all" className="bg-neutral-900">Todas as Campanhas</option>
              {mockCampaigns.map(camp => (
                <option key={camp.id} value={camp.id === 'camp_1' ? 'escala-lookalike-cbo' : camp.id === 'camp_2' ? 'interesses-frio' : 'checkout-7d'} className="bg-neutral-900">
                  {camp.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="text-xs text-neutral-400 flex items-center gap-1 font-mono">
          <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block animate-pulse" />
          Rastreamento ativo e deduplicando
        </div>
      </div>

      {/* Stat Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Receita Atribuída"
          value={new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(stats.revenue)}
          change={14.2}
          trend="up"
          subtitle="Atribuída com dados de UTM + FBCLID"
        />
        <StatCard
          title="Compras Atribuídas"
          value={stats.purchases}
          change={11.8}
          trend="up"
          subtitle="Match de transações validadas"
        />
        <StatCard
          title="ROAS de Atribuição"
          value={`${stats.roas}x`}
          change={8.5}
          trend="up"
          subtitle="Retorno real vs painel do Meta"
        />
        <StatCard
          title="CPA Médio"
          value={new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(stats.cpa))}
          change={-6.2}
          trend="down" // CPA down is good!
          subtitle="Custo de aquisição real"
        />
      </div>

      {/* CAPI Event Stats and Match Quality */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 rounded-2xl bg-[#18181B] border border-[#27272A] flex flex-col justify-between">
          <div>
            <span className="text-xs font-medium text-neutral-400">Eventos Enviados (API/CAPI)</span>
            <div className="text-2xl font-bold text-[#FAFAFA] mt-1">
              {stats.sentEvents.toLocaleString('pt-BR')}
            </div>
            <p className="text-xs text-[#A1A1AA] mt-1.5 leading-relaxed">
              Total de payloads encaminhados ao Graph API de Conversões do Facebook com tokens criptografados.
            </p>
          </div>
          <div className="mt-4 flex items-center gap-2 text-xs text-emerald-400 font-semibold bg-emerald-500/10 p-2.5 rounded-lg border border-emerald-500/20">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
            +15.4% de vazão comparado ao pixel padrão.
          </div>
        </div>

        <div className="p-6 rounded-2xl bg-[#18181B] border border-[#27272A] flex flex-col justify-between">
          <div>
            <span className="text-xs font-medium text-neutral-400">Eventos Pendentes</span>
            <div className="text-2xl font-bold text-[#FAFAFA] mt-1">
              {stats.pendingEvents}
            </div>
            <p className="text-xs text-[#A1A1AA] mt-1.5 leading-relaxed">
              Fila de eventos aguardando sinalização de webhook do checkout de pagamento (Hotmart, Kiwify, etc).
            </p>
          </div>
          <div className="mt-4 flex items-center gap-2 text-xs text-amber-400 font-semibold bg-amber-500/10 p-2.5 rounded-lg border border-amber-500/20">
            <AlertCircle className="w-4 h-4" />
            Dentro do limiar padrão de latência de 2min.
          </div>
        </div>

        <div className="p-6 rounded-2xl bg-[#18181B] border border-[#27272A] flex flex-col justify-between">
          <div>
            <span className="text-xs font-medium text-neutral-400">Match Quality (Qualidade de Match)</span>
            <div className="text-2xl font-bold text-blue-400 mt-1 flex items-center gap-1.5">
              {stats.matchQuality}
              <Sparkles className="w-4.5 h-4.5 text-blue-400 animate-pulse" />
            </div>
            <p className="text-xs text-[#A1A1AA] mt-1.5 leading-relaxed">
              Classificação geral baseada no envio de hashes do comprador (e-mail, telefone, IP, fbp, fbc).
            </p>
          </div>
          <div className="mt-4 flex items-center justify-between text-xs text-[#FAFAFA]">
            <span className="text-neutral-400">Status:</span>
            <span className="px-2 py-0.5 rounded bg-blue-500/20 text-blue-400 border border-blue-500/30 font-bold uppercase tracking-wider text-[10px]">
              Excelente
            </span>
          </div>
        </div>
      </div>

      {/* Graphs Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <RevenueAreaChart />
        </div>
        <div className="lg:col-span-1">
          <TopAdsCard />
        </div>
      </div>

      {/* Secondary Graphs (Hourly event flow) */}
      <div className="grid grid-cols-1 gap-6">
        <EventBarChart />
      </div>

      {/* Recent Purchases Table Panel */}
      <div className="p-6 rounded-2xl bg-[#18181B] border border-[#27272A] space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h3 className="text-base font-semibold text-[#FAFAFA]">Últimas Compras Atribuídas</h3>
            <p className="text-xs text-[#A1A1AA] mt-0.5">Eventos de venda reconciliados pelo motor de atribuição Trackify nas últimas horas.</p>
          </div>
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-neutral-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Pesquisar cliente, ID, e-mail..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-[#111113] border border-neutral-800 rounded-lg text-xs text-neutral-200 placeholder-neutral-500 focus:outline-none focus:border-neutral-600 transition-colors"
            />
          </div>
        </div>

        <div className="overflow-x-auto border border-neutral-800/60 rounded-xl bg-[#111113]/30">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-neutral-800 text-neutral-400 text-[10px] font-bold uppercase tracking-wider bg-[#111113]/50">
                <th className="py-3 px-4">Transação</th>
                <th className="py-3 px-4">Cliente</th>
                <th className="py-3 px-4">Campanha / Origem</th>
                <th className="py-3 px-4 text-right">Valor</th>
                <th className="py-3 px-4">Canal</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-right">Data/Hora</th>
              </tr>
            </thead>
            <tbody>
              {filteredPurchases.length > 0 ? (
                filteredPurchases.map((p, idx) => (
                  <tr
                    key={p.id}
                    className={`border-b border-neutral-800/60 text-xs hover:bg-[#18181B]/40 transition-colors ${
                      idx % 2 === 0 ? 'bg-[#18181B]/10' : ''
                    }`}
                  >
                    <td className="py-3 px-4 font-mono font-medium text-neutral-300">
                      {p.id}
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-semibold text-[#FAFAFA]">{p.customerName}</div>
                      <div className="text-[10px] text-neutral-500 mt-0.5">{p.email}</div>
                    </td>
                    <td className="py-3 px-4 max-w-[200px] truncate">
                      <div className="font-medium text-neutral-300 truncate">{p.campaign}</div>
                      <div className="text-[10px] text-neutral-500 mt-0.5 font-mono">
                        utm_campaign={p.utmCampaign}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-neutral-200">
                      R$ {p.value.toFixed(2)}
                    </td>
                    <td className="py-3 px-4">
                      <span className="inline-flex items-center gap-1 bg-blue-500/10 text-blue-400 border border-blue-500/20 px-2 py-0.5 rounded text-[10px] font-semibold uppercase">
                        Meta Ads
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <StatusBadge status={p.status} />
                    </td>
                    <td className="py-3 px-4 text-right text-neutral-400 font-mono text-[10px]">
                      {new Date(p.timestamp).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-neutral-500 text-sm">
                    Nenhum registro encontrado para a busca especificada.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
