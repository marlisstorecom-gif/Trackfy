import { Purchase, Campaign, Pixel, Integration, WebhookLog } from './types';

export const mockPurchases: Purchase[] = [
  {
    id: 'TRK-98431',
    customerName: 'Guilherme Silva',
    email: 'gui.silva@gmail.com',
    value: 197.00,
    currency: 'BRL',
    campaign: '🔥 [CBO] Conversão - Escala Lookalike 1% - 5%',
    source: 'fb',
    status: 'aprovado',
    timestamp: '2026-08-05T19:35:00-03:00',
    pixelId: '843910582910482',
    utmSource: 'facebook',
    utmMedium: 'cpc',
    utmCampaign: 'escala-lookalike-cbo',
  },
  {
    id: 'TRK-98430',
    customerName: 'Mariana Souza',
    email: 'mariana.souza@outlook.com',
    value: 297.00,
    currency: 'BRL',
    campaign: '🎯 [CBO] Conversão - Público Frio - Interesses',
    source: 'fb',
    status: 'aprovado',
    timestamp: '2026-08-05T19:28:12-03:00',
    pixelId: '843910582910482',
    utmSource: 'facebook',
    utmMedium: 'cpc',
    utmCampaign: 'interesses-frio',
  },
  {
    id: 'TRK-98429',
    customerName: 'Carlos Eduardo',
    email: 'cadu.dev@hotmail.com',
    value: 97.00,
    currency: 'BRL',
    campaign: '🔄 [Remarketing] Checkout Iniciado - 7 Dias',
    source: 'fb',
    status: 'aprovado',
    timestamp: '2026-08-05T19:15:40-03:00',
    pixelId: '843910582910482',
    utmSource: 'facebook',
    utmMedium: 'remarketing-cpc',
    utmCampaign: 'checkout-7d',
  },
  {
    id: 'TRK-98428',
    customerName: 'Ana Beatriz Ramos',
    email: 'anabea.ramos@gmail.com',
    value: 497.00,
    currency: 'BRL',
    campaign: '🔥 [CBO] Conversão - Escala Lookalike 1% - 5%',
    source: 'fb',
    status: 'pendente',
    timestamp: '2026-08-05T19:02:11-03:00',
    pixelId: '843910582910482',
    utmSource: 'facebook',
    utmMedium: 'cpc',
    utmCampaign: 'escala-lookalike-cbo',
  },
  {
    id: 'TRK-98427',
    customerName: 'Felipe Albuquerque',
    email: 'felipe.albu@gmail.com',
    value: 197.00,
    currency: 'BRL',
    campaign: '🎯 [CBO] Conversão - Público Frio - Interesses',
    source: 'fb',
    status: 'aprovado',
    timestamp: '2026-08-05T18:44:55-03:00',
    pixelId: '843910582910482',
    utmSource: 'facebook',
    utmMedium: 'cpc',
    utmCampaign: 'interesses-frio',
  },
  {
    id: 'TRK-98426',
    customerName: 'Patricia Lima',
    email: 'patylima90@yahoo.com.br',
    value: 197.00,
    currency: 'BRL',
    campaign: '🔥 [CBO] Conversão - Escala Lookalike 1% - 5%',
    source: 'fb',
    status: 'recusado',
    timestamp: '2026-08-05T18:30:19-03:00',
    pixelId: '843910582910482',
    utmSource: 'facebook',
    utmMedium: 'cpc',
    utmCampaign: 'escala-lookalike-cbo',
  },
  {
    id: 'TRK-98425',
    customerName: 'Roberto Silveira',
    email: 'roberto.silv@gmail.com',
    value: 297.00,
    currency: 'BRL',
    campaign: '⚡ [ABO] Tráfego Direto - Criativo VSL 02',
    source: 'fb',
    status: 'aprovado',
    timestamp: '2026-08-05T18:12:00-03:00',
    pixelId: '843910582910482',
    utmSource: 'facebook',
    utmMedium: 'cpc',
    utmCampaign: 'vsl-02-direto',
  }
];

export const mockCampaigns: Campaign[] = [
  {
    id: 'camp_1',
    name: '🔥 [CBO] Conversão - Escala Lookalike 1% - 5%',
    status: 'active',
    spend: 4250.00,
    revenue: 16850.00,
    roas: 3.96,
    cpc: 0.85,
    cpa: 24.85,
    purchases: 171,
    clicks: 5000,
    impressions: 124000,
  },
  {
    id: 'camp_2',
    name: '🎯 [CBO] Conversão - Público Frio - Interesses',
    status: 'active',
    spend: 2800.00,
    revenue: 8900.00,
    roas: 3.18,
    cpc: 0.98,
    cpa: 31.46,
    purchases: 89,
    clicks: 2857,
    impressions: 98000,
  },
  {
    id: 'camp_3',
    name: '🔄 [Remarketing] Checkout Iniciado - 7 Dias',
    status: 'active',
    spend: 850.00,
    revenue: 4350.00,
    roas: 5.12,
    cpc: 0.55,
    cpa: 14.16,
    purchases: 60,
    clicks: 1545,
    impressions: 34000,
  },
  {
    id: 'camp_4',
    name: '⚡ [ABO] Tráfego Direto - Criativo VSL 02',
    status: 'active',
    spend: 1500.00,
    revenue: 2850.00,
    roas: 1.90,
    cpc: 1.20,
    cpa: 48.38,
    purchases: 31,
    clicks: 1250,
    impressions: 48000,
  },
  {
    id: 'camp_5',
    name: '💰 [CBO] Teste de Públicos - Lookalike 10%',
    status: 'paused',
    spend: 450.00,
    revenue: 390.00,
    roas: 0.87,
    cpc: 1.10,
    cpa: 75.00,
    purchases: 6,
    clicks: 409,
    impressions: 15000,
  }
];

