--
-- PostgreSQL database dump
--

\restrict aO907JMPzKkIZuZtAd0DfYu68xPOXrXeAPsrwiSjMU93hGLm9xm72JG4kT3Hvkd

-- Dumped from database version 16.11 (Debian 16.11-1.pgdg13+1)
-- Dumped by pg_dump version 16.11 (Debian 16.11-1.pgdg13+1)

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

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: alembic_version; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.alembic_version (
    version_num character varying(64) NOT NULL
);


ALTER TABLE public.alembic_version OWNER TO postgres;

--
-- Name: app_settings; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.app_settings (
    id integer NOT NULL,
    exam_time_limit_minutes integer NOT NULL,
    exam_question_count integer DEFAULT 50 NOT NULL
);


ALTER TABLE public.app_settings OWNER TO postgres;

--
-- Name: app_settings_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.app_settings_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.app_settings_id_seq OWNER TO postgres;

--
-- Name: app_settings_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.app_settings_id_seq OWNED BY public.app_settings.id;


--
-- Name: audit_logs; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.audit_logs (
    id integer NOT NULL,
    user_id integer,
    action character varying NOT NULL,
    detail character varying NOT NULL,
    created_at timestamp without time zone NOT NULL
);


ALTER TABLE public.audit_logs OWNER TO postgres;

--
-- Name: audit_logs_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.audit_logs_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.audit_logs_id_seq OWNER TO postgres;

--
-- Name: audit_logs_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.audit_logs_id_seq OWNED BY public.audit_logs.id;


--
-- Name: exam_results; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.exam_results (
    id integer NOT NULL,
    user_id integer NOT NULL,
    exam_type character varying NOT NULL,
    score integer NOT NULL,
    total integer NOT NULL,
    percentage double precision NOT NULL,
    result character varying NOT NULL,
    subject_performance json NOT NULL,
    incorrect_questions json NOT NULL,
    created_at timestamp without time zone NOT NULL
);


ALTER TABLE public.exam_results OWNER TO postgres;

--
-- Name: exam_results_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.exam_results_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.exam_results_id_seq OWNER TO postgres;

--
-- Name: exam_results_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.exam_results_id_seq OWNED BY public.exam_results.id;


--
-- Name: instructor_profiles; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.instructor_profiles (
    id integer NOT NULL,
    user_id integer NOT NULL,
    employee_id character varying NOT NULL,
    name character varying NOT NULL,
    department character varying NOT NULL,
    "position" character varying NOT NULL,
    program character varying NOT NULL,
    updated_at timestamp without time zone NOT NULL
);


ALTER TABLE public.instructor_profiles OWNER TO postgres;

--
-- Name: instructor_profiles_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.instructor_profiles_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.instructor_profiles_id_seq OWNER TO postgres;

--
-- Name: instructor_profiles_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.instructor_profiles_id_seq OWNED BY public.instructor_profiles.id;


--
-- Name: questions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.questions (
    id integer NOT NULL,
    exam_type character varying NOT NULL,
    subject character varying NOT NULL,
    topic character varying NOT NULL,
    difficulty character varying NOT NULL,
    question character varying NOT NULL,
    a character varying NOT NULL,
    b character varying NOT NULL,
    c character varying NOT NULL,
    d character varying NOT NULL,
    answer character varying NOT NULL
);


ALTER TABLE public.questions OWNER TO postgres;

--
-- Name: questions_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.questions_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.questions_id_seq OWNER TO postgres;

--
-- Name: questions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.questions_id_seq OWNED BY public.questions.id;


--
-- Name: student_profiles; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.student_profiles (
    id integer NOT NULL,
    user_id integer NOT NULL,
    student_id character varying NOT NULL,
    name character varying NOT NULL,
    course character varying NOT NULL,
    exam_type character varying NOT NULL,
    let_track character varying,
    let_major character varying,
    updated_at timestamp without time zone NOT NULL
);


ALTER TABLE public.student_profiles OWNER TO postgres;

--
-- Name: student_profiles_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.student_profiles_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.student_profiles_id_seq OWNER TO postgres;

--
-- Name: student_profiles_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.student_profiles_id_seq OWNED BY public.student_profiles.id;


--
-- Name: users; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.users (
    id integer NOT NULL,
    email character varying NOT NULL,
    password_hash character varying NOT NULL,
    role character varying NOT NULL,
    created_at timestamp without time zone NOT NULL,
    active boolean DEFAULT true NOT NULL,
    must_change_password boolean DEFAULT false NOT NULL,
    temp_password_expires_at timestamp without time zone,
    failed_login_attempts integer DEFAULT 0 NOT NULL,
    is_locked boolean DEFAULT false NOT NULL
);


ALTER TABLE public.users OWNER TO postgres;

--
-- Name: users_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.users_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.users_id_seq OWNER TO postgres;

--
-- Name: users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;


--
-- Name: app_settings id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.app_settings ALTER COLUMN id SET DEFAULT nextval('public.app_settings_id_seq'::regclass);


--
-- Name: audit_logs id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.audit_logs ALTER COLUMN id SET DEFAULT nextval('public.audit_logs_id_seq'::regclass);


--
-- Name: exam_results id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.exam_results ALTER COLUMN id SET DEFAULT nextval('public.exam_results_id_seq'::regclass);


--
-- Name: instructor_profiles id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.instructor_profiles ALTER COLUMN id SET DEFAULT nextval('public.instructor_profiles_id_seq'::regclass);


--
-- Name: questions id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.questions ALTER COLUMN id SET DEFAULT nextval('public.questions_id_seq'::regclass);


--
-- Name: student_profiles id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.student_profiles ALTER COLUMN id SET DEFAULT nextval('public.student_profiles_id_seq'::regclass);


--
-- Name: users id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);


--
-- Data for Name: alembic_version; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.alembic_version (version_num) FROM stdin;
20260111_add_login_lockout_fields
\.


--
-- Data for Name: app_settings; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.app_settings (id, exam_time_limit_minutes, exam_question_count) FROM stdin;
1	60	50
\.


--
-- Data for Name: audit_logs; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.audit_logs (id, user_id, action, detail, created_at) FROM stdin;
5	\N	user_delete	Deleted user admin@gmail.com	2026-01-09 22:04:49.738606
6	2	login	User logged in	2026-01-09 22:09:39.21857
7	2	login	User logged in	2026-01-10 00:11:48.127942
8	6	register	Registered as student	2026-01-10 00:13:00.275285
9	6	login	User logged in	2026-01-10 00:13:13.233558
10	6	profile_save	Student profile saved	2026-01-10 00:13:48.440292
11	6	exam_submit	Score 7/50 (14.0%)	2026-01-10 00:15:40.513559
12	7	register	Registered as admin	2026-01-10 00:17:13.910418
13	7	login	User logged in	2026-01-10 00:17:27.978337
14	7	login	User logged in	2026-01-10 00:22:59.92554
15	\N	settings_update	Exam timer set to 60 minutes; exam questions set to 200	2026-01-10 00:30:48.625693
16	\N	settings_update	Exam timer set to 60 minutes; exam questions set to 200	2026-01-10 00:37:41.149149
17	\N	settings_update	Exam timer set to 60 minutes; exam questions set to 50	2026-01-10 00:38:38.38559
18	7	login	User logged in	2026-01-10 03:04:09.352463
19	2	login	User logged in	2026-01-10 03:04:33.20599
20	2	exam_submit	Score 24/50 (48.0%)	2026-01-10 03:24:24.8064
21	2	profile_save	Student profile saved	2026-01-10 03:41:01.9177
22	2	profile_save	Student profile saved	2026-01-10 03:54:07.491541
23	2	profile_save	Student profile saved	2026-01-10 04:28:41.953163
24	2	login	User logged in	2026-01-10 05:11:27.068318
25	7	login	User logged in	2026-01-10 05:11:58.361662
26	2	profile_save	Student profile saved	2026-01-10 05:50:42.900212
27	2	profile_save	Student profile saved	2026-01-10 05:55:39.346312
28	2	profile_save	Student profile saved	2026-01-10 06:27:56.904938
29	7	login	User logged in	2026-01-11 10:47:24.586216
30	2	login	User logged in	2026-01-11 10:48:12.640497
31	7	login	User logged in	2026-01-11 10:50:56.647115
32	1	login	User logged in	2026-01-11 10:51:26.729481
33	7	login	User logged in	2026-01-11 11:03:06.37845
39	\N	user_delete	Deleted user mycai@gmail.com	2026-01-11 11:21:05.454149
41	2	login	User logged in	2026-01-11 11:43:01.474977
44	\N	user_delete	Deleted user irene@gmail.com	2026-01-11 11:49:14.859071
46	\N	user_delete	Deleted user bea@gmail.com	2026-01-11 11:49:29.981529
51	\N	user_delete	Deleted user irene@gmail.com	2026-01-11 11:56:19.6173
56	\N	user_delete	Deleted user irene@gmail.com	2026-01-11 12:16:08.129452
60	\N	user_delete	Deleted user irene@gmail.com	2026-01-11 12:17:52.231593
61	7	login	User logged in	2026-01-11 12:18:50.652967
68	\N	user_delete	Deleted user irene@gmail.com	2026-01-11 12:39:59.860406
76	\N	user_delete	Deleted user irene@gmail.com	2026-01-11 12:44:15.559101
77	15	register	Registered as instructor	2026-01-11 12:45:25.309677
78	15	login	User logged in	2026-01-11 12:45:35.06656
79	15	access_request	Requested access (instructor)	2026-01-11 12:45:35.246162
80	15	access_request	Requested access (instructor)	2026-01-11 12:45:35.29202
81	15	access_request	Requested access (instructor)	2026-01-11 12:45:54.660063
82	15	access_approved	Access approved	2026-01-11 12:50:22.747721
83	2	access_approved	Access approved	2026-01-11 12:50:33.70258
84	2	login	User logged in	2026-01-11 12:51:10.101893
85	2	profile_save	Student profile saved	2026-01-11 13:01:21.594297
86	2	access_request	Profile updated: Exam Type: LET -> CPA; LET Track: Elementary -> -	2026-01-11 13:01:21.656274
87	2	access_denied	Access denied	2026-01-11 13:01:49.030512
88	6	access_approved	Access approved	2026-01-11 13:05:55.466249
89	15	access_approved	Access approved	2026-01-11 13:06:00.840986
90	15	access_approved	Access approved	2026-01-11 13:06:07.955419
91	15	login	User logged in	2026-01-11 13:06:35.87124
92	15	access_approved	Access approved	2026-01-11 13:06:45.123307
93	15	access_approved	Access approved	2026-01-11 13:08:10.851391
94	2	access_approved	Access approved	2026-01-11 13:09:28.784619
95	2	login	User logged in	2026-01-11 13:10:23.702023
96	2	profile_save	Student profile saved	2026-01-11 13:10:33.312538
97	2	access_request	Profile updated with no field changes.	2026-01-11 13:10:33.427288
98	2	access_approved	Access approved	2026-01-11 13:10:39.423669
99	15	access_approved	Access approved	2026-01-11 13:11:26.787002
100	15	access_approved	Access approved	2026-01-11 13:12:20.978522
101	15	access_approved	Access approved	2026-01-11 13:12:21.086037
102	1	access_approved	Access approved	2026-01-11 13:13:53.256491
103	2	profile_save	Student profile saved	2026-01-11 13:14:00.855087
104	2	access_request	Profile updated: Exam Type: CPA -> LET; LET Track: - -> Elementary	2026-01-11 13:14:00.937681
105	2	access_approved	Access approved	2026-01-11 13:14:06.930579
106	7	login	User logged in	2026-01-11 22:12:45.571791
107	2	login	User logged in	2026-01-11 22:12:52.070339
108	7	login	User logged in	2026-01-11 23:22:06.550593
109	2	login	User logged in	2026-01-11 23:22:26.81888
110	2	login	User logged in	2026-01-12 00:04:09.931733
111	7	login	User logged in	2026-01-12 02:46:41.069626
112	3	password_reset_issued	Reset by dhang@gmail.com; expires 2026-01-12T03:25:46.511251	2026-01-12 03:10:46.54192
113	3	login	User logged in	2026-01-12 03:11:26.308487
114	3	password_change	Password updated	2026-01-12 03:11:53.86692
115	3	login	User logged in	2026-01-12 03:12:16.653371
116	3	password_reset_issued	Reset by dhang@gmail.com; expires 2026-01-12T03:35:17.677355	2026-01-12 03:20:17.705229
117	2	login	User logged in	2026-01-12 03:50:10.528957
118	7	login	User logged in	2026-01-12 03:50:25.747046
119	1	login	User logged in	2026-01-12 03:58:47.069258
120	1	access_request	New account: profile submitted.	2026-01-12 03:59:19.578798
121	7	login	User logged in	2026-01-12 04:00:18.584493
122	1	access_approved	Access approved	2026-01-12 04:00:24.473055
123	1	login	User logged in	2026-01-12 04:02:29.650095
124	1	access_request	New account: profile submitted.	2026-01-12 04:02:48.643704
125	1	access_approved	Access approved	2026-01-12 04:02:54.286613
126	1	login	User logged in	2026-01-12 04:03:19.805843
127	7	login	User logged in	2026-01-12 04:29:47.841568
\.


