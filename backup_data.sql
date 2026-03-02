--
-- PostgreSQL database dump
--

\restrict isMoILdDxtdh7RnsIvnowFBTrak0Ehph9zfxpDg4ThvAZxmRL4K2a1wMYolcFa2

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
-- Data for Name: Organization; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: SKU; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: Store; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: Inventory; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: Transaction; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: User; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: _prisma_migrations; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public._prisma_migrations VALUES ('502d61a7-28e9-4403-8ecf-ee67e386f3d2', '56417b6a102eeae779f5fe1a656505db05d572a8749d475f29ac53669abe3918', '2026-02-27 17:13:49.748039+05:30', '20260217082723_init_schema', NULL, NULL, '2026-02-27 17:13:49.66317+05:30', 1);
INSERT INTO public._prisma_migrations VALUES ('3d5b7d33-e7ce-4eb6-8cf9-394e76fd201b', '7fbf8884bc107829a17e5c7c7a2c345a44806b56fa3218fbab55c15cc2afef90', '2026-02-27 17:13:49.754611+05:30', '20260217093341_make_store_external_id_unique', NULL, NULL, '2026-02-27 17:13:49.748932+05:30', 1);
INSERT INTO public._prisma_migrations VALUES ('41006e70-3c68-463b-8f28-d257a1dd1fa7', 'e3da27c27d29fb26df0e2e44a5464d4664d45bf9e38aee1d28b543ce5d629445', '2026-02-27 17:13:49.817698+05:30', '20260227110346_add_tenant_nullable', NULL, NULL, '2026-02-27 17:13:49.755716+05:30', 1);
INSERT INTO public._prisma_migrations VALUES ('25064207-f1ff-4ecb-9bd5-f5bf5f48eb75', '2a7968dda7d1c826cac0015e31f31b565b6cc7cdde5e99649883504e4136cd93', '2026-02-27 17:13:49.833096+05:30', '20260227112305_init_multi_tenant_clean', NULL, NULL, '2026-02-27 17:13:49.818561+05:30', 1);


--
-- PostgreSQL database dump complete
--

\unrestrict isMoILdDxtdh7RnsIvnowFBTrak0Ehph9zfxpDg4ThvAZxmRL4K2a1wMYolcFa2

