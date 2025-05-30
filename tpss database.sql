--
-- PostgreSQL database dump
--

-- Dumped from database version 17.2
-- Dumped by pg_dump version 17.2

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: pgcrypto; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA public;


--
-- Name: EXTENSION pgcrypto; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION pgcrypto IS 'cryptographic functions';


--
-- Name: uuid-ossp; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA public;


--
-- Name: EXTENSION "uuid-ossp"; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION "uuid-ossp" IS 'generate universally unique identifiers (UUIDs)';


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: doctors; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.doctors (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    name character varying(100) NOT NULL,
    email character varying(100) NOT NULL,
    password_hash character varying(60) NOT NULL,
    license_number character varying(50),
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


ALTER TABLE public.doctors OWNER TO postgres;

--
-- Name: patch_test_images; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.patch_test_images (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    patch_test_id uuid,
    hours_after_patch integer NOT NULL,
    image_path character varying(255) NOT NULL,
    ai_result jsonb,
    doctor_notes text,
    created_at timestamp with time zone DEFAULT now(),
    CONSTRAINT patch_test_images_hours_after_patch_check CHECK ((hours_after_patch = ANY (ARRAY[48, 96, 168])))
);


ALTER TABLE public.patch_test_images OWNER TO postgres;

--
-- Name: patch_tests; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.patch_tests (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    patient_id uuid,
    test_date date NOT NULL,
    notes text,
    created_at timestamp with time zone DEFAULT now()
);


ALTER TABLE public.patch_tests OWNER TO postgres;

--
-- Name: patients; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.patients (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    doctor_id uuid,
    name character varying(100) NOT NULL,
    dob date NOT NULL,
    gender character varying(10),
    contact_phone character varying(20),
    contact_email character varying(100),
    address text,
    medical_history text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    CONSTRAINT patients_gender_check CHECK (((gender)::text = ANY ((ARRAY['Male'::character varying, 'Female'::character varying, 'Other'::character varying])::text[])))
);


ALTER TABLE public.patients OWNER TO postgres;

--
-- Data for Name: doctors; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.doctors (id, name, email, password_hash, license_number, created_at, updated_at) FROM stdin;
354d4b4b-40e7-41ee-b32f-4cc5d0119124	Dr. Smith	dr.smith@clinic.com	$2a$10$N9qo8uLOickgx2ZMRZoMy.MRJv7XKPFY3Jdqt/UpJfJ3O0LY.7m7e	\N	2025-04-02 19:55:07.508431+05:30	2025-04-02 19:55:07.508431+05:30
6d165e14-6b99-47e2-a8cf-1bf50e561c9b	Dr. Anderson	dr.anderson@clinic.com	$2a$06$4Vi1EEcv5XFhie8nCHGouuUAk1UuC57R/2Xu6nscOeROkJps5OiZq	MD-654321	2025-04-03 14:43:13.566138+05:30	2025-04-03 14:43:13.566138+05:30
eed16d77-ac3a-4995-9ef7-a4936e5eea0f	Dr. Rakesh Sharma	rakesh@clinic.com	$2b$10$irM1mnVQ0w6WTq/sj6pu0Ohy/vFF/zaSDMZU/m9B1xigAhZ28Wr1i	MED123456	2025-04-03 15:03:27.854483+05:30	2025-04-03 15:03:27.854483+05:30
6f40ea83-0159-42b3-9215-2e50b181d021	Dr. Rakesh Sharma 2	rakesh123@clinic.com	$2b$10$HNj8gQfRZO.LIoIfQLr/U.rsS3uWsa2qJ1fR.OYiZmz6olfbKxIta	MED323456	2025-04-06 18:49:34.647335+05:30	2025-04-06 18:49:34.647335+05:30
\.


--
-- Data for Name: patch_test_images; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.patch_test_images (id, patch_test_id, hours_after_patch, image_path, ai_result, doctor_notes, created_at) FROM stdin;
bbafe818-5eb7-48c6-84ee-a3c1348956f1	c1a5e46b-476b-4c59-8948-2462cdbef2c4	48	/uploads/test1-48h.jpg	\N	\N	2025-04-02 22:39:24.585302+05:30
0bddb8ca-c1c7-4be4-a033-f0360638f3c3	c1a5e46b-476b-4c59-8948-2462cdbef2c4	96	/uploads/test1-96h.jpg	\N	\N	2025-04-02 22:39:24.585302+05:30
d5c862c0-814f-418a-a489-1837175c34db	23061af3-ca48-4b42-8240-2b9492c131de	48	/uploads/test3-48h.jpg	\N	\N	2025-04-02 22:39:24.585302+05:30
e8cce8b2-07cc-4d79-893a-f962eecda95b	23061af3-ca48-4b42-8240-2b9492c131de	96	/uploads/test3-96h.jpg	\N	\N	2025-04-02 22:39:24.585302+05:30
5ec4ce21-eac8-4fe7-ba85-1ec318e4ac96	23061af3-ca48-4b42-8240-2b9492c131de	48	/uploads/image-1743674018426.JPG	\N	\N	2025-04-03 15:23:38.440322+05:30
92fa87d6-ff04-484b-832f-46384725d64b	23061af3-ca48-4b42-8240-2b9492c131de	48	/uploads/578aec8d-1f24-4306-8e24-7040aa8e0494.JPG	\N	\N	2025-04-06 18:49:58.095518+05:30
dbce7bbe-0511-45be-afbc-0e48fefce045	23061af3-ca48-4b42-8240-2b9492c131de	48	/uploads/6573b8db-90d7-44db-8bed-f36c841038fa.JPG	\N	\N	2025-04-26 21:53:35.334066+05:30
f39906be-5930-4443-a327-087a22872a2e	23061af3-ca48-4b42-8240-2b9492c131de	48	/uploads/a115997a-a6e5-49cd-ac5e-159d84fa920e.JPG	\N	\N	2025-04-27 22:38:14.841631+05:30
1abb8409-fca3-48e3-bd78-2b11ca985318	d0f14856-ade7-4616-b140-903c74df1a0a	48	/uploads/a344ff1d-42d0-459e-80c3-44a913514535.JPG	\N	\N	2025-04-28 00:34:06.327442+05:30
a7cbcfbd-e722-4955-b2ae-8e6c71d31a75	b299b9e0-6470-40c8-bdda-4f181d7f2712	48	/uploads/0bf6ffbc-917b-4ee3-94b7-b8508d539753.JPG	\N	\N	2025-04-28 00:35:07.800127+05:30
73249897-3b56-4023-a032-2133a9fac137	b299b9e0-6470-40c8-bdda-4f181d7f2712	48	/uploads/6b3914b5-100d-4798-824b-7ae7eb5fac71.JPG	\N	\N	2025-04-28 00:57:24.420406+05:30
4b341d69-01a5-4e00-a7d8-d4ad1be092ae	b299b9e0-6470-40c8-bdda-4f181d7f2712	48	/uploads/ef582cd8-66d8-4d8b-83bd-0b554aec48d7.JPG	\N	\N	2025-04-28 02:20:39.58109+05:30
06034ed5-57f7-42b2-be2a-8abaea454227	b299b9e0-6470-40c8-bdda-4f181d7f2712	48	/uploads/3bda8b77-f3d1-446e-af8d-06b6ffabeea5.JPG	\N	\N	2025-04-28 02:42:18.891099+05:30
297afd82-8a30-45ce-8e6a-cf36e054d743	b299b9e0-6470-40c8-bdda-4f181d7f2712	48	/uploads/fb37c801-a93c-42b0-af66-d7593b9fc977.JPG	\N	\N	2025-04-28 03:11:55.043629+05:30
49f6be60-cdbe-4277-b375-5f7abf2e7419	b299b9e0-6470-40c8-bdda-4f181d7f2712	48	/uploads/dc0c1208-a0ea-4ea7-88ed-d7d958770877.jpg	\N	\N	2025-04-28 03:33:35.53224+05:30
18b5033b-23c6-43e4-881b-ed88b49cc13b	b299b9e0-6470-40c8-bdda-4f181d7f2712	48	/uploads/eeb50128-1307-45f4-b666-a14290ab4f3f.jpg	\N	\N	2025-04-28 03:50:47.139843+05:30
77b35427-2794-4b9b-a791-8d5bb95d45aa	b299b9e0-6470-40c8-bdda-4f181d7f2712	48	/uploads/bcb2fba6-3375-4bc9-84ea-0a7552ad3b6c.jpeg	\N	\N	2025-04-28 03:53:31.111578+05:30
0379e9e5-127f-44cb-ad73-61931e327d12	b299b9e0-6470-40c8-bdda-4f181d7f2712	48	/uploads/10265389-7f68-406c-9246-f7a3fd7922ea.jpeg	\N	\N	2025-04-28 04:06:29.591878+05:30
8c81bfd5-c7d9-47e9-aa73-cfcbae01d71b	b299b9e0-6470-40c8-bdda-4f181d7f2712	48	/uploads/8ec30daa-2565-41c7-a318-82ac4a9eebc1.jpg	\N	\N	2025-04-28 04:06:38.407245+05:30
515dc87c-660a-4d70-b652-f957df8f8e81	ccd90edb-06a4-4fb5-a0cb-b1fa7f1fdf66	48	/uploads/patch-tests/61b1508a-c3b4-4f11-893e-1459dbbb1e12.jpg	\N	\N	2025-04-28 04:38:59.888057+05:30
01c2ae54-77b0-4cb4-b80f-361ead93ec9b	ccd90edb-06a4-4fb5-a0cb-b1fa7f1fdf66	48	/uploads/patch-tests/32ab4c9d-1161-4b82-b794-cf4b47b47193.jpg	\N	\N	2025-04-28 05:13:41.822684+05:30
9dfa2c25-32df-43f2-8a47-aa5e80ab92d0	ccd90edb-06a4-4fb5-a0cb-b1fa7f1fdf66	48	/uploads/patch-tests/cb9bd7c1-a7a7-482f-b354-973cfdcaeccf.jpg	\N	\N	2025-04-28 17:38:21.663871+05:30
d3a55b27-ba92-4bd1-a5bb-d89a22fa7904	ccd90edb-06a4-4fb5-a0cb-b1fa7f1fdf66	48	/uploads/patch-tests/56fa75b1-6b25-4f40-8a96-0ceeee413c88.jpg	\N	\N	2025-04-28 20:10:03.896162+05:30
50eef12e-6eff-4d98-8426-97094db053f0	b9045812-6ef2-4e6d-b5c4-1d6394a887b8	48	/uploads/patch-tests/5f2626e2-1b51-4d61-913a-f57991864190.jpg	\N	\N	2025-04-28 22:22:59.537617+05:30
dcd68474-0c8d-454c-844b-24e516106df4	b9045812-6ef2-4e6d-b5c4-1d6394a887b8	48	/uploads/patch-tests/a94b4eec-d105-4543-8ca1-cb88d914804a.jpg	\N	\N	2025-04-28 23:22:13.842271+05:30
72aee211-93c1-4a10-b459-326c18482005	b9045812-6ef2-4e6d-b5c4-1d6394a887b8	48	/uploads/patch-tests/30de7599-b538-4044-a674-ba14a8c27a54.jpg	\N	\N	2025-04-28 23:24:47.84022+05:30
fb8c19fe-012c-4421-8eb2-a509b5c7f006	b9045812-6ef2-4e6d-b5c4-1d6394a887b8	96	/uploads/patch-tests/9445d57b-bd45-4c8e-8cf5-372eea254ed7.jpg	\N	\N	2025-04-28 23:31:54.360827+05:30
6db66477-6da9-468c-83b2-0cfece2a529c	18b6d497-d97b-40d5-b349-78a80d63a7d1	48	/uploads/patch-tests/96a53fe5-84b3-4860-a300-95930f06de47.jpg	\N	\N	2025-04-29 00:35:01.370249+05:30
183cc874-bfa0-4ee7-97ce-527d83b0e022	6dfe1022-0e42-4d8a-b6b7-c437404c924d	48	/uploads/patch-tests/f6807fa2-646b-427d-b684-766c3c09af43.JPG	\N	\N	2025-04-29 00:36:04.051365+05:30
f84ee7fa-a332-4a5d-a845-599f127a9060	6dfe1022-0e42-4d8a-b6b7-c437404c924d	48	/uploads/patch-tests/c2307184-ca1d-416e-81bb-0ffd2d51e9d0.JPG	\N	\N	2025-04-29 01:19:05.751935+05:30
a7e34529-a384-4678-a908-b8106422ff70	b9045812-6ef2-4e6d-b5c4-1d6394a887b8	96	http://localhost:3000/uploads/patch-tests/9becc5cd-495e-451f-a444-93a8eee54a4e.jpg	\N	\N	2025-04-29 02:20:46.203466+05:30
63752644-e2db-4c70-8c4f-504cac658df9	6dfe1022-0e42-4d8a-b6b7-c437404c924d	48	http://localhost:3000/uploads/patch-tests/36936ba4-2f29-40fb-941f-9e788fe4b665.jpg	\N	\N	2025-04-29 02:20:52.594363+05:30
357bb73d-a253-41ab-ad08-d9748b218216	a12507c1-acf9-45bb-92e2-de1d58cc9dee	48	http://localhost:3000/uploads/patch-tests/77f48602-b69d-422d-8da9-1ccde598905f.jpg	\N	\N	2025-04-29 12:57:02.3193+05:30
05389fff-031b-4adf-9539-a0dccb5253d7	d0786b91-49c7-4b0e-9268-84d670795ab8	48	http://localhost:3000/uploads/patch-tests/9b3f4db7-f454-4d70-9d03-9ce9837d06de.JPG	\N	\N	2025-05-03 11:15:00.29672+05:30
ea869805-da42-4c95-b783-5f0a874de1d2	1b87ff27-485e-47dd-bf5b-f09bf933d99d	48	http://localhost:3000/uploads/patch-tests/6d228a10-803b-448a-bc71-de725073a2cb.jpg	\N	\N	2025-05-03 12:40:39.616215+05:30
207ed763-deda-411c-9977-9ab4bde4fc48	82d3e293-abbf-409e-a026-f45eb648cf2c	48	http://localhost:3000/uploads/patch-tests/31b12955-aab5-4fca-86f1-09c789a8e544.jpg	\N	\N	2025-05-03 12:57:25.139198+05:30
7061205d-8a28-45bd-b009-8f964883795f	f54d0659-4492-43cf-9e98-ac356a0af09d	48	http://localhost:3000/uploads/patch-tests/1da33fb2-da2a-40d5-803b-853ee2c9e9c6.jpg	\N	\N	2025-05-10 23:57:52.174707+05:30
501ec2d0-9e32-4db9-a8d8-5919e22d5a0e	1e02061b-0118-41f9-a13a-3e04e2fc13f3	48	http://localhost:3000/uploads/patch-tests/70eee84c-2ce5-4d32-b20f-46c6e2256ba2.JPG	\N	\N	2025-05-28 17:32:29.595379+05:30
\.


--
-- Data for Name: patch_tests; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.patch_tests (id, patient_id, test_date, notes, created_at) FROM stdin;
c1a5e46b-476b-4c59-8948-2462cdbef2c4	b2388da8-4354-498e-9c2f-858cc1f1bc46	2023-06-01	Initial allergy screening	2025-04-02 22:39:23.383057+05:30
44b50f56-0674-466e-bede-3225843734dd	b2388da8-4354-498e-9c2f-858cc1f1bc46	2023-06-01	Follow-up test	2025-04-02 22:39:23.383057+05:30
23061af3-ca48-4b42-8240-2b9492c131de	bcd4c6bb-49ba-4302-8590-04a50430f8a4	2023-07-10	Comprehensive allergy panel	2025-04-02 22:39:23.383057+05:30
79b33a80-667e-4f64-b45a-60ea11c7d51b	bcd4c6bb-49ba-4302-8590-04a50430f8a4	2023-10-01	7th allergy test	2025-04-03 15:07:34.223296+05:30
9072ec5d-b2a4-40ce-8e62-6134a325a4c8	bcd4c6bb-49ba-4302-8590-04a50430f8a4	2023-10-01	7th allergy test	2025-04-06 18:49:41.485199+05:30
a00f23c2-e45a-4f1f-8002-d573c12e77f6	bcd4c6bb-49ba-4302-8590-04a50430f8a4	2023-10-01	7th allergy test	2025-04-28 00:31:15.942435+05:30
d0f14856-ade7-4616-b140-903c74df1a0a	a0034124-516a-412c-9e99-a08d0522ae72	2025-10-06	1st allergy test	2025-04-28 00:32:43.81563+05:30
b299b9e0-6470-40c8-bdda-4f181d7f2712	a0034124-516a-412c-9e99-a08d0522ae72	2025-10-12	2nd allergy test	2025-04-28 00:34:32.940684+05:30
f1fc5565-4041-4847-9fc0-5f65f65a3919	a0034124-516a-412c-9e99-a08d0522ae72	2025-10-12	3rd allergy test	2025-04-28 01:24:38.030963+05:30
2f7718dc-3384-4f70-ae15-a42dfb66e8a3	ca462492-ad80-4978-8ab3-71045b26b374	2025-04-29	Initial patch test	2025-04-28 01:24:51.375635+05:30
9514330f-66d4-429c-a50c-3598fe449c3b	ca462492-ad80-4978-8ab3-71045b26b374	2025-05-01	48th hour	2025-04-28 01:24:51.411859+05:30
208f55c9-6388-4e21-9bb0-17e2aec45ae3	ca462492-ad80-4978-8ab3-71045b26b374	2025-05-03	96th hour	2025-04-28 01:24:51.446896+05:30
95f9babf-b832-4845-a6f3-efbbb00094bf	ca462492-ad80-4978-8ab3-71045b26b374	2025-05-06	7th day	2025-04-28 01:24:51.482737+05:30
28de1ca4-b7e1-4ff4-8ccc-80a3eb7f078f	276eb249-39c7-4a75-bdec-b1397b4631c8	2025-04-29	Initial patch test	2025-04-28 01:25:46.279299+05:30
1be1549e-d996-48d3-895a-e9770365ac70	276eb249-39c7-4a75-bdec-b1397b4631c8	2025-05-01	48th hour	2025-04-28 01:25:46.322171+05:30
1c71b712-7bac-4df9-b683-2a1d33a74820	276eb249-39c7-4a75-bdec-b1397b4631c8	2025-05-03	96th hour	2025-04-28 01:25:46.35952+05:30
f54d0659-4492-43cf-9e98-ac356a0af09d	276eb249-39c7-4a75-bdec-b1397b4631c8	2025-05-06	7th day	2025-04-28 01:25:46.401387+05:30
e434ab6c-f70d-498d-8188-e2971486808f	50f73d9b-e1fb-438a-8cec-a0bf79d8c043	2025-04-15	Initial patch test	2025-04-28 02:06:39.225151+05:30
b870d948-721a-450b-a51d-e792423234f9	50f73d9b-e1fb-438a-8cec-a0bf79d8c043	2025-04-17	48th hour	2025-04-28 02:06:39.274516+05:30
1e1a30d1-830d-48fe-8059-f39267251a40	50f73d9b-e1fb-438a-8cec-a0bf79d8c043	2025-04-19	96th hour	2025-04-28 02:06:39.318058+05:30
154d0e44-4a33-450a-99fd-745b3613e99a	50f73d9b-e1fb-438a-8cec-a0bf79d8c043	2025-04-22	7th day	2025-04-28 02:06:39.361272+05:30
5b17e7f7-5dba-4353-b973-a4032108dd6b	50f73d9b-e1fb-438a-8cec-a0bf79d8c043	2025-05-23	Initial patch test	2025-04-28 03:19:59.177064+05:30
d2052b69-2dd3-4046-af30-43a2bd290d7a	50f73d9b-e1fb-438a-8cec-a0bf79d8c043	2025-05-25	48th hour	2025-04-28 03:19:59.225837+05:30
1d4f1da3-a57b-4b13-9e20-c35cc1f0d6e8	50f73d9b-e1fb-438a-8cec-a0bf79d8c043	2025-05-27	96th hour	2025-04-28 03:19:59.268903+05:30
46db6a17-34af-4ed5-801f-4b1fa5288783	50f73d9b-e1fb-438a-8cec-a0bf79d8c043	2025-05-30	7th day	2025-04-28 03:19:59.311454+05:30
8ef8c0d1-68bd-466a-beef-80836dd87e39	2d29a093-8b80-490c-847c-5dc34964eef6	2025-04-28	Initial patch test	2025-04-28 03:20:34.091571+05:30
fa59b539-b5bc-41cb-a118-50925d8b6ace	2d29a093-8b80-490c-847c-5dc34964eef6	2025-04-30	48th hour	2025-04-28 03:20:34.139917+05:30
ccd90edb-06a4-4fb5-a0cb-b1fa7f1fdf66	2d29a093-8b80-490c-847c-5dc34964eef6	2025-05-02	96th hour	2025-04-28 03:20:34.181107+05:30
8e0698c1-b6a7-4103-9be7-29fc652babe6	2d29a093-8b80-490c-847c-5dc34964eef6	2025-05-05	7th day	2025-04-28 03:20:34.223486+05:30
a1b139b8-5e82-4e47-9680-be09f66295af	6ea30785-4691-4ccf-ad4e-81b62c2018bd	2025-10-09	Initial patch test	2025-04-28 04:59:13.124639+05:30
a1a875dd-b8bc-4d68-91e8-be3808615510	6ea30785-4691-4ccf-ad4e-81b62c2018bd	2025-10-11	48th hour	2025-04-28 04:59:13.194667+05:30
89c47156-b964-430e-abc9-517b481b75bc	6ea30785-4691-4ccf-ad4e-81b62c2018bd	2025-10-13	96th hour	2025-04-28 04:59:13.251864+05:30
6ae96243-610f-4edd-8bd7-48a937acc9f4	6ea30785-4691-4ccf-ad4e-81b62c2018bd	2025-10-16	7th day	2025-04-28 04:59:13.309519+05:30
8b7a367e-87fb-4877-ad04-b65f8a1fba24	50f73d9b-e1fb-438a-8cec-a0bf79d8c043	2025-04-29	Initial patch test	2025-04-28 05:10:21.668896+05:30
c6d4a96e-d944-4456-9069-bc68c08ff47a	50f73d9b-e1fb-438a-8cec-a0bf79d8c043	2025-05-01	48th hour	2025-04-28 05:10:21.73244+05:30
b52add21-23e4-4a3d-84d5-25d30f8a5089	50f73d9b-e1fb-438a-8cec-a0bf79d8c043	2025-05-03	96th hour	2025-04-28 05:10:21.783133+05:30
0b58403b-9a46-47d2-8c15-a4e5aa62dc92	50f73d9b-e1fb-438a-8cec-a0bf79d8c043	2025-05-06	7th day	2025-04-28 05:10:21.834132+05:30
3240515d-3a0f-443b-b7f9-201f6fd10978	81bdc765-efae-48d9-862d-1a602750f9f2	2025-04-29	Initial patch test	2025-04-28 05:27:04.262202+05:30
b9045812-6ef2-4e6d-b5c4-1d6394a887b8	81bdc765-efae-48d9-862d-1a602750f9f2	2025-05-01	48th hour	2025-04-28 05:27:04.323308+05:30
18b6d497-d97b-40d5-b349-78a80d63a7d1	81bdc765-efae-48d9-862d-1a602750f9f2	2025-05-03	96th hour	2025-04-28 05:27:04.37587+05:30
6dfe1022-0e42-4d8a-b6b7-c437404c924d	81bdc765-efae-48d9-862d-1a602750f9f2	2025-05-06	7th day	2025-04-28 05:27:04.423436+05:30
55b768a5-8aa1-45ca-a5f3-9bf719a24d0b	19d93b05-5991-4343-b053-0a9b9402a385	2025-05-16	Initial patch test	2025-04-28 20:51:31.71632+05:30
5af520ff-5a0e-466d-bb76-ecc8ba2cfa53	19d93b05-5991-4343-b053-0a9b9402a385	2025-05-18	48th hour	2025-04-28 20:51:31.844391+05:30
03f4e65f-20d1-4051-8f08-5418d688dd6a	19d93b05-5991-4343-b053-0a9b9402a385	2025-05-20	96th hour	2025-04-28 20:51:31.950123+05:30
372a7278-de4a-43d4-bf77-1d7aae7ce9c0	19d93b05-5991-4343-b053-0a9b9402a385	2025-05-23	7th day	2025-04-28 20:51:32.055337+05:30
1decbb5d-0278-4027-81de-7a5143b0d91f	93c30358-98f1-4dd5-8c80-2a8b05b947a0	2025-05-15	Initial patch test	2025-04-28 23:42:19.155484+05:30
3e79550e-0fa2-4870-b552-41b63d5810f0	93c30358-98f1-4dd5-8c80-2a8b05b947a0	2025-05-17	48th hour	2025-04-28 23:42:19.209263+05:30
90f5faf3-304c-4e79-95db-7ec295afd950	93c30358-98f1-4dd5-8c80-2a8b05b947a0	2025-05-19	96th hour	2025-04-28 23:42:19.251843+05:30
fdbe8ee8-bf87-4440-9ca0-22ee2f517244	93c30358-98f1-4dd5-8c80-2a8b05b947a0	2025-05-22	7th day	2025-04-28 23:42:19.293571+05:30
5a611948-255b-448b-b124-d8dbeee4d272	4291cf8b-6479-4dd8-a0ed-0db2db18fb22	2025-04-29	Initial patch test	2025-04-29 12:56:31.093624+05:30
a12507c1-acf9-45bb-92e2-de1d58cc9dee	4291cf8b-6479-4dd8-a0ed-0db2db18fb22	2025-05-01	48th hour	2025-04-29 12:56:31.204246+05:30
e71125f7-63bd-4c42-a6f2-2259fe7c3777	4291cf8b-6479-4dd8-a0ed-0db2db18fb22	2025-05-03	96th hour	2025-04-29 12:56:31.298489+05:30
d0786b91-49c7-4b0e-9268-84d670795ab8	4291cf8b-6479-4dd8-a0ed-0db2db18fb22	2025-05-06	7th day	2025-04-29 12:56:31.394022+05:30
1b87ff27-485e-47dd-bf5b-f09bf933d99d	d02ff114-f3aa-4f2e-b125-f2df6cfe7726	2025-05-06	Initial patch test	2025-05-03 12:40:00.678307+05:30
00acbd95-4774-43e1-81df-29d3c0e80ebc	d02ff114-f3aa-4f2e-b125-f2df6cfe7726	2025-05-08	48th hour	2025-05-03 12:40:00.802374+05:30
f97e30c2-db60-4752-bf32-e099f7aeed55	d02ff114-f3aa-4f2e-b125-f2df6cfe7726	2025-05-10	96th hour	2025-05-03 12:40:00.90698+05:30
5ca51dc2-acf7-47ee-8d78-36a6a3e5f7d0	d02ff114-f3aa-4f2e-b125-f2df6cfe7726	2025-05-13	7th day	2025-05-03 12:40:01.009083+05:30
82d3e293-abbf-409e-a026-f45eb648cf2c	003c01ca-1529-4ffc-8bd8-6e8cbb122ce3	2025-05-08	Initial patch test	2025-05-03 12:57:02.255441+05:30
3a765412-e768-406a-9c0e-747e21c4de23	003c01ca-1529-4ffc-8bd8-6e8cbb122ce3	2025-05-10	48th hour	2025-05-03 12:57:02.307458+05:30
a92cb67f-5084-4751-84ba-78a0880740f4	003c01ca-1529-4ffc-8bd8-6e8cbb122ce3	2025-05-12	96th hour	2025-05-03 12:57:02.349382+05:30
1e02061b-0118-41f9-a13a-3e04e2fc13f3	003c01ca-1529-4ffc-8bd8-6e8cbb122ce3	2025-05-15	7th day	2025-05-03 12:57:02.391503+05:30
99dab665-4e01-4257-a062-e3f21b9a999a	99e88711-cf4c-4bcf-9d57-d70b422d9d99	2025-05-15	Initial patch test	2025-05-28 17:33:35.980049+05:30
9de1bb92-6e31-4044-a3ed-9500e672f4f7	99e88711-cf4c-4bcf-9d57-d70b422d9d99	2025-05-17	48th hour	2025-05-28 17:33:36.028411+05:30
615c12fd-a07b-490a-b2f1-c18b4d6a00aa	99e88711-cf4c-4bcf-9d57-d70b422d9d99	2025-05-19	96th hour	2025-05-28 17:33:36.077099+05:30
b7111603-599e-4688-aec1-b825e43ba6d6	99e88711-cf4c-4bcf-9d57-d70b422d9d99	2025-05-22	7th day	2025-05-28 17:33:36.119854+05:30
\.


--
-- Data for Name: patients; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.patients (id, doctor_id, name, dob, gender, contact_phone, contact_email, address, medical_history, created_at, updated_at) FROM stdin;
b2388da8-4354-498e-9c2f-858cc1f1bc46	354d4b4b-40e7-41ee-b32f-4cc5d0119124	John Doe	1985-05-15	Male	1234567890	john@example.com	\N	Allergy history: Pollen	2025-04-02 22:39:23.353619+05:30	2025-04-02 22:39:23.353619+05:30
bcd4c6bb-49ba-4302-8590-04a50430f8a4	354d4b4b-40e7-41ee-b32f-4cc5d0119124	Jane Smith	1990-08-22	Female	0987654321	jane@example.com	\N	Previous skin conditions	2025-04-02 22:39:23.353619+05:30	2025-04-02 22:39:23.353619+05:30
03d2603a-0b68-4871-83a0-b20bf9923966	\N	Test Patient 2	1992-06-25	Female	1234565690	test2@example.com	\N	No known allergies	2025-04-03 14:17:00.962665+05:30	2025-04-03 14:17:00.962665+05:30
c2f2f475-98a3-4010-8df0-7c08c11bf9b2	\N	Test Patient3	1982-03-15	Male	1234533690	test3@example.com	\N	No known allergies	2025-04-03 14:17:40.197078+05:30	2025-04-03 14:17:40.197078+05:30
5317c202-bbae-4a4a-b325-587a0aa32336	\N	Test Patient3	1982-03-15	Male	1234533690	test3@example.com	\N	No known allergies	2025-04-06 18:48:10.578183+05:30	2025-04-06 18:48:10.578183+05:30
dfb77ada-7139-47f6-8b2c-fed5c0108ce6	\N	Test Patient 4	1982-03-15	Male	1234533690	test3@example.com	\N	No known allergies	2025-04-06 18:48:23.973667+05:30	2025-04-06 18:48:23.973667+05:30
af97da79-eba3-4999-bf2b-6f618e87ea82	\N	Test Patient 5	1982-03-15	Male	1235533690	test5@example.com	\N	No known allergies	2025-04-21 17:01:32.010364+05:30	2025-04-21 17:01:32.010364+05:30
d3c13e56-9730-4ee7-832d-2d003b2ed739	\N	Test Patient 6	1982-03-15	Male	1235553690	test6@example.com	\N	No known allergies	2025-04-21 21:46:39.817265+05:30	2025-04-21 21:46:39.817265+05:30
84519a8b-e421-476e-be35-d7d9e7124e02	\N	 Test Patient 7 	1982-03-15	Male	1225553690	test7@example.com	\N	No known allergies	2025-04-25 17:14:44.810632+05:30	2025-04-25 17:14:44.810632+05:30
085912d6-fd2c-4904-8f78-80f17ed8efc7	\N	 Test Patient 8 	1982-03-15	Male	1225557690	test8@example.com	\N	No known allergies	2025-04-25 17:17:00.670008+05:30	2025-04-25 17:17:00.670008+05:30
da705ff4-d23b-44d1-ad66-91ac58861493	\N	 Test Patient 8 	1982-03-15	Male	1225557690	test8@example.com	\N	No known allergies	2025-04-25 17:19:02.710727+05:30	2025-04-25 17:19:02.710727+05:30
4070da75-fa9a-43a8-a1a6-620dd7026c21	\N	 Test Patient 8 	1982-03-15	Male	1225557690	test8@example.com	\N	No known allergies	2025-04-25 17:20:01.94995+05:30	2025-04-25 17:20:01.94995+05:30
b29e8a4b-629f-4215-8e0b-29bc324c3478	\N	 Test Patient 8 	1982-03-15	Male	1225557690	test8@example.com	\N	No known allergies	2025-04-25 17:23:07.600277+05:30	2025-04-25 17:23:07.600277+05:30
05c95149-d61d-43a8-9b61-65074688e813	\N	 Test Patient 8 	1982-03-15	Male	1225557690	test8@example.com	\N	No known allergies	2025-04-25 17:23:12.984118+05:30	2025-04-25 17:23:12.984118+05:30
440589ee-fb9c-4b4b-bda5-a7c6d7f37820	6d165e14-6b99-47e2-a8cf-1bf50e561c9b	Test	1980-01-01	Male	\N	\N	\N	\N	2025-04-25 17:24:22.909013+05:30	2025-04-25 17:24:22.909013+05:30
beb1be3f-f1ef-4ede-9d7b-d347df24942a	\N	 Test Patient 8 	1982-03-15	Male	1225557690	test8@example.com	\N	No known allergies	2025-04-25 17:25:09.029522+05:30	2025-04-25 17:25:09.029522+05:30
77fab9bd-2d70-4901-ad2c-7fed2f0598d7	\N	Test	1980-01-01	Male	\N	\N	\N	\N	2025-04-25 17:25:13.972677+05:30	2025-04-25 17:25:13.972677+05:30
f41c5270-4b3c-46fc-a850-5909841bc0fb	\N	 Test Patient 8 	1982-03-15	Male	1225557690	test8@example.com	\N	No known allergies	2025-04-25 17:28:04.725344+05:30	2025-04-25 17:28:04.725344+05:30
19d93b05-5991-4343-b053-0a9b9402a385	6d165e14-6b99-47e2-a8cf-1bf50e561c9b	 Test Patient 8 	1982-03-15	Male	1225557690	test8@example.com	\N	No known allergies	2025-04-25 17:29:31.883176+05:30	2025-04-25 17:29:31.883176+05:30
6ea30785-4691-4ccf-ad4e-81b62c2018bd	6d165e14-6b99-47e2-a8cf-1bf50e561c9b	 Test Patient 8 	1982-03-15	Male	1225557690	test8@example.com	\N	No known allergies	2025-04-26 05:08:30.416169+05:30	2025-04-26 05:08:30.416169+05:30
62d24c15-4aaa-4a9d-8917-de6912c4443a	6d165e14-6b99-47e2-a8cf-1bf50e561c9b	 Test Patient 8 	1982-03-15	Male	1225557690	test8@example.com	\N	No known allergies	2025-04-26 15:20:25.557094+05:30	2025-04-26 15:20:25.557094+05:30
818fe991-a1a5-4c25-9151-45abdd555040	6d165e14-6b99-47e2-a8cf-1bf50e561c9b	Test Patient	1990-01-01	Male	1234567890	test@example.com	\N	No known allergies	2025-04-26 17:31:21.145393+05:30	2025-04-26 17:31:21.145393+05:30
2d29a093-8b80-490c-847c-5dc34964eef6	6d165e14-6b99-47e2-a8cf-1bf50e561c9b	Test Patient1	1990-01-01	Male	1234667890	test@example.com	\N	No known allergies	2025-04-26 18:16:58.012169+05:30	2025-04-26 18:16:58.012169+05:30
3fe1b4fe-8b1b-42d7-9ffb-f3eedc8c04bb	6d165e14-6b99-47e2-a8cf-1bf50e561c9b	Test Patient1	1990-01-01	Male	1234667890	test@example.com	\N	No known allergies	2025-04-26 19:13:25.218537+05:30	2025-04-26 19:13:25.218537+05:30
31d78509-030d-492c-80c4-c99fb1dccb71	6d165e14-6b99-47e2-a8cf-1bf50e561c9b	Test Patient1	1990-01-01	Male	1234667890	test@example.com	\N	No known allergies	2025-04-26 19:53:35.460701+05:30	2025-04-26 19:53:35.460701+05:30
a0034124-516a-412c-9e99-a08d0522ae72	6d165e14-6b99-47e2-a8cf-1bf50e561c9b	Ramesh	2011-11-09	Male	8732949238	ramesh@gmail.com	\N	No known Allergies 	2025-04-26 19:54:34.133872+05:30	2025-04-26 19:54:34.133872+05:30
ca462492-ad80-4978-8ab3-71045b26b374	6d165e14-6b99-47e2-a8cf-1bf50e561c9b	Ramesh 2	2016-06-07	Male	8764475678	ramesh@gmail.com	\N	No known allergies	2025-04-27 22:37:40.212122+05:30	2025-04-27 22:37:40.212122+05:30
276eb249-39c7-4a75-bdec-b1397b4631c8	6d165e14-6b99-47e2-a8cf-1bf50e561c9b	Test Patient1	1990-01-01	Male	1234667890	test@example.com	\N	No known allergies	2025-04-27 22:39:30.323181+05:30	2025-04-27 22:39:30.323181+05:30
50f73d9b-e1fb-438a-8cec-a0bf79d8c043	6d165e14-6b99-47e2-a8cf-1bf50e561c9b	Suresh	2002-02-05	Male	8732949288	suresh@gmail.com	\N	No known allergies 	2025-04-27 23:58:35.979828+05:30	2025-04-27 23:58:35.979828+05:30
81bdc765-efae-48d9-862d-1a602750f9f2	6d165e14-6b99-47e2-a8cf-1bf50e561c9b	Suresh 2	2002-07-10	Male	8732949238	suresh@gmail.com	\N	No known allergies	2025-04-28 05:25:04.502727+05:30	2025-04-28 05:25:04.502727+05:30
93c30358-98f1-4dd5-8c80-2a8b05b947a0	6d165e14-6b99-47e2-a8cf-1bf50e561c9b	Suresh 3	1998-11-24	Male	8764475678	suresh3@gmail.com	\N	No known allergies	2025-04-28 23:42:07.768125+05:30	2025-04-28 23:42:07.768125+05:30
db1e5576-d281-4105-af48-1c217dfb92b9	6d165e14-6b99-47e2-a8cf-1bf50e561c9b	Aisha	2010-10-20	Female	8732949266	aisha@gmail.com	\N	No known Allergies 	2025-04-29 02:29:37.646141+05:30	2025-04-29 02:29:37.646141+05:30
19389224-bc39-42e9-a334-e0d8295e33ef	6d165e14-6b99-47e2-a8cf-1bf50e561c9b	Test Patient1	1990-01-01	Male	1234667890	test@example.com	\N	No known allergies	2025-04-29 12:53:44.495851+05:30	2025-04-29 12:53:44.495851+05:30
4291cf8b-6479-4dd8-a0ed-0db2db18fb22	6d165e14-6b99-47e2-a8cf-1bf50e561c9b	Aisha 2	2014-05-14	Male	8764475678	aisha@gmail.com	\N	No known allergies	2025-04-29 12:54:26.945313+05:30	2025-04-29 12:54:26.945313+05:30
d02ff114-f3aa-4f2e-b125-f2df6cfe7726	6d165e14-6b99-47e2-a8cf-1bf50e561c9b	Kavana Gowda	2025-05-10	Female	8764475678	ramesh@gmail.com	\N	No medical history	2025-05-03 12:32:48.765343+05:30	2025-05-03 12:32:48.765343+05:30
003c01ca-1529-4ffc-8bd8-6e8cbb122ce3	6d165e14-6b99-47e2-a8cf-1bf50e561c9b	Shravani	2024-02-06	Female	8732949238	ramesh@gmail.com	\N	No known allergies	2025-05-03 12:56:37.176798+05:30	2025-05-03 12:56:37.176798+05:30
99e88711-cf4c-4bcf-9d57-d70b422d9d99	6d165e14-6b99-47e2-a8cf-1bf50e561c9b	Alex	2016-06-07	Male	8732949238	alex@gmail.com	\N	no known allergies	2025-05-28 17:33:20.547125+05:30	2025-05-28 17:33:20.547125+05:30
\.


--
-- Name: doctors doctors_email_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.doctors
    ADD CONSTRAINT doctors_email_key UNIQUE (email);


--
-- Name: doctors doctors_license_number_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.doctors
    ADD CONSTRAINT doctors_license_number_key UNIQUE (license_number);


--
-- Name: doctors doctors_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.doctors
    ADD CONSTRAINT doctors_pkey PRIMARY KEY (id);


--
-- Name: patch_test_images patch_test_images_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.patch_test_images
    ADD CONSTRAINT patch_test_images_pkey PRIMARY KEY (id);


--
-- Name: patch_tests patch_tests_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.patch_tests
    ADD CONSTRAINT patch_tests_pkey PRIMARY KEY (id);


--
-- Name: patients patients_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.patients
    ADD CONSTRAINT patients_pkey PRIMARY KEY (id);


--
-- Name: idx_patch_test_images_patch_test_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_patch_test_images_patch_test_id ON public.patch_test_images USING btree (patch_test_id);


--
-- Name: idx_patch_tests_patient_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_patch_tests_patient_id ON public.patch_tests USING btree (patient_id);


--
-- Name: idx_patients_doctor_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_patients_doctor_id ON public.patients USING btree (doctor_id);


--
-- Name: patch_test_images patch_test_images_patch_test_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.patch_test_images
    ADD CONSTRAINT patch_test_images_patch_test_id_fkey FOREIGN KEY (patch_test_id) REFERENCES public.patch_tests(id) ON DELETE CASCADE;


--
-- Name: patch_tests patch_tests_patient_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.patch_tests
    ADD CONSTRAINT patch_tests_patient_id_fkey FOREIGN KEY (patient_id) REFERENCES public.patients(id) ON DELETE CASCADE;


--
-- Name: patients patients_doctor_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.patients
    ADD CONSTRAINT patients_doctor_id_fkey FOREIGN KEY (doctor_id) REFERENCES public.doctors(id) ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

