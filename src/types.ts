export interface StatCardProps {
  id?: string;
  title: string;
  value: string | number;
  change: number; // positive or negative percentage, e.g. +12.4 or -3.2
  trend: 'up' | 'down' | 'neutral';
  subtitle?: string;
  loading?: boolean;
}

export interface Purchase {
  id: string;
  customerName: string;
  email: string;
  value: number;
  currency: string;
  campaign: string;
  source: string; // e.g., 'fb', 'google', 'organic'
  status: 'aprovado' | 'pendente' | 'recusado';
  timestamp: string;
  pixelId: string;
  utmSource: string;
  utmMedium: string;
  utmCampaign: string;
}

export interface Campaign {
  id: string;
  name: string;
  status: 'active' | 'paused';
  spend: number;
  revenue: number;
  roas: number;
  cpc: number;
  cpa: number;
  purchases: number;
  clicks: number;
  impressions: number;
}

export interface Pixel {
  id: string;
  name: string;
  status: 'active' | 'inactive';
  eventsCount: number;
  lastActive: string;
}

export interface Integration {
  id: string;
  name: string;
  logo: string; // Key of simple logos
  description: string;
  connected: boolean;
  status: 'connected' | 'disconnected';
  webhookUrl?: string;
}

export interface WebhookLog {
  id: string;
  timestamp: string;
  event: string; // e.g. 'purchase', 'lead'
  source: string; // Kiwify, Hotmart, Shopify
  status: 'received' | 'processed' | 'sent_to_facebook';
  payload: string; // JSON string
}

export interface AppState {
  currentTab: string;
  isOnboarding: boolean;
  onboardingStep: number;
  isMetaConnected: boolean;
  metaAccount: {
    name: string;
    id: string;
    status: string;
    businessManager: string;
  } | null;
  selectedPixelId: string;
  pixels: Pixel[];
  integrations: Integration[];
  webhookLogs: WebhookLog[];
  apiKey: string;
  apiSecret: string;
  apiToken: string;
  userProfile: {
    name: string;
    email: string;
    company: string;
    plan: string;
    usage: {
      eventsUsed: number;
      eventsLimit: number;
      pixelsUsed: number;
      pixelsLimit: number;
    };
  };
}
