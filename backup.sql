--
-- PostgreSQL database dump
--

\restrict hznmsKnQwGB4d5qtSwdegMbvoHexklXJsDNwWueny9F65xu1zdlKqLMDdHdnefB

-- Dumped from database version 13.23
-- Dumped by pg_dump version 13.23

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: UserRole; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."UserRole" AS ENUM (
    'OWNER',
    'ADMIN',
    'USER'
);


ALTER TYPE public."UserRole" OWNER TO postgres;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: Inventory; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Inventory" (
    id text NOT NULL,
    "storeId" text NOT NULL,
    "skuId" text NOT NULL,
    "unitsAcquired" integer NOT NULL,
    "unitsSaleable" integer NOT NULL,
    "stockAgeDays" integer NOT NULL,
    "organizationId" text NOT NULL
);


ALTER TABLE public."Inventory" OWNER TO postgres;

--
-- Name: Organization; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Organization" (
    id text NOT NULL,
    name text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."Organization" OWNER TO postgres;

--
-- Name: SKU; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."SKU" (
    id text NOT NULL,
    "externalId" integer NOT NULL,
    category text NOT NULL,
    mrp double precision,
    condition text,
    "acquisitionCost" double precision NOT NULL,
    "refurbCost" double precision NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."SKU" OWNER TO postgres;

--
-- Name: Store; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Store" (
    id text NOT NULL,
    "externalId" integer NOT NULL,
    code text NOT NULL,
    name text NOT NULL,
    region text,
    city text,
    "cityType" text,
    "isActive" boolean DEFAULT true NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "organizationId" text NOT NULL
);


ALTER TABLE public."Store" OWNER TO postgres;

--
-- Name: Transaction; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Transaction" (
    id text NOT NULL,
    "externalId" integer NOT NULL,
    "storeId" text NOT NULL,
    "skuId" text NOT NULL,
    date timestamp(3) without time zone NOT NULL,
    "sellingPriceGst" double precision NOT NULL,
    "netRevenue" double precision NOT NULL,
    cogs double precision NOT NULL,
    "grossMarginPct" double precision NOT NULL,
    "inventoryAgeBucket" text NOT NULL,
    quantity integer,
    "organizationId" text NOT NULL
);


ALTER TABLE public."Transaction" OWNER TO postgres;