export const mockPixels: Pixel[] = [
  {
    id: '843910582910482',
    name: 'Pixel de Vendas - Produto Principal',
    status: 'active',
    eventsCount: 42109,
    lastActive: 'há 1 min'
  },
  {
    id: '928401840192841',
    name: 'Pixel de Remarketing - Público Quente',
    status: 'active',
    eventsCount: 18451,
    lastActive: 'há 5 min'
  },
  {
    id: '710492840192840',
    name: 'Pixel - Lançamento Semente',
    status: 'inactive',
    eventsCount: 301,
    lastActive: 'há 3 dias'
  }
];

export const mockIntegrations: Integration[] = [
  {
    id: 'hotmart',
    name: 'Hotmart',
    logo: '🔥',
    description: 'Rastreie boletos, cartões de crédito e pix gerados na Hotmart e envie imediatamente ao Pixel do Facebook.',
    connected: true,
    status: 'connected',
    webhookUrl: 'https://api.trackify.com.br/v1/webhooks/hotmart/wh-8239482'
  },
  {
    id: 'kiwify',
    name: 'Kiwify',
    logo: '🥝',
    description: 'Atribuição em tempo real para compras aprovadas, reembolsadas e abandonos de carrinho na Kiwify.',
    connected: false,
    status: 'disconnected'
  },
  {
    id: 'shopify',
    name: 'Shopify',
    logo: '🛍️',
    description: 'Integração direta com o checkout da Shopify para captura de FBCLID, AddToCart e Purchase de forma automatizada.',
    connected: false,
    status: 'disconnected'
  }
];

export const mockWebhookLogs: WebhookLog[] = [
  {
    id: 'log_001',
    timestamp: '2026-08-05T19:35:01-03:00',
    event: 'purchase',
    source: 'Hotmart',
    status: 'sent_to_facebook',
    payload: JSON.stringify({
      event: 'purchase',
      transaction: 'HP09182390182',
      product_id: 284901,
      product_name: 'Fórmula Escala Digital 2.0',
      price: 197.00,
      currency: 'BRL',
      buyer: {
        name: 'Guilherme Silva',
        email: 'gui.silva@gmail.com',
        phone: '+5511999998888',
        ip: '189.12.35.101',
        user_agent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_5 like Mac OS X)'
      },
      utm: {
        utm_source: 'facebook',
        utm_medium: 'cpc',
        utm_campaign: 'escala-lookalike-cbo',
        fbclid: 'IwAR3FpB_D_bU6_r9gU918-v-Z2g987q9Yt_z9-zR92'
      }
    }, null, 2)
  },
  {
    id: 'log_002',
    timestamp: '2026-08-05T19:28:13-03:00',
    event: 'purchase',
    source: 'Hotmart',
    status: 'sent_to_facebook',
    payload: JSON.stringify({
      event: 'purchase',
      transaction: 'HP09182390181',
      product_id: 284901,
      product_name: 'Fórmula Escala Digital 2.0',
      price: 297.00,
      buyer: {
        name: 'Mariana Souza',
        email: 'mariana.souza@outlook.com',
        phone: '+5521988887777',
        ip: '201.89.12.44'
      },
      utm: {
        utm_source: 'facebook',
        utm_medium: 'cpc',
        utm_campaign: 'interesses-frio',
        fbclid: 'IwAR3XpT_8401928401928401928'
      }
    }, null, 2)
  },
  {
    id: 'log_003',
    timestamp: '2026-08-05T19:15:42-03:00',
    event: 'initiate_checkout',
    source: 'Hotmart',
    status: 'processed',
    payload: JSON.stringify({
      event: 'initiate_checkout',
      product_id: 284901,
      price: 97.00,
      buyer: {
        name: 'Carlos Eduardo',
        email: 'cadu.dev@hotmail.com'
      }
    }, null, 2)
  },
  {
    id: 'log_004',
    timestamp: '2026-08-05T19:02:12-03:00',
    event: 'purchase_pending',
    source: 'Hotmart',
    status: 'received',
    payload: JSON.stringify({
      event: 'billet_generated',
      product_id: 284901,
      price: 497.00,
      buyer: {
        name: 'Ana Beatriz Ramos',
        email: 'anabea.ramos@gmail.com'
      }
    }, null, 2)
  }
];
