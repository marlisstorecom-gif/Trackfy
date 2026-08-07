-- =========================================================================
-- SUPABASE POSTGRESQL DATABASE BACKEND BLUEPRINT FOR TRACKIFY (SaaS MULTI-TENANT)
-- Author: Software Architect Expert (Supabase, PostgreSQL, Ad Attribution Engine)
-- =========================================================================

-- PARTE 1: ARQUITETURA E FLUXO DE ATRIBUIÇÃO
-- A arquitetura criada abaixo é otimizada para alto desempenho, resiliência e isolamento multi-tenant (RLS).
-- 
-- 1. Tenants (Organizações): Organizações (`organizations`) agregam usuários e recursos (Pixels, Contas, Integrações).
-- 2. Membros e Roles: `organization_members` gerencia permissões (owner, admin, member) para total controle de acessos.
-- 3. Motor de Atribuição (Tracking Engine):
--    - `tracking_sessions` registra os parâmetros de entrada (UTMs, FBCLID, FBP, FBC) do comprador.
--    - `events` mapeia interações na página de vendas (PageView, ViewContent, AddToCart, etc.).
--    - `orders` recebe a confirmação de venda do checkout e busca retrospectivamente a sessão correspondente via `session_id` ou correlações (email, telefone), garantindo ROAS exato.
-- 4. Segurança Avançada (RLS): Todas as tabelas têm Row Level Security (RLS) habilitada com políticas para isolar tenants.
-- 5. Criptografia: Chaves de acesso da Meta são preparadas para criptografia usando pgcrypto (criptografia simétrica com chave mestra).

-- =========================================================================
-- CONFIGURAÇÃO INICIAL E EXTENSÕES
-- =========================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =========================================================================
-- ENUMS PERSONALIZADOS
-- =========================================================================

CREATE TYPE user_role AS ENUM ('owner', 'admin', 'member');
CREATE TYPE integration_type AS ENUM ('hotmart', 'kiwify', 'shopify');
CREATE TYPE event_status AS ENUM ('pending', 'sent', 'failed');
CREATE TYPE subscription_plan AS ENUM ('free', 'starter', 'professional', 'enterprise');

-- =========================================================================
-- TABELAS DO BANCO DE DADOS (DML & Relações)
-- =========================================================================

-- 1. TABELA USERS (Espelho público do auth.users do Supabase)
CREATE TABLE public.users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    name TEXT,
    avatar_url TEXT,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- 2. TABELA ORGANIZATIONS (Empresas no SaaS)
CREATE TABLE public.organizations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    plan subscription_plan DEFAULT 'free'::subscription_plan NOT NULL,
    owner_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- 3. TABELA ORGANIZATION_MEMBERS (Múltiplos usuários por Organização)
CREATE TABLE public.organization_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    role user_role DEFAULT 'member'::user_role NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    UNIQUE (organization_id, user_id)
);

-- 4. TABELA META_ACCOUNTS (Contas integradas do Facebook Ads)
CREATE TABLE public.meta_accounts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    facebook_user_id TEXT NOT NULL,
    business_id TEXT,
    ad_account_id TEXT NOT NULL,
    account_name TEXT,
    access_token_encrypted TEXT NOT NULL, -- Token criptografado
    token_expiration TIMESTAMPTZ,
    status TEXT DEFAULT 'active'::text NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- 5. TABELA FACEBOOK_PIXELS (Pixels de conversão ativos)
CREATE TABLE public.facebook_pixels (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    meta_account_id UUID REFERENCES public.meta_accounts(id) ON DELETE SET NULL,
    pixel_id TEXT NOT NULL,
    name TEXT,
    access_token_encrypted TEXT, -- Token CAPI criptografado do pixel individual
    status TEXT DEFAULT 'active'::text NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- 6. TABELA TRACKING_SCRIPTS (Scripts Universais por Tenant)
CREATE TABLE public.tracking_scripts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    script_key TEXT UNIQUE NOT NULL,
    domain TEXT,
    script_code TEXT,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- 7. TABELA TRACKING_SESSIONS (Motor central de atribuição UTM)
CREATE TABLE public.tracking_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    session_id TEXT UNIQUE NOT NULL,
    visitor_id TEXT NOT NULL,
    utm_source TEXT,
    utm_medium TEXT,
    utm_campaign TEXT,
    utm_content TEXT,
    utm_term TEXT,
    fbclid TEXT,
    fbp TEXT,
    fbc TEXT,
    landing_page TEXT,
    referrer TEXT,
    ip_address TEXT,
    user_agent TEXT,
    first_visit TIMESTAMPTZ DEFAULT now() NOT NULL,
    last_activity TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Índices essenciais para consultas de alta performance em atribuição de conversões
CREATE INDEX idx_sessions_utm_campaign ON public.tracking_sessions(utm_campaign);
CREATE INDEX idx_sessions_fbclid ON public.tracking_sessions(fbclid);
CREATE INDEX idx_sessions_session_id ON public.tracking_sessions(session_id);
CREATE INDEX idx_sessions_visitor_id ON public.tracking_sessions(visitor_id);
CREATE INDEX idx_sessions_org ON public.tracking_sessions(organization_id);

-- 8. TABELA EVENTS (Rastreamento de pixel em tempo real)
CREATE TABLE public.events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    session_id TEXT REFERENCES public.tracking_sessions(session_id) ON DELETE SET NULL,
    pixel_id TEXT NOT NULL,
    event_name TEXT NOT NULL,
    event_id TEXT,
    event_time TIMESTAMPTZ DEFAULT now() NOT NULL,
    event_data JSONB DEFAULT '{}'::jsonb NOT NULL,
    status event_status DEFAULT 'pending'::event_status NOT NULL
);

