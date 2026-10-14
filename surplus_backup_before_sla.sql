--
-- PostgreSQL database dump
--

-- Dumped from database version 16.4 (Debian 16.4-1.pgdg110+2)
-- Dumped by pg_dump version 16.4 (Debian 16.4-1.pgdg110+2)

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
-- Name: tiger; Type: SCHEMA; Schema: -; Owner: surplus
--

CREATE SCHEMA tiger;


ALTER SCHEMA tiger OWNER TO surplus;

--
-- Name: tiger_data; Type: SCHEMA; Schema: -; Owner: surplus
--

CREATE SCHEMA tiger_data;


ALTER SCHEMA tiger_data OWNER TO surplus;

--
-- Name: topology; Type: SCHEMA; Schema: -; Owner: surplus
--

CREATE SCHEMA topology;


ALTER SCHEMA topology OWNER TO surplus;

--
-- Name: SCHEMA topology; Type: COMMENT; Schema: -; Owner: surplus
--

COMMENT ON SCHEMA topology IS 'PostGIS Topology schema';


--
-- Name: fuzzystrmatch; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS fuzzystrmatch WITH SCHEMA public;


--
-- Name: EXTENSION fuzzystrmatch; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION fuzzystrmatch IS 'determine similarities and distance between strings';


--
-- Name: postgis; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS postgis WITH SCHEMA public;


--
-- Name: EXTENSION postgis; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION postgis IS 'PostGIS geometry and geography spatial types and functions';


--
-- Name: postgis_tiger_geocoder; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS postgis_tiger_geocoder WITH SCHEMA tiger;


--
-- Name: EXTENSION postgis_tiger_geocoder; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION postgis_tiger_geocoder IS 'PostGIS tiger geocoder and reverse geocoder';


--
-- Name: postgis_topology; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS postgis_topology WITH SCHEMA topology;


--
-- Name: EXTENSION postgis_topology; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION postgis_topology IS 'PostGIS topology spatial types and functions';


--
-- Name: ClaimStatus; Type: TYPE; Schema: public; Owner: surplus
--

CREATE TYPE public."ClaimStatus" AS ENUM (
    'ACTIVE',
    'CANCELLED',
    'COMPLETED',
    'REJECTED'
);


ALTER TYPE public."ClaimStatus" OWNER TO surplus;

--
-- Name: DisputeStatus; Type: TYPE; Schema: public; Owner: surplus
--

CREATE TYPE public."DisputeStatus" AS ENUM (
    'OPEN',
    'UNDER_REVIEW',
    'RESOLVED',
    'CLOSED'
);


ALTER TYPE public."DisputeStatus" OWNER TO surplus;

--
-- Name: ListingStatus; Type: TYPE; Schema: public; Owner: surplus
--

CREATE TYPE public."ListingStatus" AS ENUM (
    'POSTED',
    'CLAIMED',
    'PICKED_UP',
    'DELIVERED',
    'CLOSED',
    'EXPIRED'
);


ALTER TYPE public."ListingStatus" OWNER TO surplus;

--
-- Name: NotificationType; Type: TYPE; Schema: public; Owner: surplus
--

CREATE TYPE public."NotificationType" AS ENUM (
    'LISTING',
    'CLAIM',
    'TRANSACTION',
    'SLA',
    'REWARD',
    'DISPUTE',
    'SYSTEM'
);


ALTER TYPE public."NotificationType" OWNER TO surplus;

--
-- Name: RewardLedgerType; Type: TYPE; Schema: public; Owner: surplus
--

CREATE TYPE public."RewardLedgerType" AS ENUM (
    'EARN',
    'REDEEM',
    'ADJUST',
    'EXPIRE'
);


ALTER TYPE public."RewardLedgerType" OWNER TO surplus;

--
-- Name: Role; Type: TYPE; Schema: public; Owner: surplus
--

CREATE TYPE public."Role" AS ENUM (
    'DONOR',
    'NGO',
    'VOLUNTEER',
    'ADMIN'
);


ALTER TYPE public."Role" OWNER TO surplus;

--
-- Name: SlaStatus; Type: TYPE; Schema: public; Owner: surplus
--

CREATE TYPE public."SlaStatus" AS ENUM (
    'NOT_STARTED',
    'RUNNING',
    'ON_TIME',
    'OVERDUE',
    'COMPLETED'
);


ALTER TYPE public."SlaStatus" OWNER TO surplus;

--
-- Name: TransactionStatus; Type: TYPE; Schema: public; Owner: surplus
--

CREATE TYPE public."TransactionStatus" AS ENUM (
    'ACTIVE',
    'DELIVERED',
    'CLOSED',
    'DISPUTED',
    'CANCELLED'
);


ALTER TYPE public."TransactionStatus" OWNER TO surplus;

--
-- Name: VerificationStatus; Type: TYPE; Schema: public; Owner: surplus
--

CREATE TYPE public."VerificationStatus" AS ENUM (
    'PENDING',
    'VERIFIED',
    'REJECTED',
    'SUSPENDED'
);


ALTER TYPE public."VerificationStatus" OWNER TO surplus;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: _prisma_migrations; Type: TABLE; Schema: public; Owner: surplus
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


ALTER TABLE public._prisma_migrations OWNER TO surplus;

--
-- Name: audit_logs; Type: TABLE; Schema: public; Owner: surplus
--