--
-- Name: User; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."User" (
    id text NOT NULL,
    email text NOT NULL,
    password text NOT NULL,
    role public."UserRole" DEFAULT 'USER'::public."UserRole" NOT NULL,
    "organizationId" text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."User" OWNER TO postgres;

--
-- Name: _prisma_migrations; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public._prisma_migrations (
    id character varying(36) NOT NULL,
    checksum character varying(64) NOT NULL,
    finished_at timestamp with time zone,
    migration_name character varying(255) NOT NULL,
    logs text,
    rolled_back_at timestamp with time zone,
    started_at timestamp with time zone DEFAULT now() NOT NULL,
    applied_steps_count integer DEFAULT 0 NOT NULL
);


ALTER TABLE public._prisma_migrations OWNER TO postgres;

--
-- Data for Name: Inventory; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Inventory" (id, "storeId", "skuId", "unitsAcquired", "unitsSaleable", "stockAgeDays", "organizationId") FROM stdin;
\.


--
-- Data for Name: Organization; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Organization" (id, name, "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: SKU; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."SKU" (id, "externalId", category, mrp, condition, "acquisitionCost", "refurbCost", "createdAt") FROM stdin;
\.


--
-- Data for Name: Store; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Store" (id, "externalId", code, name, region, city, "cityType", "isActive", "createdAt", "updatedAt", "organizationId") FROM stdin;
\.


--
-- Data for Name: Transaction; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Transaction" (id, "externalId", "storeId", "skuId", date, "sellingPriceGst", "netRevenue", cogs, "grossMarginPct", "inventoryAgeBucket", quantity, "organizationId") FROM stdin;
\.


--
-- Data for Name: User; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."User" (id, email, password, role, "organizationId", "createdAt") FROM stdin;
\.


--
-- Data for Name: _prisma_migrations; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public._prisma_migrations (id, checksum, finished_at, migration_name, logs, rolled_back_at, started_at, applied_steps_count) FROM stdin;
502d61a7-28e9-4403-8ecf-ee67e386f3d2	56417b6a102eeae779f5fe1a656505db05d572a8749d475f29ac53669abe3918	2026-02-27 17:13:49.748039+05:30	20260217082723_init_schema	\N	\N	2026-02-27 17:13:49.66317+05:30	1
3d5b7d33-e7ce-4eb6-8cf9-394e76fd201b	7fbf8884bc107829a17e5c7c7a2c345a44806b56fa3218fbab55c15cc2afef90	2026-02-27 17:13:49.754611+05:30	20260217093341_make_store_external_id_unique	\N	\N	2026-02-27 17:13:49.748932+05:30	1
41006e70-3c68-463b-8f28-d257a1dd1fa7	e3da27c27d29fb26df0e2e44a5464d4664d45bf9e38aee1d28b543ce5d629445	2026-02-27 17:13:49.817698+05:30	20260227110346_add_tenant_nullable	\N	\N	2026-02-27 17:13:49.755716+05:30	1
25064207-f1ff-4ecb-9bd5-f5bf5f48eb75	2a7968dda7d1c826cac0015e31f31b565b6cc7cdde5e99649883504e4136cd93	2026-02-27 17:13:49.833096+05:30	20260227112305_init_multi_tenant_clean	\N	\N	2026-02-27 17:13:49.818561+05:30	1
\.


--
-- Name: Inventory Inventory_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Inventory"
    ADD CONSTRAINT "Inventory_pkey" PRIMARY KEY (id);


--
-- Name: Organization Organization_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Organization"
    ADD CONSTRAINT "Organization_pkey" PRIMARY KEY (id);


--
-- Name: SKU SKU_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."SKU"
    ADD CONSTRAINT "SKU_pkey" PRIMARY KEY (id);


--
-- Name: Store Store_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Store"
    ADD CONSTRAINT "Store_pkey" PRIMARY KEY (id);


--
-- Name: Transaction Transaction_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Transaction"
    ADD CONSTRAINT "Transaction_pkey" PRIMARY KEY (id);


--
-- Name: User User_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."User"
    ADD CONSTRAINT "User_pkey" PRIMARY KEY (id);


--
-- Name: _prisma_migrations _prisma_migrations_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public._prisma_migrations
    ADD CONSTRAINT _prisma_migrations_pkey PRIMARY KEY (id);


--
-- Name: Inventory_organizationId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "Inventory_organizationId_idx" ON public."Inventory" USING btree ("organizationId");


--
-- Name: Inventory_organizationId_stockAgeDays_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "Inventory_organizationId_stockAgeDays_idx" ON public."Inventory" USING btree ("organizationId", "stockAgeDays");


--
-- Name: Inventory_storeId_skuId_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "Inventory_storeId_skuId_key" ON public."Inventory" USING btree ("storeId", "skuId");


--
-- Name: SKU_externalId_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "SKU_externalId_key" ON public."SKU" USING btree ("externalId");


--
-- Name: Store_externalId_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "Store_externalId_key" ON public."Store" USING btree ("externalId");


--
-- Name: Store_organizationId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "Store_organizationId_idx" ON public."Store" USING btree ("organizationId");


--
-- Name: Transaction_externalId_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "Transaction_externalId_key" ON public."Transaction" USING btree ("externalId");


--
-- Name: Transaction_organizationId_date_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "Transaction_organizationId_date_idx" ON public."Transaction" USING btree ("organizationId", date);


--
-- Name: Transaction_organizationId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "Transaction_organizationId_idx" ON public."Transaction" USING btree ("organizationId");


--
-- Name: Transaction_skuId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "Transaction_skuId_idx" ON public."Transaction" USING btree ("skuId");


--
-- Name: Transaction_storeId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "Transaction_storeId_idx" ON public."Transaction" USING btree ("storeId");


--
-- Name: User_email_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "User_email_key" ON public."User" USING btree (email);


--
-- Name: User_organizationId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "User_organizationId_idx" ON public."User" USING btree ("organizationId");


--
-- Name: Inventory Inventory_organizationId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Inventory"
    ADD CONSTRAINT "Inventory_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES public."Organization"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Inventory Inventory_skuId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Inventory"
    ADD CONSTRAINT "Inventory_skuId_fkey" FOREIGN KEY ("skuId") REFERENCES public."SKU"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Inventory Inventory_storeId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Inventory"
    ADD CONSTRAINT "Inventory_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES public."Store"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Store Store_organizationId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Store"
    ADD CONSTRAINT "Store_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES public."Organization"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Transaction Transaction_organizationId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Transaction"
    ADD CONSTRAINT "Transaction_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES public."Organization"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Transaction Transaction_skuId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Transaction"
    ADD CONSTRAINT "Transaction_skuId_fkey" FOREIGN KEY ("skuId") REFERENCES public."SKU"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Transaction Transaction_storeId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Transaction"
    ADD CONSTRAINT "Transaction_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES public."Store"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: User User_organizationId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."User"
    ADD CONSTRAINT "User_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES public."Organization"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- PostgreSQL database dump complete
--

\unrestrict hznmsKnQwGB4d5qtSwdegMbvoHexklXJsDNwWueny9F65xu1zdlKqLMDdHdnefB