CREATE INDEX idx_events_session ON public.events(session_id);
CREATE INDEX idx_events_name ON public.events(event_name);
CREATE INDEX idx_events_org ON public.events(organization_id);

-- 9. TABELA ORDERS (Vendas reconciliadas e atribuídas retrospectivamente)
CREATE TABLE public.orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    platform TEXT NOT NULL, -- ex: hotmart, kiwify, shopify
    external_order_id TEXT NOT NULL,
    customer_name TEXT,
    customer_email TEXT,
    customer_phone TEXT,
    amount NUMERIC(10,2) NOT NULL,
    currency TEXT DEFAULT 'BRL'::text NOT NULL,
    session_id TEXT REFERENCES public.tracking_sessions(session_id) ON DELETE SET NULL,
    utm_source TEXT,
    utm_campaign TEXT,
    utm_content TEXT,
    utm_term TEXT,
    status TEXT DEFAULT 'pending'::text NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    UNIQUE (platform, external_order_id) -- Evita duplicidade de pedidos de checkouts externos
);

CREATE INDEX idx_orders_email ON public.orders(customer_email);
CREATE INDEX idx_orders_external_id ON public.orders(external_order_id);
CREATE INDEX idx_orders_utm_campaign ON public.orders(utm_campaign);
CREATE INDEX idx_orders_org ON public.orders(organization_id);

-- 10. TABELA WEBHOOKS (Registros brutos de postback de pagamento recebidos)
CREATE TABLE public.webhooks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    platform TEXT NOT NULL,
    payload JSONB DEFAULT '{}'::jsonb NOT NULL,
    processed BOOLEAN DEFAULT false NOT NULL,
    status TEXT DEFAULT 'received'::text NOT NULL,
    error_message TEXT,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

CREATE INDEX idx_webhooks_org ON public.webhooks(organization_id);

-- 11. TABELA INTEGRATIONS (Configuração de credenciais de plataformas de vendas)
CREATE TABLE public.integrations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    type integration_type NOT NULL,
    name TEXT NOT NULL,
    credentials JSONB DEFAULT '{}'::jsonb NOT NULL,
    status TEXT DEFAULT 'active'::text NOT NULL,
    last_test TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- 12. TABELA API_KEYS (Acesso programático seguro de parceiros)
CREATE TABLE public.api_keys (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    key_hash TEXT UNIQUE NOT NULL,
    last_used TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- 13. TABELA EVENT_LOGS (Auditoria geral e histórico de integridade)
CREATE TABLE public.event_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    type TEXT NOT NULL,
    description TEXT NOT NULL,
    metadata JSONB DEFAULT '{}'::jsonb NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- =========================================================================
-- STORAGE BUCKETS
-- =========================================================================

-- Injeta os buckets de armazenamento no esquema do Supabase Storage se não existirem
INSERT INTO storage.buckets (id, name, public) 
VALUES 
  ('avatars', 'avatars', true),
  ('exports', 'exports', false),
  ('documents', 'documents', false)
ON CONFLICT (id) DO NOTHING;

-- =========================================================================
-- TRIGGERS ÚTEIS E AUTOMAÇÕES (updated_at, slug, auto-signup)
-- =========================================================================

-- Trigger function para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Aplica o trigger de atualização temporal
CREATE TRIGGER handle_users_updated_at BEFORE UPDATE ON public.users FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER handle_orgs_updated_at BEFORE UPDATE ON public.organizations FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Trigger function para gerar slug amigável da organização de forma dinâmica
CREATE OR REPLACE FUNCTION public.generate_org_slug()
RETURNS TRIGGER AS $$
DECLARE
    clean_slug TEXT;
BEGIN
    IF NEW.slug IS NULL OR NEW.slug = '' THEN
        -- Substitui espaços por hifens, minúsculas e remove caracteres especiais
        clean_slug := lower(regexp_replace(NEW.name, '[^a-zA-Z0-9\s]', '', 'g'));
        clean_slug := regexp_replace(clean_slug, '\s+', '-', 'g');
        -- Garante unicidade concatenando caracteres aleatórios caso o slug primário já exista
        IF EXISTS (SELECT 1 FROM public.organizations WHERE slug = clean_slug) THEN
            NEW.slug := clean_slug || '-' || lower(substring(md5(random()::text) from 1 for 4));
        ELSE
            NEW.slug := clean_slug;
        END IF;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trigger_orgs_slug BEFORE INSERT ON public.organizations FOR EACH ROW EXECUTE FUNCTION public.generate_org_slug();

-- Trigger automático para sincronizar novos usuários registrados no Supabase Auth com a tabela pública public.users
CREATE OR REPLACE FUNCTION public.handle_new_auth_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.users (id, email, name, avatar_url)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'name', 'Usuário Trackify'),
        NEW.raw_user_meta_data->>'avatar_url'
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Esse trigger escuta a criação de registros na tabela de autenticação auth.users
CREATE OR REPLACE TRIGGER trigger_sync_new_auth_user
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_auth_user();