--
-- Data for Name: exam_results; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.exam_results (id, user_id, exam_type, score, total, percentage, result, subject_performance, incorrect_questions, created_at) FROM stdin;
1	2	LET	30	50	60	PASS	{"GenEd": {"correct": 18, "total": 28}, "Professional Ed": {"correct": 12, "total": 22}}	[{"id": 3, "subject": "GenEd", "topic": "Science", "difficulty": "Hard", "question": "Which layer of the Earth is liquid?", "correct_answer": "C", "student_answer": "D", "reference": "Review: Science"}, {"id": 72, "subject": "GenEd", "topic": "Science", "difficulty": "Medium", "question": "What gas do humans inhale for respiration?", "correct_answer": "B", "student_answer": "A", "reference": "Review: Science"}, {"id": 76, "subject": "GenEd", "topic": "Math", "difficulty": "Medium", "question": "What is x if 5x = 45?", "correct_answer": "C", "student_answer": "B", "reference": "Review: Math"}, {"id": 81, "subject": "GenEd", "topic": "Math", "difficulty": "Medium", "question": "What is x if 5x = 45?", "correct_answer": "C", "student_answer": "B", "reference": "Review: Math"}, {"id": 115, "subject": "GenEd", "topic": "Civics", "difficulty": "Hard", "question": "Which article of the 1987 Constitution focuses on education?", "correct_answer": "C", "student_answer": "B", "reference": "Review: Civics"}, {"id": 116, "subject": "GenEd", "topic": "Math", "difficulty": "Hard", "question": "What is the sum of the interior angles of an octagon?", "correct_answer": "C", "student_answer": "B", "reference": "Review: Math"}, {"id": 122, "subject": "GenEd", "topic": "Science", "difficulty": "Hard", "question": "Which body system maintains homeostasis?", "correct_answer": "B", "student_answer": "C", "reference": "Review: Science"}, {"id": 134, "subject": "GenEd", "topic": "Grammar", "difficulty": "Hard", "question": "Which sentence uses correct subject-verb agreement?", "correct_answer": "B", "student_answer": "A", "reference": "Review: Grammar"}, {"id": 142, "subject": "GenEd", "topic": "Science", "difficulty": "Hard", "question": "Which body system maintains homeostasis?", "correct_answer": "B", "student_answer": "A", "reference": "Review: Science"}, {"id": 152, "subject": "GenEd", "topic": "Science", "difficulty": "Hard", "question": "Which body system maintains homeostasis?", "correct_answer": "B", "student_answer": "A", "reference": "Review: Science"}, {"id": 166, "subject": "GenEd", "topic": "Professional Education - Assessment", "difficulty": "Easy", "question": "Which assessment is given before instruction?", "correct_answer": "C", "student_answer": "B", "reference": "Review: Professional Education - Assessment"}, {"id": 207, "subject": "GenEd", "topic": "Professional Education - Curriculum", "difficulty": "Easy", "question": "Who is known for the objectives-centered curriculum?", "correct_answer": "B", "student_answer": "A", "reference": "Review: Professional Education - Curriculum"}, {"id": 209, "subject": "GenEd", "topic": "Professional Education - Classroom Management", "difficulty": "Easy", "question": "Which helps maintain discipline in class?", "correct_answer": "A", "student_answer": "C", "reference": "Review: Professional Education - Classroom Management"}, {"id": 217, "subject": "GenEd", "topic": "Professional Education - Educational Psychology", "difficulty": "Medium", "question": "Which domain involves skills and movement?", "correct_answer": "C", "student_answer": "A", "reference": "Review: Professional Education - Educational Psychology"}, {"id": 234, "subject": "GenEd", "topic": "Professional Education - Assessment", "difficulty": "Medium", "question": "Which assessment checks learning after instruction?", "correct_answer": "C", "student_answer": "A", "reference": "Review: Professional Education - Assessment"}, {"id": 239, "subject": "GenEd", "topic": "Professional Education - Assessment", "difficulty": "Medium", "question": "Which assessment checks learning after instruction?", "correct_answer": "C", "student_answer": "B", "reference": "Review: Professional Education - Assessment"}, {"id": 292, "subject": "GenEd", "topic": "Professional Education - Learning Theories", "difficulty": "Hard", "question": "Which theorist introduced the zone of proximal development?", "correct_answer": "B", "student_answer": "A", "reference": "Review: Professional Education - Learning Theories"}, {"id": 294, "subject": "GenEd", "topic": "Professional Education - Educational Research", "difficulty": "Hard", "question": "Which design determines cause-and-effect relationships?", "correct_answer": "C", "student_answer": "B", "reference": "Review: Professional Education - Educational Research"}, {"id": 304, "subject": "GenEd", "topic": "Professional Education - Educational Research", "difficulty": "Hard", "question": "Which design determines cause-and-effect relationships?", "correct_answer": "C", "student_answer": "B", "reference": "Review: Professional Education - Educational Research"}, {"id": 306, "subject": "GenEd", "topic": "Professional Education - Curriculum Development", "difficulty": "Hard", "question": "Who proposed the spiral curriculum?", "correct_answer": "B", "student_answer": "C", "reference": "Review: Professional Education - Curriculum Development"}]	2026-01-09 17:41:43.046928
2	6	LET	7	50	14	FAIL	{"GenEd": {"correct": 6, "total": 24}, "Professional Ed": {"correct": 1, "total": 26}}	[{"id": 18, "subject": "GenEd", "topic": "Reading", "difficulty": "Easy", "question": "What part of a paragraph introduces the main idea?", "correct_answer": "A", "student_answer": "D", "reference": "Review: Reading"}, {"id": 38, "subject": "GenEd", "topic": "Reading", "difficulty": "Easy", "question": "What part of a paragraph introduces the main idea?", "correct_answer": "A", "student_answer": "D", "reference": "Review: Reading"}, {"id": 39, "subject": "GenEd", "topic": "Grammar", "difficulty": "Easy", "question": "Which word is a noun?", "correct_answer": "C", "student_answer": "B", "reference": "Review: Grammar"}, {"id": 40, "subject": "GenEd", "topic": "Civics", "difficulty": "Easy", "question": "Who is the head of the executive branch of the Philippines?", "correct_answer": "B", "student_answer": "C", "reference": "Review: Civics"}, {"id": 46, "subject": "GenEd", "topic": "Math", "difficulty": "Easy", "question": "What is 15 + 25?", "correct_answer": "C", "student_answer": "B", "reference": "Review: Math"}, {"id": 56, "subject": "GenEd", "topic": "Math", "difficulty": "Easy", "question": "What is 15 + 25?", "correct_answer": "C", "student_answer": "B", "reference": "Review: Math"}, {"id": 57, "subject": "GenEd", "topic": "Science", "difficulty": "Easy", "question": "Which organ pumps blood throughout the body?", "correct_answer": "C", "student_answer": "A", "reference": "Review: Science"}, {"id": 63, "subject": "GenEd", "topic": "Reading", "difficulty": "Medium", "question": "What is the author's purpose in a persuasive text?", "correct_answer": "C", "student_answer": "A", "reference": "Review: Reading"}, {"id": 70, "subject": "GenEd", "topic": "Civics", "difficulty": "Medium", "question": "Which branch of government interprets the law?", "correct_answer": "C", "student_answer": "A", "reference": "Review: Civics"}, {"id": 74, "subject": "GenEd", "topic": "Grammar", "difficulty": "Medium", "question": "Which sentence is grammatically correct?", "correct_answer": "B", "student_answer": "A", "reference": "Review: Grammar"}, {"id": 84, "subject": "GenEd", "topic": "Grammar", "difficulty": "Medium", "question": "Which sentence is grammatically correct?", "correct_answer": "B", "student_answer": "D", "reference": "Review: Grammar"}, {"id": 86, "subject": "GenEd", "topic": "Math", "difficulty": "Medium", "question": "What is x if 5x = 45?", "correct_answer": "C", "student_answer": "A", "reference": "Review: Math"}, {"id": 108, "subject": "GenEd", "topic": "Reading", "difficulty": "Medium", "question": "What is the author's purpose in a persuasive text?", "correct_answer": "C", "student_answer": "B", "reference": "Review: Reading"}, {"id": 109, "subject": "GenEd", "topic": "Grammar", "difficulty": "Medium", "question": "Which sentence is grammatically correct?", "correct_answer": "B", "student_answer": "A", "reference": "Review: Grammar"}, {"id": 110, "subject": "GenEd", "topic": "Civics", "difficulty": "Medium", "question": "Which branch of government interprets the law?", "correct_answer": "C", "student_answer": "A", "reference": "Review: Civics"}, {"id": 113, "subject": "GenEd", "topic": "Reading", "difficulty": "Hard", "question": "Which statement best summarizes a text?", "correct_answer": "B", "student_answer": "C", "reference": "Review: Reading"}, {"id": 114, "subject": "GenEd", "topic": "Grammar", "difficulty": "Hard", "question": "Which sentence uses correct subject-verb agreement?", "correct_answer": "B", "student_answer": "C", "reference": "Review: Grammar"}, {"id": 146, "subject": "GenEd", "topic": "Math", "difficulty": "Hard", "question": "What is the sum of the interior angles of an octagon?", "correct_answer": "C", "student_answer": "A", "reference": "Review: Math"}, {"id": 168, "subject": "GenEd", "topic": "Professional Education - Principles of Teaching", "difficulty": "Easy", "question": "Which principle states that teaching should consider learners' differences?", "correct_answer": "B", "student_answer": "C", "reference": "Review: Professional Education - Principles of Teaching"}, {"id": 171, "subject": "GenEd", "topic": "Professional Education - Assessment", "difficulty": "Easy", "question": "Which assessment is given before instruction?", "correct_answer": "C", "student_answer": "A", "reference": "Review: Professional Education - Assessment"}, {"id": 172, "subject": "GenEd", "topic": "Professional Education - Curriculum", "difficulty": "Easy", "question": "Who is known for the objectives-centered curriculum?", "correct_answer": "B", "student_answer": "D", "reference": "Review: Professional Education - Curriculum"}, {"id": 173, "subject": "GenEd", "topic": "Professional Education - Principles of Teaching", "difficulty": "Easy", "question": "Which principle states that teaching should consider learners' differences?", "correct_answer": "B", "student_answer": "A", "reference": "Review: Professional Education - Principles of Teaching"}, {"id": 177, "subject": "GenEd", "topic": "Professional Education - Curriculum", "difficulty": "Easy", "question": "Who is known for the objectives-centered curriculum?", "correct_answer": "B", "student_answer": "D", "reference": "Review: Professional Education - Curriculum"}, {"id": 187, "subject": "GenEd", "topic": "Professional Education - Curriculum", "difficulty": "Easy", "question": "Who is known for the objectives-centered curriculum?", "correct_answer": "B", "student_answer": "C", "reference": "Review: Professional Education - Curriculum"}, {"id": 194, "subject": "GenEd", "topic": "Professional Education - Classroom Management", "difficulty": "Easy", "question": "Which helps maintain discipline in class?", "correct_answer": "A", "student_answer": "C", "reference": "Review: Professional Education - Classroom Management"}, {"id": 203, "subject": "GenEd", "topic": "Professional Education - Principles of Teaching", "difficulty": "Easy", "question": "Which principle states that teaching should consider learners' differences?", "correct_answer": "B", "student_answer": "C", "reference": "Review: Professional Education - Principles of Teaching"}, {"id": 205, "subject": "GenEd", "topic": "Professional Education - Learning Theories", "difficulty": "Easy", "question": "Who is associated with behaviorism?", "correct_answer": "C", "student_answer": "A", "reference": "Review: Professional Education - Learning Theories"}, {"id": 212, "subject": "GenEd", "topic": "Professional Education - Curriculum", "difficulty": "Easy", "question": "Who is known for the objectives-centered curriculum?", "correct_answer": "B", "student_answer": "C", "reference": "Review: Professional Education - Curriculum"}, {"id": 213, "subject": "GenEd", "topic": "Professional Education - Learning Theories", "difficulty": "Medium", "question": "Which theory emphasizes social interaction in learning?", "correct_answer": "C", "student_answer": "D", "reference": "Review: Professional Education - Learning Theories"}, {"id": 214, "subject": "GenEd", "topic": "Professional Education - Assessment", "difficulty": "Medium", "question": "Which assessment checks learning after instruction?", "correct_answer": "C", "student_answer": "B", "reference": "Review: Professional Education - Assessment"}, {"id": 224, "subject": "GenEd", "topic": "Professional Education - Assessment", "difficulty": "Medium", "question": "Which assessment checks learning after instruction?", "correct_answer": "C", "student_answer": "D", "reference": "Review: Professional Education - Assessment"}, {"id": 229, "subject": "GenEd", "topic": "Professional Education - Assessment", "difficulty": "Medium", "question": "Which assessment checks learning after instruction?", "correct_answer": "C", "student_answer": "D", "reference": "Review: Professional Education - Assessment"}, {"id": 237, "subject": "GenEd", "topic": "Professional Education - Educational Psychology", "difficulty": "Medium", "question": "Which domain involves skills and movement?", "correct_answer": "C", "student_answer": "A", "reference": "Review: Professional Education - Educational Psychology"}, {"id": 239, "subject": "GenEd", "topic": "Professional Education - Assessment", "difficulty": "Medium", "question": "Which assessment checks learning after instruction?", "correct_answer": "C", "student_answer": "B", "reference": "Review: Professional Education - Assessment"}, {"id": 240, "subject": "GenEd", "topic": "Professional Education - Classroom Management", "difficulty": "Medium", "question": "Which strategy promotes positive behavior?", "correct_answer": "B", "student_answer": "C", "reference": "Review: Professional Education - Classroom Management"}, {"id": 248, "subject": "GenEd", "topic": "Professional Education - Learning Theories", "difficulty": "Medium", "question": "Which theory emphasizes social interaction in learning?", "correct_answer": "C", "student_answer": "D", "reference": "Review: Professional Education - Learning Theories"}, {"id": 249, "subject": "GenEd", "topic": "Professional Education - Assessment", "difficulty": "Medium", "question": "Which assessment checks learning after instruction?", "correct_answer": "C", "student_answer": "A", "reference": "Review: Professional Education - Assessment"}, {"id": 260, "subject": "GenEd", "topic": "Professional Education - Classroom Management", "difficulty": "Medium", "question": "Which strategy promotes positive behavior?", "correct_answer": "B", "student_answer": "C", "reference": "Review: Professional Education - Classroom Management"}, {"id": 272, "subject": "GenEd", "topic": "Professional Education - Learning Theories", "difficulty": "Hard", "question": "Which theorist introduced the zone of proximal development?", "correct_answer": "B", "student_answer": "C", "reference": "Review: Professional Education - Learning Theories"}, {"id": 276, "subject": "GenEd", "topic": "Professional Education - Curriculum Development", "difficulty": "Hard", "question": "Who proposed the spiral curriculum?", "correct_answer": "B", "student_answer": "C", "reference": "Review: Professional Education - Curriculum Development"}, {"id": 289, "subject": "GenEd", "topic": "Professional Education - Educational Research", "difficulty": "Hard", "question": "Which design determines cause-and-effect relationships?", "correct_answer": "C", "student_answer": "A", "reference": "Review: Professional Education - Educational Research"}, {"id": 290, "subject": "GenEd", "topic": "Professional Education - Educational Laws and Ethics", "difficulty": "Hard", "question": "Which policy protects learners from abuse in schools?", "correct_answer": "B", "student_answer": "C", "reference": "Review: Professional Education - Educational Laws and Ethics"}, {"id": 300, "subject": "GenEd", "topic": "Professional Education - Educational Laws and Ethics", "difficulty": "Hard", "question": "Which policy protects learners from abuse in schools?", "correct_answer": "B", "student_answer": "D", "reference": "Review: Professional Education - Educational Laws and Ethics"}]	2026-01-10 00:15:40.370334
3	2	LET	24	50	48	FAIL	{"GenEd": {"correct": 13, "total": 21}, "Professional Ed": {"correct": 11, "total": 29}}	[{"id": 101, "subject": "GenEd", "topic": "Math", "difficulty": "Medium", "question": "What is x if 5x = 45?", "correct_answer": "C", "student_answer": "B", "reference": "Review: Math"}, {"id": 109, "subject": "GenEd", "topic": "Grammar", "difficulty": "Medium", "question": "Which sentence is grammatically correct?", "correct_answer": "B", "student_answer": "C", "reference": "Review: Grammar"}, {"id": 119, "subject": "GenEd", "topic": "Grammar", "difficulty": "Hard", "question": "Which sentence uses correct subject-verb agreement?", "correct_answer": "B", "student_answer": "C", "reference": "Review: Grammar"}, {"id": 122, "subject": "GenEd", "topic": "Science", "difficulty": "Hard", "question": "Which body system maintains homeostasis?", "correct_answer": "B", "student_answer": "A", "reference": "Review: Science"}, {"id": 127, "subject": "GenEd", "topic": "Science", "difficulty": "Hard", "question": "Which body system maintains homeostasis?", "correct_answer": "B", "student_answer": "C", "reference": "Review: Science"}, {"id": 141, "subject": "GenEd", "topic": "Math", "difficulty": "Hard", "question": "What is the sum of the interior angles of an octagon?", "correct_answer": "C", "student_answer": "B", "reference": "Review: Math"}, {"id": 146, "subject": "GenEd", "topic": "Math", "difficulty": "Hard", "question": "What is the sum of the interior angles of an octagon?", "correct_answer": "C", "student_answer": "B", "reference": "Review: Math"}, {"id": 159, "subject": "GenEd", "topic": "Grammar", "difficulty": "Hard", "question": "Which sentence uses correct subject-verb agreement?", "correct_answer": "B", "student_answer": "A", "reference": "Review: Grammar"}, {"id": 167, "subject": "GenEd", "topic": "Professional Education - Curriculum", "difficulty": "Easy", "question": "Who is known for the objectives-centered curriculum?", "correct_answer": "B", "student_answer": "A", "reference": "Review: Professional Education - Curriculum"}, {"id": 172, "subject": "GenEd", "topic": "Professional Education - Curriculum", "difficulty": "Easy", "question": "Who is known for the objectives-centered curriculum?", "correct_answer": "B", "student_answer": "A", "reference": "Review: Professional Education - Curriculum"}, {"id": 178, "subject": "GenEd", "topic": "Professional Education - Principles of Teaching", "difficulty": "Easy", "question": "Which principle states that teaching should consider learners' differences?", "correct_answer": "B", "student_answer": "D", "reference": "Review: Professional Education - Principles of Teaching"}, {"id": 186, "subject": "GenEd", "topic": "Professional Education - Assessment", "difficulty": "Easy", "question": "Which assessment is given before instruction?", "correct_answer": "C", "student_answer": "A", "reference": "Review: Professional Education - Assessment"}, {"id": 205, "subject": "GenEd", "topic": "Professional Education - Learning Theories", "difficulty": "Easy", "question": "Who is associated with behaviorism?", "correct_answer": "C", "student_answer": "A", "reference": "Review: Professional Education - Learning Theories"}, {"id": 207, "subject": "GenEd", "topic": "Professional Education - Curriculum", "difficulty": "Easy", "question": "Who is known for the objectives-centered curriculum?", "correct_answer": "B", "student_answer": "A", "reference": "Review: Professional Education - Curriculum"}, {"id": 210, "subject": "GenEd", "topic": "Professional Education - Learning Theories", "difficulty": "Easy", "question": "Who is associated with behaviorism?", "correct_answer": "C", "student_answer": "D", "reference": "Review: Professional Education - Learning Theories"}, {"id": 211, "subject": "GenEd", "topic": "Professional Education - Assessment", "difficulty": "Easy", "question": "Which assessment is given before instruction?", "correct_answer": "C", "student_answer": "B", "reference": "Review: Professional Education - Assessment"}, {"id": 216, "subject": "GenEd", "topic": "Professional Education - Curriculum", "difficulty": "Medium", "question": "Which curriculum focuses on real-life problems?", "correct_answer": "B", "student_answer": "C", "reference": "Review: Professional Education - Curriculum"}, {"id": 218, "subject": "GenEd", "topic": "Professional Education - Learning Theories", "difficulty": "Medium", "question": "Which theory emphasizes social interaction in learning?", "correct_answer": "C", "student_answer": "B", "reference": "Review: Professional Education - Learning Theories"}, {"id": 226, "subject": "GenEd", "topic": "Professional Education - Curriculum", "difficulty": "Medium", "question": "Which curriculum focuses on real-life problems?", "correct_answer": "B", "student_answer": "C", "reference": "Review: Professional Education - Curriculum"}, {"id": 241, "subject": "GenEd", "topic": "Professional Education - Curriculum", "difficulty": "Medium", "question": "Which curriculum focuses on real-life problems?", "correct_answer": "B", "student_answer": "C", "reference": "Review: Professional Education - Curriculum"}, {"id": 255, "subject": "GenEd", "topic": "Professional Education - Classroom Management", "difficulty": "Medium", "question": "Which strategy promotes positive behavior?", "correct_answer": "B", "student_answer": "A", "reference": "Review: Professional Education - Classroom Management"}, {"id": 256, "subject": "GenEd", "topic": "Professional Education - Curriculum", "difficulty": "Medium", "question": "Which curriculum focuses on real-life problems?", "correct_answer": "B", "student_answer": "A", "reference": "Review: Professional Education - Curriculum"}, {"id": 289, "subject": "GenEd", "topic": "Professional Education - Educational Research", "difficulty": "Hard", "question": "Which design determines cause-and-effect relationships?", "correct_answer": "C", "student_answer": "B", "reference": "Review: Professional Education - Educational Research"}, {"id": 296, "subject": "GenEd", "topic": "Professional Education - Curriculum Development", "difficulty": "Hard", "question": "Who proposed the spiral curriculum?", "correct_answer": "B", "student_answer": "C", "reference": "Review: Professional Education - Curriculum Development"}, {"id": 303, "subject": "GenEd", "topic": "Professional Education - Assessment and Evaluation", "difficulty": "Hard", "question": "Which validity ensures test items match objectives?", "correct_answer": "B", "student_answer": "C", "reference": "Review: Professional Education - Assessment and Evaluation"}, {"id": 306, "subject": "GenEd", "topic": "Professional Education - Curriculum Development", "difficulty": "Hard", "question": "Who proposed the spiral curriculum?", "correct_answer": "B", "student_answer": "D", "reference": "Review: Professional Education - Curriculum Development"}]	2026-01-10 03:24:24.738163
\.


