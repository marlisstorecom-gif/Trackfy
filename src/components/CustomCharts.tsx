import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'motion/react';
import { Activity, Flame, ShoppingBag, Zap } from 'lucide-react';

// Custom Area Chart for Revenue
interface RevenueDataPoint {
  day: string;
  revenue: number;
  purchases: number;
}

const revenueData: RevenueDataPoint[] = [
  { day: '28/07', revenue: 3400, purchases: 17 },
  { day: '29/07', revenue: 4200, purchases: 21 },
  { day: '30/07', revenue: 5800, purchases: 29 },
  { day: '31/07', revenue: 4900, purchases: 24 },
  { day: '01/08', revenue: 7200, purchases: 36 },
  { day: '02/08', revenue: 9800, purchases: 49 },
  { day: '03/08', revenue: 11500, purchases: 57 },
  { day: '04/08', revenue: 14200, purchases: 71 },
  { day: '05/08', revenue: 16850, purchases: 84 },
];

export function RevenueAreaChart() {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });
  const [width, setWidth] = useState(500);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    const resizeObserver = new ResizeObserver((entries) => {
      for (let entry of entries) {
        setWidth(entry.contentRect.width || 500);
      }
    });
    resizeObserver.observe(containerRef.current);
    return () => resizeObserver.disconnect();
  }, []);

  const height = 240;
  const paddingX = 40;
  const paddingY = 30;

  const maxRevenue = Math.max(...revenueData.map((d) => d.revenue)) * 1.1;
  const minRevenue = 0;

  const getX = (index: number) => {
    return paddingX + (index / (revenueData.length - 1)) * (width - paddingX * 2);
  };

  const getY = (value: number) => {
    return height - paddingY - ((value - minRevenue) / (maxRevenue - minRevenue)) * (height - paddingY * 2);
  };

  // Generate SVG Path
  const points = revenueData.map((d, idx) => `${getX(idx)},${getY(d.revenue)}`);
  const linePath = `M ${points.join(' L ')}`;
  const areaPath = `${linePath} L ${getX(revenueData.length - 1)},${height - paddingY} L ${getX(0)},${height - paddingY} Z`;

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(val);
  };

  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!containerRef.current) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;

    // Find closest index
    let closestIndex = 0;
    let minDistance = Infinity;

    for (let i = 0; i < revenueData.length; i++) {
      const dx = Math.abs(getX(i) - x);
      if (dx < minDistance) {
        minDistance = dx;
        closestIndex = i;
      }
    }

    setHoveredIndex(closestIndex);
    setTooltipPos({
      x: getX(closestIndex),
      y: getY(revenueData[closestIndex].revenue) - 10,
    });
  };

  return (
    <div className="p-6 rounded-2xl bg-[#18181B] border border-[#27272A]" ref={containerRef}>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <span className="text-xs font-semibold text-blue-500 uppercase tracking-wider font-mono">Atribuição Inteligente</span>
          <h3 className="text-lg font-bold text-[#FAFAFA] flex items-center gap-2 mt-0.5">
            <ShoppingBag className="w-4 h-4 text-blue-400" />
            Receita Atribuída por Dia
          </h3>
        </div>
        <div className="flex items-center gap-3 bg-neutral-900 px-3 py-1.5 rounded-lg border border-neutral-800">
          <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
          <span className="text-xs font-semibold text-neutral-300">Total: R$ 78.050,00</span>
        </div>
      </div>

      <div className="relative h-[250px] w-full">
        <svg
          className="w-full h-full overflow-visible cursor-crosshair"
          onMouseMove={handleMouseMove}
          onMouseLeave={() => setHoveredIndex(null)}
        >
          <defs>
            <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#2563EB" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#2563EB" stopOpacity="0.0" />
            </linearGradient>
            <linearGradient id="lineGradient" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#3B82F6" />
              <stop offset="50%" stopColor="#2563EB" />
              <stop offset="100%" stopColor="#60A5FA" />
            </linearGradient>
          </defs>

          {/* Gridlines */}
          {[0, 0.25, 0.5, 0.75, 1].map((ratio, idx) => {
            const val = maxRevenue * ratio;
            const y = getY(val);
            return (
              <g key={idx}>
                <line
                  x1={paddingX}
                  y1={y}
                  x2={width - paddingX}
                  y2={y}
                  stroke="#27272A"
                  strokeWidth="1"
                  strokeDasharray="4 4"
                />
                <text
                  x={paddingX - 10}
                  y={y + 4}
                  fill="#A1A1AA"
                  fontSize="10"
                  fontFamily="monospace"
                  textAnchor="end"
                >
                  {val >= 1000 ? `${(val / 1000).toFixed(1)}k` : val.toFixed(0)}
                </text>
              </g>
            );
          })}

          {/* X Axis labels */}
          {revenueData.map((d, idx) => (
            <text
              key={idx}
              x={getX(idx)}
              y={height - 10}
              fill="#A1A1AA"
              fontSize="10"
              fontFamily="monospace"
              textAnchor="middle"
            >
              {d.day}
            </text>
          ))}

          {/* Main Area Path */}
          <motion.path
            d={areaPath}
            fill="url(#areaGradient)"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
          />

          {/* Main Line Path */}
          <motion.path
            d={linePath}
            fill="none"
            stroke="url(#lineGradient)"
            strokeWidth="3"
            strokeLinecap="round"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
          />

          {/* Dots & Interactivity */}
          {revenueData.map((d, idx) => {
            const cx = getX(idx);
            const cy = getY(d.revenue);
            const isHovered = hoveredIndex === idx;

            return (
              <g key={idx}>
                {isHovered && (
                  <>
                    {/* Vertical guideline */}
                    <line
                      x1={cx}
                      y1={paddingY}
                      x2={cx}
                      y2={height - paddingY}
                      stroke="#2563EB"
                      strokeWidth="1.5"
                      strokeOpacity="0.6"
                    />
                    {/* Glowing outer aura for hovered node */}
                    <circle cx={cx} cy={cy} r="10" fill="#2563EB" fillOpacity="0.25" />
                  </>
                )}
                {/* Core dot node */}
                <circle
                  cx={cx}
                  cy={cy}
                  r={isHovered ? '6' : '4'}
                  fill={isHovered ? '#60A5FA' : '#18181B'}
                  stroke="#2563EB"
                  strokeWidth={isHovered ? '3' : '2'}
                  className="transition-all duration-150"
                />
              </g>
            );
          })}
        </svg>

        {/* Real-time HTML Tooltip */}
        {hoveredIndex !== null && (
          <div
            className="absolute z-10 p-3 rounded-xl border border-neutral-700 bg-neutral-950/95 shadow-xl text-xs flex flex-col gap-1 pointer-events-none transition-all duration-150"
            style={{
              left: `${Math.min(tooltipPos.x - 70, width - 155)}px`,
              top: `${Math.max(tooltipPos.y - 75, 10)}px`,
              width: '140px',
            }}
          >
            <div className="text-[10px] uppercase tracking-wider text-neutral-400 font-mono font-semibold">
              Dia {revenueData[hoveredIndex].day}
            </div>
            <div className="text-sm font-bold text-[#FAFAFA]">
              {formatCurrency(revenueData[hoveredIndex].revenue)}
            </div>
            <div className="text-[10px] text-emerald-400 font-medium flex items-center gap-1">
              <Zap className="w-3 h-3" /> {revenueData[hoveredIndex].purchases} Compras ativas
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Custom Bar Chart for Active API Webhook/Pixel Conversion Events
interface EventDataPoint {
  time: string;
  received: number;
  processed: number;
  sent: number;
}

const eventData: EventDataPoint[] = [
  { time: '12:00', received: 450, processed: 440, sent: 435 },
  { time: '13:00', received: 580, processed: 575, sent: 572 },
  { time: '14:00', received: 850, processed: 840, sent: 838 },
  { time: '15:00', received: 710, processed: 700, sent: 698 },
  { time: '16:00', received: 940, processed: 935, sent: 931 },
  { time: '17:00', received: 1120, processed: 1115, sent: 1112 },
  { time: '18:00', received: 1350, processed: 1342, sent: 1340 },
  { time: '19:00', received: 1540, processed: 1530, sent: 1528 },
];

export function EventBarChart() {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [width, setWidth] = useState(500);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    const resizeObserver = new ResizeObserver((entries) => {
      for (let entry of entries) {
        setWidth(entry.contentRect.width || 500);
      }
    });
    resizeObserver.observe(containerRef.current);
    return () => resizeObserver.disconnect();
  }, []);

  const height = 240;
  const paddingX = 40;
  const paddingY = 30;

  const maxVal = Math.max(...eventData.map((d) => d.received)) * 1.1;

  const getX = (index: number) => {
    return paddingX + (index / eventData.length) * (width - paddingX * 2);
  };

  const getBarHeight = (val: number) => {
    return (val / maxVal) * (height - paddingY * 2);
  };

  const barWidth = Math.max(8, (width - paddingX * 2) / eventData.length / 3 - 6);

  return (
    <div className="p-6 rounded-2xl bg-[#18181B] border border-[#27272A]" ref={containerRef}>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <span className="text-xs font-semibold text-emerald-500 uppercase tracking-wider font-mono">Conversions API (CAPI)</span>
          <h3 className="text-lg font-bold text-[#FAFAFA] flex items-center gap-2 mt-0.5">
            <Activity className="w-4 h-4 text-emerald-400 animate-pulse" />
            Vazão de Eventos & Deduplicação
          </h3>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <span className="flex items-center gap-1.5 text-xs text-neutral-400">
            <span className="w-2.5 h-2.5 rounded bg-blue-500/50" />
            Recebido
          </span>
          <span className="flex items-center gap-1.5 text-xs text-neutral-400">
            <span className="w-2.5 h-2.5 rounded bg-amber-500/60" />
            Processado
          </span>
          <span className="flex items-center gap-1.5 text-xs text-neutral-400">
            <span className="w-2.5 h-2.5 rounded bg-[#16A34A]" />
            Atribuído Meta
          </span>
        </div>
      </div>

      <div className="relative h-[250px] w-full">
        <svg className="w-full h-full overflow-visible">
          {/* Horizontal lines */}
          {[0, 0.25, 0.5, 0.75, 1].map((ratio, idx) => {
            const val = maxVal * ratio;
            const y = height - paddingY - (ratio * (height - paddingY * 2));
            return (
              <g key={idx}>
                <line
                  x1={paddingX}
                  y1={y}
                  x2={width - paddingX}
                  y2={y}
                  stroke="#27272A"
                  strokeWidth="1"
                />
                <text
                  x={paddingX - 10}
                  y={y + 4}
                  fill="#A1A1AA"
                  fontSize="10"
                  fontFamily="monospace"
                  textAnchor="end"
                >
                  {val.toFixed(0)}
                </text>
              </g>
            );
          })}

          {/* Event Bars */}
          {eventData.map((d, idx) => {
            const startX = getX(idx);
            const rHeight = getBarHeight(d.received);
            const pHeight = getBarHeight(d.processed);
            const sHeight = getBarHeight(d.sent);

            const rx = startX + 2;
            const px = rx + barWidth + 2;
            const sx = px + barWidth + 2;

            const ry = height - paddingY - rHeight;
            const py = height - paddingY - pHeight;
            const sy = height - paddingY - sHeight;

            const isHovered = hoveredIndex === idx;

            return (
              <g
                key={idx}
                onMouseEnter={() => setHoveredIndex(idx)}
                onMouseLeave={() => setHoveredIndex(null)}
                className="cursor-pointer"
              >
                {/* Background column highlighting hovered */}
                {isHovered && (
                  <rect
                    x={startX - 4}
                    y={paddingY - 5}
                    width={(barWidth + 3) * 3 + 12}
                    height={height - paddingY * 2 + 10}
                    fill="#27272A"
                    fillOpacity="0.2"
                    rx="8"
                  />
                )}

                {/* Received Event Bar */}
                <rect
                  x={rx}
                  y={ry}
                  width={barWidth}
                  height={Math.max(2, rHeight)}
                  fill={isHovered ? '#3B82F6' : '#2563EB'}
                  fillOpacity={isHovered ? '1' : '0.4'}
                  rx="2"
                  className="transition-all duration-200"
                />

                {/* Processed Event Bar */}
                <rect
                  x={px}
                  y={py}
                  width={barWidth}
                  height={Math.max(2, pHeight)}
                  fill={isHovered ? '#F59E0B' : '#D97706'}
                  fillOpacity={isHovered ? '1' : '0.6'}
                  rx="2"
                  className="transition-all duration-200"
                />

                {/* Sent Event Bar */}
                <rect
                  x={sx}
                  y={sy}
                  width={barWidth}
                  height={Math.max(2, sHeight)}
                  fill={isHovered ? '#34D399' : '#16A34A'}
                  rx="2"
                  className="transition-all duration-200"
                />

                {/* Hour Text Label */}
                <text
                  x={startX + (barWidth * 3 + 6) / 2}
                  y={height - 10}
                  fill="#A1A1AA"
                  fontSize="10"
                  fontFamily="monospace"
                  textAnchor="middle"
                >
                  {d.time}
                </text>
              </g>
            );
          })}
        </svg>

        {/* Real-time HTML Tooltip */}
        {hoveredIndex !== null && (
          <div
            className="absolute z-10 p-3 rounded-xl border border-neutral-700 bg-neutral-950/95 shadow-xl text-xs flex flex-col gap-1.5 pointer-events-none transition-all duration-150"
            style={{
              left: `${Math.min(getX(hoveredIndex) - 40, width - 185)}px`,
              top: `${Math.max(height - paddingY - getBarHeight(eventData[hoveredIndex].received) - 100, 10)}px`,
              width: '170px',
            }}
          >
            <div className="text-[10px] uppercase tracking-wider text-neutral-400 font-mono font-semibold">
              Filtro {eventData[hoveredIndex].time}
            </div>
            <div className="flex flex-col gap-1">
              <div className="flex justify-between text-neutral-300">
                <span>Recebidos:</span>
                <span className="font-semibold font-mono text-blue-400">{eventData[hoveredIndex].received}</span>
              </div>
              <div className="flex justify-between text-neutral-300">
                <span>Processados:</span>
                <span className="font-semibold font-mono text-amber-400">{eventData[hoveredIndex].processed}</span>
              </div>
              <div className="flex justify-between text-neutral-100">
                <span>Enviados CAPI:</span>
                <span className="font-semibold font-mono text-emerald-400">{eventData[hoveredIndex].sent}</span>
              </div>
            </div>
            <div className="border-t border-neutral-800 pt-1 text-[10px] text-emerald-400/80 font-medium flex items-center justify-between">
              <span>Match Quality:</span>
              <span className="font-bold font-mono bg-emerald-500/10 px-1 py-0.2 rounded border border-emerald-500/20">9.8/10</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Top Performing Ads component
export function TopAdsCard() {
  const ads = [
    { name: 'Criativo_03_Video_VSL_Frio.mp4', purchases: 94, cpa: 'R$ 22,40', roas: '4.2x', spend: 'R$ 2.105,60', thumb: '🔥' },
    { name: 'Img_01_Carrossel_Resultado_Depoimentos.png', purchases: 45, cpa: 'R$ 25,12', roas: '3.6x', spend: 'R$ 1.130,40', thumb: '⭐' },
    { name: 'Criativo_05_UGC_Unboxing_Desconto.mp4', purchases: 32, cpa: 'R$ 29,80', roas: '3.1x', spend: 'R$ 953,60', thumb: '📦' },
  ];

  return (
    <div className="p-6 rounded-2xl bg-[#18181B] border border-[#27272A] flex flex-col h-full">
      <div className="flex items-center justify-between mb-6">
        <div>
          <span className="text-xs font-semibold text-blue-500 uppercase tracking-wider font-mono">Performance criativa</span>
          <h3 className="text-lg font-bold text-[#FAFAFA] flex items-center gap-2 mt-0.5">
            <Flame className="w-4 h-4 text-orange-400" />
            Top Criativos do Meta Ads
          </h3>
        </div>
      </div>

      <div className="flex-grow space-y-4">
        {ads.map((ad, idx) => (
          <div
            key={idx}
            className="p-3.5 rounded-xl border border-neutral-800/60 bg-[#111113]/50 flex items-center gap-4 hover:border-neutral-700/60 transition-all duration-200"
          >
            <div className="w-10 h-10 rounded-lg bg-neutral-900 border border-neutral-800 flex items-center justify-center text-lg shadow-inner">
              {ad.thumb}
            </div>
            <div className="flex-grow min-w-0">
              <h4 className="text-xs font-semibold text-neutral-200 truncate">{ad.name}</h4>
              <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                <span className="text-[10px] font-mono text-[#A1A1AA]">Gastos: <span className="text-neutral-300 font-semibold">{ad.spend}</span></span>
                <span className="text-[10px] font-mono text-[#A1A1AA]">CPA: <span className="text-neutral-300 font-semibold">{ad.cpa}</span></span>
              </div>
            </div>
            <div className="text-right flex-shrink-0">
              <div className="text-xs font-bold text-emerald-400 font-mono">{ad.roas} ROAS</div>
              <div className="text-[10px] text-neutral-400 font-mono mt-0.5">{ad.purchases} compras</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