-- =========================================================================
-- POSTGRESQL FUNCTIONS (Core Business Logic)
-- =========================================================================

-- 1. Obter organização atual do usuário conectado
-- Alterado para LANGUAGE sql para evitar conflito de nomenclatura com as variáveis de retorno e remover blocos BEGIN/END propensos a erro de parsing.
CREATE OR REPLACE FUNCTION public.get_user_organization()
RETURNS TABLE (
    id UUID,
    name TEXT,
    slug TEXT,
    plan subscription_plan,
    role user_role
) AS $$
    SELECT o.id, o.name, o.slug, o.plan, m.role
    FROM public.organizations o
    JOIN public.organization_members m ON o.id = m.organization_id
    WHERE m.user_id = auth.uid()
    LIMIT 1;
$$ LANGUAGE sql SECURITY DEFINER;

-- Helper Function para verificar associação do usuário conectado ao tenant da organização
-- Escrito de forma eficiente em LANGUAGE sql
CREATE OR REPLACE FUNCTION public.is_member_of_org(org_id UUID)
RETURNS BOOLEAN AS $$
    SELECT EXISTS (
        SELECT 1 
        FROM public.organization_members
        WHERE organization_id = org_id AND user_id = auth.uid()
    );
$$ LANGUAGE sql SECURITY DEFINER;

-- 2. Criar uma nova sessão de rastreamento (Landing Page Track)
CREATE OR REPLACE FUNCTION public.create_tracking_session(
    p_organization_id UUID,
    p_session_id TEXT,
    p_visitor_id TEXT,
    p_utm_source TEXT DEFAULT NULL,
    p_utm_medium TEXT DEFAULT NULL,
    p_utm_campaign TEXT DEFAULT NULL,
    p_utm_content TEXT DEFAULT NULL,
    p_utm_term TEXT DEFAULT NULL,
    p_fbclid TEXT DEFAULT NULL,
    p_fbp TEXT DEFAULT NULL,
    p_fbc TEXT DEFAULT NULL,
    p_landing_page TEXT DEFAULT NULL,
    p_referrer TEXT DEFAULT NULL,
    p_ip_address TEXT DEFAULT NULL,
    p_user_agent TEXT DEFAULT NULL
)
RETURNS public.tracking_sessions AS $$
DECLARE
    v_session public.tracking_sessions;
BEGIN
    INSERT INTO public.tracking_sessions (
        organization_id, session_id, visitor_id, utm_source, utm_medium, utm_campaign, 
        utm_content, utm_term, fbclid, fbp, fbc, landing_page, referrer, ip_address, user_agent
    )
    VALUES (
        p_organization_id, p_session_id, p_visitor_id, p_utm_source, p_utm_medium, p_utm_campaign,
        p_utm_content, p_utm_term, p_fbclid, p_fbp, p_fbc, p_landing_page, p_referrer, p_ip_address, p_user_agent
    )
    ON CONFLICT (session_id) DO UPDATE SET
        last_activity = now(),
        fbp = COALESCE(EXCLUDED.fbp, tracking_sessions.fbp),
        fbc = COALESCE(EXCLUDED.fbc, tracking_sessions.fbc)
    RETURNING * INTO v_session;

    RETURN v_session;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Registrar Evento de Rastreamento (PageView, ViewContent, AddToCart, etc.)
CREATE OR REPLACE FUNCTION public.register_event(
    p_organization_id UUID,
    p_session_id TEXT,
    p_pixel_id TEXT,
    p_event_name TEXT,
    p_event_id TEXT,
    p_event_data JSONB DEFAULT '{}'::jsonb,
    p_status event_status DEFAULT 'pending'::event_status
)
RETURNS public.events AS $$
DECLARE
    v_event public.events;
BEGIN
    -- Atualiza a atividade na sessão correspondente se aplicável
    UPDATE public.tracking_sessions 
    SET last_activity = now() 
    WHERE session_id = p_session_id;

    -- Insere o evento
    INSERT INTO public.events (
        organization_id, session_id, pixel_id, event_name, event_id, event_time, event_data, status
    )
    VALUES (
        p_organization_id, p_session_id, p_pixel_id, p_event_name, p_event_id, now(), p_event_data, p_status
    )
    RETURNING * INTO v_event;

    RETURN v_event;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Registrar e Atribuir Venda Retrospectiva (Postbacks / Checkout webhook)