--
-- Data for Name: instructor_profiles; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.instructor_profiles (id, user_id, employee_id, name, department, "position", program, updated_at) FROM stdin;
\.


--
-- Data for Name: questions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.questions (id, exam_type, subject, topic, difficulty, question, a, b, c, d, answer) FROM stdin;
1	LET	GenEd	Reading	Easy	What is the main idea of a paragraph?	The supporting details	The topic sentence	The conclusion	The title	B
2	LET	GenEd	Math	Medium	What is the value of 3/4 + 1/8?	5/8	7/8	1	9/8	B
3	LET	GenEd	Science	Hard	Which layer of the Earth is liquid?	Inner core	Mantle	Outer core	Crust	C
4	LET	Mathematics	Algebra	Medium	What is x if 2x + 4 = 10?	2	3	4	5	B
5	LET	Science	Biology	Easy	Which organelle is the powerhouse of the cell?	Nucleus	Mitochondria	Ribosome	Golgi apparatus	B
6	LET	Social Studies	History	Medium	Who wrote the Philippine novel Noli Me Tangere?	Jose Rizal	Andres Bonifacio	Emilio Aguinaldo	Apolinario Mabini	A
7	LET	English	Grammar	Easy	Choose the correct verb: She ___ to the store yesterday.	go	goes	went	gone	C
8	LET	Filipino	Wika	Medium	Alin ang tamang baybay?	Tagumpay	Tagumpaey	Tagumpai	Tagumpae	A
9	LET	P.E	Fitness	Easy	Ilang minuto ang inirerekomendang moderate exercise kada linggo?	30	60	150	300	C
10	CPA	FAR	Assets	Hard	Which asset is measured at amortized cost?	Equity securities	Trading securities	Held-to-maturity investments	Derivatives	C
11	CPA	Taxation	VAT	Medium	What is the standard VAT rate in the Philippines?	8%	10%	12%	15%	C
12	CPA	Auditing	Opinion	Easy	Which opinion is issued when statements are free of material misstatement?	Qualified	Adverse	Disclaimer	Unmodified	D
13	LET	GenEd	Reading	Easy	What part of a paragraph introduces the main idea?	Topic sentence	Conclusion	Detail	Example	A
14	LET	GenEd	Grammar	Easy	Which word is a noun?	Run	Beautiful	Teacher	Quickly	C
15	LET	GenEd	Civics	Easy	Who is the head of the executive branch of the Philippines?	Chief Justice	President	Speaker	Senator	B
16	LET	GenEd	Math	Easy	What is 15 + 25?	30	35	40	45	C
17	LET	GenEd	Science	Easy	Which organ pumps blood throughout the body?	Lungs	Brain	Heart	Kidney	C
18	LET	GenEd	Reading	Easy	What part of a paragraph introduces the main idea?	Topic sentence	Conclusion	Detail	Example	A
19	LET	GenEd	Grammar	Easy	Which word is a noun?	Run	Beautiful	Teacher	Quickly	C
20	LET	GenEd	Civics	Easy	Who is the head of the executive branch of the Philippines?	Chief Justice	President	Speaker	Senator	B
21	LET	GenEd	Math	Easy	What is 15 + 25?	30	35	40	45	C
22	LET	GenEd	Science	Easy	Which organ pumps blood throughout the body?	Lungs	Brain	Heart	Kidney	C
23	LET	GenEd	Reading	Easy	What part of a paragraph introduces the main idea?	Topic sentence	Conclusion	Detail	Example	A
24	LET	GenEd	Grammar	Easy	Which word is a noun?	Run	Beautiful	Teacher	Quickly	C
25	LET	GenEd	Civics	Easy	Who is the head of the executive branch of the Philippines?	Chief Justice	President	Speaker	Senator	B
26	LET	GenEd	Math	Easy	What is 15 + 25?	30	35	40	45	C
27	LET	GenEd	Science	Easy	Which organ pumps blood throughout the body?	Lungs	Brain	Heart	Kidney	C
28	LET	GenEd	Reading	Easy	What part of a paragraph introduces the main idea?	Topic sentence	Conclusion	Detail	Example	A
29	LET	GenEd	Grammar	Easy	Which word is a noun?	Run	Beautiful	Teacher	Quickly	C
30	LET	GenEd	Civics	Easy	Who is the head of the executive branch of the Philippines?	Chief Justice	President	Speaker	Senator	B
31	LET	GenEd	Math	Easy	What is 15 + 25?	30	35	40	45	C
32	LET	GenEd	Science	Easy	Which organ pumps blood throughout the body?	Lungs	Brain	Heart	Kidney	C
33	LET	GenEd	Reading	Easy	What part of a paragraph introduces the main idea?	Topic sentence	Conclusion	Detail	Example	A
34	LET	GenEd	Grammar	Easy	Which word is a noun?	Run	Beautiful	Teacher	Quickly	C
35	LET	GenEd	Civics	Easy	Who is the head of the executive branch of the Philippines?	Chief Justice	President	Speaker	Senator	B
36	LET	GenEd	Math	Easy	What is 15 + 25?	30	35	40	45	C
37	LET	GenEd	Science	Easy	Which organ pumps blood throughout the body?	Lungs	Brain	Heart	Kidney	C
38	LET	GenEd	Reading	Easy	What part of a paragraph introduces the main idea?	Topic sentence	Conclusion	Detail	Example	A
39	LET	GenEd	Grammar	Easy	Which word is a noun?	Run	Beautiful	Teacher	Quickly	C
40	LET	GenEd	Civics	Easy	Who is the head of the executive branch of the Philippines?	Chief Justice	President	Speaker	Senator	B
41	LET	GenEd	Math	Easy	What is 15 + 25?	30	35	40	45	C
42	LET	GenEd	Science	Easy	Which organ pumps blood throughout the body?	Lungs	Brain	Heart	Kidney	C
43	LET	GenEd	Reading	Easy	What part of a paragraph introduces the main idea?	Topic sentence	Conclusion	Detail	Example	A
44	LET	GenEd	Grammar	Easy	Which word is a noun?	Run	Beautiful	Teacher	Quickly	C
45	LET	GenEd	Civics	Easy	Who is the head of the executive branch of the Philippines?	Chief Justice	President	Speaker	Senator	B
46	LET	GenEd	Math	Easy	What is 15 + 25?	30	35	40	45	C
47	LET	GenEd	Science	Easy	Which organ pumps blood throughout the body?	Lungs	Brain	Heart	Kidney	C
48	LET	GenEd	Reading	Easy	What part of a paragraph introduces the main idea?	Topic sentence	Conclusion	Detail	Example	A
49	LET	GenEd	Grammar	Easy	Which word is a noun?	Run	Beautiful	Teacher	Quickly	C
50	LET	GenEd	Civics	Easy	Who is the head of the executive branch of the Philippines?	Chief Justice	President	Speaker	Senator	B
51	LET	GenEd	Math	Easy	What is 15 + 25?	30	35	40	45	C
52	LET	GenEd	Science	Easy	Which organ pumps blood throughout the body?	Lungs	Brain	Heart	Kidney	C
53	LET	GenEd	Reading	Easy	What part of a paragraph introduces the main idea?	Topic sentence	Conclusion	Detail	Example	A
54	LET	GenEd	Grammar	Easy	Which word is a noun?	Run	Beautiful	Teacher	Quickly	C
55	LET	GenEd	Civics	Easy	Who is the head of the executive branch of the Philippines?	Chief Justice	President	Speaker	Senator	B
56	LET	GenEd	Math	Easy	What is 15 + 25?	30	35	40	45	C
57	LET	GenEd	Science	Easy	Which organ pumps blood throughout the body?	Lungs	Brain	Heart	Kidney	C
58	LET	GenEd	Reading	Easy	What part of a paragraph introduces the main idea?	Topic sentence	Conclusion	Detail	Example	A
59	LET	GenEd	Grammar	Easy	Which word is a noun?	Run	Beautiful	Teacher	Quickly	C
60	LET	GenEd	Civics	Easy	Who is the head of the executive branch of the Philippines?	Chief Justice	President	Speaker	Senator	B
61	LET	GenEd	Math	Easy	What is 15 + 25?	30	35	40	45	C
62	LET	GenEd	Science	Easy	Which organ pumps blood throughout the body?	Lungs	Brain	Heart	Kidney	C
63	LET	GenEd	Reading	Medium	What is the author's purpose in a persuasive text?	To inform	To entertain	To persuade	To narrate	C
64	LET	GenEd	Grammar	Medium	Which sentence is grammatically correct?	She don't like coffee.	She doesn't like coffee.	She didn't likes coffee.	She don't likes coffee.	B
65	LET	GenEd	Civics	Medium	Which branch of government interprets the law?	Executive	Legislative	Judicial	Barangay	C
66	LET	GenEd	Math	Medium	What is x if 5x = 45?	7	8	9	10	C
67	LET	GenEd	Science	Medium	What gas do humans inhale for respiration?	Carbon dioxide	Oxygen	Nitrogen	Hydrogen	B
68	LET	GenEd	Reading	Medium	What is the author's purpose in a persuasive text?	To inform	To entertain	To persuade	To narrate	C
69	LET	GenEd	Grammar	Medium	Which sentence is grammatically correct?	She don't like coffee.	She doesn't like coffee.	She didn't likes coffee.	She don't likes coffee.	B
70	LET	GenEd	Civics	Medium	Which branch of government interprets the law?	Executive	Legislative	Judicial	Barangay	C
71	LET	GenEd	Math	Medium	What is x if 5x = 45?	7	8	9	10	C
72	LET	GenEd	Science	Medium	What gas do humans inhale for respiration?	Carbon dioxide	Oxygen	Nitrogen	Hydrogen	B
73	LET	GenEd	Reading	Medium	What is the author's purpose in a persuasive text?	To inform	To entertain	To persuade	To narrate	C
74	LET	GenEd	Grammar	Medium	Which sentence is grammatically correct?	She don't like coffee.	She doesn't like coffee.	She didn't likes coffee.	She don't likes coffee.	B
75	LET	GenEd	Civics	Medium	Which branch of government interprets the law?	Executive	Legislative	Judicial	Barangay	C
76	LET	GenEd	Math	Medium	What is x if 5x = 45?	7	8	9	10	C
77	LET	GenEd	Science	Medium	What gas do humans inhale for respiration?	Carbon dioxide	Oxygen	Nitrogen	Hydrogen	B
78	LET	GenEd	Reading	Medium	What is the author's purpose in a persuasive text?	To inform	To entertain	To persuade	To narrate	C
79	LET	GenEd	Grammar	Medium	Which sentence is grammatically correct?	She don't like coffee.	She doesn't like coffee.	She didn't likes coffee.	She don't likes coffee.	B
80	LET	GenEd	Civics	Medium	Which branch of government interprets the law?	Executive	Legislative	Judicial	Barangay	C
81	LET	GenEd	Math	Medium	What is x if 5x = 45?	7	8	9	10	C
82	LET	GenEd	Science	Medium	What gas do humans inhale for respiration?	Carbon dioxide	Oxygen	Nitrogen	Hydrogen	B
83	LET	GenEd	Reading	Medium	What is the author's purpose in a persuasive text?	To inform	To entertain	To persuade	To narrate	C
84	LET	GenEd	Grammar	Medium	Which sentence is grammatically correct?	She don't like coffee.	She doesn't like coffee.	She didn't likes coffee.	She don't likes coffee.	B
85	LET	GenEd	Civics	Medium	Which branch of government interprets the law?	Executive	Legislative	Judicial	Barangay	C
86	LET	GenEd	Math	Medium	What is x if 5x = 45?	7	8	9	10	C
87	LET	GenEd	Science	Medium	What gas do humans inhale for respiration?	Carbon dioxide	Oxygen	Nitrogen	Hydrogen	B
88	LET	GenEd	Reading	Medium	What is the author's purpose in a persuasive text?	To inform	To entertain	To persuade	To narrate	C
89	LET	GenEd	Grammar	Medium	Which sentence is grammatically correct?	She don't like coffee.	She doesn't like coffee.	She didn't likes coffee.	She don't likes coffee.	B
90	LET	GenEd	Civics	Medium	Which branch of government interprets the law?	Executive	Legislative	Judicial	Barangay	C
91	LET	GenEd	Math	Medium	What is x if 5x = 45?	7	8	9	10	C
92	LET	GenEd	Science	Medium	What gas do humans inhale for respiration?	Carbon dioxide	Oxygen	Nitrogen	Hydrogen	B
93	LET	GenEd	Reading	Medium	What is the author's purpose in a persuasive text?	To inform	To entertain	To persuade	To narrate	C
94	LET	GenEd	Grammar	Medium	Which sentence is grammatically correct?	She don't like coffee.	She doesn't like coffee.	She didn't likes coffee.	She don't likes coffee.	B
95	LET	GenEd	Civics	Medium	Which branch of government interprets the law?	Executive	Legislative	Judicial	Barangay	C
96	LET	GenEd	Math	Medium	What is x if 5x = 45?	7	8	9	10	C
97	LET	GenEd	Science	Medium	What gas do humans inhale for respiration?	Carbon dioxide	Oxygen	Nitrogen	Hydrogen	B
98	LET	GenEd	Reading	Medium	What is the author's purpose in a persuasive text?	To inform	To entertain	To persuade	To narrate	C
99	LET	GenEd	Grammar	Medium	Which sentence is grammatically correct?	She don't like coffee.	She doesn't like coffee.	She didn't likes coffee.	She don't likes coffee.	B
100	LET	GenEd	Civics	Medium	Which branch of government interprets the law?	Executive	Legislative	Judicial	Barangay	C
101	LET	GenEd	Math	Medium	What is x if 5x = 45?	7	8	9	10	C
102	LET	GenEd	Science	Medium	What gas do humans inhale for respiration?	Carbon dioxide	Oxygen	Nitrogen	Hydrogen	B
103	LET	GenEd	Reading	Medium	What is the author's purpose in a persuasive text?	To inform	To entertain	To persuade	To narrate	C
104	LET	GenEd	Grammar	Medium	Which sentence is grammatically correct?	She don't like coffee.	She doesn't like coffee.	She didn't likes coffee.	She don't likes coffee.	B
105	LET	GenEd	Civics	Medium	Which branch of government interprets the law?	Executive	Legislative	Judicial	Barangay	C
106	LET	GenEd	Math	Medium	What is x if 5x = 45?	7	8	9	10	C
107	LET	GenEd	Science	Medium	What gas do humans inhale for respiration?	Carbon dioxide	Oxygen	Nitrogen	Hydrogen	B
108	LET	GenEd	Reading	Medium	What is the author's purpose in a persuasive text?	To inform	To entertain	To persuade	To narrate	C
109	LET	GenEd	Grammar	Medium	Which sentence is grammatically correct?	She don't like coffee.	She doesn't like coffee.	She didn't likes coffee.	She don't likes coffee.	B
110	LET	GenEd	Civics	Medium	Which branch of government interprets the law?	Executive	Legislative	Judicial	Barangay	C
111	LET	GenEd	Math	Medium	What is x if 5x = 45?	7	8	9	10	C
112	LET	GenEd	Science	Medium	What gas do humans inhale for respiration?	Carbon dioxide	Oxygen	Nitrogen	Hydrogen	B
113	LET	GenEd	Reading	Hard	Which statement best summarizes a text?	A repeated detail	The central idea	A title	An example	B
114	LET	GenEd	Grammar	Hard	Which sentence uses correct subject-verb agreement?	The group of students are noisy.	The group of students is noisy.	The students group are noisy.	Students group is noisy.	B
115	LET	GenEd	Civics	Hard	Which article of the 1987 Constitution focuses on education?	Article II	Article XII	Article XIV	Article XV	C
116	LET	GenEd	Math	Hard	What is the sum of the interior angles of an octagon?	720°	900°	1080°	1440°	C
117	LET	GenEd	Science	Hard	Which body system maintains homeostasis?	Digestive	Endocrine	Respiratory	Skeletal	B
118	LET	GenEd	Reading	Hard	Which statement best summarizes a text?	A repeated detail	The central idea	A title	An example	B
119	LET	GenEd	Grammar	Hard	Which sentence uses correct subject-verb agreement?	The group of students are noisy.	The group of students is noisy.	The students group are noisy.	Students group is noisy.	B
120	LET	GenEd	Civics	Hard	Which article of the 1987 Constitution focuses on education?	Article II	Article XII	Article XIV	Article XV	C
121	LET	GenEd	Math	Hard	What is the sum of the interior angles of an octagon?	720°	900°	1080°	1440°	C
122	LET	GenEd	Science	Hard	Which body system maintains homeostasis?	Digestive	Endocrine	Respiratory	Skeletal	B
123	LET	GenEd	Reading	Hard	Which statement best summarizes a text?	A repeated detail	The central idea	A title	An example	B
124	LET	GenEd	Grammar	Hard	Which sentence uses correct subject-verb agreement?	The group of students are noisy.	The group of students is noisy.	The students group are noisy.	Students group is noisy.	B
125	LET	GenEd	Civics	Hard	Which article of the 1987 Constitution focuses on education?	Article II	Article XII	Article XIV	Article XV	C
126	LET	GenEd	Math	Hard	What is the sum of the interior angles of an octagon?	720°	900°	1080°	1440°	C
127	LET	GenEd	Science	Hard	Which body system maintains homeostasis?	Digestive	Endocrine	Respiratory	Skeletal	B
128	LET	GenEd	Reading	Hard	Which statement best summarizes a text?	A repeated detail	The central idea	A title	An example	B
129	LET	GenEd	Grammar	Hard	Which sentence uses correct subject-verb agreement?	The group of students are noisy.	The group of students is noisy.	The students group are noisy.	Students group is noisy.	B
130	LET	GenEd	Civics	Hard	Which article of the 1987 Constitution focuses on education?	Article II	Article XII	Article XIV	Article XV	C
131	LET	GenEd	Math	Hard	What is the sum of the interior angles of an octagon?	720°	900°	1080°	1440°	C
132	LET	GenEd	Science	Hard	Which body system maintains homeostasis?	Digestive	Endocrine	Respiratory	Skeletal	B
133	LET	GenEd	Reading	Hard	Which statement best summarizes a text?	A repeated detail	The central idea	A title	An example	B
134	LET	GenEd	Grammar	Hard	Which sentence uses correct subject-verb agreement?	The group of students are noisy.	The group of students is noisy.	The students group are noisy.	Students group is noisy.	B
135	LET	GenEd	Civics	Hard	Which article of the 1987 Constitution focuses on education?	Article II	Article XII	Article XIV	Article XV	C
136	LET	GenEd	Math	Hard	What is the sum of the interior angles of an octagon?	720°	900°	1080°	1440°	C
137	LET	GenEd	Science	Hard	Which body system maintains homeostasis?	Digestive	Endocrine	Respiratory	Skeletal	B
138	LET	GenEd	Reading	Hard	Which statement best summarizes a text?	A repeated detail	The central idea	A title	An example	B
139	LET	GenEd	Grammar	Hard	Which sentence uses correct subject-verb agreement?	The group of students are noisy.	The group of students is noisy.	The students group are noisy.	Students group is noisy.	B
140	LET	GenEd	Civics	Hard	Which article of the 1987 Constitution focuses on education?	Article II	Article XII	Article XIV	Article XV	C
141	LET	GenEd	Math	Hard	What is the sum of the interior angles of an octagon?	720°	900°	1080°	1440°	C
142	LET	GenEd	Science	Hard	Which body system maintains homeostasis?	Digestive	Endocrine	Respiratory	Skeletal	B
143	LET	GenEd	Reading	Hard	Which statement best summarizes a text?	A repeated detail	The central idea	A title	An example	B
144	LET	GenEd	Grammar	Hard	Which sentence uses correct subject-verb agreement?	The group of students are noisy.	The group of students is noisy.	The students group are noisy.	Students group is noisy.	B
145	LET	GenEd	Civics	Hard	Which article of the 1987 Constitution focuses on education?	Article II	Article XII	Article XIV	Article XV	C
146	LET	GenEd	Math	Hard	What is the sum of the interior angles of an octagon?	720°	900°	1080°	1440°	C
147	LET	GenEd	Science	Hard	Which body system maintains homeostasis?	Digestive	Endocrine	Respiratory	Skeletal	B
148	LET	GenEd	Reading	Hard	Which statement best summarizes a text?	A repeated detail	The central idea	A title	An example	B
149	LET	GenEd	Grammar	Hard	Which sentence uses correct subject-verb agreement?	The group of students are noisy.	The group of students is noisy.	The students group are noisy.	Students group is noisy.	B
150	LET	GenEd	Civics	Hard	Which article of the 1987 Constitution focuses on education?	Article II	Article XII	Article XIV	Article XV	C
151	LET	GenEd	Math	Hard	What is the sum of the interior angles of an octagon?	720°	900°	1080°	1440°	C
152	LET	GenEd	Science	Hard	Which body system maintains homeostasis?	Digestive	Endocrine	Respiratory	Skeletal	B
153	LET	GenEd	Reading	Hard	Which statement best summarizes a text?	A repeated detail	The central idea	A title	An example	B
154	LET	GenEd	Grammar	Hard	Which sentence uses correct subject-verb agreement?	The group of students are noisy.	The group of students is noisy.	The students group are noisy.	Students group is noisy.	B
155	LET	GenEd	Civics	Hard	Which article of the 1987 Constitution focuses on education?	Article II	Article XII	Article XIV	Article XV	C
156	LET	GenEd	Math	Hard	What is the sum of the interior angles of an octagon?	720°	900°	1080°	1440°	C
157	LET	GenEd	Science	Hard	Which body system maintains homeostasis?	Digestive	Endocrine	Respiratory	Skeletal	B
158	LET	GenEd	Reading	Hard	Which statement best summarizes a text?	A repeated detail	The central idea	A title	An example	B
159	LET	GenEd	Grammar	Hard	Which sentence uses correct subject-verb agreement?	The group of students are noisy.	The group of students is noisy.	The students group are noisy.	Students group is noisy.	B
160	LET	GenEd	Civics	Hard	Which article of the 1987 Constitution focuses on education?	Article II	Article XII	Article XIV	Article XV	C
161	LET	GenEd	Math	Hard	What is the sum of the interior angles of an octagon?	720°	900°	1080°	1440°	C
162	LET	GenEd	Science	Hard	Which body system maintains homeostasis?	Digestive	Endocrine	Respiratory	Skeletal	B
163	LET	GenEd	Professional Education - Principles of Teaching	Easy	Which principle states that teaching should consider learners' differences?	Motivation	Individual differences	Feedback	Gradation	B
164	LET	GenEd	Professional Education - Classroom Management	Easy	Which helps maintain discipline in class?	Clear rules	Ignoring behavior	No routines	Inconsistent rules	A
165	LET	GenEd	Professional Education - Learning Theories	Easy	Who is associated with behaviorism?	Piaget	Vygotsky	Skinner	Gardner	C
166	LET	GenEd	Professional Education - Assessment	Easy	Which assessment is given before instruction?	Summative	Formative	Diagnostic	Norm-referenced	C
167	LET	GenEd	Professional Education - Curriculum	Easy	Who is known for the objectives-centered curriculum?	Bruner	Tyler	Dewey	Taba	B
168	LET	GenEd	Professional Education - Principles of Teaching	Easy	Which principle states that teaching should consider learners' differences?	Motivation	Individual differences	Feedback	Gradation	B
169	LET	GenEd	Professional Education - Classroom Management	Easy	Which helps maintain discipline in class?	Clear rules	Ignoring behavior	No routines	Inconsistent rules	A
170	LET	GenEd	Professional Education - Learning Theories	Easy	Who is associated with behaviorism?	Piaget	Vygotsky	Skinner	Gardner	C
171	LET	GenEd	Professional Education - Assessment	Easy	Which assessment is given before instruction?	Summative	Formative	Diagnostic	Norm-referenced	C
172	LET	GenEd	Professional Education - Curriculum	Easy	Who is known for the objectives-centered curriculum?	Bruner	Tyler	Dewey	Taba	B
173	LET	GenEd	Professional Education - Principles of Teaching	Easy	Which principle states that teaching should consider learners' differences?	Motivation	Individual differences	Feedback	Gradation	B
174	LET	GenEd	Professional Education - Classroom Management	Easy	Which helps maintain discipline in class?	Clear rules	Ignoring behavior	No routines	Inconsistent rules	A
175	LET	GenEd	Professional Education - Learning Theories	Easy	Who is associated with behaviorism?	Piaget	Vygotsky	Skinner	Gardner	C
176	LET	GenEd	Professional Education - Assessment	Easy	Which assessment is given before instruction?	Summative	Formative	Diagnostic	Norm-referenced	C
177	LET	GenEd	Professional Education - Curriculum	Easy	Who is known for the objectives-centered curriculum?	Bruner	Tyler	Dewey	Taba	B
178	LET	GenEd	Professional Education - Principles of Teaching	Easy	Which principle states that teaching should consider learners' differences?	Motivation	Individual differences	Feedback	Gradation	B
179	LET	GenEd	Professional Education - Classroom Management	Easy	Which helps maintain discipline in class?	Clear rules	Ignoring behavior	No routines	Inconsistent rules	A
180	LET	GenEd	Professional Education - Learning Theories	Easy	Who is associated with behaviorism?	Piaget	Vygotsky	Skinner	Gardner	C
181	LET	GenEd	Professional Education - Assessment	Easy	Which assessment is given before instruction?	Summative	Formative	Diagnostic	Norm-referenced	C
182	LET	GenEd	Professional Education - Curriculum	Easy	Who is known for the objectives-centered curriculum?	Bruner	Tyler	Dewey	Taba	B
183	LET	GenEd	Professional Education - Principles of Teaching	Easy	Which principle states that teaching should consider learners' differences?	Motivation	Individual differences	Feedback	Gradation	B
184	LET	GenEd	Professional Education - Classroom Management	Easy	Which helps maintain discipline in class?	Clear rules	Ignoring behavior	No routines	Inconsistent rules	A
185	LET	GenEd	Professional Education - Learning Theories	Easy	Who is associated with behaviorism?	Piaget	Vygotsky	Skinner	Gardner	C
186	LET	GenEd	Professional Education - Assessment	Easy	Which assessment is given before instruction?	Summative	Formative	Diagnostic	Norm-referenced	C
187	LET	GenEd	Professional Education - Curriculum	Easy	Who is known for the objectives-centered curriculum?	Bruner	Tyler	Dewey	Taba	B
188	LET	GenEd	Professional Education - Principles of Teaching	Easy	Which principle states that teaching should consider learners' differences?	Motivation	Individual differences	Feedback	Gradation	B
189	LET	GenEd	Professional Education - Classroom Management	Easy	Which helps maintain discipline in class?	Clear rules	Ignoring behavior	No routines	Inconsistent rules	A
190	LET	GenEd	Professional Education - Learning Theories	Easy	Who is associated with behaviorism?	Piaget	Vygotsky	Skinner	Gardner	C
191	LET	GenEd	Professional Education - Assessment	Easy	Which assessment is given before instruction?	Summative	Formative	Diagnostic	Norm-referenced	C
192	LET	GenEd	Professional Education - Curriculum	Easy	Who is known for the objectives-centered curriculum?	Bruner	Tyler	Dewey	Taba	B
193	LET	GenEd	Professional Education - Principles of Teaching	Easy	Which principle states that teaching should consider learners' differences?	Motivation	Individual differences	Feedback	Gradation	B
194	LET	GenEd	Professional Education - Classroom Management	Easy	Which helps maintain discipline in class?	Clear rules	Ignoring behavior	No routines	Inconsistent rules	A
195	LET	GenEd	Professional Education - Learning Theories	Easy	Who is associated with behaviorism?	Piaget	Vygotsky	Skinner	Gardner	C
196	LET	GenEd	Professional Education - Assessment	Easy	Which assessment is given before instruction?	Summative	Formative	Diagnostic	Norm-referenced	C
197	LET	GenEd	Professional Education - Curriculum	Easy	Who is known for the objectives-centered curriculum?	Bruner	Tyler	Dewey	Taba	B
198	LET	GenEd	Professional Education - Principles of Teaching	Easy	Which principle states that teaching should consider learners' differences?	Motivation	Individual differences	Feedback	Gradation	B
199	LET	GenEd	Professional Education - Classroom Management	Easy	Which helps maintain discipline in class?	Clear rules	Ignoring behavior	No routines	Inconsistent rules	A
200	LET	GenEd	Professional Education - Learning Theories	Easy	Who is associated with behaviorism?	Piaget	Vygotsky	Skinner	Gardner	C
201	LET	GenEd	Professional Education - Assessment	Easy	Which assessment is given before instruction?	Summative	Formative	Diagnostic	Norm-referenced	C
202	LET	GenEd	Professional Education - Curriculum	Easy	Who is known for the objectives-centered curriculum?	Bruner	Tyler	Dewey	Taba	B
203	LET	GenEd	Professional Education - Principles of Teaching	Easy	Which principle states that teaching should consider learners' differences?	Motivation	Individual differences	Feedback	Gradation	B
204	LET	GenEd	Professional Education - Classroom Management	Easy	Which helps maintain discipline in class?	Clear rules	Ignoring behavior	No routines	Inconsistent rules	A
205	LET	GenEd	Professional Education - Learning Theories	Easy	Who is associated with behaviorism?	Piaget	Vygotsky	Skinner	Gardner	C
206	LET	GenEd	Professional Education - Assessment	Easy	Which assessment is given before instruction?	Summative	Formative	Diagnostic	Norm-referenced	C
207	LET	GenEd	Professional Education - Curriculum	Easy	Who is known for the objectives-centered curriculum?	Bruner	Tyler	Dewey	Taba	B
208	LET	GenEd	Professional Education - Principles of Teaching	Easy	Which principle states that teaching should consider learners' differences?	Motivation	Individual differences	Feedback	Gradation	B
209	LET	GenEd	Professional Education - Classroom Management	Easy	Which helps maintain discipline in class?	Clear rules	Ignoring behavior	No routines	Inconsistent rules	A
210	LET	GenEd	Professional Education - Learning Theories	Easy	Who is associated with behaviorism?	Piaget	Vygotsky	Skinner	Gardner	C
211	LET	GenEd	Professional Education - Assessment	Easy	Which assessment is given before instruction?	Summative	Formative	Diagnostic	Norm-referenced	C
212	LET	GenEd	Professional Education - Curriculum	Easy	Who is known for the objectives-centered curriculum?	Bruner	Tyler	Dewey	Taba	B
213	LET	GenEd	Professional Education - Learning Theories	Medium	Which theory emphasizes social interaction in learning?	Behaviorism	Constructivism	Social constructivism	Humanism	C
214	LET	GenEd	Professional Education - Assessment	Medium	Which assessment checks learning after instruction?	Diagnostic	Formative	Summative	Placement	C
215	LET	GenEd	Professional Education - Classroom Management	Medium	Which strategy promotes positive behavior?	Punishment	Clear expectations	Ignoring rules	Strict silence	B
216	LET	GenEd	Professional Education - Curriculum	Medium	Which curriculum focuses on real-life problems?	Subject-centered	Problem-centered	Discipline-based	Textbook-based	B
217	LET	GenEd	Professional Education - Educational Psychology	Medium	Which domain involves skills and movement?	Cognitive	Affective	Psychomotor	Behavioral	C
218	LET	GenEd	Professional Education - Learning Theories	Medium	Which theory emphasizes social interaction in learning?	Behaviorism	Constructivism	Social constructivism	Humanism	C
219	LET	GenEd	Professional Education - Assessment	Medium	Which assessment checks learning after instruction?	Diagnostic	Formative	Summative	Placement	C
220	LET	GenEd	Professional Education - Classroom Management	Medium	Which strategy promotes positive behavior?	Punishment	Clear expectations	Ignoring rules	Strict silence	B
221	LET	GenEd	Professional Education - Curriculum	Medium	Which curriculum focuses on real-life problems?	Subject-centered	Problem-centered	Discipline-based	Textbook-based	B
222	LET	GenEd	Professional Education - Educational Psychology	Medium	Which domain involves skills and movement?	Cognitive	Affective	Psychomotor	Behavioral	C
223	LET	GenEd	Professional Education - Learning Theories	Medium	Which theory emphasizes social interaction in learning?	Behaviorism	Constructivism	Social constructivism	Humanism	C
224	LET	GenEd	Professional Education - Assessment	Medium	Which assessment checks learning after instruction?	Diagnostic	Formative	Summative	Placement	C
225	LET	GenEd	Professional Education - Classroom Management	Medium	Which strategy promotes positive behavior?	Punishment	Clear expectations	Ignoring rules	Strict silence	B
226	LET	GenEd	Professional Education - Curriculum	Medium	Which curriculum focuses on real-life problems?	Subject-centered	Problem-centered	Discipline-based	Textbook-based	B
227	LET	GenEd	Professional Education - Educational Psychology	Medium	Which domain involves skills and movement?	Cognitive	Affective	Psychomotor	Behavioral	C
228	LET	GenEd	Professional Education - Learning Theories	Medium	Which theory emphasizes social interaction in learning?	Behaviorism	Constructivism	Social constructivism	Humanism	C
229	LET	GenEd	Professional Education - Assessment	Medium	Which assessment checks learning after instruction?	Diagnostic	Formative	Summative	Placement	C
230	LET	GenEd	Professional Education - Classroom Management	Medium	Which strategy promotes positive behavior?	Punishment	Clear expectations	Ignoring rules	Strict silence	B
231	LET	GenEd	Professional Education - Curriculum	Medium	Which curriculum focuses on real-life problems?	Subject-centered	Problem-centered	Discipline-based	Textbook-based	B
232	LET	GenEd	Professional Education - Educational Psychology	Medium	Which domain involves skills and movement?	Cognitive	Affective	Psychomotor	Behavioral	C
233	LET	GenEd	Professional Education - Learning Theories	Medium	Which theory emphasizes social interaction in learning?	Behaviorism	Constructivism	Social constructivism	Humanism	C
234	LET	GenEd	Professional Education - Assessment	Medium	Which assessment checks learning after instruction?	Diagnostic	Formative	Summative	Placement	C
235	LET	GenEd	Professional Education - Classroom Management	Medium	Which strategy promotes positive behavior?	Punishment	Clear expectations	Ignoring rules	Strict silence	B
236	LET	GenEd	Professional Education - Curriculum	Medium	Which curriculum focuses on real-life problems?	Subject-centered	Problem-centered	Discipline-based	Textbook-based	B
237	LET	GenEd	Professional Education - Educational Psychology	Medium	Which domain involves skills and movement?	Cognitive	Affective	Psychomotor	Behavioral	C
238	LET	GenEd	Professional Education - Learning Theories	Medium	Which theory emphasizes social interaction in learning?	Behaviorism	Constructivism	Social constructivism	Humanism	C
239	LET	GenEd	Professional Education - Assessment	Medium	Which assessment checks learning after instruction?	Diagnostic	Formative	Summative	Placement	C
240	LET	GenEd	Professional Education - Classroom Management	Medium	Which strategy promotes positive behavior?	Punishment	Clear expectations	Ignoring rules	Strict silence	B
241	LET	GenEd	Professional Education - Curriculum	Medium	Which curriculum focuses on real-life problems?	Subject-centered	Problem-centered	Discipline-based	Textbook-based	B
242	LET	GenEd	Professional Education - Educational Psychology	Medium	Which domain involves skills and movement?	Cognitive	Affective	Psychomotor	Behavioral	C
243	LET	GenEd	Professional Education - Learning Theories	Medium	Which theory emphasizes social interaction in learning?	Behaviorism	Constructivism	Social constructivism	Humanism	C
244	LET	GenEd	Professional Education - Assessment	Medium	Which assessment checks learning after instruction?	Diagnostic	Formative	Summative	Placement	C
245	LET	GenEd	Professional Education - Classroom Management	Medium	Which strategy promotes positive behavior?	Punishment	Clear expectations	Ignoring rules	Strict silence	B
246	LET	GenEd	Professional Education - Curriculum	Medium	Which curriculum focuses on real-life problems?	Subject-centered	Problem-centered	Discipline-based	Textbook-based	B
247	LET	GenEd	Professional Education - Educational Psychology	Medium	Which domain involves skills and movement?	Cognitive	Affective	Psychomotor	Behavioral	C
248	LET	GenEd	Professional Education - Learning Theories	Medium	Which theory emphasizes social interaction in learning?	Behaviorism	Constructivism	Social constructivism	Humanism	C
249	LET	GenEd	Professional Education - Assessment	Medium	Which assessment checks learning after instruction?	Diagnostic	Formative	Summative	Placement	C
250	LET	GenEd	Professional Education - Classroom Management	Medium	Which strategy promotes positive behavior?	Punishment	Clear expectations	Ignoring rules	Strict silence	B
251	LET	GenEd	Professional Education - Curriculum	Medium	Which curriculum focuses on real-life problems?	Subject-centered	Problem-centered	Discipline-based	Textbook-based	B
252	LET	GenEd	Professional Education - Educational Psychology	Medium	Which domain involves skills and movement?	Cognitive	Affective	Psychomotor	Behavioral	C
253	LET	GenEd	Professional Education - Learning Theories	Medium	Which theory emphasizes social interaction in learning?	Behaviorism	Constructivism	Social constructivism	Humanism	C
254	LET	GenEd	Professional Education - Assessment	Medium	Which assessment checks learning after instruction?	Diagnostic	Formative	Summative	Placement	C
255	LET	GenEd	Professional Education - Classroom Management	Medium	Which strategy promotes positive behavior?	Punishment	Clear expectations	Ignoring rules	Strict silence	B
256	LET	GenEd	Professional Education - Curriculum	Medium	Which curriculum focuses on real-life problems?	Subject-centered	Problem-centered	Discipline-based	Textbook-based	B
257	LET	GenEd	Professional Education - Educational Psychology	Medium	Which domain involves skills and movement?	Cognitive	Affective	Psychomotor	Behavioral	C
258	LET	GenEd	Professional Education - Learning Theories	Medium	Which theory emphasizes social interaction in learning?	Behaviorism	Constructivism	Social constructivism	Humanism	C
259	LET	GenEd	Professional Education - Assessment	Medium	Which assessment checks learning after instruction?	Diagnostic	Formative	Summative	Placement	C
260	LET	GenEd	Professional Education - Classroom Management	Medium	Which strategy promotes positive behavior?	Punishment	Clear expectations	Ignoring rules	Strict silence	B
261	LET	GenEd	Professional Education - Curriculum	Medium	Which curriculum focuses on real-life problems?	Subject-centered	Problem-centered	Discipline-based	Textbook-based	B
262	LET	GenEd	Professional Education - Educational Psychology	Medium	Which domain involves skills and movement?	Cognitive	Affective	Psychomotor	Behavioral	C
263	LET	GenEd	Professional Education - Assessment and Evaluation	Hard	Which validity ensures test items match objectives?	Reliability	Content validity	Face validity	Objectivity	B
264	LET	GenEd	Professional Education - Educational Research	Hard	Which design determines cause-and-effect relationships?	Descriptive	Correlational	Experimental	Qualitative	C
265	LET	GenEd	Professional Education - Educational Laws and Ethics	Hard	Which policy protects learners from abuse in schools?	Labor Code	Child Protection Policy	Civil Code	RPC	B
266	LET	GenEd	Professional Education - Curriculum Development	Hard	Who proposed the spiral curriculum?	Tyler	Bruner	Dewey	Taba	B
267	LET	GenEd	Professional Education - Learning Theories	Hard	Which theorist introduced the zone of proximal development?	Piaget	Vygotsky	Skinner	Bandura	B
268	LET	GenEd	Professional Education - Assessment and Evaluation	Hard	Which validity ensures test items match objectives?	Reliability	Content validity	Face validity	Objectivity	B
269	LET	GenEd	Professional Education - Educational Research	Hard	Which design determines cause-and-effect relationships?	Descriptive	Correlational	Experimental	Qualitative	C
270	LET	GenEd	Professional Education - Educational Laws and Ethics	Hard	Which policy protects learners from abuse in schools?	Labor Code	Child Protection Policy	Civil Code	RPC	B
271	LET	GenEd	Professional Education - Curriculum Development	Hard	Who proposed the spiral curriculum?	Tyler	Bruner	Dewey	Taba	B
272	LET	GenEd	Professional Education - Learning Theories	Hard	Which theorist introduced the zone of proximal development?	Piaget	Vygotsky	Skinner	Bandura	B
273	LET	GenEd	Professional Education - Assessment and Evaluation	Hard	Which validity ensures test items match objectives?	Reliability	Content validity	Face validity	Objectivity	B
274	LET	GenEd	Professional Education - Educational Research	Hard	Which design determines cause-and-effect relationships?	Descriptive	Correlational	Experimental	Qualitative	C
275	LET	GenEd	Professional Education - Educational Laws and Ethics	Hard	Which policy protects learners from abuse in schools?	Labor Code	Child Protection Policy	Civil Code	RPC	B
276	LET	GenEd	Professional Education - Curriculum Development	Hard	Who proposed the spiral curriculum?	Tyler	Bruner	Dewey	Taba	B
277	LET	GenEd	Professional Education - Learning Theories	Hard	Which theorist introduced the zone of proximal development?	Piaget	Vygotsky	Skinner	Bandura	B
278	LET	GenEd	Professional Education - Assessment and Evaluation	Hard	Which validity ensures test items match objectives?	Reliability	Content validity	Face validity	Objectivity	B
279	LET	GenEd	Professional Education - Educational Research	Hard	Which design determines cause-and-effect relationships?	Descriptive	Correlational	Experimental	Qualitative	C
280	LET	GenEd	Professional Education - Educational Laws and Ethics	Hard	Which policy protects learners from abuse in schools?	Labor Code	Child Protection Policy	Civil Code	RPC	B
281	LET	GenEd	Professional Education - Curriculum Development	Hard	Who proposed the spiral curriculum?	Tyler	Bruner	Dewey	Taba	B
282	LET	GenEd	Professional Education - Learning Theories	Hard	Which theorist introduced the zone of proximal development?	Piaget	Vygotsky	Skinner	Bandura	B
283	LET	GenEd	Professional Education - Assessment and Evaluation	Hard	Which validity ensures test items match objectives?	Reliability	Content validity	Face validity	Objectivity	B
284	LET	GenEd	Professional Education - Educational Research	Hard	Which design determines cause-and-effect relationships?	Descriptive	Correlational	Experimental	Qualitative	C
285	LET	GenEd	Professional Education - Educational Laws and Ethics	Hard	Which policy protects learners from abuse in schools?	Labor Code	Child Protection Policy	Civil Code	RPC	B
286	LET	GenEd	Professional Education - Curriculum Development	Hard	Who proposed the spiral curriculum?	Tyler	Bruner	Dewey	Taba	B
287	LET	GenEd	Professional Education - Learning Theories	Hard	Which theorist introduced the zone of proximal development?	Piaget	Vygotsky	Skinner	Bandura	B
288	LET	GenEd	Professional Education - Assessment and Evaluation	Hard	Which validity ensures test items match objectives?	Reliability	Content validity	Face validity	Objectivity	B
289	LET	GenEd	Professional Education - Educational Research	Hard	Which design determines cause-and-effect relationships?	Descriptive	Correlational	Experimental	Qualitative	C
290	LET	GenEd	Professional Education - Educational Laws and Ethics	Hard	Which policy protects learners from abuse in schools?	Labor Code	Child Protection Policy	Civil Code	RPC	B
291	LET	GenEd	Professional Education - Curriculum Development	Hard	Who proposed the spiral curriculum?	Tyler	Bruner	Dewey	Taba	B
292	LET	GenEd	Professional Education - Learning Theories	Hard	Which theorist introduced the zone of proximal development?	Piaget	Vygotsky	Skinner	Bandura	B
293	LET	GenEd	Professional Education - Assessment and Evaluation	Hard	Which validity ensures test items match objectives?	Reliability	Content validity	Face validity	Objectivity	B
294	LET	GenEd	Professional Education - Educational Research	Hard	Which design determines cause-and-effect relationships?	Descriptive	Correlational	Experimental	Qualitative	C
295	LET	GenEd	Professional Education - Educational Laws and Ethics	Hard	Which policy protects learners from abuse in schools?	Labor Code	Child Protection Policy	Civil Code	RPC	B
296	LET	GenEd	Professional Education - Curriculum Development	Hard	Who proposed the spiral curriculum?	Tyler	Bruner	Dewey	Taba	B
297	LET	GenEd	Professional Education - Learning Theories	Hard	Which theorist introduced the zone of proximal development?	Piaget	Vygotsky	Skinner	Bandura	B
298	LET	GenEd	Professional Education - Assessment and Evaluation	Hard	Which validity ensures test items match objectives?	Reliability	Content validity	Face validity	Objectivity	B
299	LET	GenEd	Professional Education - Educational Research	Hard	Which design determines cause-and-effect relationships?	Descriptive	Correlational	Experimental	Qualitative	C
300	LET	GenEd	Professional Education - Educational Laws and Ethics	Hard	Which policy protects learners from abuse in schools?	Labor Code	Child Protection Policy	Civil Code	RPC	B
301	LET	GenEd	Professional Education - Curriculum Development	Hard	Who proposed the spiral curriculum?	Tyler	Bruner	Dewey	Taba	B
302	LET	GenEd	Professional Education - Learning Theories	Hard	Which theorist introduced the zone of proximal development?	Piaget	Vygotsky	Skinner	Bandura	B
303	LET	GenEd	Professional Education - Assessment and Evaluation	Hard	Which validity ensures test items match objectives?	Reliability	Content validity	Face validity	Objectivity	B
304	LET	GenEd	Professional Education - Educational Research	Hard	Which design determines cause-and-effect relationships?	Descriptive	Correlational	Experimental	Qualitative	C
305	LET	GenEd	Professional Education - Educational Laws and Ethics	Hard	Which policy protects learners from abuse in schools?	Labor Code	Child Protection Policy	Civil Code	RPC	B
306	LET	GenEd	Professional Education - Curriculum Development	Hard	Who proposed the spiral curriculum?	Tyler	Bruner	Dewey	Taba	B
307	LET	GenEd	Professional Education - Learning Theories	Hard	Which theorist introduced the zone of proximal development?	Piaget	Vygotsky	Skinner	Bandura	B
308	LET	GenEd	Professional Education - Assessment and Evaluation	Hard	Which validity ensures test items match objectives?	Reliability	Content validity	Face validity	Objectivity	B
309	LET	GenEd	Professional Education - Educational Research	Hard	Which design determines cause-and-effect relationships?	Descriptive	Correlational	Experimental	Qualitative	C
310	LET	GenEd	Professional Education - Educational Laws and Ethics	Hard	Which policy protects learners from abuse in schools?	Labor Code	Child Protection Policy	Civil Code	RPC	B
311	LET	GenEd	Professional Education - Curriculum Development	Hard	Who proposed the spiral curriculum?	Tyler	Bruner	Dewey	Taba	B
312	LET	GenEd	Professional Education - Learning Theories	Hard	Which theorist introduced the zone of proximal development?	Piaget	Vygotsky	Skinner	Bandura	B
\.