CREATE TABLE public.audit_logs (
    id uuid NOT NULL,
    "actorId" uuid,
    action text NOT NULL,
    "entityType" text NOT NULL,
    "entityId" text,
    metadata jsonb,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.audit_logs OWNER TO surplus;

--
-- Name: claims; Type: TABLE; Schema: public; Owner: surplus
--

CREATE TABLE public.claims (
    id uuid NOT NULL,
    "listingId" uuid NOT NULL,
    "claimantId" uuid NOT NULL,
    status public."ClaimStatus" DEFAULT 'ACTIVE'::public."ClaimStatus" NOT NULL,
    notes text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "nGOProfileId" uuid
);


ALTER TABLE public.claims OWNER TO surplus;

--
-- Name: disputes; Type: TABLE; Schema: public; Owner: surplus
--

CREATE TABLE public.disputes (
    id uuid NOT NULL,
    "transactionId" uuid NOT NULL,
    "openedById" uuid NOT NULL,
    "resolvedById" uuid,
    reason text NOT NULL,
    description text,
    status public."DisputeStatus" DEFAULT 'OPEN'::public."DisputeStatus" NOT NULL,
    resolution text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "resolvedAt" timestamp(3) without time zone
);


ALTER TABLE public.disputes OWNER TO surplus;

--
-- Name: donor_profiles; Type: TABLE; Schema: public; Owner: surplus
--

CREATE TABLE public.donor_profiles (
    id uuid NOT NULL,
    "userId" uuid NOT NULL,
    "organizationName" text,
    "contactName" text NOT NULL,
    phone text,
    address text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.donor_profiles OWNER TO surplus;

--
-- Name: listings; Type: TABLE; Schema: public; Owner: surplus
--

CREATE TABLE public.listings (
    id uuid NOT NULL,
    "outletId" uuid NOT NULL,
    title text NOT NULL,
    description text,
    category text,
    quantity numeric(12,2),
    unit text,
    "preparedAt" timestamp(3) without time zone,
    "expiresAt" timestamp(3) without time zone NOT NULL,
    status public."ListingStatus" DEFAULT 'POSTED'::public."ListingStatus" NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.listings OWNER TO surplus;

--
-- Name: need_zones; Type: TABLE; Schema: public; Owner: surplus
--

CREATE TABLE public.need_zones (
    id uuid NOT NULL,
    "ngoId" uuid,
    "createdById" uuid,
    name text NOT NULL,
    description text,
    priority integer DEFAULT 0 NOT NULL,
    location public.geography(Point,4326),
    "radiusMeters" integer,
    "isActive" boolean DEFAULT true NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.need_zones OWNER TO surplus;

--
-- Name: ngo_profiles; Type: TABLE; Schema: public; Owner: surplus
--

CREATE TABLE public.ngo_profiles (
    id uuid NOT NULL,
    "userId" uuid NOT NULL,
    "organizationName" text NOT NULL,
    "contactName" text NOT NULL,
    phone text,
    address text,
    "beneficiaryCount" integer,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.ngo_profiles OWNER TO surplus;

--
-- Name: notifications; Type: TABLE; Schema: public; Owner: surplus
--

CREATE TABLE public.notifications (
    id uuid NOT NULL,
    "userId" uuid NOT NULL,
    type public."NotificationType" NOT NULL,
    title text NOT NULL,
    message text NOT NULL,
    "isRead" boolean DEFAULT false NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "readAt" timestamp(3) without time zone
);


ALTER TABLE public.notifications OWNER TO surplus;

--
-- Name: outlets; Type: TABLE; Schema: public; Owner: surplus
--

CREATE TABLE public.outlets (
    id uuid NOT NULL,
    "donorId" uuid NOT NULL,
    name text NOT NULL,
    address text NOT NULL,
    location public.geography(Point,4326),
    "isActive" boolean DEFAULT true NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.outlets OWNER TO surplus;

--
-- Name: proof_of_distribution; Type: TABLE; Schema: public; Owner: surplus
--

CREATE TABLE public.proof_of_distribution (
    id uuid NOT NULL,
    "transactionId" uuid NOT NULL,
    "uploadedById" uuid NOT NULL,
    "imageUrl" text,
    notes text,
    "beneficiaryCount" integer,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.proof_of_distribution OWNER TO surplus;

--
-- Name: reward_ledger; Type: TABLE; Schema: public; Owner: surplus
--

CREATE TABLE public.reward_ledger (
    id uuid NOT NULL,
    "userId" uuid NOT NULL,
    "transactionId" uuid,
    type public."RewardLedgerType" NOT NULL,
    points integer NOT NULL,
    reason text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.reward_ledger OWNER TO surplus;

--
-- Name: reward_rules; Type: TABLE; Schema: public; Owner: surplus
--

CREATE TABLE public.reward_rules (
    id uuid NOT NULL,
    name text NOT NULL,
    description text,
    points integer NOT NULL,
    "actionType" text NOT NULL,
    "isActive" boolean DEFAULT true NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.reward_rules OWNER TO surplus;

--
-- Name: rewards; Type: TABLE; Schema: public; Owner: surplus
--

CREATE TABLE public.rewards (
    id uuid NOT NULL,
    "userId" uuid NOT NULL,
    "transactionId" uuid,
    points integer NOT NULL,
    reason text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.rewards OWNER TO surplus;

--
-- Name: transactions; Type: TABLE; Schema: public; Owner: surplus
--

CREATE TABLE public.transactions (
    id uuid NOT NULL,
    "listingId" uuid NOT NULL,
    "claimId" uuid NOT NULL,
    "volunteerId" uuid,
    status public."TransactionStatus" DEFAULT 'ACTIVE'::public."TransactionStatus" NOT NULL,
    "slaStatus" public."SlaStatus" DEFAULT 'NOT_STARTED'::public."SlaStatus" NOT NULL,
    "pickupAt" timestamp(3) without time zone,
    "deliveredAt" timestamp(3) without time zone,
    "closedAt" timestamp(3) without time zone,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.transactions OWNER TO surplus;

--
-- Name: users; Type: TABLE; Schema: public; Owner: surplus
--

CREATE TABLE public.users (
    id uuid NOT NULL,
    email text NOT NULL,
    "passwordHash" text NOT NULL,
    role public."Role" NOT NULL,
    "verificationStatus" public."VerificationStatus" DEFAULT 'PENDING'::public."VerificationStatus" NOT NULL,
    "isActive" boolean DEFAULT true NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.users OWNER TO surplus;

--
-- Name: volunteer_profiles; Type: TABLE; Schema: public; Owner: surplus
--

CREATE TABLE public.volunteer_profiles (
    id uuid NOT NULL,
    "userId" uuid NOT NULL,
    "fullName" text NOT NULL,
    phone text,
    "vehicleType" text,
    availability boolean DEFAULT true NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.volunteer_profiles OWNER TO surplus;

--
-- Data for Name: _prisma_migrations; Type: TABLE DATA; Schema: public; Owner: surplus
--

COPY public._prisma_migrations (id, checksum, finished_at, migration_name, logs, rolled_back_at, started_at, applied_steps_count) FROM stdin;
592cd2d6-8c1c-4e7f-9b0e-61a17fd8c179	b29cd78d79d9d45db22a9bea2319a35b0320828e2ed970bbdaa437f134d1ca29	2026-10-03 18:15:39.341998+00	20261003181539_init	\N	\N	2026-10-03 18:15:39.291565+00	1
8a2ae9c2-88d2-47bd-8e80-4debce905f18	fa41cfea1c1b9ae301fe4a606e8933196c70f5a3fc005968e425658be06cf16a	2026-10-03 18:24:10.906578+00	20261003183000_add_spatial_indexes	\N	\N	2026-10-03 18:24:10.880903+00	1
\.


--
-- Data for Name: audit_logs; Type: TABLE DATA; Schema: public; Owner: surplus
--

COPY public.audit_logs (id, "actorId", action, "entityType", "entityId", metadata, "createdAt") FROM stdin;
\.


--
-- Data for Name: claims; Type: TABLE DATA; Schema: public; Owner: surplus
--

COPY public.claims (id, "listingId", "claimantId", status, notes, "createdAt", "updatedAt", "nGOProfileId") FROM stdin;
ea0a647f-299b-4142-b4ca-5b423dc12d48	9a520a32-c2ef-482f-aadb-6316190a784b	d921d7d1-27ca-41a2-8107-c75c18b42fb7	ACTIVE	\N	2026-10-05 09:22:12.788	2026-10-05 09:22:12.788	1e2f8e13-6405-4275-8fdb-5f76c3925ecc
19704008-d505-480f-bed3-ffa7cd4b86d7	dbb4b25f-3cd6-4c48-88dc-ff8c836b1a14	d921d7d1-27ca-41a2-8107-c75c18b42fb7	ACTIVE	\N	2026-10-05 09:45:35.512	2026-10-05 09:45:35.512	1e2f8e13-6405-4275-8fdb-5f76c3925ecc
\.


--
-- Data for Name: disputes; Type: TABLE DATA; Schema: public; Owner: surplus
--

COPY public.disputes (id, "transactionId", "openedById", "resolvedById", reason, description, status, resolution, "createdAt", "updatedAt", "resolvedAt") FROM stdin;
\.


--
-- Data for Name: donor_profiles; Type: TABLE DATA; Schema: public; Owner: surplus
--

COPY public.donor_profiles (id, "userId", "organizationName", "contactName", phone, address, "createdAt", "updatedAt") FROM stdin;
bc3a0cc2-b32a-490d-85fd-14be7102c016	8c143097-924c-4552-81d8-d2a60876e0ac	PCCOE Campus Kitchen	Surplus Donor	+919999999999	Pimpri-Chinchwad, Pune	2026-10-03 18:33:08.508	2026-10-03 18:33:08.508
44b4b136-1384-47ef-b450-c8fd8429e952	92189f61-1054-48fe-8606-22b67bd5a825	\N	Test Donor	9876543210	\N	2026-10-03 19:21:59.231	2026-10-03 19:21:59.231
0e118b37-59a6-4488-9f1c-f786cdf89438	7e53a632-bb39-4d31-acfc-ccc57fb6d1f5	\N	Second Donor	9876543211	\N	2026-10-04 03:51:33.866	2026-10-04 03:51:33.866
\.


--
-- Data for Name: listings; Type: TABLE DATA; Schema: public; Owner: surplus
--

COPY public.listings (id, "outletId", title, description, category, quantity, unit, "preparedAt", "expiresAt", status, "createdAt", "updatedAt") FROM stdin;
b6a8a653-9ce2-4299-8944-97ab7218a1f9	08b8fa7b-1317-48b2-9d45-428b0b577bca	Fresh Vegetable Meals	Freshly prepared surplus meals available for donation.	Prepared Food	30.00	meals	2026-10-05 12:30:00	2026-10-05 16:30:00	EXPIRED	2026-10-04 20:08:27.541	2026-10-04 20:43:45.095
9a520a32-c2ef-482f-aadb-6316190a784b	c95858b8-c1b3-47d2-a8b5-8518879dfe4e	Fresh Dinner Meals	Fresh surplus meals available for community distribution.	Prepared Food	25.00	meals	2026-10-05 09:20:00	2026-10-06 09:20:00	CLAIMED	2026-10-05 09:20:29.044	2026-10-05 09:22:12.81
55555555-5555-4555-8555-555555555555	22222222-2222-4222-8222-222222222222	Bakery Surplus	Bread and bakery items remaining after daily operations.	Bakery	20.00	kg	2026-10-03 18:33:08.541	2026-10-04 04:33:08.541	EXPIRED	2026-10-03 18:33:08.542	2026-10-05 09:24:03.251
33333333-3333-4333-8333-333333333333	11111111-1111-4111-8111-111111111111	Fresh Cooked Meals	Fresh surplus meals available for redistribution.	Cooked Food	50.00	meals	2026-10-03 18:33:08.538	2026-10-04 00:33:08.538	EXPIRED	2026-10-03 18:33:08.538	2026-10-05 09:24:05.47
44444444-4444-4444-8444-444444444444	11111111-1111-4111-8111-111111111111	Packed Rice Meals	Packed rice-based meals for community distribution.	Rice	30.00	packs	2026-10-03 18:33:08.54	2026-10-04 02:33:08.54	EXPIRED	2026-10-03 18:33:08.541	2026-10-05 09:24:07.637
dbb4b25f-3cd6-4c48-88dc-ff8c836b1a14	08b8fa7b-1317-48b2-9d45-428b0b577bca	Phase 7 Testing	Testing transaction cycle	Bakery	20.00	meals	2026-10-05 09:44:00	2026-10-06 09:45:00	DELIVERED	2026-10-05 09:45:09.828	2026-10-05 10:02:26.788
80f3204d-6281-4cce-a170-4aff4053ca9f	08b8fa7b-1317-48b2-9d45-428b0b577bca	Fresh vegetables	vegetables	Vegetables	50.00	kg	2026-10-08 04:41:00	2026-10-08 04:42:00	EXPIRED	2026-10-08 04:41:41.371	2026-10-08 04:42:00.105
\.


--
-- Data for Name: need_zones; Type: TABLE DATA; Schema: public; Owner: surplus
--

COPY public.need_zones (id, "ngoId", "createdById", name, description, priority, location, "radiusMeters", "isActive", "createdAt", "updatedAt") FROM stdin;
66666666-6666-4666-8666-666666666666	1e2f8e13-6405-4275-8fdb-5f76c3925ecc	d921d7d1-27ca-41a2-8107-c75c18b42fb7	Pimpri Community Zone	Community shelter and nearby beneficiaries.	8	0101000020E610000079E9263108745240C520B07268A13240	5000	t	2026-10-03 18:33:08.543	2026-10-03 18:33:08.543
77777777-7777-4777-8777-777777777777	1e2f8e13-6405-4275-8fdb-5f76c3925ecc	d921d7d1-27ca-41a2-8107-c75c18b42fb7	Nigdi Distribution Zone	Local food distribution requirement.	6	0101000020E61000008716D9CEF773524037894160E5A03240	4000	t	2026-10-03 18:33:08.545	2026-10-03 18:33:08.545
\.


--
-- Data for Name: ngo_profiles; Type: TABLE DATA; Schema: public; Owner: surplus
--

COPY public.ngo_profiles (id, "userId", "organizationName", "contactName", phone, address, "beneficiaryCount", "createdAt", "updatedAt") FROM stdin;
1e2f8e13-6405-4275-8fdb-5f76c3925ecc	d921d7d1-27ca-41a2-8107-c75c18b42fb7	Hope Community Shelter	Shelter Coordinator	+918888888888	Pune, Maharashtra	120	2026-10-03 18:33:08.512	2026-10-03 18:33:08.512
\.


--
-- Data for Name: notifications; Type: TABLE DATA; Schema: public; Owner: surplus
--

COPY public.notifications (id, "userId", type, title, message, "isRead", "createdAt", "readAt") FROM stdin;
\.


--
-- Data for Name: outlets; Type: TABLE DATA; Schema: public; Owner: surplus
--

COPY public.outlets (id, "donorId", name, address, location, "isActive", "createdAt", "updatedAt") FROM stdin;
11111111-1111-4111-8111-111111111111	bc3a0cc2-b32a-490d-85fd-14be7102c016	PCCOE Main Canteen	PCCOE, Nigdi, Pune	0101000020E6100000F2D24D62107452405305A3923AA13240	t	2026-10-03 18:33:08.516	2026-10-03 18:33:08.516
22222222-2222-4222-8222-222222222222	bc3a0cc2-b32a-490d-85fd-14be7102c016	PCCOE Hostel Kitchen	PCCOE Hostel Campus, Pune	0101000020E6100000E3A59BC420745240A8C64B3789A13240	t	2026-10-03 18:33:08.53	2026-10-03 18:33:08.53
c95858b8-c1b3-47d2-a8b5-8518879dfe4e	bc3a0cc2-b32a-490d-85fd-14be7102c016	PCCOE Campus Kitchen	Pimpri Chinchwad College of Engineering, Pune	0101000020E6100000143FC6DCB57052409FCDAACFD5A63240	t	2026-10-03 19:48:42.71	2026-10-03 19:48:42.71
08b8fa7b-1317-48b2-9d45-428b0b577bca	bc3a0cc2-b32a-490d-85fd-14be7102c016	Wakad Distribution Center	Wakad, Pune	0101000020E610000070CE88D2DE705240295C8FC2F5983240	t	2026-10-03 19:50:29.545	2026-10-03 19:50:29.545
\.


--
-- Data for Name: proof_of_distribution; Type: TABLE DATA; Schema: public; Owner: surplus
--

COPY public.proof_of_distribution (id, "transactionId", "uploadedById", "imageUrl", notes, "beneficiaryCount", "createdAt") FROM stdin;
\.


--
-- Data for Name: reward_ledger; Type: TABLE DATA; Schema: public; Owner: surplus
--

COPY public.reward_ledger (id, "userId", "transactionId", type, points, reason, "createdAt") FROM stdin;
\.


--
-- Data for Name: reward_rules; Type: TABLE DATA; Schema: public; Owner: surplus
--

COPY public.reward_rules (id, name, description, points, "actionType", "isActive", "createdAt", "updatedAt") FROM stdin;
88888888-8888-4888-8888-888888888888	Successful Food Donation	Reward for successfully completing a food donation.	50	DONATION_COMPLETED	t	2026-10-03 18:33:08.547	2026-10-03 18:33:08.547
99999999-9999-4999-8999-999999999999	Volunteer Delivery	Reward for completing a delivery.	30	DELIVERY_COMPLETED	t	2026-10-03 18:33:08.549	2026-10-03 18:33:08.549
\.


--
-- Data for Name: rewards; Type: TABLE DATA; Schema: public; Owner: surplus
--

COPY public.rewards (id, "userId", "transactionId", points, reason, "createdAt") FROM stdin;
\.


--
-- Data for Name: spatial_ref_sys; Type: TABLE DATA; Schema: public; Owner: surplus
--

COPY public.spatial_ref_sys (srid, auth_name, auth_srid, srtext, proj4text) FROM stdin;
\.


--
-- Data for Name: transactions; Type: TABLE DATA; Schema: public; Owner: surplus
--

COPY public.transactions (id, "listingId", "claimId", "volunteerId", status, "slaStatus", "pickupAt", "deliveredAt", "closedAt", "createdAt", "updatedAt") FROM stdin;
59d1b0f1-4846-4d83-9fe0-a0512a7335c4	dbb4b25f-3cd6-4c48-88dc-ff8c836b1a14	19704008-d505-480f-bed3-ffa7cd4b86d7	\N	DELIVERED	COMPLETED	2026-10-05 09:59:10.971	2026-10-05 10:02:26.787	\N	2026-10-05 09:45:35.539	2026-10-05 10:02:26.789
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: surplus
--

COPY public.users (id, email, "passwordHash", role, "verificationStatus", "isActive", "createdAt", "updatedAt") FROM stdin;
8c143097-924c-4552-81d8-d2a60876e0ac	donor@surplus.local	$2b$10$IRQ0SVO10YCPbIH.LE3pBe5xjIggsQvuoRZdf1wOhieCZqh/enIkK	DONOR	VERIFIED	t	2026-10-03 18:33:08.464	2026-10-03 18:33:08.464
d921d7d1-27ca-41a2-8107-c75c18b42fb7	ngo@surplus.local	$2b$10$IRQ0SVO10YCPbIH.LE3pBe5xjIggsQvuoRZdf1wOhieCZqh/enIkK	NGO	VERIFIED	t	2026-10-03 18:33:08.503	2026-10-03 18:33:08.503
a2c28a91-5d43-4259-af83-0621b4b60792	volunteer@surplus.local	$2b$10$IRQ0SVO10YCPbIH.LE3pBe5xjIggsQvuoRZdf1wOhieCZqh/enIkK	VOLUNTEER	VERIFIED	t	2026-10-03 18:33:08.505	2026-10-03 18:33:08.505
ec748310-7a72-45b5-a7b4-3e9438ec4164	admin@surplus.local	$2b$10$IRQ0SVO10YCPbIH.LE3pBe5xjIggsQvuoRZdf1wOhieCZqh/enIkK	ADMIN	VERIFIED	t	2026-10-03 18:33:08.506	2026-10-03 18:33:08.506
92189f61-1054-48fe-8606-22b67bd5a825	testdonor@surplus.local	$2b$12$wM2Yv9AQWcPLesJdEXmZ9.hsUeztuzq9stl2fTlGAPyRe2e/4BHV.	DONOR	PENDING	t	2026-10-03 19:21:59.213	2026-10-03 19:21:59.213
7e53a632-bb39-4d31-acfc-ccc57fb6d1f5	donor2@surplus.local	$2b$12$N6KarWeMPyMi0CTecEMtPOS0DnEi1vrfNymKOGBNdUmthM5NTs1wa	DONOR	PENDING	t	2026-10-04 03:51:33.844	2026-10-04 03:51:33.844
\.


--
-- Data for Name: volunteer_profiles; Type: TABLE DATA; Schema: public; Owner: surplus
--

COPY public.volunteer_profiles (id, "userId", "fullName", phone, "vehicleType", availability, "createdAt", "updatedAt") FROM stdin;
2c48e4cd-d21c-4a2f-a2b3-1d7955bbb309	a2c28a91-5d43-4259-af83-0621b4b60792	Surplus Volunteer	+917777777777	Two Wheeler	t	2026-10-03 18:33:08.514	2026-10-03 18:33:08.514
\.


--
-- Data for Name: geocode_settings; Type: TABLE DATA; Schema: tiger; Owner: surplus
--

COPY tiger.geocode_settings (name, setting, unit, category, short_desc) FROM stdin;
\.


--
-- Data for Name: pagc_gaz; Type: TABLE DATA; Schema: tiger; Owner: surplus
--

COPY tiger.pagc_gaz (id, seq, word, stdword, token, is_custom) FROM stdin;
\.


--
-- Data for Name: pagc_lex; Type: TABLE DATA; Schema: tiger; Owner: surplus
--

COPY tiger.pagc_lex (id, seq, word, stdword, token, is_custom) FROM stdin;
\.


--
-- Data for Name: pagc_rules; Type: TABLE DATA; Schema: tiger; Owner: surplus
--

COPY tiger.pagc_rules (id, rule, is_custom) FROM stdin;
\.


--
-- Data for Name: topology; Type: TABLE DATA; Schema: topology; Owner: surplus
--

COPY topology.topology (id, name, srid, "precision", hasz) FROM stdin;
\.


--
-- Data for Name: layer; Type: TABLE DATA; Schema: topology; Owner: surplus
--

COPY topology.layer (topology_id, layer_id, schema_name, table_name, feature_column, feature_type, level, child_id) FROM stdin;
\.


--
-- Name: topology_id_seq; Type: SEQUENCE SET; Schema: topology; Owner: surplus
--

SELECT pg_catalog.setval('topology.topology_id_seq', 1, false);


--
-- Name: _prisma_migrations _prisma_migrations_pkey; Type: CONSTRAINT; Schema: public; Owner: surplus
--

ALTER TABLE ONLY public._prisma_migrations
    ADD CONSTRAINT _prisma_migrations_pkey PRIMARY KEY (id);


--
-- Name: audit_logs audit_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: surplus
--

ALTER TABLE ONLY public.audit_logs
    ADD CONSTRAINT audit_logs_pkey PRIMARY KEY (id);


--
-- Name: claims claims_pkey; Type: CONSTRAINT; Schema: public; Owner: surplus
--

ALTER TABLE ONLY public.claims
    ADD CONSTRAINT claims_pkey PRIMARY KEY (id);


--
-- Name: disputes disputes_pkey; Type: CONSTRAINT; Schema: public; Owner: surplus
--

ALTER TABLE ONLY public.disputes
    ADD CONSTRAINT disputes_pkey PRIMARY KEY (id);


--
-- Name: donor_profiles donor_profiles_pkey; Type: CONSTRAINT; Schema: public; Owner: surplus
--

ALTER TABLE ONLY public.donor_profiles
    ADD CONSTRAINT donor_profiles_pkey PRIMARY KEY (id);


--
-- Name: listings listings_pkey; Type: CONSTRAINT; Schema: public; Owner: surplus
--

ALTER TABLE ONLY public.listings
    ADD CONSTRAINT listings_pkey PRIMARY KEY (id);


--
-- Name: need_zones need_zones_pkey; Type: CONSTRAINT; Schema: public; Owner: surplus
--

ALTER TABLE ONLY public.need_zones
    ADD CONSTRAINT need_zones_pkey PRIMARY KEY (id);


--
-- Name: ngo_profiles ngo_profiles_pkey; Type: CONSTRAINT; Schema: public; Owner: surplus
--

ALTER TABLE ONLY public.ngo_profiles
    ADD CONSTRAINT ngo_profiles_pkey PRIMARY KEY (id);


--
-- Name: notifications notifications_pkey; Type: CONSTRAINT; Schema: public; Owner: surplus
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_pkey PRIMARY KEY (id);


--
-- Name: outlets outlets_pkey; Type: CONSTRAINT; Schema: public; Owner: surplus
--

ALTER TABLE ONLY public.outlets
    ADD CONSTRAINT outlets_pkey PRIMARY KEY (id);


--
-- Name: proof_of_distribution proof_of_distribution_pkey; Type: CONSTRAINT; Schema: public; Owner: surplus
--

ALTER TABLE ONLY public.proof_of_distribution
    ADD CONSTRAINT proof_of_distribution_pkey PRIMARY KEY (id);


--
-- Name: reward_ledger reward_ledger_pkey; Type: CONSTRAINT; Schema: public; Owner: surplus
--

ALTER TABLE ONLY public.reward_ledger
    ADD CONSTRAINT reward_ledger_pkey PRIMARY KEY (id);


--
-- Name: reward_rules reward_rules_pkey; Type: CONSTRAINT; Schema: public; Owner: surplus
--

ALTER TABLE ONLY public.reward_rules
    ADD CONSTRAINT reward_rules_pkey PRIMARY KEY (id);


--
-- Name: rewards rewards_pkey; Type: CONSTRAINT; Schema: public; Owner: surplus
--

ALTER TABLE ONLY public.rewards
    ADD CONSTRAINT rewards_pkey PRIMARY KEY (id);


--
-- Name: transactions transactions_pkey; Type: CONSTRAINT; Schema: public; Owner: surplus
--

ALTER TABLE ONLY public.transactions
    ADD CONSTRAINT transactions_pkey PRIMARY KEY (id);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: surplus
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: volunteer_profiles volunteer_profiles_pkey; Type: CONSTRAINT; Schema: public; Owner: surplus
--

ALTER TABLE ONLY public.volunteer_profiles
    ADD CONSTRAINT volunteer_profiles_pkey PRIMARY KEY (id);


--
-- Name: audit_logs_actorId_idx; Type: INDEX; Schema: public; Owner: surplus
--

CREATE INDEX "audit_logs_actorId_idx" ON public.audit_logs USING btree ("actorId");


--
-- Name: audit_logs_createdAt_idx; Type: INDEX; Schema: public; Owner: surplus
--

CREATE INDEX "audit_logs_createdAt_idx" ON public.audit_logs USING btree ("createdAt");


--
-- Name: audit_logs_entityType_entityId_idx; Type: INDEX; Schema: public; Owner: surplus
--

CREATE INDEX "audit_logs_entityType_entityId_idx" ON public.audit_logs USING btree ("entityType", "entityId");


--
-- Name: claims_claimantId_status_idx; Type: INDEX; Schema: public; Owner: surplus
--

CREATE INDEX "claims_claimantId_status_idx" ON public.claims USING btree ("claimantId", status);


--
-- Name: claims_listingId_claimantId_key; Type: INDEX; Schema: public; Owner: surplus
--

CREATE UNIQUE INDEX "claims_listingId_claimantId_key" ON public.claims USING btree ("listingId", "claimantId");


--
-- Name: claims_listingId_status_idx; Type: INDEX; Schema: public; Owner: surplus
--

CREATE INDEX "claims_listingId_status_idx" ON public.claims USING btree ("listingId", status);


--
-- Name: disputes_openedById_idx; Type: INDEX; Schema: public; Owner: surplus
--

CREATE INDEX "disputes_openedById_idx" ON public.disputes USING btree ("openedById");


--
-- Name: disputes_status_idx; Type: INDEX; Schema: public; Owner: surplus
--

CREATE INDEX disputes_status_idx ON public.disputes USING btree (status);


--
-- Name: disputes_transactionId_idx; Type: INDEX; Schema: public; Owner: surplus
--

CREATE INDEX "disputes_transactionId_idx" ON public.disputes USING btree ("transactionId");


--
-- Name: donor_profiles_userId_key; Type: INDEX; Schema: public; Owner: surplus
--

CREATE UNIQUE INDEX "donor_profiles_userId_key" ON public.donor_profiles USING btree ("userId");


--
-- Name: listings_expiresAt_idx; Type: INDEX; Schema: public; Owner: surplus
--

CREATE INDEX "listings_expiresAt_idx" ON public.listings USING btree ("expiresAt");


--
-- Name: listings_outletId_idx; Type: INDEX; Schema: public; Owner: surplus
--

CREATE INDEX "listings_outletId_idx" ON public.listings USING btree ("outletId");


--
-- Name: listings_status_expiresAt_idx; Type: INDEX; Schema: public; Owner: surplus
--

CREATE INDEX "listings_status_expiresAt_idx" ON public.listings USING btree (status, "expiresAt");


--
-- Name: listings_status_idx; Type: INDEX; Schema: public; Owner: surplus
--

CREATE INDEX listings_status_idx ON public.listings USING btree (status);


--
-- Name: need_zones_isActive_idx; Type: INDEX; Schema: public; Owner: surplus
--

CREATE INDEX "need_zones_isActive_idx" ON public.need_zones USING btree ("isActive");


--
-- Name: need_zones_location_gist_idx; Type: INDEX; Schema: public; Owner: surplus
--

CREATE INDEX need_zones_location_gist_idx ON public.need_zones USING gist (location);


--
-- Name: need_zones_ngoId_idx; Type: INDEX; Schema: public; Owner: surplus
--

CREATE INDEX "need_zones_ngoId_idx" ON public.need_zones USING btree ("ngoId");


--
-- Name: need_zones_priority_idx; Type: INDEX; Schema: public; Owner: surplus
--

CREATE INDEX need_zones_priority_idx ON public.need_zones USING btree (priority);


--
-- Name: ngo_profiles_userId_key; Type: INDEX; Schema: public; Owner: surplus
--

CREATE UNIQUE INDEX "ngo_profiles_userId_key" ON public.ngo_profiles USING btree ("userId");


--
-- Name: notifications_createdAt_idx; Type: INDEX; Schema: public; Owner: surplus
--

CREATE INDEX "notifications_createdAt_idx" ON public.notifications USING btree ("createdAt");


--
-- Name: notifications_userId_isRead_idx; Type: INDEX; Schema: public; Owner: surplus
--

CREATE INDEX "notifications_userId_isRead_idx" ON public.notifications USING btree ("userId", "isRead");


--
-- Name: outlets_donorId_idx; Type: INDEX; Schema: public; Owner: surplus
--

CREATE INDEX "outlets_donorId_idx" ON public.outlets USING btree ("donorId");


--
-- Name: outlets_isActive_idx; Type: INDEX; Schema: public; Owner: surplus
--

CREATE INDEX "outlets_isActive_idx" ON public.outlets USING btree ("isActive");


--
-- Name: outlets_location_gist_idx; Type: INDEX; Schema: public; Owner: surplus
--

CREATE INDEX outlets_location_gist_idx ON public.outlets USING gist (location);


--
-- Name: proof_of_distribution_transactionId_key; Type: INDEX; Schema: public; Owner: surplus
--

CREATE UNIQUE INDEX "proof_of_distribution_transactionId_key" ON public.proof_of_distribution USING btree ("transactionId");


--
-- Name: proof_of_distribution_uploadedById_idx; Type: INDEX; Schema: public; Owner: surplus
--

CREATE INDEX "proof_of_distribution_uploadedById_idx" ON public.proof_of_distribution USING btree ("uploadedById");


--
-- Name: reward_ledger_transactionId_idx; Type: INDEX; Schema: public; Owner: surplus
--

CREATE INDEX "reward_ledger_transactionId_idx" ON public.reward_ledger USING btree ("transactionId");


--
-- Name: reward_ledger_userId_createdAt_idx; Type: INDEX; Schema: public; Owner: surplus
--

CREATE INDEX "reward_ledger_userId_createdAt_idx" ON public.reward_ledger USING btree ("userId", "createdAt");


--
-- Name: reward_rules_actionType_idx; Type: INDEX; Schema: public; Owner: surplus
--

CREATE INDEX "reward_rules_actionType_idx" ON public.reward_rules USING btree ("actionType");


--
-- Name: reward_rules_isActive_idx; Type: INDEX; Schema: public; Owner: surplus
--

CREATE INDEX "reward_rules_isActive_idx" ON public.reward_rules USING btree ("isActive");


--
-- Name: rewards_transactionId_idx; Type: INDEX; Schema: public; Owner: surplus
--

CREATE INDEX "rewards_transactionId_idx" ON public.rewards USING btree ("transactionId");


--
-- Name: rewards_userId_idx; Type: INDEX; Schema: public; Owner: surplus
--

CREATE INDEX "rewards_userId_idx" ON public.rewards USING btree ("userId");


--
-- Name: transactions_claimId_key; Type: INDEX; Schema: public; Owner: surplus
--

CREATE UNIQUE INDEX "transactions_claimId_key" ON public.transactions USING btree ("claimId");


--
-- Name: transactions_listingId_key; Type: INDEX; Schema: public; Owner: surplus
--

CREATE UNIQUE INDEX "transactions_listingId_key" ON public.transactions USING btree ("listingId");


--
-- Name: transactions_slaStatus_idx; Type: INDEX; Schema: public; Owner: surplus
--

CREATE INDEX "transactions_slaStatus_idx" ON public.transactions USING btree ("slaStatus");


--
-- Name: transactions_status_idx; Type: INDEX; Schema: public; Owner: surplus
--

CREATE INDEX transactions_status_idx ON public.transactions USING btree (status);


--
-- Name: transactions_volunteerId_idx; Type: INDEX; Schema: public; Owner: surplus
--

CREATE INDEX "transactions_volunteerId_idx" ON public.transactions USING btree ("volunteerId");


--
-- Name: users_createdAt_idx; Type: INDEX; Schema: public; Owner: surplus
--

CREATE INDEX "users_createdAt_idx" ON public.users USING btree ("createdAt");


--
-- Name: users_email_key; Type: INDEX; Schema: public; Owner: surplus
--

CREATE UNIQUE INDEX users_email_key ON public.users USING btree (email);


--
-- Name: users_role_idx; Type: INDEX; Schema: public; Owner: surplus
--

CREATE INDEX users_role_idx ON public.users USING btree (role);


--
-- Name: users_verificationStatus_idx; Type: INDEX; Schema: public; Owner: surplus
--

CREATE INDEX "users_verificationStatus_idx" ON public.users USING btree ("verificationStatus");


--
-- Name: volunteer_profiles_userId_key; Type: INDEX; Schema: public; Owner: surplus
--

CREATE UNIQUE INDEX "volunteer_profiles_userId_key" ON public.volunteer_profiles USING btree ("userId");


--
-- Name: audit_logs audit_logs_actorId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: surplus
--

ALTER TABLE ONLY public.audit_logs
    ADD CONSTRAINT "audit_logs_actorId_fkey" FOREIGN KEY ("actorId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: claims claims_claimantId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: surplus
--

ALTER TABLE ONLY public.claims
    ADD CONSTRAINT "claims_claimantId_fkey" FOREIGN KEY ("claimantId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: claims claims_listingId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: surplus
--

ALTER TABLE ONLY public.claims
    ADD CONSTRAINT "claims_listingId_fkey" FOREIGN KEY ("listingId") REFERENCES public.listings(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: claims claims_nGOProfileId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: surplus
--

ALTER TABLE ONLY public.claims
    ADD CONSTRAINT "claims_nGOProfileId_fkey" FOREIGN KEY ("nGOProfileId") REFERENCES public.ngo_profiles(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: disputes disputes_openedById_fkey; Type: FK CONSTRAINT; Schema: public; Owner: surplus
--

ALTER TABLE ONLY public.disputes
    ADD CONSTRAINT "disputes_openedById_fkey" FOREIGN KEY ("openedById") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: disputes disputes_resolvedById_fkey; Type: FK CONSTRAINT; Schema: public; Owner: surplus
--

ALTER TABLE ONLY public.disputes
    ADD CONSTRAINT "disputes_resolvedById_fkey" FOREIGN KEY ("resolvedById") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: disputes disputes_transactionId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: surplus
--

ALTER TABLE ONLY public.disputes
    ADD CONSTRAINT "disputes_transactionId_fkey" FOREIGN KEY ("transactionId") REFERENCES public.transactions(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: donor_profiles donor_profiles_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: surplus
--

ALTER TABLE ONLY public.donor_profiles
    ADD CONSTRAINT "donor_profiles_userId_fkey" FOREIGN KEY ("userId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: listings listings_outletId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: surplus
--

ALTER TABLE ONLY public.listings
    ADD CONSTRAINT "listings_outletId_fkey" FOREIGN KEY ("outletId") REFERENCES public.outlets(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: need_zones need_zones_createdById_fkey; Type: FK CONSTRAINT; Schema: public; Owner: surplus
--

ALTER TABLE ONLY public.need_zones
    ADD CONSTRAINT "need_zones_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: need_zones need_zones_ngoId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: surplus
--

ALTER TABLE ONLY public.need_zones
    ADD CONSTRAINT "need_zones_ngoId_fkey" FOREIGN KEY ("ngoId") REFERENCES public.ngo_profiles(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: ngo_profiles ngo_profiles_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: surplus
--

ALTER TABLE ONLY public.ngo_profiles
    ADD CONSTRAINT "ngo_profiles_userId_fkey" FOREIGN KEY ("userId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: notifications notifications_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: surplus
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT "notifications_userId_fkey" FOREIGN KEY ("userId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: outlets outlets_donorId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: surplus
--

ALTER TABLE ONLY public.outlets
    ADD CONSTRAINT "outlets_donorId_fkey" FOREIGN KEY ("donorId") REFERENCES public.donor_profiles(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: proof_of_distribution proof_of_distribution_transactionId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: surplus
--

ALTER TABLE ONLY public.proof_of_distribution
    ADD CONSTRAINT "proof_of_distribution_transactionId_fkey" FOREIGN KEY ("transactionId") REFERENCES public.transactions(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: proof_of_distribution proof_of_distribution_uploadedById_fkey; Type: FK CONSTRAINT; Schema: public; Owner: surplus
--

ALTER TABLE ONLY public.proof_of_distribution
    ADD CONSTRAINT "proof_of_distribution_uploadedById_fkey" FOREIGN KEY ("uploadedById") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: reward_ledger reward_ledger_transactionId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: surplus
--

ALTER TABLE ONLY public.reward_ledger
    ADD CONSTRAINT "reward_ledger_transactionId_fkey" FOREIGN KEY ("transactionId") REFERENCES public.transactions(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: reward_ledger reward_ledger_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: surplus
--

ALTER TABLE ONLY public.reward_ledger
    ADD CONSTRAINT "reward_ledger_userId_fkey" FOREIGN KEY ("userId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: rewards rewards_transactionId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: surplus
--

ALTER TABLE ONLY public.rewards
    ADD CONSTRAINT "rewards_transactionId_fkey" FOREIGN KEY ("transactionId") REFERENCES public.transactions(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: rewards rewards_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: surplus
--

ALTER TABLE ONLY public.rewards
    ADD CONSTRAINT "rewards_userId_fkey" FOREIGN KEY ("userId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: transactions transactions_claimId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: surplus
--

ALTER TABLE ONLY public.transactions
    ADD CONSTRAINT "transactions_claimId_fkey" FOREIGN KEY ("claimId") REFERENCES public.claims(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: transactions transactions_listingId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: surplus
--

ALTER TABLE ONLY public.transactions
    ADD CONSTRAINT "transactions_listingId_fkey" FOREIGN KEY ("listingId") REFERENCES public.listings(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: transactions transactions_volunteerId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: surplus
--

ALTER TABLE ONLY public.transactions
    ADD CONSTRAINT "transactions_volunteerId_fkey" FOREIGN KEY ("volunteerId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: volunteer_profiles volunteer_profiles_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: surplus
--

ALTER TABLE ONLY public.volunteer_profiles
    ADD CONSTRAINT "volunteer_profiles_userId_fkey" FOREIGN KEY ("userId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