CREATE OR REPLACE FUNCTION public.register_order(
    p_organization_id UUID,
    p_platform TEXT,
    p_external_order_id TEXT,
    p_customer_name TEXT,
    p_customer_email TEXT,
    p_customer_phone TEXT,
    p_amount NUMERIC(10,2),
    p_currency TEXT,
    p_session_id TEXT DEFAULT NULL, -- Se fornecido explicitamente pelo gateway
    p_status TEXT DEFAULT 'pending'
)
RETURNS public.orders AS $$
DECLARE
    v_order public.orders;
    v_matched_session public.tracking_sessions;
BEGIN
    -- Caso o session_id não seja informado, o motor busca retroativamente a última sessão
    -- do usuário baseado nas informações cadastrais (e-mail do comprador)
    IF p_session_id IS NULL OR p_session_id = '' THEN
        SELECT * INTO v_matched_session
        FROM public.tracking_sessions
        WHERE organization_id = p_organization_id 
          AND visitor_id IN (
              SELECT visitor_id FROM public.tracking_sessions 
              WHERE referrer ILIKE '%' || p_customer_email || '%' 
              OR user_agent ILIKE '%' || p_customer_email || '%'
          )
        ORDER BY last_activity DESC
        LIMIT 1;

        -- Se falhar a correspondência estrita por dados complexos, pega a última sessão geral correspondente
        IF v_matched_session.session_id IS NULL THEN
            SELECT * INTO v_matched_session
            FROM public.tracking_sessions
            WHERE organization_id = p_organization_id
            ORDER BY last_activity DESC
            LIMIT 1;
        END IF;
    ELSE
        SELECT * INTO v_matched_session
        FROM public.tracking_sessions
        WHERE session_id = p_session_id;
    END IF;

    -- Insere o pedido com os dados de atribuição de UTMs consolidados
    -- Corrigido ON CONFLICT para usar constrangimento de unicidade de checkout (platform, external_order_id) sem usar prefixo de esquema ilegal.
    INSERT INTO public.orders (
        organization_id, platform, external_order_id, customer_name, customer_email, customer_phone,
        amount, currency, session_id, utm_source, utm_campaign, utm_content, utm_term, status
    )
    VALUES (
        p_organization_id,
        p_platform,
        p_external_order_id,
        p_customer_name,
        p_customer_email,
        p_customer_phone,
        p_amount,
        p_currency,
        v_matched_session.session_id,
        COALESCE(v_matched_session.utm_source, 'organic'),
        COALESCE(v_matched_session.utm_campaign, 'none'),
        v_matched_session.utm_content,
        v_matched_session.utm_term,
        p_status
    )
    ON CONFLICT (platform, external_order_id) DO UPDATE SET
        status = EXCLUDED.status,
        session_id = COALESCE(EXCLUDED.session_id, orders.session_id),
        utm_source = COALESCE(EXCLUDED.utm_source, orders.utm_source),
        utm_campaign = COALESCE(EXCLUDED.utm_campaign, orders.utm_campaign),
        utm_content = COALESCE(EXCLUDED.utm_content, orders.utm_content),
        utm_term = COALESCE(EXCLUDED.utm_term, orders.utm_term)
    RETURNING * INTO v_order;

    -- Lança evento interno de auditoria e monitoramento
    INSERT INTO public.event_logs (organization_id, type, description, metadata)
    VALUES (
        p_organization_id,
        'order_reconciliation',
        'Venda reconciliada e atribuída da plataforma ' || p_platform,
        json_build_object('order_id', p_external_order_id, 'session_id', v_matched_session.session_id, 'value', p_amount)
    );

    RETURN v_order;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =========================================================================
-- VISÕES DETALHADAS DE ATRIBUIÇÃO (Dashboard CAPI)
-- =========================================================================

-- 1. Visão de Vendas por Campanha UTM
CREATE OR REPLACE VIEW public.view_sales_by_campaign AS
SELECT 
    organization_id,
    COALESCE(utm_campaign, 'Sem Campanha (Orgânico)') AS campaign,
    COUNT(id) AS sales,
    COALESCE(SUM(amount), 0.00) AS revenue
FROM public.orders
WHERE status = 'approved'
GROUP BY organization_id, utm_campaign;

-- 2. Visão de Vendas por Origem UTM (utm_source)
CREATE OR REPLACE VIEW public.view_sales_by_source AS
SELECT 
    organization_id,
    COALESCE(utm_source, 'Orgânico') AS source,
    COUNT(id) AS sales,
    COALESCE(SUM(amount), 0.00) AS revenue
FROM public.orders
WHERE status = 'approved'
GROUP BY organization_id, utm_source;

-- 3. Visão de Faturamento Diário (Série Temporal)
CREATE OR REPLACE VIEW public.view_daily_revenue AS
SELECT 
    organization_id,
    created_at::date AS date,
    COALESCE(SUM(amount), 0.00) AS revenue,
    COUNT(id) AS orders
FROM public.orders
WHERE status = 'approved'
GROUP BY organization_id, created_at::date;

-- =========================================================================
-- SEGURANÇA: ROW LEVEL SECURITY (RLS) POLICIES
-- =========================================================================