--
-- Data for Name: student_profiles; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.student_profiles (id, user_id, student_id, name, course, exam_type, let_track, let_major, updated_at) FROM stdin;
2	6	123	Meriam Lingad	Education	LET	Elementary	\N	2026-01-10 00:13:48.340784
1	2	123	KHAEL BART JAVILLONAR	EDUCATION	LET	Elementary	\N	2026-01-11 13:14:00.826782
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.users (id, email, password_hash, role, created_at, active, must_change_password, temp_password_expires_at, failed_login_attempts, is_locked) FROM stdin;
6	meriam@gmail.com	$2b$12$L//Ft1UFfhRvbe5q56B9bOsh.fww8eqVzyqOpJ7k9ONFQc1oW4Wmq	student	2026-01-10 00:13:00.237708	t	f	\N	0	f
7	dhang@gmail.com	$2b$12$uLVHnVLj4KpV6We/UGe4j.h0PLKYxO.XTaPkETqn6k1coAds0RY6a	admin	2026-01-10 00:17:13.881405	t	f	\N	0	f
15	precy@gmail.com	$2b$12$4OIiNB1tCoiMZMEyK0EndO1qgPXMR59uVEfk6tYmm1lboE5bAaEdi	instructor	2026-01-11 12:45:25.297331	t	f	\N	0	f
2	khael@gmail.com	$2b$12$lYVDeFFsjBJRXjDWxLM8ieIeEQ5fRwgSGjXfwKrhzZsubeOReF8si	student	2026-01-09 17:06:37.379294	t	f	\N	0	f
3	bartjavillonar@gmail.com	$2b$12$EUyhsYyqf6RIfZ3OP2Ec4OBTUbHDWXyre9kEW68rPhqAlhIqTZjPm	admin	2026-01-09 19:29:12.616875	t	t	2026-01-12 03:35:17.677355	0	f
1	bart@gmail.com	$2b$12$nOozTGjnxIxHcs2avNhmvuSX.LaJ.e/9E6c32fDXEyskGj.eAmeea	instructor	2026-01-09 17:05:55.027795	t	f	\N	0	f
\.