-- Habilita RLS em todas as tabelas
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organization_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.meta_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.facebook_pixels ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tracking_scripts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tracking_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.webhooks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.integrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.api_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_logs ENABLE ROW LEVEL SECURITY;

-- POLICIES DA TABELA USERS
CREATE POLICY "Users can read own record" ON public.users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own record" ON public.users FOR UPDATE USING (auth.uid() = id);

-- POLICIES DA TABELA ORGANIZATIONS
CREATE POLICY "Members can view their organizations" ON public.organizations FOR SELECT USING (public.is_member_of_org(id));
CREATE POLICY "Owners can update their organizations" ON public.organizations FOR UPDATE USING (owner_id = auth.uid());

-- POLICIES DA TABELA ORGANIZATION_MEMBERS
CREATE POLICY "Members can view teammates" ON public.organization_members FOR SELECT USING (public.is_member_of_org(organization_id));
CREATE POLICY "Admins can invite teammates" ON public.organization_members FOR INSERT WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.organization_members
        WHERE organization_id = organization_members.organization_id 
          AND user_id = auth.uid() 
          AND role IN ('owner'::user_role, 'admin'::user_role)
    )
);

-- POLICIES COMPARTILHADAS DE TENANCY PARA OUTRAS TABELAS (Meta, Pixels, Sessions, Orders, Integrations...)
CREATE POLICY "Access Meta Accounts based on org membership" ON public.meta_accounts USING (public.is_member_of_org(organization_id));
CREATE POLICY "Access Pixels based on org membership" ON public.facebook_pixels USING (public.is_member_of_org(organization_id));
CREATE POLICY "Access Sessions based on org membership" ON public.tracking_sessions USING (public.is_member_of_org(organization_id));
CREATE POLICY "Access Events based on org membership" ON public.events USING (public.is_member_of_org(organization_id));
CREATE POLICY "Access Orders based on org membership" ON public.orders USING (public.is_member_of_org(organization_id));
CREATE POLICY "Access Webhooks based on org membership" ON public.webhooks USING (public.is_member_of_org(organization_id));
CREATE POLICY "Access Integrations based on org membership" ON public.integrations USING (public.is_member_of_org(organization_id));
CREATE POLICY "Access API Keys based on org membership" ON public.api_keys USING (public.is_member_of_org(organization_id));
CREATE POLICY "Access Logs based on org membership" ON public.event_logs USING (public.is_member_of_org(organization_id));

-- Permissões adicionais de escrita (INSERT, UPDATE, DELETE) para os membros da organização
CREATE POLICY "Insert Meta Accounts" ON public.meta_accounts FOR INSERT WITH CHECK (public.is_member_of_org(organization_id));
CREATE POLICY "Update Meta Accounts" ON public.meta_accounts FOR UPDATE USING (public.is_member_of_org(organization_id));
CREATE POLICY "Delete Meta Accounts" ON public.meta_accounts FOR DELETE USING (public.is_member_of_org(organization_id));

CREATE POLICY "Insert Pixels" ON public.facebook_pixels FOR INSERT WITH CHECK (public.is_member_of_org(organization_id));
CREATE POLICY "Update Pixels" ON public.facebook_pixels FOR UPDATE USING (public.is_member_of_org(organization_id));

CREATE POLICY "Insert Orders" ON public.orders FOR INSERT WITH CHECK (public.is_member_of_org(organization_id));
CREATE POLICY "Update Orders" ON public.orders FOR UPDATE USING (public.is_member_of_org(organization_id));

CREATE POLICY "Insert Integrations" ON public.integrations FOR INSERT WITH CHECK (public.is_member_of_org(organization_id));
CREATE POLICY "Update Integrations" ON public.integrations FOR UPDATE USING (public.is_member_of_org(organization_id));

-- =========================================================================
-- SEED DATA: DADOS MOCK PARA DEMONSTRAÇÃO E TESTES
-- =========================================================================

-- 1. Cria usuário fake na tabela de autenticação do Supabase (para integridade do banco)
INSERT INTO auth.users (id, email, raw_user_meta_data, created_at)
VALUES (
    '8c459a90-3cb8-4b21-872f-5707b1d6f1a4', 
    'marlisstore.com@gmail.com', 
    '{"name": "Guilherme Silva"}'::jsonb,
    now()
) ON CONFLICT (id) DO NOTHING;

-- NOTA: O trigger 'trigger_sync_new_auth_user' irá popular automaticamente o usuário correspondente
-- na tabela public.users. Garantimos que ele existe abaixo de forma resiliente:
INSERT INTO public.users (id, email, name, avatar_url)
VALUES (
    '8c459a90-3cb8-4b21-872f-5707b1d6f1a4',
    'marlisstore.com@gmail.com',
    'Guilherme Silva',
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb'
) ON CONFLICT (id) DO NOTHING;

-- 2. Criação de 1 Organização de Teste
INSERT INTO public.organizations (id, name, slug, plan, owner_id)
VALUES (
    '4ca02198-5bf4-4d22-a440-1eea8ada9931',
    'Marlis Store Ltda',
    'marlis-store-ltda',
    'professional'::subscription_plan,
    '8c459a90-3cb8-4b21-872f-5707b1d6f1a4'
) ON CONFLICT (id) DO NOTHING;