--
-- Name: app_settings_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.app_settings_id_seq', 1, true);


--
-- Name: audit_logs_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.audit_logs_id_seq', 127, true);


--
-- Name: exam_results_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.exam_results_id_seq', 3, true);


--
-- Name: instructor_profiles_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.instructor_profiles_id_seq', 1, false);


--
-- Name: questions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.questions_id_seq', 312, true);


--
-- Name: student_profiles_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.student_profiles_id_seq', 2, true);


--
-- Name: users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.users_id_seq', 15, true);


--
-- Name: alembic_version alembic_version_pkc; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.alembic_version
    ADD CONSTRAINT alembic_version_pkc PRIMARY KEY (version_num);


--
-- Name: app_settings app_settings_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.app_settings
    ADD CONSTRAINT app_settings_pkey PRIMARY KEY (id);


--
-- Name: audit_logs audit_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.audit_logs
    ADD CONSTRAINT audit_logs_pkey PRIMARY KEY (id);


--
-- Name: exam_results exam_results_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.exam_results
    ADD CONSTRAINT exam_results_pkey PRIMARY KEY (id);


--
-- Name: instructor_profiles instructor_profiles_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.instructor_profiles
    ADD CONSTRAINT instructor_profiles_pkey PRIMARY KEY (id);


--
-- Name: instructor_profiles instructor_profiles_user_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.instructor_profiles
    ADD CONSTRAINT instructor_profiles_user_id_key UNIQUE (user_id);


--
-- Name: questions questions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.questions
    ADD CONSTRAINT questions_pkey PRIMARY KEY (id);


--
-- Name: student_profiles student_profiles_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.student_profiles
    ADD CONSTRAINT student_profiles_pkey PRIMARY KEY (id);


--
-- Name: student_profiles student_profiles_user_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.student_profiles
    ADD CONSTRAINT student_profiles_user_id_key UNIQUE (user_id);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: ix_users_email; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX ix_users_email ON public.users USING btree (email);


--
-- Name: audit_logs audit_logs_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.audit_logs
    ADD CONSTRAINT audit_logs_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: exam_results exam_results_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.exam_results
    ADD CONSTRAINT exam_results_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: instructor_profiles instructor_profiles_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.instructor_profiles
    ADD CONSTRAINT instructor_profiles_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: student_profiles student_profiles_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.student_profiles
    ADD CONSTRAINT student_profiles_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- PostgreSQL database dump complete
--

\unrestrict aO907JMPzKkIZuZtAd0DfYu68xPOXrXeAPsrwiSjMU93hGLm9xm72JG4kT3Hvkd