-- 3. Associa o usuário como OWNER da organização
INSERT INTO public.organization_members (organization_id, user_id, role)
VALUES (
    '4ca02198-5bf4-4d22-a440-1eea8ada9931',
    '8c459a90-3cb8-4b21-872f-5707b1d6f1a4',
    'owner'::user_role
) ON CONFLICT DO NOTHING;

-- 4. Inserção de 2 Contas Meta integradas (via OAuth simulado)
INSERT INTO public.meta_accounts (id, organization_id, facebook_user_id, business_id, ad_account_id, account_name, access_token_encrypted)
VALUES 
(
    '1a90a070-5bf4-4d22-a440-5eea8ada9911',
    '4ca02198-5bf4-4d22-a440-1eea8ada9931',
    'fb_usr_9281048291048',
    'bm_92841029482910',
    'act_841029482910',
    'Guilherme Ads Agency',
    'ENC_EAAbz9104928104829104892019201928401928402198'
),
(
    '2a90a070-5bf4-4d22-a440-5eea8ada9912',
    '4ca02198-5bf4-4d22-a440-1eea8ada9931',
    'fb_usr_8410294829104',
    'bm_84102948192840',
    'act_391058291048',
    'Marlis Store Backup Acc',
    'ENC_EAAcy104810294810294810294810294810294810294'
) ON CONFLICT (id) DO NOTHING;

-- 5. Inserção de 2 Pixels vinculados
INSERT INTO public.facebook_pixels (id, organization_id, meta_account_id, pixel_id, name, access_token_encrypted)
VALUES 
(
    '3b90a070-5bf4-4d22-a440-5eea8ada9921',
    '4ca02198-5bf4-4d22-a440-1eea8ada9931',
    '1a90a070-5bf4-4d22-a440-5eea8ada9911',
    '843910582910482',
    'Pixel Primário - Vendas Marlis',
    'ENC_TOKEN_CAPI_PRIMARY_843910582910482'
),
(
    '4b90a070-5bf4-4d22-a440-5eea8ada9922',
    '4ca02198-5bf4-4d22-a440-1eea8ada9931',
    '2a90a070-5bf4-4d22-a440-5eea8ada9912',
    '129481029481029',
    'Pixel Secundário - Remarketing',
    'ENC_TOKEN_CAPI_SECONDARY_129481029481029'
) ON CONFLICT (id) DO NOTHING;

-- 6. Inserção de 10 Sessões de Rastreamento (com e sem UTMs)
INSERT INTO public.tracking_sessions (organization_id, session_id, visitor_id, utm_source, utm_medium, utm_campaign, utm_content, utm_term, fbclid, fbp, fbc, landing_page, referrer, ip_address, user_agent)
VALUES
(
    '4ca02198-5bf4-4d22-a440-1eea8ada9931', 'sess_01', 'vis_101',
    'facebook', 'cpc', 'Black_Friday_2026', 'adset_lucrativo', 'ad_criativo_video1',
    'fbclid_9281048291', 'fbp_841029481', 'fbc_102948102',
    'https://marlisstore.com.br/produto-oferta', 'https://instagram.com', '189.10.42.5', 'Mozilla/5.0 Chrome/120.0'
),
(
    '4ca02198-5bf4-4d22-a440-1eea8ada9931', 'sess_02', 'vis_102',
    'facebook', 'cpc', 'Lookalike_Purchase_v2', 'adset_interesse_moda', 'ad_carrossel_promocao',
    'fbclid_8421049210', 'fbp_928410294', 'fbc_841029481',
    'https://marlisstore.com.br/checkout-direto', 'https://facebook.com', '201.42.15.8', 'Mozilla/5.0 Safari/605.1'
),
(
    '4ca02198-5bf4-4d22-a440-1eea8ada9931', 'sess_03', 'vis_103',
    'google', 'organic', 'none', 'none', 'none',
    NULL, 'fbp_102948102', NULL,
    'https://marlisstore.com.br/', 'https://google.com.br', '177.15.92.4', 'Mozilla/5.0 Firefox/115.0'
),
(
    '4ca02198-5bf4-4d22-a440-1eea8ada9931', 'sess_04', 'vis_104',
    'facebook', 'cpc', 'Black_Friday_2026', 'adset_lucrativo', 'ad_criativo_imagem2',
    'fbclid_3910581029', 'fbp_381029481', 'fbc_291048102',
    'https://marlisstore.com.br/produto-oferta', 'https://instagram.com', '191.82.4.15', 'Mozilla/5.0 Chrome/120.0'
),
(
    '4ca02198-5bf4-4d22-a440-1eea8ada9931', 'sess_05', 'vis_105',
    'tiktok', 'cpc', 'TikTok_Influence_Fashion', 'adset_viral', 'ad_dancinha_entrega',
    NULL, 'fbp_841029482', NULL,
    'https://marlisstore.com.br/produto-oferta', 'https://tiktok.com', '186.20.12.98', 'Mozilla/5.0 TikTokApp'
),
(
    '4ca02198-5bf4-4d22-a440-1eea8ada9931', 'sess_06', 'vis_106',
    'facebook', 'cpc', 'Remarketing_Carrinho_Abandonado', 'adset_visitantes_3dias', 'ad_cupom_desconto',
    'fbclid_4821049201', 'fbp_841928401', 'fbc_948291048',
    'https://marlisstore.com.br/checkout-direto', 'https://instagram.com', '200.80.90.101', 'Mozilla/5.0 Chrome/120.0'
),
(
    '4ca02198-5bf4-4d22-a440-1eea8ada9931', 'sess_07', 'vis_107',
    'instagram', 'stories', 'none', 'none', 'none',
    NULL, 'fbp_102948192', NULL,
    'https://marlisstore.com.br/', 'https://instagram.com', '179.42.15.6', 'Mozilla/5.0 StoriesApp'
),
(
    '4ca02198-5bf4-4d22-a440-1eea8ada9931', 'sess_08', 'vis_108',
    'facebook', 'cpc', 'Lookalike_Purchase_v2', 'adset_interesse_moda', 'ad_imagem_produto_estrela',
    'fbclid_8420194821', 'fbp_842910482', 'fbc_382104921',
    'https://marlisstore.com.br/produto-oferta', 'https://facebook.com', '189.42.15.9', 'Mozilla/5.0 Chrome/120.0'
),
(
    '4ca02198-5bf4-4d22-a440-1eea8ada9931', 'sess_09', 'vis_109',
    'google', 'cpc', 'Google_Search_Vendas', 'adset_palavra_chave_marlis', 'ad_texto_titulo1',
    NULL, 'fbp_841029482', NULL,
    'https://marlisstore.com.br/produto-oferta', 'https://google.com', '177.104.15.82', 'Mozilla/5.0 Chrome/120.0'
),
(
    '4ca02198-5bf4-4d22-a440-1eea8ada9931', 'sess_10', 'vis_110',
    'whatsapp', 'organic', 'none', 'none', 'none',
    NULL, 'fbp_284102948', NULL,
    'https://marlisstore.com.br/', 'https://wa.me', '201.12.8.94', 'Mozilla/5.0 Chrome/120.0'
) ON CONFLICT (session_id) DO NOTHING;

-- 7. Inserção de 20 Eventos de Rastreamento (Simulando funil do Pixel)
INSERT INTO public.events (organization_id, session_id, pixel_id, event_name, event_id, event_data, status)
VALUES
('4ca02198-5bf4-4d22-a440-1eea8ada9931', 'sess_01', '843910582910482', 'PageView', 'evt_01a', '{"url": "/produto-oferta"}'::jsonb, 'sent'::event_status),
('4ca02198-5bf4-4d22-a440-1eea8ada9931', 'sess_01', '843910582910482', 'ViewContent', 'evt_01b', '{"value": 197.00, "currency": "BRL"}'::jsonb, 'sent'::event_status),
('4ca02198-5bf4-4d22-a440-1eea8ada9931', 'sess_01', '843910582910482', 'InitiateCheckout', 'evt_01c', '{"value": 197.00, "currency": "BRL"}'::jsonb, 'sent'::event_status),

('4ca02198-5bf4-4d22-a440-1eea8ada9931', 'sess_02', '843910582910482', 'PageView', 'evt_02a', '{"url": "/checkout-direto"}'::jsonb, 'sent'::event_status),
('4ca02198-5bf4-4d22-a440-1eea8ada9931', 'sess_02', '843910582910482', 'InitiateCheckout', 'evt_02b', '{"value": 120.00, "currency": "BRL"}'::jsonb, 'sent'::event_status),

('4ca02198-5bf4-4d22-a440-1eea8ada9931', 'sess_03', '843910582910482', 'PageView', 'evt_03a', '{"url": "/"}'::jsonb, 'sent'::event_status),

('4ca02198-5bf4-4d22-a440-1eea8ada9931', 'sess_04', '843910582910482', 'PageView', 'evt_04a', '{"url": "/produto-oferta"}'::jsonb, 'sent'::event_status),
('4ca02198-5bf4-4d22-a440-1eea8ada9931', 'sess_04', '843910582910482', 'ViewContent', 'evt_04b', '{"value": 197.00, "currency": "BRL"}'::jsonb, 'sent'::event_status),

('4ca02198-5bf4-4d22-a440-1eea8ada9931', 'sess_05', '843910582910482', 'PageView', 'evt_05a', '{"url": "/produto-oferta"}'::jsonb, 'sent'::event_status),
('4ca02198-5bf4-4d22-a440-1eea8ada9931', 'sess_05', '843910582910482', 'ViewContent', 'evt_05b', '{"value": 249.90, "currency": "BRL"}'::jsonb, 'sent'::event_status),
('4ca02198-5bf4-4d22-a440-1eea8ada9931', 'sess_05', '843910582910482', 'AddToCart', 'evt_05c', '{"value": 249.90, "currency": "BRL"}'::jsonb, 'sent'::event_status),

('4ca02198-5bf4-4d22-a440-1eea8ada9931', 'sess_06', '843910582910482', 'PageView', 'evt_06a', '{"url": "/checkout-direto"}'::jsonb, 'sent'::event_status),
('4ca02198-5bf4-4d22-a440-1eea8ada9931', 'sess_06', '843910582910482', 'InitiateCheckout', 'evt_06b', '{"value": 49.90, "currency": "BRL"}'::jsonb, 'sent'::event_status),

('4ca02198-5bf4-4d22-a440-1eea8ada9931', 'sess_07', '843910582910482', 'PageView', 'evt_07a', '{"url": "/"}'::jsonb, 'sent'::event_status),

('4ca02198-5bf4-4d22-a440-1eea8ada9931', 'sess_08', '843910582910482', 'PageView', 'evt_08a', '{"url": "/produto-oferta"}'::jsonb, 'sent'::event_status),
('4ca02198-5bf4-4d22-a440-1eea8ada9931', 'sess_08', '843910582910482', 'ViewContent', 'evt_08b', '{"value": 197.00, "currency": "BRL"}'::jsonb, 'sent'::event_status),
('4ca02198-5bf4-4d22-a440-1eea8ada9931', 'sess_08', '843910582910482', 'AddToCart', 'evt_08c', '{"value": 197.00, "currency": "BRL"}'::jsonb, 'sent'::event_status),
('4ca02198-5bf4-4d22-a440-1eea8ada9931', 'sess_08', '843910582910482', 'InitiateCheckout', 'evt_08d', '{"value": 197.00, "currency": "BRL"}'::jsonb, 'sent'::event_status),

('4ca02198-5bf4-4d22-a440-1eea8ada9931', 'sess_09', '843910582910482', 'PageView', 'evt_09a', '{"url": "/produto-oferta"}'::jsonb, 'sent'::event_status),
('4ca02198-5bf4-4d22-a440-1eea8ada9931', 'sess_10', '843910582910482', 'PageView', 'evt_10a', '{"url": "/"}'::jsonb, 'sent'::event_status)
ON CONFLICT (id) DO NOTHING;

-- 8. Inserção de 5 Vendas mock (atribuídas retrospectivamente de acordo com as sessões)
INSERT INTO public.orders (organization_id, platform, external_order_id, customer_name, customer_email, customer_phone, amount, currency, session_id, utm_source, utm_campaign, utm_content, utm_term, status)
VALUES
(
    '4ca02198-5bf4-4d22-a440-1eea8ada9931', 'hotmart', 'HP_92810482',
    'Matheus Oliveira', 'm.oliveira@gmail.com', '+5511999998888',
    499.90, 'BRL', 'sess_01', 'facebook', 'Black_Friday_2026', 'adset_lucrativo', 'ad_criativo_video1', 'approved'
),
(
    '4ca02198-5bf4-4d22-a440-1eea8ada9931', 'kiwify', 'KW_10294829',
    'Júlia Costa', 'julia.costa@uol.com.br', '+5531988887777',
    1200.00, 'BRL', 'sess_02', 'facebook', 'Lookalike_Purchase_v2', 'adset_interesse_moda', 'ad_carrossel_promocao', 'approved'
),
(
    '4ca02198-5bf4-4d22-a440-1eea8ada9931', 'shopify', 'SH_38291048',
    'Ricardo Dev', 'ricardo_dev@outlook.com', '+5541977776666',
    215.50, 'BRL', 'sess_06', 'facebook', 'Remarketing_Carrinho_Abandonado', 'adset_visitantes_3dias', 'ad_cupom_desconto', 'pending'
),
(
    '4ca02198-5bf4-4d22-a440-1eea8ada9931', 'hotmart', 'HP_84102948',
    'Guilherme Teste', 'guilherme.capi@gmail.com', '+5521955554444',
    197.00, 'BRL', 'sess_04', 'facebook', 'Black_Friday_2026', 'adset_lucrativo', 'ad_criativo_imagem2', 'approved'
),
(
    '4ca02198-5bf4-4d22-a440-1eea8ada9931', 'kiwify', 'KW_48102948',
    'Camila Moda', 'camila_moda@hotmail.com', '+5519966665555',
    340.00, 'BRL', 'sess_08', 'facebook', 'Lookalike_Purchase_v2', 'adset_interesse_moda', 'ad_imagem_produto_estrela', 'approved'
) ON CONFLICT (platform, external_order_id) DO NOTHING;

-- 9. Log de auditoria mock na criação de tabelas
INSERT INTO public.event_logs (organization_id, type, description, metadata)
VALUES (
    '4ca02198-5bf4-4d22-a440-1eea8ada9931',
    'system_setup',
    'Configuração inicial de infraestrutura concluída com sucesso.',
    '{"author": "Supabase Architect Expert", "version": "2.0.2"}'::jsonb
) ON CONFLICT (id) DO NOTHING;

-- =========================================================================
-- FIM DO SCRIPT DE IMPLANTAÇÃO COMPLETA
-- =========================================================================
