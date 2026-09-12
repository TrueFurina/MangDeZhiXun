-- ============================================================
-- SECTION: SCHEMA
-- ============================================================

--
-- PostgreSQL database dump
--


-- Dumped from database version 17.6
-- Dumped by pg_dump version 17.6

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
-- Name: public; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA IF NOT EXISTS "public";


--
-- Name: SCHEMA "public"; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON SCHEMA "public" IS 'standard public schema';


--
-- Name: pg_graphql; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS "pg_graphql" WITH SCHEMA "graphql";


--
-- Name: EXTENSION "pg_graphql"; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON EXTENSION "pg_graphql" IS 'pg_graphql: GraphQL support';


--
-- Name: pgcrypto; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";


--
-- Name: EXTENSION "pgcrypto"; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON EXTENSION "pgcrypto" IS 'cryptographic functions';


--
-- Name: supabase_vault; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS "supabase_vault" WITH SCHEMA "vault";


--
-- Name: EXTENSION "supabase_vault"; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON EXTENSION "supabase_vault" IS 'Supabase Vault Extension';


--
-- Name: uuid-ossp; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";


--
-- Name: EXTENSION "uuid-ossp"; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON EXTENSION "uuid-ossp" IS 'generate universally unique identifiers (UUIDs)';


--
-- Name: pay_order_status; Type: TYPE; Schema: public; Owner: -
--

DO $pg_schema_restore$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_type t
    JOIN pg_namespace n ON n.oid = t.typnamespace
    WHERE n.nspname = 'public'
      AND t.typname = 'pay_order_status'
  ) THEN
    EXECUTE $pg_schema_sql$
CREATE TYPE "public"."pay_order_status" AS ENUM (
    'pending',
    'paid',
    'cancelled',
    'refunded',
    'partial_refunded'
);
$pg_schema_sql$;
  END IF;
END
$pg_schema_restore$;


--
-- Name: refund_status; Type: TYPE; Schema: public; Owner: -
--

DO $pg_schema_restore$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_type t
    JOIN pg_namespace n ON n.oid = t.typnamespace
    WHERE n.nspname = 'public'
      AND t.typname = 'refund_status'
  ) THEN
    EXECUTE $pg_schema_sql$
CREATE TYPE "public"."refund_status" AS ENUM (
    'pending',
    'approved',
    'rejected',
    'refunded',
    'failed'
);
$pg_schema_sql$;
  END IF;
END
$pg_schema_restore$;


--
-- Name: auto_cleanup_monitoring(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE OR REPLACE FUNCTION "public"."auto_cleanup_monitoring"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
  DELETE FROM public.error_log WHERE create_time < now() - interval '30 days';
  DELETE FROM public.performance_monitor WHERE create_time < now() - interval '30 days';
  RETURN NEW;
END;
$$;


--
-- Name: cleanup_old_monitoring_data(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE OR REPLACE FUNCTION "public"."cleanup_old_monitoring_data"() RETURNS "void"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
  DELETE FROM public.error_log WHERE create_time < now() - interval '30 days';
  DELETE FROM public.performance_monitor WHERE create_time < now() - interval '30 days';
END;
$$;


--
-- Name: generate_invite_code(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE OR REPLACE FUNCTION "public"."generate_invite_code"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  IF NEW.invite_code IS NULL THEN
    NEW.invite_code := SUBSTRING(MD5(RANDOM()::TEXT) FROM 1 FOR 8);
  END IF;
  RETURN NEW;
END;
$$;


--
-- Name: update_student_verification_updated_at(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE OR REPLACE FUNCTION "public"."update_student_verification_updated_at"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;


--
-- Name: update_updated_at_column(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE OR REPLACE FUNCTION "public"."update_updated_at_column"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;


SET default_tablespace = '';

SET default_table_access_method = "heap";

--
-- Name: ability_profiles; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE IF NOT EXISTS "public"."ability_profiles" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "programming_ability" integer DEFAULT 0,
    "data_analysis_ability" integer DEFAULT 0,
    "design_ability" integer DEFAULT 0,
    "writing_ability" integer DEFAULT 0,
    "marketing_ability" integer DEFAULT 0,
    "operations_ability" integer DEFAULT 0,
    "product_ability" integer DEFAULT 0,
    "project_management_ability" integer DEFAULT 0,
    "technical_support_ability" integer DEFAULT 0,
    "research_ability" integer DEFAULT 0,
    "communication_ability" integer DEFAULT 0,
    "teamwork_ability" integer DEFAULT 0,
    "leadership_ability" integer DEFAULT 0,
    "problem_solving_ability" integer DEFAULT 0,
    "learning_ability" integer DEFAULT 0,
    "innovation_ability" integer DEFAULT 0,
    "time_management_ability" integer DEFAULT 0,
    "stress_resistance_ability" integer DEFAULT 0,
    "adaptability" integer DEFAULT 0,
    "execution_ability" integer DEFAULT 0,
    "internet_knowledge" integer DEFAULT 0,
    "finance_knowledge" integer DEFAULT 0,
    "education_knowledge" integer DEFAULT 0,
    "healthcare_knowledge" integer DEFAULT 0,
    "manufacturing_knowledge" integer DEFAULT 0,
    "retail_knowledge" integer DEFAULT 0,
    "media_knowledge" integer DEFAULT 0,
    "consulting_knowledge" integer DEFAULT 0,
    "government_knowledge" integer DEFAULT 0,
    "startup_knowledge" integer DEFAULT 0,
    "overall_score" integer DEFAULT 0,
    "data_sources" "jsonb" DEFAULT '[]'::"jsonb",
    "last_analyzed_at" timestamp with time zone,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


--
-- Name: affiliate_rewards; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE IF NOT EXISTS "public"."affiliate_rewards" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "promoter_id" "uuid" NOT NULL,
    "invitee_id" "uuid" NOT NULL,
    "order_id" "uuid",
    "reward_amount" numeric(10,2) NOT NULL,
    "status" integer DEFAULT 0,
    "create_time" timestamp with time zone DEFAULT "now"(),
    "settle_time" timestamp with time zone
);


--
-- Name: ai_interview_record; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE IF NOT EXISTS "public"."ai_interview_record" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid",
    "job_id" character varying(64),
    "interview_type" character varying(50) DEFAULT 'voice'::character varying NOT NULL,
    "status" smallint DEFAULT 0 NOT NULL,
    "total_score" numeric(5,2),
    "round_count" integer DEFAULT 0 NOT NULL,
    "round_data" "jsonb" DEFAULT '[]'::"jsonb" NOT NULL,
    "voice_features" "jsonb",
    "logic_score" numeric(5,2),
    "pressure_score" numeric(5,2),
    "ai_comment" "text",
    "start_time" timestamp with time zone,
    "end_time" timestamp with time zone,
    "create_time" timestamp with time zone DEFAULT "now"() NOT NULL,
    "video_features" "jsonb" DEFAULT '{}'::"jsonb",
    "scenario_score" numeric(5,2),
    "skill_score" numeric(5,2)
);


--
-- Name: assessment_record; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE IF NOT EXISTS "public"."assessment_record" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "status" smallint DEFAULT 0 NOT NULL,
    "total_score" numeric(5,2),
    "dimension_scores" "jsonb",
    "answer_data" "jsonb",
    "start_time" timestamp with time zone DEFAULT "now"(),
    "submit_time" timestamp with time zone
);


--
-- Name: assessment_records; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE IF NOT EXISTS "public"."assessment_records" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_email" "text" NOT NULL,
    "job_title" "text" NOT NULL,
    "total_score" integer NOT NULL,
    "tech_score" integer NOT NULL,
    "general_score" integer NOT NULL,
    "behavior_score" integer NOT NULL,
    "experience_score" integer NOT NULL,
    "status" "text" DEFAULT 'completed'::"text",
    "completed_at" timestamp with time zone DEFAULT "now"(),
    "created_at" timestamp with time zone DEFAULT "now"(),
    "answers" "jsonb" DEFAULT '{}'::"jsonb",
    "user_id" "uuid",
    CONSTRAINT "assessment_records_status_check" CHECK (("status" = ANY (ARRAY['in_progress'::"text", 'completed'::"text"])))
);


--
-- Name: COLUMN "assessment_records"."answers"; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN "public"."assessment_records"."answers" IS '存储用户答案、AI批改结果和题目信息的JSON数据';


--
-- Name: assessment_results; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE IF NOT EXISTS "public"."assessment_results" (
    "id" bigint NOT NULL,
    "task_id" bigint,
    "user_id" bigint,
    "user_name" "text" NOT NULL,
    "user_email" "text",
    "user_phone" "text",
    "total_score" numeric(5,2) DEFAULT 0,
    "dimension_scores" "jsonb" DEFAULT '{}'::"jsonb",
    "answers" "jsonb" DEFAULT '[]'::"jsonb",
    "status" "text" DEFAULT 'in_progress'::"text",
    "completed_at" timestamp with time zone,
    "created_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "assessment_results_status_check" CHECK (("status" = ANY (ARRAY['in_progress'::"text", 'completed'::"text"])))
);


--
-- Name: assessment_results_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE IF NOT EXISTS "public"."assessment_results_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: assessment_results_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE "public"."assessment_results_id_seq" OWNED BY "public"."assessment_results"."id";


--
-- Name: assessment_tasks; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE IF NOT EXISTS "public"."assessment_tasks" (
    "id" bigint NOT NULL,
    "company_id" bigint NOT NULL,
    "template_id" bigint,
    "task_name" "text" NOT NULL,
    "deadline" timestamp with time zone,
    "target_position" "text",
    "status" "text" DEFAULT 'draft'::"text",
    "link" "text",
    "participants_count" integer DEFAULT 0,
    "completed_count" integer DEFAULT 0,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "assessment_tasks_status_check" CHECK (("status" = ANY (ARRAY['draft'::"text", 'published'::"text", 'paused'::"text", 'ended'::"text"])))
);


--
-- Name: assessment_tasks_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE IF NOT EXISTS "public"."assessment_tasks_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: assessment_tasks_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE "public"."assessment_tasks_id_seq" OWNED BY "public"."assessment_tasks"."id";


--
-- Name: assessment_templates; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE IF NOT EXISTS "public"."assessment_templates" (
    "id" bigint NOT NULL,
    "company_id" bigint NOT NULL,
    "template_name" "text" NOT NULL,
    "applicable_positions" "text"[] DEFAULT '{}'::"text"[],
    "questions" "jsonb" DEFAULT '[]'::"jsonb",
    "status" "text" DEFAULT 'active'::"text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "assessment_templates_status_check" CHECK (("status" = ANY (ARRAY['active'::"text", 'disabled'::"text"])))
);


--
-- Name: assessment_templates_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE IF NOT EXISTS "public"."assessment_templates_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: assessment_templates_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE "public"."assessment_templates_id_seq" OWNED BY "public"."assessment_templates"."id";


--
-- Name: assessments; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE IF NOT EXISTS "public"."assessments" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "position_name" "text" NOT NULL,
    "category" "text" NOT NULL,
    "description" "text",
    "duration_minutes" integer DEFAULT 30,
    "difficulty_level" "text" DEFAULT 'medium'::"text",
    "participant_count" integer DEFAULT 0,
    "icon" "text",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "assessments_difficulty_level_check" CHECK (("difficulty_level" = ANY (ARRAY['easy'::"text", 'medium'::"text", 'hard'::"text"])))
);


--
-- Name: candidate_assessment_account; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE IF NOT EXISTS "public"."candidate_assessment_account" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "enterprise_id" "uuid",
    "model_id" "uuid",
    "candidate_name" character varying(100) NOT NULL,
    "candidate_phone" character varying(20) NOT NULL,
    "account_code" character varying(50) NOT NULL,
    "password" character varying(50) NOT NULL,
    "status" smallint DEFAULT 0 NOT NULL,
    "expire_time" timestamp with time zone NOT NULL,
    "create_time" timestamp with time zone DEFAULT "now"() NOT NULL,
    "use_time" timestamp with time zone
);


--
-- Name: candidates; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE IF NOT EXISTS "public"."candidates" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "company_email" "text" NOT NULL,
    "name" "text" NOT NULL,
    "email" "text",
    "position" "text",
    "tags" "jsonb" DEFAULT '[]'::"jsonb" NOT NULL,
    "notes" "text",
    "favorite" boolean DEFAULT false NOT NULL,
    "evaluations" "jsonb" DEFAULT '[]'::"jsonb" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "student_user_id" "uuid",
    "student_email" "text"
);


--
-- Name: career_consultations; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE IF NOT EXISTS "public"."career_consultations" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "question" "text" NOT NULL,
    "question_category" "text",
    "answer" "text" NOT NULL,
    "answer_quality_score" integer,
    "related_keywords" "jsonb" DEFAULT '[]'::"jsonb",
    "related_resources" "jsonb" DEFAULT '[]'::"jsonb",
    "is_helpful" boolean,
    "user_feedback" "text",
    "created_at" timestamp with time zone DEFAULT "now"()
);


--
-- Name: class_students; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE IF NOT EXISTS "public"."class_students" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "class_id" "uuid" NOT NULL,
    "student_no" "text" NOT NULL,
    "gender" "text",
    "political_status" "text",
    "display_name" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


--
-- Name: classes; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE IF NOT EXISTS "public"."classes" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" "text" NOT NULL,
    "university_email" "text" NOT NULL,
    "description" "text",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


--
-- Name: colleges; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE IF NOT EXISTS "public"."colleges" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "university_id" integer NOT NULL,
    "name" "text" NOT NULL,
    "code" "text",
    "contact_person" "text",
    "contact_phone" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


--
-- Name: companies; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE IF NOT EXISTS "public"."companies" (
    "company_id" integer NOT NULL,
    "company_name" character varying(200) NOT NULL,
    "industry" character varying(100),
    "company_size" character varying(50),
    "company_desc" "text",
    "contact_email" character varying(255),
    "contact_phone" character varying(20),
    "subscription_plan" character varying(50) DEFAULT 'basic'::character varying,
    "subscription_expire_date" "date",
    "created_at" timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: companies_company_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE IF NOT EXISTS "public"."companies_company_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: companies_company_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE "public"."companies_company_id_seq" OWNED BY "public"."companies"."company_id";


--
-- Name: company_positions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE IF NOT EXISTS "public"."company_positions" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "university_id" integer NOT NULL,
    "company_id" "uuid" NOT NULL,
    "position_name" "text" NOT NULL,
    "position_type" "text" NOT NULL,
    "industry" "text",
    "work_location" "text",
    "recruit_count" integer,
    "salary_range" "text",
    "position_requirements" "text",
    "competency_model_id" "uuid",
    "published_at" timestamp with time zone DEFAULT "now"(),
    "deadline" "date",
    "audit_status" "text" DEFAULT '待审核'::"text",
    "position_status" "text" DEFAULT '招聘中'::"text",
    "audit_comment" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "company_positions_audit_status_check" CHECK (("audit_status" = ANY (ARRAY['待审核'::"text", '审核通过'::"text", '审核驳回'::"text"]))),
    CONSTRAINT "company_positions_position_status_check" CHECK (("position_status" = ANY (ARRAY['招聘中'::"text", '已截止'::"text", '已下架'::"text"]))),
    CONSTRAINT "company_positions_position_type_check" CHECK (("position_type" = ANY (ARRAY['实习岗位'::"text", '校招全职岗位'::"text", '社招岗位'::"text"])))
);


--
-- Name: competency_models; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE IF NOT EXISTS "public"."competency_models" (
    "model_id" integer NOT NULL,
    "model_name" character varying(200) NOT NULL,
    "position_id" integer,
    "company_id" integer,
    "knowledge_items" "jsonb",
    "skills_items" "jsonb",
    "quality_items" "jsonb",
    "soft_skills_items" "jsonb",
    "model_desc" "text",
    "created_by" integer,
    "created_at" timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    "updated_at" timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: competency_models_model_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE IF NOT EXISTS "public"."competency_models_model_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: competency_models_model_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE "public"."competency_models_model_id_seq" OWNED BY "public"."competency_models"."model_id";


--
-- Name: cooperation_agreements; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE IF NOT EXISTS "public"."cooperation_agreements" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "university_id" integer NOT NULL,
    "company_id" "uuid" NOT NULL,
    "agreement_name" "text" NOT NULL,
    "agreement_type" "text" NOT NULL,
    "signing_entity" "text" NOT NULL,
    "effective_start_date" "date" NOT NULL,
    "effective_end_date" "date" NOT NULL,
    "agreement_status" "text" DEFAULT '未生效'::"text",
    "agreement_file_url" "text" NOT NULL,
    "signing_date" "date",
    "agreement_content" "text",
    "archived_at" timestamp with time zone,
    "remarks" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "cooperation_agreements_agreement_status_check" CHECK (("agreement_status" = ANY (ARRAY['未生效'::"text", '生效中'::"text", '已到期'::"text", '已归档'::"text"]))),
    CONSTRAINT "cooperation_agreements_agreement_type_check" CHECK (("agreement_type" = ANY (ARRAY['框架合作协议'::"text", '实习基地协议'::"text", '课程共建协议'::"text", '就业推荐协议'::"text", '保密协议'::"text", '其他'::"text"])))
);


--
-- Name: cooperation_companies; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE IF NOT EXISTS "public"."cooperation_companies" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "university_id" integer NOT NULL,
    "company_name" "text" NOT NULL,
    "credit_code" "text",
    "industry" "text" NOT NULL,
    "company_scale" "text",
    "cooperation_level" "text" DEFAULT '普通合作单位'::"text",
    "address" "text",
    "contact_person" "text" NOT NULL,
    "contact_phone" "text" NOT NULL,
    "contact_email" "text",
    "business_license_url" "text",
    "qualification_files" "text"[],
    "audit_status" "text" DEFAULT '待审核'::"text",
    "audit_comment" "text",
    "company_status" "text" DEFAULT '正常合作'::"text",
    "approved_at" timestamp with time zone,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "cooperation_companies_audit_status_check" CHECK (("audit_status" = ANY (ARRAY['待审核'::"text", '审核通过'::"text", '审核驳回'::"text"]))),
    CONSTRAINT "cooperation_companies_company_scale_check" CHECK (("company_scale" = ANY (ARRAY['50人以下'::"text", '50-200人'::"text", '200-500人'::"text", '500人以上'::"text"]))),
    CONSTRAINT "cooperation_companies_company_status_check" CHECK (("company_status" = ANY (ARRAY['正常合作'::"text", '暂停合作'::"text", '终止合作'::"text"]))),
    CONSTRAINT "cooperation_companies_cooperation_level_check" CHECK (("cooperation_level" = ANY (ARRAY['战略合作伙伴'::"text", '核心合作单位'::"text", '普通合作单位'::"text"]))),
    CONSTRAINT "cooperation_companies_industry_check" CHECK (("industry" = ANY (ARRAY['跨境电商'::"text", '互联网'::"text", '新能源'::"text", '智能制造'::"text", '金融'::"text", '教育'::"text", '医疗'::"text", '其他'::"text"])))
);


--
-- Name: cooperation_plans; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE IF NOT EXISTS "public"."cooperation_plans" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "university_id" integer NOT NULL,
    "company_id" "uuid" NOT NULL,
    "plan_name" "text" NOT NULL,
    "plan_type" "text" NOT NULL,
    "plan_status" "text" DEFAULT '意向沟通'::"text",
    "cooperation_start_date" "date",
    "cooperation_end_date" "date",
    "plan_details" "text",
    "responsible_person" "text" NOT NULL,
    "responsible_phone" "text" NOT NULL,
    "company_contact" "text",
    "plan_attachments" "text"[],
    "landing_result" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "cooperation_plans_plan_status_check" CHECK (("plan_status" = ANY (ARRAY['意向沟通'::"text", '方案洽谈'::"text", '推进中'::"text", '已落地'::"text", '已终止'::"text"]))),
    CONSTRAINT "cooperation_plans_plan_type_check" CHECK (("plan_type" = ANY (ARRAY['实习基地共建'::"text", '课程体系共建'::"text", '职前培训合作'::"text", '就业推荐合作'::"text", '创新创业合作'::"text", '其他'::"text"])))
);


--
-- Name: cooperation_projects; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE IF NOT EXISTS "public"."cooperation_projects" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "university_id" integer NOT NULL,
    "plan_id" "uuid",
    "company_id" "uuid" NOT NULL,
    "project_name" "text" NOT NULL,
    "project_type" "text" NOT NULL,
    "project_stage" "text" DEFAULT '筹备期'::"text",
    "project_start_date" "date",
    "project_end_date" "date",
    "project_leader" "text" NOT NULL,
    "project_members" "text"[],
    "company_contact" "text",
    "project_goals" "text",
    "stage_plans" "jsonb",
    "progress_percentage" integer DEFAULT 0,
    "project_attachments" "text"[],
    "acceptance_result" "text",
    "acceptance_report_url" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "cooperation_projects_acceptance_result_check" CHECK (("acceptance_result" = ANY (ARRAY['未验收'::"text", '验收通过'::"text", '验收不通过'::"text"]))),
    CONSTRAINT "cooperation_projects_progress_percentage_check" CHECK ((("progress_percentage" >= 0) AND ("progress_percentage" <= 100))),
    CONSTRAINT "cooperation_projects_project_stage_check" CHECK (("project_stage" = ANY (ARRAY['筹备期'::"text", '启动期'::"text", '执行期'::"text", '验收期'::"text", '已完成'::"text", '已终止'::"text"]))),
    CONSTRAINT "cooperation_projects_project_type_check" CHECK (("project_type" = ANY (ARRAY['实习基地建设'::"text", '课程共建项目'::"text", '就业培训项目'::"text", '创新创业项目'::"text", '课题联合研究'::"text"])))
);


--
-- Name: course_progress; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE IF NOT EXISTS "public"."course_progress" (
    "id" bigint NOT NULL,
    "user_email" "text" NOT NULL,
    "course_id" bigint NOT NULL,
    "progress_percent" integer DEFAULT 0 NOT NULL,
    "is_completed" boolean DEFAULT false,
    "exam_passed" boolean DEFAULT false,
    "last_studied_at" timestamp with time zone DEFAULT "now"(),
    "completed_at" timestamp with time zone,
    "created_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "course_progress_progress_percent_check" CHECK ((("progress_percent" >= 0) AND ("progress_percent" <= 100)))
);


--
-- Name: course_progress_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE IF NOT EXISTS "public"."course_progress_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: course_progress_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE "public"."course_progress_id_seq" OWNED BY "public"."course_progress"."id";


--
-- Name: course_study; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE IF NOT EXISTS "public"."course_study" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "course_id" bigint NOT NULL,
    "study_status" smallint DEFAULT 0 NOT NULL,
    "study_time" integer DEFAULT 0 NOT NULL,
    "progress_percent" integer DEFAULT 0 NOT NULL,
    "complete_time" timestamp with time zone,
    "create_time" timestamp with time zone DEFAULT "now"() NOT NULL,
    "update_time" timestamp with time zone DEFAULT "now"() NOT NULL
);


--
-- Name: courses; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE IF NOT EXISTS "public"."courses" (
    "id" bigint NOT NULL,
    "title" "text" NOT NULL,
    "type" "text" NOT NULL,
    "duration" "text" NOT NULL,
    "difficulty" "text" NOT NULL,
    "instructor" "text" NOT NULL,
    "rating" numeric(2,1) NOT NULL,
    "description" "text" NOT NULL,
    "link" "text" NOT NULL,
    "dimension" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "video_url" "text",
    "status" smallint DEFAULT 1,
    CONSTRAINT "courses_difficulty_check" CHECK (("difficulty" = ANY (ARRAY['初级'::"text", '中级'::"text", '高级'::"text"]))),
    CONSTRAINT "courses_dimension_check" CHECK (("dimension" = ANY (ARRAY['专业技能提升'::"text", '通用能力培养'::"text", '行为特质塑造'::"text", '项目实战经验'::"text", '推荐资源'::"text"]))),
    CONSTRAINT "courses_rating_check" CHECK ((("rating" >= (0)::numeric) AND ("rating" <= (5)::numeric))),
    CONSTRAINT "courses_type_check" CHECK (("type" = ANY (ARRAY['video'::"text", 'document'::"text", 'course'::"text"])))
);


--
-- Name: courses_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE IF NOT EXISTS "public"."courses_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: courses_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE "public"."courses_id_seq" OWNED BY "public"."courses"."id";


--
-- Name: deep_research_task; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE IF NOT EXISTS "public"."deep_research_task" (
    "task_id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid",
    "task_name" "text" NOT NULL,
    "research_topic" "text" NOT NULL,
    "report_type" "text" DEFAULT '行业研究报告'::"text" NOT NULL,
    "reference_files" "jsonb" DEFAULT '[]'::"jsonb" NOT NULL,
    "report_outline" "jsonb" DEFAULT '[]'::"jsonb" NOT NULL,
    "report_content" "text",
    "status" smallint DEFAULT 0 NOT NULL,
    "progress" integer DEFAULT 0 NOT NULL,
    "current_stage" "text",
    "generation_log" "text",
    "share_link" "text",
    "create_time" timestamp with time zone DEFAULT "now"() NOT NULL,
    "update_time" timestamp with time zone DEFAULT "now"() NOT NULL
);


--
-- Name: dorm_members; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE IF NOT EXISTS "public"."dorm_members" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "building" "text" NOT NULL,
    "room_no" "text" NOT NULL,
    "seat_no" "text",
    "grade" "text",
    "class_info" "text",
    "years" "text",
    "member_name" "text" NOT NULL,
    "is_leader" boolean DEFAULT false,
    "leader" "text",
    "counselor" "text",
    "created_at" timestamp with time zone DEFAULT "now"()
);


--
-- Name: enterprise_competency_model; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE IF NOT EXISTS "public"."enterprise_competency_model" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "enterprise_id" "uuid",
    "job_name" character varying(200) NOT NULL,
    "model_name" character varying(200) NOT NULL,
    "dimension_config" "jsonb" DEFAULT '{}'::"jsonb" NOT NULL,
    "question_ids" "jsonb" DEFAULT '[]'::"jsonb" NOT NULL,
    "status" smallint DEFAULT 1 NOT NULL,
    "create_time" timestamp with time zone DEFAULT "now"() NOT NULL,
    "update_time" timestamp with time zone DEFAULT "now"() NOT NULL
);


--
-- Name: enterprise_hiring_cache; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE IF NOT EXISTS "public"."enterprise_hiring_cache" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "keyword" "text" NOT NULL,
    "company_name" "text",
    "title_kw" "text",
    "title_type" "text",
    "city" "text",
    "src" "text",
    "title_level" "text",
    "avg_sal" "text",
    "title_cnt" integer,
    "title_modify_date" "text",
    "city_cnt" integer,
    "avg_sal_str" "text",
    "avg_sal_num" numeric,
    "bk_education" "text",
    "education_list" "jsonb",
    "pri_province" "text",
    "zpnumber_list" "jsonb",
    "salary_list" "jsonb",
    "btw3and5_years" "text",
    "recruit_position" "jsonb",
    "years_list" "jsonb",
    "zpnumber" integer,
    "ss_num_his_list" "jsonb",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


--
-- Name: TABLE "enterprise_hiring_cache"; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE "public"."enterprise_hiring_cache" IS '企业招聘数据缓存表';


--
-- Name: enterprise_hiring_query_history; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE IF NOT EXISTS "public"."enterprise_hiring_query_history" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid",
    "keyword" "text" NOT NULL,
    "query_type" "text" NOT NULL,
    "success" boolean DEFAULT true,
    "error_message" "text",
    "created_at" timestamp with time zone DEFAULT "now"()
);


--
-- Name: TABLE "enterprise_hiring_query_history"; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE "public"."enterprise_hiring_query_history" IS '企业招聘查询历史记录表';


--
-- Name: error_log; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE IF NOT EXISTS "public"."error_log" (
    "log_id" character varying(64) NOT NULL,
    "error_time" timestamp with time zone NOT NULL,
    "error_type" character varying(100) NOT NULL,
    "error_message" "text",
    "function_name" character varying(255) NOT NULL,
    "request_params" "jsonb",
    "user_id" character varying(64),
    "create_time" timestamp with time zone DEFAULT "now"() NOT NULL
);


--
-- Name: evaluations; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE IF NOT EXISTS "public"."evaluations" (
    "evaluation_id" integer NOT NULL,
    "user_id" integer NOT NULL,
    "position_id" integer,
    "model_id" integer,
    "total_score" numeric(5,2),
    "match_level" character varying(10),
    "knowledge_score" numeric(5,2),
    "skills_score" numeric(5,2),
    "quality_score" numeric(5,2),
    "soft_skills_score" numeric(5,2),
    "detailed_results" "jsonb",
    "strengths" "jsonb",
    "weaknesses" "jsonb",
    "evaluation_type" character varying(50),
    "status" character varying(20) DEFAULT 'completed'::character varying,
    "created_at" timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: evaluations_evaluation_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE IF NOT EXISTS "public"."evaluations_evaluation_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: evaluations_evaluation_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE "public"."evaluations_evaluation_id_seq" OWNED BY "public"."evaluations"."evaluation_id";


--
-- Name: growth_paths; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE IF NOT EXISTS "public"."growth_paths" (
    "id" bigint NOT NULL,
    "user_email" "text" NOT NULL,
    "assessment_id" bigint,
    "path_data" "jsonb" NOT NULL,
    "generated_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


--
-- Name: growth_paths_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE IF NOT EXISTS "public"."growth_paths_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: growth_paths_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE "public"."growth_paths_id_seq" OWNED BY "public"."growth_paths"."id";


--
-- Name: growth_plans; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE IF NOT EXISTS "public"."growth_plans" (
    "plan_id" integer NOT NULL,
    "user_id" integer NOT NULL,
    "evaluation_id" integer,
    "target_position" character varying(200),
    "current_level" character varying(10),
    "target_level" character varying(10),
    "phase_1_tasks" "jsonb",
    "phase_2_tasks" "jsonb",
    "phase_3_tasks" "jsonb",
    "recommended_resources" "jsonb",
    "estimated_duration" integer,
    "progress" integer DEFAULT 0,
    "status" character varying(20) DEFAULT 'active'::character varying,
    "created_at" timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    "updated_at" timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: growth_plans_plan_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE IF NOT EXISTS "public"."growth_plans_plan_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: growth_plans_plan_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE "public"."growth_plans_plan_id_seq" OWNED BY "public"."growth_plans"."plan_id";


--
-- Name: internship_paths; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE IF NOT EXISTS "public"."internship_paths" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "target_position" "text" NOT NULL,
    "target_industry" "text",
    "path_stages" "jsonb" NOT NULL,
    "current_stage" integer DEFAULT 1,
    "completion_rate" integer DEFAULT 0,
    "ability_gaps" "jsonb" DEFAULT '[]'::"jsonb",
    "learning_suggestions" "jsonb" DEFAULT '[]'::"jsonb",
    "status" "text" DEFAULT 'active'::"text",
    "started_at" timestamp with time zone DEFAULT "now"(),
    "completed_at" timestamp with time zone,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


--
-- Name: interview_simulations; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE IF NOT EXISTS "public"."interview_simulations" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "position_name" "text" NOT NULL,
    "interview_type" "text" NOT NULL,
    "difficulty_level" "text" DEFAULT 'medium'::"text",
    "questions_and_answers" "jsonb" NOT NULL,
    "overall_score" integer NOT NULL,
    "dimension_scores" "jsonb" NOT NULL,
    "strengths" "jsonb" DEFAULT '[]'::"jsonb",
    "weaknesses" "jsonb" DEFAULT '[]'::"jsonb",
    "improvement_suggestions" "jsonb" DEFAULT '[]'::"jsonb",
    "recommended_practice_topics" "jsonb" DEFAULT '[]'::"jsonb",
    "interview_duration" integer,
    "completion_rate" integer,
    "user_rating" integer,
    "user_notes" "text",
    "created_at" timestamp with time zone DEFAULT "now"()
);


--
-- Name: job_applications; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE IF NOT EXISTS "public"."job_applications" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_email" "text" NOT NULL,
    "company" "text" NOT NULL,
    "position" "text" NOT NULL,
    "status" "text" DEFAULT 'applied'::"text" NOT NULL,
    "salary" "text",
    "source" "text",
    "interview_rounds" integer DEFAULT 0 NOT NULL,
    "notes" "text",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "position_id" integer
);


--
-- Name: job_favorites; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE IF NOT EXISTS "public"."job_favorites" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_email" "text" NOT NULL,
    "job_id" integer NOT NULL,
    "job_title" "text" NOT NULL,
    "company" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"()
);


--
-- Name: job_seeker_profiles; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE IF NOT EXISTS "public"."job_seeker_profiles" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "name" "text",
    "education_level" "text",
    "major" "text",
    "graduation_year" integer,
    "work_experience_years" integer DEFAULT 0,
    "skills" "jsonb" DEFAULT '[]'::"jsonb",
    "certifications" "jsonb" DEFAULT '[]'::"jsonb",
    "career_goal" "text",
    "target_positions" "jsonb" DEFAULT '[]'::"jsonb",
    "target_industries" "jsonb" DEFAULT '[]'::"jsonb",
    "target_cities" "jsonb" DEFAULT '[]'::"jsonb",
    "expected_salary_min" integer,
    "expected_salary_max" integer,
    "work_type" "text",
    "personality_traits" "jsonb" DEFAULT '[]'::"jsonb",
    "strengths" "jsonb" DEFAULT '[]'::"jsonb",
    "weaknesses" "jsonb" DEFAULT '[]'::"jsonb",
    "job_seeking_status" "text" DEFAULT 'active'::"text",
    "availability_date" "date",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


--
-- Name: learning_plan_task; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE IF NOT EXISTS "public"."learning_plan_task" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_email" "text" NOT NULL,
    "plan_id" "uuid" NOT NULL,
    "task_key" "text" NOT NULL,
    "is_completed" boolean DEFAULT false NOT NULL,
    "completed_at" timestamp with time zone,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


--
-- Name: learning_plans; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE IF NOT EXISTS "public"."learning_plans" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_email" "text" NOT NULL,
    "target_company" "text",
    "target_position" "text",
    "plan_data" "jsonb" DEFAULT '{}'::"jsonb" NOT NULL,
    "status" "text" DEFAULT 'active'::"text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


--
-- Name: learning_records; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE IF NOT EXISTS "public"."learning_records" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "task_id" "uuid" NOT NULL,
    "path_id" "uuid",
    "started_at" timestamp with time zone DEFAULT "now"(),
    "completed_at" timestamp with time zone,
    "time_spent" integer,
    "submission_content" "text",
    "submission_files" "jsonb" DEFAULT '[]'::"jsonb",
    "evaluation_result" "jsonb",
    "ability_improvements" "jsonb" DEFAULT '[]'::"jsonb",
    "user_rating" integer,
    "user_feedback" "text",
    "status" "text" DEFAULT 'in_progress'::"text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


--
-- Name: learning_resources; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE IF NOT EXISTS "public"."learning_resources" (
    "resource_id" integer NOT NULL,
    "resource_name" character varying(200) NOT NULL,
    "resource_type" character varying(50),
    "resource_url" character varying(500),
    "resource_desc" "text",
    "skill_tags" "jsonb",
    "difficulty_level" character varying(20),
    "duration" integer,
    "provider" character varying(100),
    "created_at" timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: learning_resources_resource_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE IF NOT EXISTS "public"."learning_resources_resource_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: learning_resources_resource_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE "public"."learning_resources_resource_id_seq" OWNED BY "public"."learning_resources"."resource_id";


--
-- Name: matches; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE IF NOT EXISTS "public"."matches" (
    "match_id" integer NOT NULL,
    "user_id" integer NOT NULL,
    "position_id" integer NOT NULL,
    "evaluation_id" integer,
    "match_score" numeric(5,2) NOT NULL,
    "match_details" "jsonb",
    "status" character varying(20) DEFAULT 'active'::character varying,
    "created_at" timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: matches_match_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE IF NOT EXISTS "public"."matches_match_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: matches_match_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE "public"."matches_match_id_seq" OWNED BY "public"."matches"."match_id";


--
-- Name: membership_plans; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE IF NOT EXISTS "public"."membership_plans" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "sku_code" "text" NOT NULL,
    "name" "text" NOT NULL,
    "description" "text" DEFAULT ''::"text" NOT NULL,
    "price" numeric(10,2) NOT NULL,
    "period" "text" DEFAULT 'month'::"text" NOT NULL,
    "role" "text" DEFAULT 'student'::"text" NOT NULL,
    "features" "jsonb" DEFAULT '[]'::"jsonb" NOT NULL,
    "sort_order" integer DEFAULT 0 NOT NULL,
    "is_active" boolean DEFAULT true NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


--
-- Name: membership_subscriptions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE IF NOT EXISTS "public"."membership_subscriptions" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_email" "text" NOT NULL,
    "plan_sku_code" "text" NOT NULL,
    "plan_name" "text" NOT NULL,
    "start_date" timestamp with time zone DEFAULT "now"() NOT NULL,
    "end_date" timestamp with time zone NOT NULL,
    "status" "text" DEFAULT 'active'::"text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


--
-- Name: mentor_arrangements; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE IF NOT EXISTS "public"."mentor_arrangements" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "mentor_name" "text" NOT NULL,
    "title" "text",
    "target_class" "text",
    "student_count" integer,
    "student_names" "text"[],
    "qq" "text",
    "created_at" timestamp with time zone DEFAULT "now"()
);


--
-- Name: operation_logs; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE IF NOT EXISTS "public"."operation_logs" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid",
    "user_name" character varying(100),
    "action" character varying(100) NOT NULL,
    "resource" character varying(100) NOT NULL,
    "resource_id" "uuid",
    "details" "jsonb",
    "ip_address" character varying(50),
    "user_agent" "text",
    "status" character varying(20),
    "created_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "operation_logs_status_check" CHECK ((("status")::"text" = ANY (ARRAY[('success'::character varying)::"text", ('failed'::character varying)::"text"])))
);


--
-- Name: orders; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE IF NOT EXISTS "public"."orders" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "package_type" "text" NOT NULL,
    "package_duration" "text" NOT NULL,
    "original_price" numeric(10,2) NOT NULL,
    "actual_price" numeric(10,2) NOT NULL,
    "payment_method" "text" DEFAULT 'wechat'::"text" NOT NULL,
    "payment_status" smallint DEFAULT 0 NOT NULL,
    "transaction_id" "text",
    "create_time" timestamp with time zone DEFAULT "now"() NOT NULL,
    "pay_time" timestamp with time zone,
    "expire_time" timestamp with time zone NOT NULL,
    "order_no" "text"
);


--
-- Name: payment_orders; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE IF NOT EXISTS "public"."payment_orders" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "order_no" "text" NOT NULL,
    "purchaser_email" "text" NOT NULL,
    "purchaser_role" "text" DEFAULT 'student'::"text" NOT NULL,
    "status" "public"."pay_order_status" DEFAULT 'pending'::"public"."pay_order_status" NOT NULL,
    "wechat_pay_url" "text",
    "total_amount" numeric(12,2) NOT NULL,
    "plan_snapshot" "jsonb" DEFAULT '{}'::"jsonb" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


--
-- Name: payment_refunds; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE IF NOT EXISTS "public"."payment_refunds" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "refund_no" "text" NOT NULL,
    "order_id" "uuid" NOT NULL,
    "order_no" "text" NOT NULL,
    "purchaser_email" "text" NOT NULL,
    "amount" numeric(12,2) NOT NULL,
    "reason" "text" DEFAULT ''::"text" NOT NULL,
    "status" "public"."refund_status" DEFAULT 'pending'::"public"."refund_status" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


--
-- Name: performance_monitor; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE IF NOT EXISTS "public"."performance_monitor" (
    "monitor_id" character varying(64) NOT NULL,
    "start_time" timestamp with time zone NOT NULL,
    "end_time" timestamp with time zone NOT NULL,
    "duration" integer NOT NULL,
    "function_name" character varying(255) NOT NULL,
    "request_params" "jsonb",
    "create_time" timestamp with time zone DEFAULT "now"() NOT NULL
);


--
-- Name: permissions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE IF NOT EXISTS "public"."permissions" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" character varying(100) NOT NULL,
    "display_name" character varying(200) NOT NULL,
    "resource" character varying(100) NOT NULL,
    "action" character varying(50) NOT NULL,
    "description" "text",
    "created_at" timestamp with time zone DEFAULT "now"()
);


--
-- Name: positions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE IF NOT EXISTS "public"."positions" (
    "position_id" integer NOT NULL,
    "position_name" character varying(100) NOT NULL,
    "position_type" smallint NOT NULL,
    "salary_range" character varying(50) NOT NULL,
    "required_skills" "jsonb" NOT NULL,
    "position_desc" character varying(500),
    "update_time" timestamp with time zone DEFAULT "now"(),
    "job_url" character varying(500),
    "company_id" integer,
    "competency_model_id" integer,
    "status" character varying(20) DEFAULT 'active'::character varying,
    CONSTRAINT "positions_position_type_check" CHECK (("position_type" = ANY (ARRAY[1, 2, 3, 4])))
);


--
-- Name: positions_position_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE IF NOT EXISTS "public"."positions_position_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: positions_position_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE "public"."positions_position_id_seq" OWNED BY "public"."positions"."position_id";


--
-- Name: project_progress_records; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE IF NOT EXISTS "public"."project_progress_records" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "project_id" "uuid" NOT NULL,
    "record_date" "date" NOT NULL,
    "progress_content" "text" NOT NULL,
    "evidence_files" "text"[],
    "recorder" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"()
);


--
-- Name: question_bank; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE IF NOT EXISTS "public"."question_bank" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "question_text" "text" NOT NULL,
    "question_type" character varying(50) NOT NULL,
    "options" "jsonb",
    "correct_answer" "jsonb",
    "score" integer DEFAULT 10 NOT NULL,
    "difficulty" character varying(20),
    "related_positions" "jsonb",
    "related_competencies" "jsonb",
    "explanation" "text",
    "status" character varying(20) DEFAULT 'active'::character varying,
    "created_by" "uuid",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "question_bank_difficulty_check" CHECK ((("difficulty")::"text" = ANY (ARRAY[('easy'::character varying)::"text", ('medium'::character varying)::"text", ('hard'::character varying)::"text"]))),
    CONSTRAINT "question_bank_question_type_check" CHECK ((("question_type")::"text" = ANY (ARRAY[('single_choice'::character varying)::"text", ('multiple_choice'::character varying)::"text", ('scenario'::character varying)::"text", ('practical'::character varying)::"text", ('interview'::character varying)::"text"]))),
    CONSTRAINT "question_bank_status_check" CHECK ((("status")::"text" = ANY (ARRAY[('active'::character varying)::"text", ('inactive'::character varying)::"text", ('draft'::character varying)::"text"])))
);


--
-- Name: resume_optimizations; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE IF NOT EXISTS "public"."resume_optimizations" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "original_resume_text" "text" NOT NULL,
    "original_resume_url" "text",
    "target_position" "text",
    "target_industry" "text",
    "analysis_result" "jsonb" NOT NULL,
    "optimization_suggestions" "jsonb" NOT NULL,
    "optimized_resume_text" "text",
    "optimized_resume_url" "text",
    "improvement_score" integer,
    "before_after_comparison" "jsonb",
    "is_applied" boolean DEFAULT false,
    "user_rating" integer,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


--
-- Name: resume_versions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE IF NOT EXISTS "public"."resume_versions" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_email" "text" NOT NULL,
    "name" "text" NOT NULL,
    "target_company" "text",
    "target_position" "text",
    "original_content" "text" DEFAULT ''::"text" NOT NULL,
    "optimized_content" "text" DEFAULT ''::"text" NOT NULL,
    "ats_score" integer,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "keyword_hits" "jsonb"
);


--
-- Name: role_permissions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE IF NOT EXISTS "public"."role_permissions" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "role_id" "uuid" NOT NULL,
    "permission_id" "uuid" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"()
);


--
-- Name: roles; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE IF NOT EXISTS "public"."roles" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" character varying(50) NOT NULL,
    "display_name" character varying(100) NOT NULL,
    "description" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


--
-- Name: student_applications; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE IF NOT EXISTS "public"."student_applications" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "position_id" "uuid" NOT NULL,
    "student_id" "uuid" NOT NULL,
    "student_name" "text" NOT NULL,
    "student_major" "text",
    "student_grade" "text",
    "contact_phone" "text",
    "competency_score" numeric(5,2),
    "match_score" numeric(5,2),
    "application_status" "text" DEFAULT '已投递'::"text",
    "applied_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "student_applications_application_status_check" CHECK (("application_status" = ANY (ARRAY['已投递'::"text", '企业已查看'::"text", '面试中'::"text", '已录用'::"text", '已淘汰'::"text"])))
);


--
-- Name: student_profiles; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE IF NOT EXISTS "public"."student_profiles" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "student_no" "text" NOT NULL,
    "name" "text" NOT NULL,
    "gender" "text",
    "birth_date" "text",
    "political_status" "text",
    "hometown" "text",
    "province" "text",
    "city" "text",
    "id_masked" "text",
    "phone_masked" "text",
    "major" "text",
    "class_name" "text",
    "mentor_name" "text",
    "mentor_title" "text",
    "mentor_qq" "text",
    "dorm_building" "text",
    "dorm_room" "text",
    "dorm_seat" "text",
    "dorm_counselor" "text",
    "dorm_class_info" "text",
    "created_at" timestamp with time zone DEFAULT "now"()
);


--
-- Name: user_profiles; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE IF NOT EXISTS "public"."user_profiles" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid",
    "email" "text" NOT NULL,
    "nickname" "text" NOT NULL,
    "phone" "text",
    "avatar_url" "text",
    "vip_level" "text" DEFAULT 'free'::"text",
    "vip_expire_at" timestamp with time zone,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "wechat_openid" "text",
    "wechat_unionid" "text",
    "qq_openid" "text",
    "alipay_user_id" "text",
    "login_type" "text" DEFAULT 'phone'::"text",
    "user_role" "text" DEFAULT 'student'::"text",
    "university_ref_id" integer,
    "college_id" "uuid",
    "university_name" "text",
    "college_name" "text",
    "invite_code" character varying(20),
    "invited_by" "uuid",
    "job_intent" "text",
    "graduation_year" "text",
    CONSTRAINT "user_profiles_login_type_check" CHECK (("login_type" = ANY (ARRAY['phone'::"text", 'wechat'::"text", 'qq'::"text", 'alipay'::"text"]))),
    CONSTRAINT "user_profiles_vip_level_check" CHECK (("vip_level" = ANY (ARRAY['free'::"text", 'premium'::"text", 'enterprise'::"text"])))
);


--
-- Name: student_talent; Type: VIEW; Schema: public; Owner: -
--

CREATE OR REPLACE VIEW "public"."student_talent" AS
 SELECT "up"."user_id",
    "up"."email",
    "up"."nickname",
    "up"."phone",
    "up"."university_name",
    "up"."college_name",
    "up"."job_intent",
    "up"."graduation_year",
    "up"."avatar_url",
    "latest"."job_title",
    "latest"."total_score",
    "latest"."tech_score",
    "latest"."general_score",
    "latest"."behavior_score",
    "latest"."experience_score",
    "latest"."completed_at" AS "assessment_at"
   FROM ("public"."user_profiles" "up"
     LEFT JOIN LATERAL ( SELECT "ar"."id",
            "ar"."user_email",
            "ar"."job_title",
            "ar"."total_score",
            "ar"."tech_score",
            "ar"."general_score",
            "ar"."behavior_score",
            "ar"."experience_score",
            "ar"."status",
            "ar"."completed_at",
            "ar"."created_at",
            "ar"."answers",
            "ar"."user_id"
           FROM "public"."assessment_records" "ar"
          WHERE ("ar"."user_id" = "up"."user_id")
          ORDER BY "ar"."completed_at" DESC
         LIMIT 1) "latest" ON (true))
  WHERE (("up"."user_role" = 'student'::"text") AND ("up"."user_id" IS NOT NULL));


--
-- Name: student_verifications; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE IF NOT EXISTS "public"."student_verifications" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "school_name" "text" NOT NULL,
    "student_id" "text" NOT NULL,
    "real_name" "text" NOT NULL,
    "student_card_image_url" "text",
    "verification_status" "text" DEFAULT 'pending'::"text" NOT NULL,
    "verified_at" timestamp with time zone,
    "rejected_reason" "text",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "student_verifications_verification_status_check" CHECK (("verification_status" = ANY (ARRAY['pending'::"text", 'approved'::"text", 'rejected'::"text"])))
);


--
-- Name: study_checkins; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE IF NOT EXISTS "public"."study_checkins" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_email" "text" NOT NULL,
    "checkin_date" "date" DEFAULT CURRENT_DATE NOT NULL,
    "note" "text",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


--
-- Name: subscriptions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE IF NOT EXISTS "public"."subscriptions" (
    "subscription_id" integer NOT NULL,
    "company_id" integer NOT NULL,
    "plan_type" character varying(50) NOT NULL,
    "plan_price" numeric(10,2),
    "start_date" "date" NOT NULL,
    "end_date" "date" NOT NULL,
    "max_positions" integer,
    "max_evaluations" integer,
    "max_resumes" integer,
    "features" "jsonb",
    "status" character varying(20) DEFAULT 'active'::character varying,
    "created_at" timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: subscriptions_subscription_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE IF NOT EXISTS "public"."subscriptions_subscription_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: subscriptions_subscription_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE "public"."subscriptions_subscription_id_seq" OWNED BY "public"."subscriptions"."subscription_id";


--
-- Name: system_config; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE IF NOT EXISTS "public"."system_config" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "config_key" character varying(100) NOT NULL,
    "config_value" "text" NOT NULL,
    "config_type" character varying(50) NOT NULL,
    "display_name" character varying(200) NOT NULL,
    "description" "text",
    "category" character varying(100),
    "is_public" boolean DEFAULT false,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "system_config_config_type_check" CHECK ((("config_type")::"text" = ANY (ARRAY[('string'::character varying)::"text", ('number'::character varying)::"text", ('boolean'::character varying)::"text", ('json'::character varying)::"text"])))
);


--
-- Name: training_submissions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE IF NOT EXISTS "public"."training_submissions" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "task_id" "uuid" NOT NULL,
    "class_id" "uuid" NOT NULL,
    "student_no" "text" NOT NULL,
    "evidence_chain" "jsonb" DEFAULT '[]'::"jsonb" NOT NULL,
    "script" "jsonb",
    "scores" "jsonb" DEFAULT '{}'::"jsonb" NOT NULL,
    "ai_comment" "text",
    "teacher_override" "jsonb",
    "status" "text" DEFAULT 'in_progress'::"text" NOT NULL,
    "started_at" timestamp with time zone,
    "completed_at" timestamp with time zone,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


--
-- Name: training_tasks; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE IF NOT EXISTS "public"."training_tasks" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "title" "text" NOT NULL,
    "description" "text" NOT NULL,
    "task_type" "text" NOT NULL,
    "related_positions" "jsonb" DEFAULT '[]'::"jsonb",
    "related_industries" "jsonb" DEFAULT '[]'::"jsonb",
    "difficulty_level" "text" NOT NULL,
    "estimated_duration" integer,
    "required_abilities" "jsonb" DEFAULT '[]'::"jsonb",
    "task_content" "jsonb" NOT NULL,
    "evaluation_criteria" "jsonb" NOT NULL,
    "reference_solution" "text",
    "tags" "jsonb" DEFAULT '[]'::"jsonb",
    "is_active" boolean DEFAULT true,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "class_id" "uuid",
    "scene_type" "text",
    "difficulty" "text",
    "deadline" timestamp with time zone,
    "status" "text" DEFAULT 'published'::"text" NOT NULL,
    "university_email" "text"
);


--
-- Name: universities; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE IF NOT EXISTS "public"."universities" (
    "university_id" integer NOT NULL,
    "university_name" character varying(200) NOT NULL,
    "university_type" character varying(50),
    "location" character varying(100),
    "contact_email" character varying(255),
    "contact_phone" character varying(20),
    "service_status" character varying(20) DEFAULT 'active'::character varying,
    "created_at" timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: universities_university_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE IF NOT EXISTS "public"."universities_university_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: universities_university_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE "public"."universities_university_id_seq" OWNED BY "public"."universities"."university_id";


--
-- Name: usage_records; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE IF NOT EXISTS "public"."usage_records" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_email" "text" NOT NULL,
    "usage_type" "text" NOT NULL,
    "usage_date" "date" DEFAULT CURRENT_DATE NOT NULL,
    "count" integer DEFAULT 1 NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


--
-- Name: user_achievements; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE IF NOT EXISTS "public"."user_achievements" (
    "id" bigint NOT NULL,
    "user_email" "text" NOT NULL,
    "achievement_id" "text" NOT NULL,
    "achievement_name" "text" NOT NULL,
    "unlocked_at" timestamp with time zone DEFAULT "now"()
);


--
-- Name: user_achievements_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE IF NOT EXISTS "public"."user_achievements_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: user_achievements_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE "public"."user_achievements_id_seq" OWNED BY "public"."user_achievements"."id";


--
-- Name: user_courses; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE IF NOT EXISTS "public"."user_courses" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_email" "text" NOT NULL,
    "course_id" "uuid" NOT NULL,
    "progress" integer DEFAULT 0 NOT NULL,
    "is_completed" boolean DEFAULT false NOT NULL,
    "completed_at" timestamp with time zone,
    "create_time" timestamp with time zone DEFAULT "now"() NOT NULL,
    "update_time" timestamp with time zone DEFAULT "now"() NOT NULL
);


--
-- Name: user_portrait; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE IF NOT EXISTS "public"."user_portrait" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "basic_info" "jsonb" DEFAULT '{}'::"jsonb",
    "job_target" "jsonb" DEFAULT '{}'::"jsonb",
    "assessment_history" "jsonb" DEFAULT '[]'::"jsonb",
    "learning_behavior" "jsonb" DEFAULT '{}'::"jsonb",
    "resume_experience" "jsonb" DEFAULT '{}'::"jsonb",
    "competency_model" "jsonb" DEFAULT '{}'::"jsonb",
    "ability_portrait" "jsonb" DEFAULT '{}'::"jsonb",
    "interview_history" "jsonb" DEFAULT '[]'::"jsonb",
    "recommended_learning" "jsonb" DEFAULT '{}'::"jsonb",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


--
-- Name: user_stats; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE IF NOT EXISTS "public"."user_stats" (
    "id" bigint NOT NULL,
    "user_email" "text" NOT NULL,
    "total_learning_minutes" integer DEFAULT 0,
    "completed_courses" integer DEFAULT 0,
    "ability_improvement_percent" numeric(5,2) DEFAULT 0,
    "ranking_percent" numeric(5,2) DEFAULT 100,
    "last_updated" timestamp with time zone DEFAULT "now"()
);


--
-- Name: user_stats_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE IF NOT EXISTS "public"."user_stats_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: user_stats_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE "public"."user_stats_id_seq" OWNED BY "public"."user_stats"."id";


--
-- Name: users; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE IF NOT EXISTS "public"."users" (
    "user_id" integer NOT NULL,
    "email" character varying(255),
    "phone" character varying(20),
    "password_hash" character varying(255),
    "user_name" character varying(100) NOT NULL,
    "role" character varying(20) NOT NULL,
    "avatar_url" character varying(500),
    "student_id" character varying(50),
    "university_id" integer,
    "major" character varying(100),
    "grade" integer,
    "education" character varying(20),
    "company_id" integer,
    "department" character varying(100),
    "university_staff_id" character varying(50),
    "status" character varying(20) DEFAULT 'active'::character varying,
    "created_at" timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    "updated_at" timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "users_role_check" CHECK ((("role")::"text" = ANY (ARRAY[('student'::character varying)::"text", ('company_hr'::character varying)::"text", ('university_staff'::character varying)::"text", ('admin'::character varying)::"text"])))
);


--
-- Name: users_user_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE IF NOT EXISTS "public"."users_user_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: users_user_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE "public"."users_user_id_seq" OWNED BY "public"."users"."user_id";


--
-- Name: vip_orders; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE IF NOT EXISTS "public"."vip_orders" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_email" "text" NOT NULL,
    "vip_level" "text" NOT NULL,
    "amount" numeric(10,2) NOT NULL,
    "payment_method" "text" DEFAULT 'bank_transfer'::"text",
    "payment_status" "text" DEFAULT 'pending'::"text",
    "payment_proof_url" "text",
    "bank_card_number" "text" DEFAULT '6222031402011005175'::"text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "paid_at" timestamp with time zone,
    "order_no" "text",
    "duration_months" integer,
    "original_price" numeric(10,2),
    "actual_price" numeric(10,2),
    "transaction_id" "text",
    "updated_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "vip_orders_payment_status_check" CHECK (("payment_status" = ANY (ARRAY['pending'::"text", 'paid'::"text", 'cancelled'::"text"]))),
    CONSTRAINT "vip_orders_vip_level_check" CHECK (("vip_level" = ANY (ARRAY['premium'::"text", 'enterprise'::"text"])))
);


--
-- Name: vip_plans; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE IF NOT EXISTS "public"."vip_plans" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "vip_level" "text" NOT NULL,
    "duration_months" integer NOT NULL,
    "original_price" numeric(10,2) NOT NULL,
    "discount_price" numeric(10,2) NOT NULL,
    "features" "jsonb" NOT NULL,
    "is_active" boolean DEFAULT true,
    "sort_order" integer DEFAULT 0,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "vip_plans_vip_level_check" CHECK (("vip_level" = ANY (ARRAY['premium'::"text", 'enterprise'::"text"])))
);


--
-- Name: web_content_summary_task; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE IF NOT EXISTS "public"."web_content_summary_task" (
    "task_id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid",
    "task_name" "text" NOT NULL,
    "url_list" "jsonb" DEFAULT '[]'::"jsonb" NOT NULL,
    "summary_result" "jsonb" DEFAULT '[]'::"jsonb" NOT NULL,
    "status" smallint DEFAULT 0 NOT NULL,
    "progress" integer DEFAULT 0 NOT NULL,
    "current_url" "text",
    "generation_log" "text",
    "create_time" timestamp with time zone DEFAULT "now"() NOT NULL,
    "update_time" timestamp with time zone DEFAULT "now"() NOT NULL
);


--
-- Name: assessment_results id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."assessment_results" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."assessment_results_id_seq"'::"regclass");


--
-- Name: assessment_tasks id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."assessment_tasks" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."assessment_tasks_id_seq"'::"regclass");


--
-- Name: assessment_templates id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."assessment_templates" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."assessment_templates_id_seq"'::"regclass");


--
-- Name: companies company_id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."companies" ALTER COLUMN "company_id" SET DEFAULT "nextval"('"public"."companies_company_id_seq"'::"regclass");


--
-- Name: competency_models model_id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."competency_models" ALTER COLUMN "model_id" SET DEFAULT "nextval"('"public"."competency_models_model_id_seq"'::"regclass");


--
-- Name: course_progress id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."course_progress" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."course_progress_id_seq"'::"regclass");


--
-- Name: courses id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."courses" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."courses_id_seq"'::"regclass");


--
-- Name: evaluations evaluation_id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."evaluations" ALTER COLUMN "evaluation_id" SET DEFAULT "nextval"('"public"."evaluations_evaluation_id_seq"'::"regclass");


--
-- Name: growth_paths id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."growth_paths" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."growth_paths_id_seq"'::"regclass");


--
-- Name: growth_plans plan_id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."growth_plans" ALTER COLUMN "plan_id" SET DEFAULT "nextval"('"public"."growth_plans_plan_id_seq"'::"regclass");


--
-- Name: learning_resources resource_id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."learning_resources" ALTER COLUMN "resource_id" SET DEFAULT "nextval"('"public"."learning_resources_resource_id_seq"'::"regclass");


--
-- Name: matches match_id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."matches" ALTER COLUMN "match_id" SET DEFAULT "nextval"('"public"."matches_match_id_seq"'::"regclass");


--
-- Name: positions position_id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."positions" ALTER COLUMN "position_id" SET DEFAULT "nextval"('"public"."positions_position_id_seq"'::"regclass");


--
-- Name: subscriptions subscription_id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."subscriptions" ALTER COLUMN "subscription_id" SET DEFAULT "nextval"('"public"."subscriptions_subscription_id_seq"'::"regclass");


--
-- Name: universities university_id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."universities" ALTER COLUMN "university_id" SET DEFAULT "nextval"('"public"."universities_university_id_seq"'::"regclass");


--
-- Name: user_achievements id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."user_achievements" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."user_achievements_id_seq"'::"regclass");


--
-- Name: user_stats id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."user_stats" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."user_stats_id_seq"'::"regclass");


--
-- Name: users user_id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."users" ALTER COLUMN "user_id" SET DEFAULT "nextval"('"public"."users_user_id_seq"'::"regclass");


--
-- Name: ability_profiles ability_profiles_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

DO $pg_schema_restore$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint con
    JOIN pg_class c ON c.oid = con.conrelid
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE con.conname = 'ability_profiles_pkey'
      AND n.nspname = 'public'
      AND c.relname = 'ability_profiles'
  ) THEN
    EXECUTE $pg_schema_sql$
ALTER TABLE ONLY "public"."ability_profiles"
    ADD CONSTRAINT "ability_profiles_pkey" PRIMARY KEY ("id");
$pg_schema_sql$;
  END IF;
END
$pg_schema_restore$;


--
-- Name: affiliate_rewards affiliate_rewards_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

DO $pg_schema_restore$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint con
    JOIN pg_class c ON c.oid = con.conrelid
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE con.conname = 'affiliate_rewards_pkey'
      AND n.nspname = 'public'
      AND c.relname = 'affiliate_rewards'
  ) THEN
    EXECUTE $pg_schema_sql$
ALTER TABLE ONLY "public"."affiliate_rewards"
    ADD CONSTRAINT "affiliate_rewards_pkey" PRIMARY KEY ("id");
$pg_schema_sql$;
  END IF;
END
$pg_schema_restore$;


--
-- Name: ai_interview_record ai_interview_record_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

DO $pg_schema_restore$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint con
    JOIN pg_class c ON c.oid = con.conrelid
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE con.conname = 'ai_interview_record_pkey'
      AND n.nspname = 'public'
      AND c.relname = 'ai_interview_record'
  ) THEN
    EXECUTE $pg_schema_sql$
ALTER TABLE ONLY "public"."ai_interview_record"
    ADD CONSTRAINT "ai_interview_record_pkey" PRIMARY KEY ("id");
$pg_schema_sql$;
  END IF;
END
$pg_schema_restore$;


--
-- Name: assessment_record assessment_record_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

DO $pg_schema_restore$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint con
    JOIN pg_class c ON c.oid = con.conrelid
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE con.conname = 'assessment_record_pkey'
      AND n.nspname = 'public'
      AND c.relname = 'assessment_record'
  ) THEN
    EXECUTE $pg_schema_sql$
ALTER TABLE ONLY "public"."assessment_record"
    ADD CONSTRAINT "assessment_record_pkey" PRIMARY KEY ("id");
$pg_schema_sql$;
  END IF;
END
$pg_schema_restore$;


--
-- Name: assessment_records assessment_records_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

DO $pg_schema_restore$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint con
    JOIN pg_class c ON c.oid = con.conrelid
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE con.conname = 'assessment_records_pkey'
      AND n.nspname = 'public'
      AND c.relname = 'assessment_records'
  ) THEN
    EXECUTE $pg_schema_sql$
ALTER TABLE ONLY "public"."assessment_records"
    ADD CONSTRAINT "assessment_records_pkey" PRIMARY KEY ("id");
$pg_schema_sql$;
  END IF;
END
$pg_schema_restore$;


--
-- Name: assessment_results assessment_results_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

DO $pg_schema_restore$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint con
    JOIN pg_class c ON c.oid = con.conrelid
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE con.conname = 'assessment_results_pkey'
      AND n.nspname = 'public'
      AND c.relname = 'assessment_results'
  ) THEN
    EXECUTE $pg_schema_sql$
ALTER TABLE ONLY "public"."assessment_results"
    ADD CONSTRAINT "assessment_results_pkey" PRIMARY KEY ("id");
$pg_schema_sql$;
  END IF;
END
$pg_schema_restore$;


--
-- Name: assessment_tasks assessment_tasks_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

DO $pg_schema_restore$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint con
    JOIN pg_class c ON c.oid = con.conrelid
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE con.conname = 'assessment_tasks_pkey'
      AND n.nspname = 'public'
      AND c.relname = 'assessment_tasks'
  ) THEN
    EXECUTE $pg_schema_sql$
ALTER TABLE ONLY "public"."assessment_tasks"
    ADD CONSTRAINT "assessment_tasks_pkey" PRIMARY KEY ("id");
$pg_schema_sql$;
  END IF;
END
$pg_schema_restore$;


--
-- Name: assessment_templates assessment_templates_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

DO $pg_schema_restore$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint con
    JOIN pg_class c ON c.oid = con.conrelid
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE con.conname = 'assessment_templates_pkey'
      AND n.nspname = 'public'
      AND c.relname = 'assessment_templates'
  ) THEN
    EXECUTE $pg_schema_sql$
ALTER TABLE ONLY "public"."assessment_templates"
    ADD CONSTRAINT "assessment_templates_pkey" PRIMARY KEY ("id");
$pg_schema_sql$;
  END IF;
END
$pg_schema_restore$;


--
-- Name: assessments assessments_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

DO $pg_schema_restore$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint con
    JOIN pg_class c ON c.oid = con.conrelid
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE con.conname = 'assessments_pkey'
      AND n.nspname = 'public'
      AND c.relname = 'assessments'
  ) THEN
    EXECUTE $pg_schema_sql$
ALTER TABLE ONLY "public"."assessments"
    ADD CONSTRAINT "assessments_pkey" PRIMARY KEY ("id");
$pg_schema_sql$;
  END IF;
END
$pg_schema_restore$;


--
-- Name: candidate_assessment_account candidate_assessment_account_account_code_key; Type: CONSTRAINT; Schema: public; Owner: -
--

DO $pg_schema_restore$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint con
    JOIN pg_class c ON c.oid = con.conrelid
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE con.conname = 'candidate_assessment_account_account_code_key'
      AND n.nspname = 'public'
      AND c.relname = 'candidate_assessment_account'
  ) THEN
    EXECUTE $pg_schema_sql$
ALTER TABLE ONLY "public"."candidate_assessment_account"
    ADD CONSTRAINT "candidate_assessment_account_account_code_key" UNIQUE ("account_code");
$pg_schema_sql$;
  END IF;
END
$pg_schema_restore$;


--
-- Name: candidate_assessment_account candidate_assessment_account_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

DO $pg_schema_restore$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint con
    JOIN pg_class c ON c.oid = con.conrelid
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE con.conname = 'candidate_assessment_account_pkey'
      AND n.nspname = 'public'
      AND c.relname = 'candidate_assessment_account'
  ) THEN
    EXECUTE $pg_schema_sql$
ALTER TABLE ONLY "public"."candidate_assessment_account"
    ADD CONSTRAINT "candidate_assessment_account_pkey" PRIMARY KEY ("id");
$pg_schema_sql$;
  END IF;
END
$pg_schema_restore$;


--
-- Name: candidates candidates_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

DO $pg_schema_restore$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint con
    JOIN pg_class c ON c.oid = con.conrelid
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE con.conname = 'candidates_pkey'
      AND n.nspname = 'public'
      AND c.relname = 'candidates'
  ) THEN
    EXECUTE $pg_schema_sql$
ALTER TABLE ONLY "public"."candidates"
    ADD CONSTRAINT "candidates_pkey" PRIMARY KEY ("id");
$pg_schema_sql$;
  END IF;
END
$pg_schema_restore$;


--
-- Name: career_consultations career_consultations_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

DO $pg_schema_restore$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint con
    JOIN pg_class c ON c.oid = con.conrelid
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE con.conname = 'career_consultations_pkey'
      AND n.nspname = 'public'
      AND c.relname = 'career_consultations'
  ) THEN
    EXECUTE $pg_schema_sql$
ALTER TABLE ONLY "public"."career_consultations"
    ADD CONSTRAINT "career_consultations_pkey" PRIMARY KEY ("id");
$pg_schema_sql$;
  END IF;
END
$pg_schema_restore$;


--
-- Name: class_students class_students_class_id_student_no_key; Type: CONSTRAINT; Schema: public; Owner: -
--

DO $pg_schema_restore$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint con
    JOIN pg_class c ON c.oid = con.conrelid
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE con.conname = 'class_students_class_id_student_no_key'
      AND n.nspname = 'public'
      AND c.relname = 'class_students'
  ) THEN
    EXECUTE $pg_schema_sql$
ALTER TABLE ONLY "public"."class_students"
    ADD CONSTRAINT "class_students_class_id_student_no_key" UNIQUE ("class_id", "student_no");
$pg_schema_sql$;
  END IF;
END
$pg_schema_restore$;


--
-- Name: class_students class_students_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

DO $pg_schema_restore$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint con
    JOIN pg_class c ON c.oid = con.conrelid
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE con.conname = 'class_students_pkey'
      AND n.nspname = 'public'
      AND c.relname = 'class_students'
  ) THEN
    EXECUTE $pg_schema_sql$
ALTER TABLE ONLY "public"."class_students"
    ADD CONSTRAINT "class_students_pkey" PRIMARY KEY ("id");
$pg_schema_sql$;
  END IF;
END
$pg_schema_restore$;


--
-- Name: classes classes_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

DO $pg_schema_restore$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint con
    JOIN pg_class c ON c.oid = con.conrelid
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE con.conname = 'classes_pkey'
      AND n.nspname = 'public'
      AND c.relname = 'classes'
  ) THEN
    EXECUTE $pg_schema_sql$
ALTER TABLE ONLY "public"."classes"
    ADD CONSTRAINT "classes_pkey" PRIMARY KEY ("id");
$pg_schema_sql$;
  END IF;
END
$pg_schema_restore$;


--
-- Name: colleges colleges_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

DO $pg_schema_restore$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint con
    JOIN pg_class c ON c.oid = con.conrelid
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE con.conname = 'colleges_pkey'
      AND n.nspname = 'public'
      AND c.relname = 'colleges'
  ) THEN
    EXECUTE $pg_schema_sql$
ALTER TABLE ONLY "public"."colleges"
    ADD CONSTRAINT "colleges_pkey" PRIMARY KEY ("id");
$pg_schema_sql$;
  END IF;
END
$pg_schema_restore$;


--
-- Name: colleges colleges_university_id_name_key; Type: CONSTRAINT; Schema: public; Owner: -
--

DO $pg_schema_restore$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint con
    JOIN pg_class c ON c.oid = con.conrelid
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE con.conname = 'colleges_university_id_name_key'
      AND n.nspname = 'public'
      AND c.relname = 'colleges'
  ) THEN
    EXECUTE $pg_schema_sql$
ALTER TABLE ONLY "public"."colleges"
    ADD CONSTRAINT "colleges_university_id_name_key" UNIQUE ("university_id", "name");
$pg_schema_sql$;
  END IF;
END
$pg_schema_restore$;


--
-- Name: companies companies_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

DO $pg_schema_restore$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint con
    JOIN pg_class c ON c.oid = con.conrelid
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE con.conname = 'companies_pkey'
      AND n.nspname = 'public'
      AND c.relname = 'companies'
  ) THEN
    EXECUTE $pg_schema_sql$
ALTER TABLE ONLY "public"."companies"
    ADD CONSTRAINT "companies_pkey" PRIMARY KEY ("company_id");
$pg_schema_sql$;
  END IF;
END
$pg_schema_restore$;


--
-- Name: company_positions company_positions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

DO $pg_schema_restore$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint con
    JOIN pg_class c ON c.oid = con.conrelid
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE con.conname = 'company_positions_pkey'
      AND n.nspname = 'public'
      AND c.relname = 'company_positions'
  ) THEN
    EXECUTE $pg_schema_sql$
ALTER TABLE ONLY "public"."company_positions"
    ADD CONSTRAINT "company_positions_pkey" PRIMARY KEY ("id");
$pg_schema_sql$;
  END IF;
END
$pg_schema_restore$;


--
-- Name: competency_models competency_models_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

DO $pg_schema_restore$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint con
    JOIN pg_class c ON c.oid = con.conrelid
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE con.conname = 'competency_models_pkey'
      AND n.nspname = 'public'
      AND c.relname = 'competency_models'
  ) THEN
    EXECUTE $pg_schema_sql$
ALTER TABLE ONLY "public"."competency_models"
    ADD CONSTRAINT "competency_models_pkey" PRIMARY KEY ("model_id");
$pg_schema_sql$;
  END IF;
END
$pg_schema_restore$;


--
-- Name: cooperation_agreements cooperation_agreements_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

DO $pg_schema_restore$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint con
    JOIN pg_class c ON c.oid = con.conrelid
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE con.conname = 'cooperation_agreements_pkey'
      AND n.nspname = 'public'
      AND c.relname = 'cooperation_agreements'
  ) THEN
    EXECUTE $pg_schema_sql$
ALTER TABLE ONLY "public"."cooperation_agreements"
    ADD CONSTRAINT "cooperation_agreements_pkey" PRIMARY KEY ("id");
$pg_schema_sql$;
  END IF;
END
$pg_schema_restore$;


--
-- Name: cooperation_companies cooperation_companies_credit_code_key; Type: CONSTRAINT; Schema: public; Owner: -
--

DO $pg_schema_restore$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint con
    JOIN pg_class c ON c.oid = con.conrelid
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE con.conname = 'cooperation_companies_credit_code_key'
      AND n.nspname = 'public'
      AND c.relname = 'cooperation_companies'
  ) THEN
    EXECUTE $pg_schema_sql$
ALTER TABLE ONLY "public"."cooperation_companies"
    ADD CONSTRAINT "cooperation_companies_credit_code_key" UNIQUE ("credit_code");
$pg_schema_sql$;
  END IF;
END
$pg_schema_restore$;


--
-- Name: cooperation_companies cooperation_companies_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

DO $pg_schema_restore$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint con
    JOIN pg_class c ON c.oid = con.conrelid
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE con.conname = 'cooperation_companies_pkey'
      AND n.nspname = 'public'
      AND c.relname = 'cooperation_companies'
  ) THEN
    EXECUTE $pg_schema_sql$
ALTER TABLE ONLY "public"."cooperation_companies"
    ADD CONSTRAINT "cooperation_companies_pkey" PRIMARY KEY ("id");
$pg_schema_sql$;
  END IF;
END
$pg_schema_restore$;


--
-- Name: cooperation_plans cooperation_plans_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

DO $pg_schema_restore$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint con
    JOIN pg_class c ON c.oid = con.conrelid
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE con.conname = 'cooperation_plans_pkey'
      AND n.nspname = 'public'
      AND c.relname = 'cooperation_plans'
  ) THEN
    EXECUTE $pg_schema_sql$
ALTER TABLE ONLY "public"."cooperation_plans"
    ADD CONSTRAINT "cooperation_plans_pkey" PRIMARY KEY ("id");
$pg_schema_sql$;
  END IF;
END
$pg_schema_restore$;


--
-- Name: cooperation_projects cooperation_projects_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

DO $pg_schema_restore$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint con
    JOIN pg_class c ON c.oid = con.conrelid
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE con.conname = 'cooperation_projects_pkey'
      AND n.nspname = 'public'
      AND c.relname = 'cooperation_projects'
  ) THEN
    EXECUTE $pg_schema_sql$
ALTER TABLE ONLY "public"."cooperation_projects"
    ADD CONSTRAINT "cooperation_projects_pkey" PRIMARY KEY ("id");
$pg_schema_sql$;
  END IF;
END
$pg_schema_restore$;


--
-- Name: course_progress course_progress_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

DO $pg_schema_restore$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint con
    JOIN pg_class c ON c.oid = con.conrelid
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE con.conname = 'course_progress_pkey'
      AND n.nspname = 'public'
      AND c.relname = 'course_progress'
  ) THEN
    EXECUTE $pg_schema_sql$
ALTER TABLE ONLY "public"."course_progress"
    ADD CONSTRAINT "course_progress_pkey" PRIMARY KEY ("id");
$pg_schema_sql$;
  END IF;
END
$pg_schema_restore$;


--
-- Name: course_progress course_progress_user_email_course_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

DO $pg_schema_restore$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint con
    JOIN pg_class c ON c.oid = con.conrelid
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE con.conname = 'course_progress_user_email_course_id_key'
      AND n.nspname = 'public'
      AND c.relname = 'course_progress'
  ) THEN
    EXECUTE $pg_schema_sql$
ALTER TABLE ONLY "public"."course_progress"
    ADD CONSTRAINT "course_progress_user_email_course_id_key" UNIQUE ("user_email", "course_id");
$pg_schema_sql$;
  END IF;
END
$pg_schema_restore$;


--
-- Name: course_study course_study_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

DO $pg_schema_restore$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint con
    JOIN pg_class c ON c.oid = con.conrelid
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE con.conname = 'course_study_pkey'
      AND n.nspname = 'public'
      AND c.relname = 'course_study'
  ) THEN
    EXECUTE $pg_schema_sql$
ALTER TABLE ONLY "public"."course_study"
    ADD CONSTRAINT "course_study_pkey" PRIMARY KEY ("id");
$pg_schema_sql$;
  END IF;
END
$pg_schema_restore$;


--
-- Name: course_study course_study_user_id_course_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

DO $pg_schema_restore$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint con
    JOIN pg_class c ON c.oid = con.conrelid
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE con.conname = 'course_study_user_id_course_id_key'
      AND n.nspname = 'public'
      AND c.relname = 'course_study'
  ) THEN
    EXECUTE $pg_schema_sql$
ALTER TABLE ONLY "public"."course_study"
    ADD CONSTRAINT "course_study_user_id_course_id_key" UNIQUE ("user_id", "course_id");
$pg_schema_sql$;
  END IF;
END
$pg_schema_restore$;


--
-- Name: courses courses_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

DO $pg_schema_restore$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint con
    JOIN pg_class c ON c.oid = con.conrelid
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE con.conname = 'courses_pkey'
      AND n.nspname = 'public'
      AND c.relname = 'courses'
  ) THEN
    EXECUTE $pg_schema_sql$
ALTER TABLE ONLY "public"."courses"
    ADD CONSTRAINT "courses_pkey" PRIMARY KEY ("id");
$pg_schema_sql$;
  END IF;
END
$pg_schema_restore$;


--
-- Name: deep_research_task deep_research_task_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

DO $pg_schema_restore$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint con
    JOIN pg_class c ON c.oid = con.conrelid
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE con.conname = 'deep_research_task_pkey'
      AND n.nspname = 'public'
      AND c.relname = 'deep_research_task'
  ) THEN
    EXECUTE $pg_schema_sql$
ALTER TABLE ONLY "public"."deep_research_task"
    ADD CONSTRAINT "deep_research_task_pkey" PRIMARY KEY ("task_id");
$pg_schema_sql$;
  END IF;
END
$pg_schema_restore$;


--
-- Name: dorm_members dorm_members_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

DO $pg_schema_restore$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint con
    JOIN pg_class c ON c.oid = con.conrelid
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE con.conname = 'dorm_members_pkey'
      AND n.nspname = 'public'
      AND c.relname = 'dorm_members'
  ) THEN
    EXECUTE $pg_schema_sql$
ALTER TABLE ONLY "public"."dorm_members"
    ADD CONSTRAINT "dorm_members_pkey" PRIMARY KEY ("id");
$pg_schema_sql$;
  END IF;
END
$pg_schema_restore$;


--
-- Name: enterprise_competency_model enterprise_competency_model_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

DO $pg_schema_restore$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint con
    JOIN pg_class c ON c.oid = con.conrelid
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE con.conname = 'enterprise_competency_model_pkey'
      AND n.nspname = 'public'
      AND c.relname = 'enterprise_competency_model'
  ) THEN
    EXECUTE $pg_schema_sql$
ALTER TABLE ONLY "public"."enterprise_competency_model"
    ADD CONSTRAINT "enterprise_competency_model_pkey" PRIMARY KEY ("id");
$pg_schema_sql$;
  END IF;
END
$pg_schema_restore$;


--
-- Name: enterprise_hiring_cache enterprise_hiring_cache_keyword_key; Type: CONSTRAINT; Schema: public; Owner: -
--

DO $pg_schema_restore$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint con
    JOIN pg_class c ON c.oid = con.conrelid
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE con.conname = 'enterprise_hiring_cache_keyword_key'
      AND n.nspname = 'public'
      AND c.relname = 'enterprise_hiring_cache'
  ) THEN
    EXECUTE $pg_schema_sql$
ALTER TABLE ONLY "public"."enterprise_hiring_cache"
    ADD CONSTRAINT "enterprise_hiring_cache_keyword_key" UNIQUE ("keyword");
$pg_schema_sql$;
  END IF;
END
$pg_schema_restore$;


--
-- Name: enterprise_hiring_cache enterprise_hiring_cache_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

DO $pg_schema_restore$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint con
    JOIN pg_class c ON c.oid = con.conrelid
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE con.conname = 'enterprise_hiring_cache_pkey'
      AND n.nspname = 'public'
      AND c.relname = 'enterprise_hiring_cache'
  ) THEN
    EXECUTE $pg_schema_sql$
ALTER TABLE ONLY "public"."enterprise_hiring_cache"
    ADD CONSTRAINT "enterprise_hiring_cache_pkey" PRIMARY KEY ("id");
$pg_schema_sql$;
  END IF;
END
$pg_schema_restore$;


--
-- Name: enterprise_hiring_query_history enterprise_hiring_query_history_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

DO $pg_schema_restore$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint con
    JOIN pg_class c ON c.oid = con.conrelid
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE con.conname = 'enterprise_hiring_query_history_pkey'
      AND n.nspname = 'public'
      AND c.relname = 'enterprise_hiring_query_history'
  ) THEN
    EXECUTE $pg_schema_sql$
ALTER TABLE ONLY "public"."enterprise_hiring_query_history"
    ADD CONSTRAINT "enterprise_hiring_query_history_pkey" PRIMARY KEY ("id");
$pg_schema_sql$;
  END IF;
END
$pg_schema_restore$;


--
-- Name: error_log error_log_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

DO $pg_schema_restore$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint con
    JOIN pg_class c ON c.oid = con.conrelid
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE con.conname = 'error_log_pkey'
      AND n.nspname = 'public'
      AND c.relname = 'error_log'
  ) THEN
    EXECUTE $pg_schema_sql$
ALTER TABLE ONLY "public"."error_log"
    ADD CONSTRAINT "error_log_pkey" PRIMARY KEY ("log_id");
$pg_schema_sql$;
  END IF;
END
$pg_schema_restore$;


--
-- Name: evaluations evaluations_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

DO $pg_schema_restore$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint con
    JOIN pg_class c ON c.oid = con.conrelid
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE con.conname = 'evaluations_pkey'
      AND n.nspname = 'public'
      AND c.relname = 'evaluations'
  ) THEN
    EXECUTE $pg_schema_sql$
ALTER TABLE ONLY "public"."evaluations"
    ADD CONSTRAINT "evaluations_pkey" PRIMARY KEY ("evaluation_id");
$pg_schema_sql$;
  END IF;
END
$pg_schema_restore$;


--
-- Name: growth_paths growth_paths_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

DO $pg_schema_restore$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint con
    JOIN pg_class c ON c.oid = con.conrelid
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE con.conname = 'growth_paths_pkey'
      AND n.nspname = 'public'
      AND c.relname = 'growth_paths'
  ) THEN
    EXECUTE $pg_schema_sql$
ALTER TABLE ONLY "public"."growth_paths"
    ADD CONSTRAINT "growth_paths_pkey" PRIMARY KEY ("id");
$pg_schema_sql$;
  END IF;
END
$pg_schema_restore$;


--
-- Name: growth_plans growth_plans_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

DO $pg_schema_restore$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint con
    JOIN pg_class c ON c.oid = con.conrelid
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE con.conname = 'growth_plans_pkey'
      AND n.nspname = 'public'
      AND c.relname = 'growth_plans'
  ) THEN
    EXECUTE $pg_schema_sql$
ALTER TABLE ONLY "public"."growth_plans"
    ADD CONSTRAINT "growth_plans_pkey" PRIMARY KEY ("plan_id");
$pg_schema_sql$;
  END IF;
END
$pg_schema_restore$;


--
-- Name: internship_paths internship_paths_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

DO $pg_schema_restore$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint con
    JOIN pg_class c ON c.oid = con.conrelid
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE con.conname = 'internship_paths_pkey'
      AND n.nspname = 'public'
      AND c.relname = 'internship_paths'
  ) THEN
    EXECUTE $pg_schema_sql$
ALTER TABLE ONLY "public"."internship_paths"
    ADD CONSTRAINT "internship_paths_pkey" PRIMARY KEY ("id");
$pg_schema_sql$;
  END IF;
END
$pg_schema_restore$;


--
-- Name: interview_simulations interview_simulations_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

DO $pg_schema_restore$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint con
    JOIN pg_class c ON c.oid = con.conrelid
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE con.conname = 'interview_simulations_pkey'
      AND n.nspname = 'public'
      AND c.relname = 'interview_simulations'
  ) THEN
    EXECUTE $pg_schema_sql$
ALTER TABLE ONLY "public"."interview_simulations"
    ADD CONSTRAINT "interview_simulations_pkey" PRIMARY KEY ("id");
$pg_schema_sql$;
  END IF;
END
$pg_schema_restore$;


--
-- Name: job_applications job_applications_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

DO $pg_schema_restore$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint con
    JOIN pg_class c ON c.oid = con.conrelid
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE con.conname = 'job_applications_pkey'
      AND n.nspname = 'public'
      AND c.relname = 'job_applications'
  ) THEN
    EXECUTE $pg_schema_sql$
ALTER TABLE ONLY "public"."job_applications"
    ADD CONSTRAINT "job_applications_pkey" PRIMARY KEY ("id");
$pg_schema_sql$;
  END IF;
END
$pg_schema_restore$;


--
-- Name: job_favorites job_favorites_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

DO $pg_schema_restore$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint con
    JOIN pg_class c ON c.oid = con.conrelid
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE con.conname = 'job_favorites_pkey'
      AND n.nspname = 'public'
      AND c.relname = 'job_favorites'
  ) THEN
    EXECUTE $pg_schema_sql$
ALTER TABLE ONLY "public"."job_favorites"
    ADD CONSTRAINT "job_favorites_pkey" PRIMARY KEY ("id");
$pg_schema_sql$;
  END IF;
END
$pg_schema_restore$;


--
-- Name: job_favorites job_favorites_user_email_job_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

DO $pg_schema_restore$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint con
    JOIN pg_class c ON c.oid = con.conrelid
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE con.conname = 'job_favorites_user_email_job_id_key'
      AND n.nspname = 'public'
      AND c.relname = 'job_favorites'
  ) THEN
    EXECUTE $pg_schema_sql$
ALTER TABLE ONLY "public"."job_favorites"
    ADD CONSTRAINT "job_favorites_user_email_job_id_key" UNIQUE ("user_email", "job_id");
$pg_schema_sql$;
  END IF;
END
$pg_schema_restore$;


--
-- Name: job_seeker_profiles job_seeker_profiles_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

DO $pg_schema_restore$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint con
    JOIN pg_class c ON c.oid = con.conrelid
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE con.conname = 'job_seeker_profiles_pkey'
      AND n.nspname = 'public'
      AND c.relname = 'job_seeker_profiles'
  ) THEN
    EXECUTE $pg_schema_sql$
ALTER TABLE ONLY "public"."job_seeker_profiles"
    ADD CONSTRAINT "job_seeker_profiles_pkey" PRIMARY KEY ("id");
$pg_schema_sql$;
  END IF;
END
$pg_schema_restore$;


--
-- Name: learning_plan_task learning_plan_task_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

DO $pg_schema_restore$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint con
    JOIN pg_class c ON c.oid = con.conrelid
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE con.conname = 'learning_plan_task_pkey'
      AND n.nspname = 'public'
      AND c.relname = 'learning_plan_task'
  ) THEN
    EXECUTE $pg_schema_sql$
ALTER TABLE ONLY "public"."learning_plan_task"
    ADD CONSTRAINT "learning_plan_task_pkey" PRIMARY KEY ("id");
$pg_schema_sql$;
  END IF;
END
$pg_schema_restore$;


--
-- Name: learning_plan_task learning_plan_task_plan_id_task_key_key; Type: CONSTRAINT; Schema: public; Owner: -
--

DO $pg_schema_restore$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint con
    JOIN pg_class c ON c.oid = con.conrelid
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE con.conname = 'learning_plan_task_plan_id_task_key_key'
      AND n.nspname = 'public'
      AND c.relname = 'learning_plan_task'
  ) THEN
    EXECUTE $pg_schema_sql$
ALTER TABLE ONLY "public"."learning_plan_task"
    ADD CONSTRAINT "learning_plan_task_plan_id_task_key_key" UNIQUE ("plan_id", "task_key");
$pg_schema_sql$;
  END IF;
END
$pg_schema_restore$;


--
-- Name: learning_plans learning_plans_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

DO $pg_schema_restore$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint con
    JOIN pg_class c ON c.oid = con.conrelid
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE con.conname = 'learning_plans_pkey'
      AND n.nspname = 'public'
      AND c.relname = 'learning_plans'
  ) THEN
    EXECUTE $pg_schema_sql$
ALTER TABLE ONLY "public"."learning_plans"
    ADD CONSTRAINT "learning_plans_pkey" PRIMARY KEY ("id");
$pg_schema_sql$;
  END IF;
END
$pg_schema_restore$;


--
-- Name: learning_records learning_records_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

DO $pg_schema_restore$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint con
    JOIN pg_class c ON c.oid = con.conrelid
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE con.conname = 'learning_records_pkey'
      AND n.nspname = 'public'
      AND c.relname = 'learning_records'
  ) THEN
    EXECUTE $pg_schema_sql$
ALTER TABLE ONLY "public"."learning_records"
    ADD CONSTRAINT "learning_records_pkey" PRIMARY KEY ("id");
$pg_schema_sql$;
  END IF;
END
$pg_schema_restore$;


--
-- Name: learning_resources learning_resources_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

DO $pg_schema_restore$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint con
    JOIN pg_class c ON c.oid = con.conrelid
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE con.conname = 'learning_resources_pkey'
      AND n.nspname = 'public'
      AND c.relname = 'learning_resources'
  ) THEN
    EXECUTE $pg_schema_sql$
ALTER TABLE ONLY "public"."learning_resources"
    ADD CONSTRAINT "learning_resources_pkey" PRIMARY KEY ("resource_id");
$pg_schema_sql$;
  END IF;
END
$pg_schema_restore$;


--
-- Name: matches matches_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

DO $pg_schema_restore$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint con
    JOIN pg_class c ON c.oid = con.conrelid
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE con.conname = 'matches_pkey'
      AND n.nspname = 'public'
      AND c.relname = 'matches'
  ) THEN
    EXECUTE $pg_schema_sql$
ALTER TABLE ONLY "public"."matches"
    ADD CONSTRAINT "matches_pkey" PRIMARY KEY ("match_id");
$pg_schema_sql$;
  END IF;
END
$pg_schema_restore$;


--
-- Name: membership_plans membership_plans_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

DO $pg_schema_restore$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint con
    JOIN pg_class c ON c.oid = con.conrelid
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE con.conname = 'membership_plans_pkey'
      AND n.nspname = 'public'
      AND c.relname = 'membership_plans'
  ) THEN
    EXECUTE $pg_schema_sql$
ALTER TABLE ONLY "public"."membership_plans"
    ADD CONSTRAINT "membership_plans_pkey" PRIMARY KEY ("id");
$pg_schema_sql$;
  END IF;
END
$pg_schema_restore$;


--
-- Name: membership_plans membership_plans_sku_code_key; Type: CONSTRAINT; Schema: public; Owner: -
--

DO $pg_schema_restore$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint con
    JOIN pg_class c ON c.oid = con.conrelid
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE con.conname = 'membership_plans_sku_code_key'
      AND n.nspname = 'public'
      AND c.relname = 'membership_plans'
  ) THEN
    EXECUTE $pg_schema_sql$
ALTER TABLE ONLY "public"."membership_plans"
    ADD CONSTRAINT "membership_plans_sku_code_key" UNIQUE ("sku_code");
$pg_schema_sql$;
  END IF;
END
$pg_schema_restore$;


--
-- Name: membership_subscriptions membership_subscriptions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

DO $pg_schema_restore$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint con
    JOIN pg_class c ON c.oid = con.conrelid
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE con.conname = 'membership_subscriptions_pkey'
      AND n.nspname = 'public'
      AND c.relname = 'membership_subscriptions'
  ) THEN
    EXECUTE $pg_schema_sql$
ALTER TABLE ONLY "public"."membership_subscriptions"
    ADD CONSTRAINT "membership_subscriptions_pkey" PRIMARY KEY ("id");
$pg_schema_sql$;
  END IF;
END
$pg_schema_restore$;


--
-- Name: membership_subscriptions membership_subscriptions_user_email_key; Type: CONSTRAINT; Schema: public; Owner: -
--

DO $pg_schema_restore$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint con
    JOIN pg_class c ON c.oid = con.conrelid
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE con.conname = 'membership_subscriptions_user_email_key'
      AND n.nspname = 'public'
      AND c.relname = 'membership_subscriptions'
  ) THEN
    EXECUTE $pg_schema_sql$
ALTER TABLE ONLY "public"."membership_subscriptions"
    ADD CONSTRAINT "membership_subscriptions_user_email_key" UNIQUE ("user_email");
$pg_schema_sql$;
  END IF;
END
$pg_schema_restore$;


--
-- Name: mentor_arrangements mentor_arrangements_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

DO $pg_schema_restore$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint con
    JOIN pg_class c ON c.oid = con.conrelid
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE con.conname = 'mentor_arrangements_pkey'
      AND n.nspname = 'public'
      AND c.relname = 'mentor_arrangements'
  ) THEN
    EXECUTE $pg_schema_sql$
ALTER TABLE ONLY "public"."mentor_arrangements"
    ADD CONSTRAINT "mentor_arrangements_pkey" PRIMARY KEY ("id");
$pg_schema_sql$;
  END IF;
END
$pg_schema_restore$;


--
-- Name: operation_logs operation_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

DO $pg_schema_restore$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint con
    JOIN pg_class c ON c.oid = con.conrelid
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE con.conname = 'operation_logs_pkey'
      AND n.nspname = 'public'
      AND c.relname = 'operation_logs'
  ) THEN
    EXECUTE $pg_schema_sql$
ALTER TABLE ONLY "public"."operation_logs"
    ADD CONSTRAINT "operation_logs_pkey" PRIMARY KEY ("id");
$pg_schema_sql$;
  END IF;
END
$pg_schema_restore$;


--
-- Name: orders orders_order_no_key; Type: CONSTRAINT; Schema: public; Owner: -
--

DO $pg_schema_restore$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint con
    JOIN pg_class c ON c.oid = con.conrelid
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE con.conname = 'orders_order_no_key'
      AND n.nspname = 'public'
      AND c.relname = 'orders'
  ) THEN
    EXECUTE $pg_schema_sql$
ALTER TABLE ONLY "public"."orders"
    ADD CONSTRAINT "orders_order_no_key" UNIQUE ("order_no");
$pg_schema_sql$;
  END IF;
END
$pg_schema_restore$;


--
-- Name: orders orders_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

DO $pg_schema_restore$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint con
    JOIN pg_class c ON c.oid = con.conrelid
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE con.conname = 'orders_pkey'
      AND n.nspname = 'public'
      AND c.relname = 'orders'
  ) THEN
    EXECUTE $pg_schema_sql$
ALTER TABLE ONLY "public"."orders"
    ADD CONSTRAINT "orders_pkey" PRIMARY KEY ("id");
$pg_schema_sql$;
  END IF;
END
$pg_schema_restore$;


--
-- Name: payment_orders payment_orders_order_no_key; Type: CONSTRAINT; Schema: public; Owner: -
--

DO $pg_schema_restore$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint con
    JOIN pg_class c ON c.oid = con.conrelid
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE con.conname = 'payment_orders_order_no_key'
      AND n.nspname = 'public'
      AND c.relname = 'payment_orders'
  ) THEN
    EXECUTE $pg_schema_sql$
ALTER TABLE ONLY "public"."payment_orders"
    ADD CONSTRAINT "payment_orders_order_no_key" UNIQUE ("order_no");
$pg_schema_sql$;
  END IF;
END
$pg_schema_restore$;


--
-- Name: payment_orders payment_orders_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

DO $pg_schema_restore$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint con
    JOIN pg_class c ON c.oid = con.conrelid
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE con.conname = 'payment_orders_pkey'
      AND n.nspname = 'public'
      AND c.relname = 'payment_orders'
  ) THEN
    EXECUTE $pg_schema_sql$
ALTER TABLE ONLY "public"."payment_orders"
    ADD CONSTRAINT "payment_orders_pkey" PRIMARY KEY ("id");
$pg_schema_sql$;
  END IF;
END
$pg_schema_restore$;


--
-- Name: payment_refunds payment_refunds_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

DO $pg_schema_restore$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint con
    JOIN pg_class c ON c.oid = con.conrelid
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE con.conname = 'payment_refunds_pkey'
      AND n.nspname = 'public'
      AND c.relname = 'payment_refunds'
  ) THEN
    EXECUTE $pg_schema_sql$
ALTER TABLE ONLY "public"."payment_refunds"
    ADD CONSTRAINT "payment_refunds_pkey" PRIMARY KEY ("id");
$pg_schema_sql$;
  END IF;
END
$pg_schema_restore$;


--
-- Name: payment_refunds payment_refunds_refund_no_key; Type: CONSTRAINT; Schema: public; Owner: -
--

DO $pg_schema_restore$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint con
    JOIN pg_class c ON c.oid = con.conrelid
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE con.conname = 'payment_refunds_refund_no_key'
      AND n.nspname = 'public'
      AND c.relname = 'payment_refunds'
  ) THEN
    EXECUTE $pg_schema_sql$
ALTER TABLE ONLY "public"."payment_refunds"
    ADD CONSTRAINT "payment_refunds_refund_no_key" UNIQUE ("refund_no");
$pg_schema_sql$;
  END IF;
END
$pg_schema_restore$;


--
-- Name: performance_monitor performance_monitor_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

DO $pg_schema_restore$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint con
    JOIN pg_class c ON c.oid = con.conrelid
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE con.conname = 'performance_monitor_pkey'
      AND n.nspname = 'public'
      AND c.relname = 'performance_monitor'
  ) THEN
    EXECUTE $pg_schema_sql$
ALTER TABLE ONLY "public"."performance_monitor"
    ADD CONSTRAINT "performance_monitor_pkey" PRIMARY KEY ("monitor_id");
$pg_schema_sql$;
  END IF;
END
$pg_schema_restore$;


--
-- Name: permissions permissions_name_key; Type: CONSTRAINT; Schema: public; Owner: -
--

DO $pg_schema_restore$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint con
    JOIN pg_class c ON c.oid = con.conrelid
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE con.conname = 'permissions_name_key'
      AND n.nspname = 'public'
      AND c.relname = 'permissions'
  ) THEN
    EXECUTE $pg_schema_sql$
ALTER TABLE ONLY "public"."permissions"
    ADD CONSTRAINT "permissions_name_key" UNIQUE ("name");
$pg_schema_sql$;
  END IF;
END
$pg_schema_restore$;


--
-- Name: permissions permissions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

DO $pg_schema_restore$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint con
    JOIN pg_class c ON c.oid = con.conrelid
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE con.conname = 'permissions_pkey'
      AND n.nspname = 'public'
      AND c.relname = 'permissions'
  ) THEN
    EXECUTE $pg_schema_sql$
ALTER TABLE ONLY "public"."permissions"
    ADD CONSTRAINT "permissions_pkey" PRIMARY KEY ("id");
$pg_schema_sql$;
  END IF;
END
$pg_schema_restore$;


--
-- Name: positions positions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

DO $pg_schema_restore$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint con
    JOIN pg_class c ON c.oid = con.conrelid
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE con.conname = 'positions_pkey'
      AND n.nspname = 'public'
      AND c.relname = 'positions'
  ) THEN
    EXECUTE $pg_schema_sql$
ALTER TABLE ONLY "public"."positions"
    ADD CONSTRAINT "positions_pkey" PRIMARY KEY ("position_id");
$pg_schema_sql$;
  END IF;
END
$pg_schema_restore$;


--
-- Name: project_progress_records project_progress_records_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

DO $pg_schema_restore$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint con
    JOIN pg_class c ON c.oid = con.conrelid
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE con.conname = 'project_progress_records_pkey'
      AND n.nspname = 'public'
      AND c.relname = 'project_progress_records'
  ) THEN
    EXECUTE $pg_schema_sql$
ALTER TABLE ONLY "public"."project_progress_records"
    ADD CONSTRAINT "project_progress_records_pkey" PRIMARY KEY ("id");
$pg_schema_sql$;
  END IF;
END
$pg_schema_restore$;


--
-- Name: question_bank question_bank_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

DO $pg_schema_restore$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint con
    JOIN pg_class c ON c.oid = con.conrelid
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE con.conname = 'question_bank_pkey'
      AND n.nspname = 'public'
      AND c.relname = 'question_bank'
  ) THEN
    EXECUTE $pg_schema_sql$
ALTER TABLE ONLY "public"."question_bank"
    ADD CONSTRAINT "question_bank_pkey" PRIMARY KEY ("id");
$pg_schema_sql$;
  END IF;
END
$pg_schema_restore$;


--
-- Name: resume_optimizations resume_optimizations_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

DO $pg_schema_restore$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint con
    JOIN pg_class c ON c.oid = con.conrelid
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE con.conname = 'resume_optimizations_pkey'
      AND n.nspname = 'public'
      AND c.relname = 'resume_optimizations'
  ) THEN
    EXECUTE $pg_schema_sql$
ALTER TABLE ONLY "public"."resume_optimizations"
    ADD CONSTRAINT "resume_optimizations_pkey" PRIMARY KEY ("id");
$pg_schema_sql$;
  END IF;
END
$pg_schema_restore$;


--
-- Name: resume_versions resume_versions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

DO $pg_schema_restore$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint con
    JOIN pg_class c ON c.oid = con.conrelid
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE con.conname = 'resume_versions_pkey'
      AND n.nspname = 'public'
      AND c.relname = 'resume_versions'
  ) THEN
    EXECUTE $pg_schema_sql$
ALTER TABLE ONLY "public"."resume_versions"
    ADD CONSTRAINT "resume_versions_pkey" PRIMARY KEY ("id");
$pg_schema_sql$;
  END IF;
END
$pg_schema_restore$;


--
-- Name: role_permissions role_permissions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

DO $pg_schema_restore$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint con
    JOIN pg_class c ON c.oid = con.conrelid
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE con.conname = 'role_permissions_pkey'
      AND n.nspname = 'public'
      AND c.relname = 'role_permissions'
  ) THEN
    EXECUTE $pg_schema_sql$
ALTER TABLE ONLY "public"."role_permissions"
    ADD CONSTRAINT "role_permissions_pkey" PRIMARY KEY ("id");
$pg_schema_sql$;
  END IF;
END
$pg_schema_restore$;


--
-- Name: role_permissions role_permissions_role_id_permission_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

DO $pg_schema_restore$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint con
    JOIN pg_class c ON c.oid = con.conrelid
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE con.conname = 'role_permissions_role_id_permission_id_key'
      AND n.nspname = 'public'
      AND c.relname = 'role_permissions'
  ) THEN
    EXECUTE $pg_schema_sql$
ALTER TABLE ONLY "public"."role_permissions"
    ADD CONSTRAINT "role_permissions_role_id_permission_id_key" UNIQUE ("role_id", "permission_id");
$pg_schema_sql$;
  END IF;
END
$pg_schema_restore$;


--
-- Name: roles roles_name_key; Type: CONSTRAINT; Schema: public; Owner: -
--

DO $pg_schema_restore$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint con
    JOIN pg_class c ON c.oid = con.conrelid
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE con.conname = 'roles_name_key'
      AND n.nspname = 'public'
      AND c.relname = 'roles'
  ) THEN
    EXECUTE $pg_schema_sql$
ALTER TABLE ONLY "public"."roles"
    ADD CONSTRAINT "roles_name_key" UNIQUE ("name");
$pg_schema_sql$;
  END IF;
END
$pg_schema_restore$;


--
-- Name: roles roles_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

DO $pg_schema_restore$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint con
    JOIN pg_class c ON c.oid = con.conrelid
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE con.conname = 'roles_pkey'
      AND n.nspname = 'public'
      AND c.relname = 'roles'
  ) THEN
    EXECUTE $pg_schema_sql$
ALTER TABLE ONLY "public"."roles"
    ADD CONSTRAINT "roles_pkey" PRIMARY KEY ("id");
$pg_schema_sql$;
  END IF;
END
$pg_schema_restore$;


--
-- Name: student_applications student_applications_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

DO $pg_schema_restore$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint con
    JOIN pg_class c ON c.oid = con.conrelid
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE con.conname = 'student_applications_pkey'
      AND n.nspname = 'public'
      AND c.relname = 'student_applications'
  ) THEN
    EXECUTE $pg_schema_sql$
ALTER TABLE ONLY "public"."student_applications"
    ADD CONSTRAINT "student_applications_pkey" PRIMARY KEY ("id");
$pg_schema_sql$;
  END IF;
END
$pg_schema_restore$;


--
-- Name: student_profiles student_profiles_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

DO $pg_schema_restore$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint con
    JOIN pg_class c ON c.oid = con.conrelid
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE con.conname = 'student_profiles_pkey'
      AND n.nspname = 'public'
      AND c.relname = 'student_profiles'
  ) THEN
    EXECUTE $pg_schema_sql$
ALTER TABLE ONLY "public"."student_profiles"
    ADD CONSTRAINT "student_profiles_pkey" PRIMARY KEY ("id");
$pg_schema_sql$;
  END IF;
END
$pg_schema_restore$;


--
-- Name: student_profiles student_profiles_student_no_key; Type: CONSTRAINT; Schema: public; Owner: -
--

DO $pg_schema_restore$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint con
    JOIN pg_class c ON c.oid = con.conrelid
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE con.conname = 'student_profiles_student_no_key'
      AND n.nspname = 'public'
      AND c.relname = 'student_profiles'
  ) THEN
    EXECUTE $pg_schema_sql$
ALTER TABLE ONLY "public"."student_profiles"
    ADD CONSTRAINT "student_profiles_student_no_key" UNIQUE ("student_no");
$pg_schema_sql$;
  END IF;
END
$pg_schema_restore$;


--
-- Name: student_verifications student_verifications_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

DO $pg_schema_restore$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint con
    JOIN pg_class c ON c.oid = con.conrelid
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE con.conname = 'student_verifications_pkey'
      AND n.nspname = 'public'
      AND c.relname = 'student_verifications'
  ) THEN
    EXECUTE $pg_schema_sql$
ALTER TABLE ONLY "public"."student_verifications"
    ADD CONSTRAINT "student_verifications_pkey" PRIMARY KEY ("id");
$pg_schema_sql$;
  END IF;
END
$pg_schema_restore$;


--
-- Name: student_verifications student_verifications_user_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

DO $pg_schema_restore$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint con
    JOIN pg_class c ON c.oid = con.conrelid
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE con.conname = 'student_verifications_user_id_key'
      AND n.nspname = 'public'
      AND c.relname = 'student_verifications'
  ) THEN
    EXECUTE $pg_schema_sql$
ALTER TABLE ONLY "public"."student_verifications"
    ADD CONSTRAINT "student_verifications_user_id_key" UNIQUE ("user_id");
$pg_schema_sql$;
  END IF;
END
$pg_schema_restore$;


--
-- Name: study_checkins study_checkins_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

DO $pg_schema_restore$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint con
    JOIN pg_class c ON c.oid = con.conrelid
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE con.conname = 'study_checkins_pkey'
      AND n.nspname = 'public'
      AND c.relname = 'study_checkins'
  ) THEN
    EXECUTE $pg_schema_sql$
ALTER TABLE ONLY "public"."study_checkins"
    ADD CONSTRAINT "study_checkins_pkey" PRIMARY KEY ("id");
$pg_schema_sql$;
  END IF;
END
$pg_schema_restore$;


--
-- Name: study_checkins study_checkins_user_email_checkin_date_key; Type: CONSTRAINT; Schema: public; Owner: -
--

DO $pg_schema_restore$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint con
    JOIN pg_class c ON c.oid = con.conrelid
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE con.conname = 'study_checkins_user_email_checkin_date_key'
      AND n.nspname = 'public'
      AND c.relname = 'study_checkins'
  ) THEN
    EXECUTE $pg_schema_sql$
ALTER TABLE ONLY "public"."study_checkins"
    ADD CONSTRAINT "study_checkins_user_email_checkin_date_key" UNIQUE ("user_email", "checkin_date");
$pg_schema_sql$;
  END IF;
END
$pg_schema_restore$;


--
-- Name: subscriptions subscriptions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

DO $pg_schema_restore$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint con
    JOIN pg_class c ON c.oid = con.conrelid
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE con.conname = 'subscriptions_pkey'
      AND n.nspname = 'public'
      AND c.relname = 'subscriptions'
  ) THEN
    EXECUTE $pg_schema_sql$
ALTER TABLE ONLY "public"."subscriptions"
    ADD CONSTRAINT "subscriptions_pkey" PRIMARY KEY ("subscription_id");
$pg_schema_sql$;
  END IF;
END
$pg_schema_restore$;


--
-- Name: system_config system_config_config_key_key; Type: CONSTRAINT; Schema: public; Owner: -
--

DO $pg_schema_restore$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint con
    JOIN pg_class c ON c.oid = con.conrelid
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE con.conname = 'system_config_config_key_key'
      AND n.nspname = 'public'
      AND c.relname = 'system_config'
  ) THEN
    EXECUTE $pg_schema_sql$
ALTER TABLE ONLY "public"."system_config"
    ADD CONSTRAINT "system_config_config_key_key" UNIQUE ("config_key");
$pg_schema_sql$;
  END IF;
END
$pg_schema_restore$;


--
-- Name: system_config system_config_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

DO $pg_schema_restore$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint con
    JOIN pg_class c ON c.oid = con.conrelid
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE con.conname = 'system_config_pkey'
      AND n.nspname = 'public'
      AND c.relname = 'system_config'
  ) THEN
    EXECUTE $pg_schema_sql$
ALTER TABLE ONLY "public"."system_config"
    ADD CONSTRAINT "system_config_pkey" PRIMARY KEY ("id");
$pg_schema_sql$;
  END IF;
END
$pg_schema_restore$;


--
-- Name: training_submissions training_submissions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

DO $pg_schema_restore$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint con
    JOIN pg_class c ON c.oid = con.conrelid
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE con.conname = 'training_submissions_pkey'
      AND n.nspname = 'public'
      AND c.relname = 'training_submissions'
  ) THEN
    EXECUTE $pg_schema_sql$
ALTER TABLE ONLY "public"."training_submissions"
    ADD CONSTRAINT "training_submissions_pkey" PRIMARY KEY ("id");
$pg_schema_sql$;
  END IF;
END
$pg_schema_restore$;


--
-- Name: training_tasks training_tasks_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

DO $pg_schema_restore$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint con
    JOIN pg_class c ON c.oid = con.conrelid
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE con.conname = 'training_tasks_pkey'
      AND n.nspname = 'public'
      AND c.relname = 'training_tasks'
  ) THEN
    EXECUTE $pg_schema_sql$
ALTER TABLE ONLY "public"."training_tasks"
    ADD CONSTRAINT "training_tasks_pkey" PRIMARY KEY ("id");
$pg_schema_sql$;
  END IF;
END
$pg_schema_restore$;


--
-- Name: universities universities_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

DO $pg_schema_restore$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint con
    JOIN pg_class c ON c.oid = con.conrelid
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE con.conname = 'universities_pkey'
      AND n.nspname = 'public'
      AND c.relname = 'universities'
  ) THEN
    EXECUTE $pg_schema_sql$
ALTER TABLE ONLY "public"."universities"
    ADD CONSTRAINT "universities_pkey" PRIMARY KEY ("university_id");
$pg_schema_sql$;
  END IF;
END
$pg_schema_restore$;


--
-- Name: usage_records usage_records_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

DO $pg_schema_restore$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint con
    JOIN pg_class c ON c.oid = con.conrelid
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE con.conname = 'usage_records_pkey'
      AND n.nspname = 'public'
      AND c.relname = 'usage_records'
  ) THEN
    EXECUTE $pg_schema_sql$
ALTER TABLE ONLY "public"."usage_records"
    ADD CONSTRAINT "usage_records_pkey" PRIMARY KEY ("id");
$pg_schema_sql$;
  END IF;
END
$pg_schema_restore$;


--
-- Name: user_achievements user_achievements_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

DO $pg_schema_restore$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint con
    JOIN pg_class c ON c.oid = con.conrelid
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE con.conname = 'user_achievements_pkey'
      AND n.nspname = 'public'
      AND c.relname = 'user_achievements'
  ) THEN
    EXECUTE $pg_schema_sql$
ALTER TABLE ONLY "public"."user_achievements"
    ADD CONSTRAINT "user_achievements_pkey" PRIMARY KEY ("id");
$pg_schema_sql$;
  END IF;
END
$pg_schema_restore$;


--
-- Name: user_achievements user_achievements_user_email_achievement_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

DO $pg_schema_restore$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint con
    JOIN pg_class c ON c.oid = con.conrelid
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE con.conname = 'user_achievements_user_email_achievement_id_key'
      AND n.nspname = 'public'
      AND c.relname = 'user_achievements'
  ) THEN
    EXECUTE $pg_schema_sql$
ALTER TABLE ONLY "public"."user_achievements"
    ADD CONSTRAINT "user_achievements_user_email_achievement_id_key" UNIQUE ("user_email", "achievement_id");
$pg_schema_sql$;
  END IF;
END
$pg_schema_restore$;


--
-- Name: user_courses user_courses_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

DO $pg_schema_restore$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint con
    JOIN pg_class c ON c.oid = con.conrelid
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE con.conname = 'user_courses_pkey'
      AND n.nspname = 'public'
      AND c.relname = 'user_courses'
  ) THEN
    EXECUTE $pg_schema_sql$
ALTER TABLE ONLY "public"."user_courses"
    ADD CONSTRAINT "user_courses_pkey" PRIMARY KEY ("id");
$pg_schema_sql$;
  END IF;
END
$pg_schema_restore$;


--
-- Name: user_courses user_courses_user_email_course_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

DO $pg_schema_restore$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint con
    JOIN pg_class c ON c.oid = con.conrelid
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE con.conname = 'user_courses_user_email_course_id_key'
      AND n.nspname = 'public'
      AND c.relname = 'user_courses'
  ) THEN
    EXECUTE $pg_schema_sql$
ALTER TABLE ONLY "public"."user_courses"
    ADD CONSTRAINT "user_courses_user_email_course_id_key" UNIQUE ("user_email", "course_id");
$pg_schema_sql$;
  END IF;
END
$pg_schema_restore$;


--
-- Name: user_portrait user_portrait_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

DO $pg_schema_restore$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint con
    JOIN pg_class c ON c.oid = con.conrelid
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE con.conname = 'user_portrait_pkey'
      AND n.nspname = 'public'
      AND c.relname = 'user_portrait'
  ) THEN
    EXECUTE $pg_schema_sql$
ALTER TABLE ONLY "public"."user_portrait"
    ADD CONSTRAINT "user_portrait_pkey" PRIMARY KEY ("id");
$pg_schema_sql$;
  END IF;
END
$pg_schema_restore$;


--
-- Name: user_portrait user_portrait_user_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

DO $pg_schema_restore$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint con
    JOIN pg_class c ON c.oid = con.conrelid
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE con.conname = 'user_portrait_user_id_key'
      AND n.nspname = 'public'
      AND c.relname = 'user_portrait'
  ) THEN
    EXECUTE $pg_schema_sql$
ALTER TABLE ONLY "public"."user_portrait"
    ADD CONSTRAINT "user_portrait_user_id_key" UNIQUE ("user_id");
$pg_schema_sql$;
  END IF;
END
$pg_schema_restore$;


--
-- Name: user_profiles user_profiles_email_key; Type: CONSTRAINT; Schema: public; Owner: -
--

DO $pg_schema_restore$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint con
    JOIN pg_class c ON c.oid = con.conrelid
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE con.conname = 'user_profiles_email_key'
      AND n.nspname = 'public'
      AND c.relname = 'user_profiles'
  ) THEN
    EXECUTE $pg_schema_sql$
ALTER TABLE ONLY "public"."user_profiles"
    ADD CONSTRAINT "user_profiles_email_key" UNIQUE ("email");
$pg_schema_sql$;
  END IF;
END
$pg_schema_restore$;


--
-- Name: user_profiles user_profiles_invite_code_key; Type: CONSTRAINT; Schema: public; Owner: -
--

DO $pg_schema_restore$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint con
    JOIN pg_class c ON c.oid = con.conrelid
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE con.conname = 'user_profiles_invite_code_key'
      AND n.nspname = 'public'
      AND c.relname = 'user_profiles'
  ) THEN
    EXECUTE $pg_schema_sql$
ALTER TABLE ONLY "public"."user_profiles"
    ADD CONSTRAINT "user_profiles_invite_code_key" UNIQUE ("invite_code");
$pg_schema_sql$;
  END IF;
END
$pg_schema_restore$;


--
-- Name: user_profiles user_profiles_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

DO $pg_schema_restore$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint con
    JOIN pg_class c ON c.oid = con.conrelid
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE con.conname = 'user_profiles_pkey'
      AND n.nspname = 'public'
      AND c.relname = 'user_profiles'
  ) THEN
    EXECUTE $pg_schema_sql$
ALTER TABLE ONLY "public"."user_profiles"
    ADD CONSTRAINT "user_profiles_pkey" PRIMARY KEY ("id");
$pg_schema_sql$;
  END IF;
END
$pg_schema_restore$;


--
-- Name: user_profiles user_profiles_user_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

DO $pg_schema_restore$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint con
    JOIN pg_class c ON c.oid = con.conrelid
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE con.conname = 'user_profiles_user_id_key'
      AND n.nspname = 'public'
      AND c.relname = 'user_profiles'
  ) THEN
    EXECUTE $pg_schema_sql$
ALTER TABLE ONLY "public"."user_profiles"
    ADD CONSTRAINT "user_profiles_user_id_key" UNIQUE ("user_id");
$pg_schema_sql$;
  END IF;
END
$pg_schema_restore$;


--
-- Name: user_stats user_stats_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

DO $pg_schema_restore$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint con
    JOIN pg_class c ON c.oid = con.conrelid
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE con.conname = 'user_stats_pkey'
      AND n.nspname = 'public'
      AND c.relname = 'user_stats'
  ) THEN
    EXECUTE $pg_schema_sql$
ALTER TABLE ONLY "public"."user_stats"
    ADD CONSTRAINT "user_stats_pkey" PRIMARY KEY ("id");
$pg_schema_sql$;
  END IF;
END
$pg_schema_restore$;


--
-- Name: user_stats user_stats_user_email_key; Type: CONSTRAINT; Schema: public; Owner: -
--

DO $pg_schema_restore$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint con
    JOIN pg_class c ON c.oid = con.conrelid
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE con.conname = 'user_stats_user_email_key'
      AND n.nspname = 'public'
      AND c.relname = 'user_stats'
  ) THEN
    EXECUTE $pg_schema_sql$
ALTER TABLE ONLY "public"."user_stats"
    ADD CONSTRAINT "user_stats_user_email_key" UNIQUE ("user_email");
$pg_schema_sql$;
  END IF;
END
$pg_schema_restore$;


--
-- Name: users users_email_key; Type: CONSTRAINT; Schema: public; Owner: -
--

DO $pg_schema_restore$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint con
    JOIN pg_class c ON c.oid = con.conrelid
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE con.conname = 'users_email_key'
      AND n.nspname = 'public'
      AND c.relname = 'users'
  ) THEN
    EXECUTE $pg_schema_sql$
ALTER TABLE ONLY "public"."users"
    ADD CONSTRAINT "users_email_key" UNIQUE ("email");
$pg_schema_sql$;
  END IF;
END
$pg_schema_restore$;


--
-- Name: users users_phone_key; Type: CONSTRAINT; Schema: public; Owner: -
--

DO $pg_schema_restore$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint con
    JOIN pg_class c ON c.oid = con.conrelid
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE con.conname = 'users_phone_key'
      AND n.nspname = 'public'
      AND c.relname = 'users'
  ) THEN
    EXECUTE $pg_schema_sql$
ALTER TABLE ONLY "public"."users"
    ADD CONSTRAINT "users_phone_key" UNIQUE ("phone");
$pg_schema_sql$;
  END IF;
END
$pg_schema_restore$;


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

DO $pg_schema_restore$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint con
    JOIN pg_class c ON c.oid = con.conrelid
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE con.conname = 'users_pkey'
      AND n.nspname = 'public'
      AND c.relname = 'users'
  ) THEN
    EXECUTE $pg_schema_sql$
ALTER TABLE ONLY "public"."users"
    ADD CONSTRAINT "users_pkey" PRIMARY KEY ("user_id");
$pg_schema_sql$;
  END IF;
END
$pg_schema_restore$;


--
-- Name: vip_orders vip_orders_order_no_key; Type: CONSTRAINT; Schema: public; Owner: -
--

DO $pg_schema_restore$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint con
    JOIN pg_class c ON c.oid = con.conrelid
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE con.conname = 'vip_orders_order_no_key'
      AND n.nspname = 'public'
      AND c.relname = 'vip_orders'
  ) THEN
    EXECUTE $pg_schema_sql$
ALTER TABLE ONLY "public"."vip_orders"
    ADD CONSTRAINT "vip_orders_order_no_key" UNIQUE ("order_no");
$pg_schema_sql$;
  END IF;
END
$pg_schema_restore$;


--
-- Name: vip_orders vip_orders_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

DO $pg_schema_restore$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint con
    JOIN pg_class c ON c.oid = con.conrelid
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE con.conname = 'vip_orders_pkey'
      AND n.nspname = 'public'
      AND c.relname = 'vip_orders'
  ) THEN
    EXECUTE $pg_schema_sql$
ALTER TABLE ONLY "public"."vip_orders"
    ADD CONSTRAINT "vip_orders_pkey" PRIMARY KEY ("id");
$pg_schema_sql$;
  END IF;
END
$pg_schema_restore$;


--
-- Name: vip_plans vip_plans_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

DO $pg_schema_restore$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint con
    JOIN pg_class c ON c.oid = con.conrelid
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE con.conname = 'vip_plans_pkey'
      AND n.nspname = 'public'
      AND c.relname = 'vip_plans'
  ) THEN
    EXECUTE $pg_schema_sql$
ALTER TABLE ONLY "public"."vip_plans"
    ADD CONSTRAINT "vip_plans_pkey" PRIMARY KEY ("id");
$pg_schema_sql$;
  END IF;
END
$pg_schema_restore$;


--
-- Name: vip_plans vip_plans_vip_level_duration_months_key; Type: CONSTRAINT; Schema: public; Owner: -
--

DO $pg_schema_restore$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint con
    JOIN pg_class c ON c.oid = con.conrelid
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE con.conname = 'vip_plans_vip_level_duration_months_key'
      AND n.nspname = 'public'
      AND c.relname = 'vip_plans'
  ) THEN
    EXECUTE $pg_schema_sql$
ALTER TABLE ONLY "public"."vip_plans"
    ADD CONSTRAINT "vip_plans_vip_level_duration_months_key" UNIQUE ("vip_level", "duration_months");
$pg_schema_sql$;
  END IF;
END
$pg_schema_restore$;


--
-- Name: web_content_summary_task web_content_summary_task_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

DO $pg_schema_restore$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint con
    JOIN pg_class c ON c.oid = con.conrelid
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE con.conname = 'web_content_summary_task_pkey'
      AND n.nspname = 'public'
      AND c.relname = 'web_content_summary_task'
  ) THEN
    EXECUTE $pg_schema_sql$
ALTER TABLE ONLY "public"."web_content_summary_task"
    ADD CONSTRAINT "web_content_summary_task_pkey" PRIMARY KEY ("task_id");
$pg_schema_sql$;
  END IF;
END
$pg_schema_restore$;


--
-- Name: idx_ability_profiles_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX IF NOT EXISTS "idx_ability_profiles_user_id" ON "public"."ability_profiles" USING "btree" ("user_id");


--
-- Name: idx_assessment_records_user_email; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX IF NOT EXISTS "idx_assessment_records_user_email" ON "public"."assessment_records" USING "btree" ("user_email");


--
-- Name: idx_assessment_records_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX IF NOT EXISTS "idx_assessment_records_user_id" ON "public"."assessment_records" USING "btree" ("user_id");


--
-- Name: idx_assessment_results_task; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX IF NOT EXISTS "idx_assessment_results_task" ON "public"."assessment_results" USING "btree" ("task_id");


--
-- Name: idx_assessment_results_user; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX IF NOT EXISTS "idx_assessment_results_user" ON "public"."assessment_results" USING "btree" ("user_id");


--
-- Name: idx_assessment_tasks_company; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX IF NOT EXISTS "idx_assessment_tasks_company" ON "public"."assessment_tasks" USING "btree" ("company_id");


--
-- Name: idx_assessment_tasks_template; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX IF NOT EXISTS "idx_assessment_tasks_template" ON "public"."assessment_tasks" USING "btree" ("template_id");


--
-- Name: idx_assessment_templates_company; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX IF NOT EXISTS "idx_assessment_templates_company" ON "public"."assessment_templates" USING "btree" ("company_id");


--
-- Name: idx_assessments_category; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX IF NOT EXISTS "idx_assessments_category" ON "public"."assessments" USING "btree" ("category");


--
-- Name: idx_assessments_difficulty; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX IF NOT EXISTS "idx_assessments_difficulty" ON "public"."assessments" USING "btree" ("difficulty_level");


--
-- Name: idx_candidates_company; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX IF NOT EXISTS "idx_candidates_company" ON "public"."candidates" USING "btree" ("company_email", "created_at" DESC);


--
-- Name: idx_candidates_favorite; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX IF NOT EXISTS "idx_candidates_favorite" ON "public"."candidates" USING "btree" ("company_email", "favorite");


--
-- Name: idx_career_consultations_created_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX IF NOT EXISTS "idx_career_consultations_created_at" ON "public"."career_consultations" USING "btree" ("created_at" DESC);


--
-- Name: idx_career_consultations_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX IF NOT EXISTS "idx_career_consultations_user_id" ON "public"."career_consultations" USING "btree" ("user_id");


--
-- Name: idx_class_students_class; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX IF NOT EXISTS "idx_class_students_class" ON "public"."class_students" USING "btree" ("class_id");


--
-- Name: idx_company_positions_company; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX IF NOT EXISTS "idx_company_positions_company" ON "public"."company_positions" USING "btree" ("company_id");


--
-- Name: idx_company_positions_university; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX IF NOT EXISTS "idx_company_positions_university" ON "public"."company_positions" USING "btree" ("university_id");


--
-- Name: idx_cooperation_agreements_company; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX IF NOT EXISTS "idx_cooperation_agreements_company" ON "public"."cooperation_agreements" USING "btree" ("company_id");


--
-- Name: idx_cooperation_agreements_university; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX IF NOT EXISTS "idx_cooperation_agreements_university" ON "public"."cooperation_agreements" USING "btree" ("university_id");


--
-- Name: idx_cooperation_companies_audit_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX IF NOT EXISTS "idx_cooperation_companies_audit_status" ON "public"."cooperation_companies" USING "btree" ("audit_status");


--
-- Name: idx_cooperation_companies_university; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX IF NOT EXISTS "idx_cooperation_companies_university" ON "public"."cooperation_companies" USING "btree" ("university_id");


--
-- Name: idx_cooperation_plans_company; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX IF NOT EXISTS "idx_cooperation_plans_company" ON "public"."cooperation_plans" USING "btree" ("company_id");


--
-- Name: idx_cooperation_plans_university; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX IF NOT EXISTS "idx_cooperation_plans_university" ON "public"."cooperation_plans" USING "btree" ("university_id");


--
-- Name: idx_cooperation_projects_company; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX IF NOT EXISTS "idx_cooperation_projects_company" ON "public"."cooperation_projects" USING "btree" ("company_id");


--
-- Name: idx_cooperation_projects_university; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX IF NOT EXISTS "idx_cooperation_projects_university" ON "public"."cooperation_projects" USING "btree" ("university_id");


--
-- Name: idx_course_progress_user; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX IF NOT EXISTS "idx_course_progress_user" ON "public"."course_progress" USING "btree" ("user_email");


--
-- Name: idx_courses_dimension; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX IF NOT EXISTS "idx_courses_dimension" ON "public"."courses" USING "btree" ("dimension");


--
-- Name: idx_courses_status_rating; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX IF NOT EXISTS "idx_courses_status_rating" ON "public"."courses" USING "btree" ("status", "rating" DESC);


--
-- Name: idx_deep_research_user; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX IF NOT EXISTS "idx_deep_research_user" ON "public"."deep_research_task" USING "btree" ("user_id", "create_time" DESC);


--
-- Name: idx_dorm_name; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX IF NOT EXISTS "idx_dorm_name" ON "public"."dorm_members" USING "btree" ("member_name");


--
-- Name: idx_enterprise_hiring_cache_company_name; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX IF NOT EXISTS "idx_enterprise_hiring_cache_company_name" ON "public"."enterprise_hiring_cache" USING "btree" ("company_name");


--
-- Name: idx_enterprise_hiring_cache_keyword; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX IF NOT EXISTS "idx_enterprise_hiring_cache_keyword" ON "public"."enterprise_hiring_cache" USING "btree" ("keyword");


--
-- Name: idx_enterprise_hiring_cache_updated_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX IF NOT EXISTS "idx_enterprise_hiring_cache_updated_at" ON "public"."enterprise_hiring_cache" USING "btree" ("updated_at");


--
-- Name: idx_enterprise_hiring_query_history_created_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX IF NOT EXISTS "idx_enterprise_hiring_query_history_created_at" ON "public"."enterprise_hiring_query_history" USING "btree" ("created_at");


--
-- Name: idx_enterprise_hiring_query_history_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX IF NOT EXISTS "idx_enterprise_hiring_query_history_user_id" ON "public"."enterprise_hiring_query_history" USING "btree" ("user_id");


--
-- Name: idx_error_log_function; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX IF NOT EXISTS "idx_error_log_function" ON "public"."error_log" USING "btree" ("function_name");


--
-- Name: idx_error_log_function_time; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX IF NOT EXISTS "idx_error_log_function_time" ON "public"."error_log" USING "btree" ("function_name", "error_time" DESC);


--
-- Name: idx_error_log_time; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX IF NOT EXISTS "idx_error_log_time" ON "public"."error_log" USING "btree" ("error_time" DESC);


--
-- Name: idx_evaluations_user; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX IF NOT EXISTS "idx_evaluations_user" ON "public"."evaluations" USING "btree" ("user_id");


--
-- Name: idx_evaluations_user_created; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX IF NOT EXISTS "idx_evaluations_user_created" ON "public"."evaluations" USING "btree" ("user_id", "created_at" DESC);


--
-- Name: idx_growth_paths_user; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX IF NOT EXISTS "idx_growth_paths_user" ON "public"."growth_paths" USING "btree" ("user_email");


--
-- Name: idx_growth_plans_user; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX IF NOT EXISTS "idx_growth_plans_user" ON "public"."growth_plans" USING "btree" ("user_id");


--
-- Name: idx_internship_paths_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX IF NOT EXISTS "idx_internship_paths_status" ON "public"."internship_paths" USING "btree" ("status");


--
-- Name: idx_internship_paths_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX IF NOT EXISTS "idx_internship_paths_user_id" ON "public"."internship_paths" USING "btree" ("user_id");


--
-- Name: idx_interview_simulations_created_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX IF NOT EXISTS "idx_interview_simulations_created_at" ON "public"."interview_simulations" USING "btree" ("created_at" DESC);


--
-- Name: idx_interview_simulations_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX IF NOT EXISTS "idx_interview_simulations_user_id" ON "public"."interview_simulations" USING "btree" ("user_id");


--
-- Name: idx_job_applications_user; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX IF NOT EXISTS "idx_job_applications_user" ON "public"."job_applications" USING "btree" ("user_email", "created_at" DESC);


--
-- Name: idx_job_favorites_job_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX IF NOT EXISTS "idx_job_favorites_job_id" ON "public"."job_favorites" USING "btree" ("job_id");


--
-- Name: idx_job_favorites_user_email; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX IF NOT EXISTS "idx_job_favorites_user_email" ON "public"."job_favorites" USING "btree" ("user_email");


--
-- Name: idx_job_seeker_profiles_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX IF NOT EXISTS "idx_job_seeker_profiles_user_id" ON "public"."job_seeker_profiles" USING "btree" ("user_id");


--
-- Name: idx_learning_plan_task_plan; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX IF NOT EXISTS "idx_learning_plan_task_plan" ON "public"."learning_plan_task" USING "btree" ("plan_id");


--
-- Name: idx_learning_plans_user; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX IF NOT EXISTS "idx_learning_plans_user" ON "public"."learning_plans" USING "btree" ("user_email", "created_at" DESC);


--
-- Name: idx_learning_records_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX IF NOT EXISTS "idx_learning_records_status" ON "public"."learning_records" USING "btree" ("status");


--
-- Name: idx_learning_records_task_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX IF NOT EXISTS "idx_learning_records_task_id" ON "public"."learning_records" USING "btree" ("task_id");


--
-- Name: idx_learning_records_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX IF NOT EXISTS "idx_learning_records_user_id" ON "public"."learning_records" USING "btree" ("user_id");


--
-- Name: idx_matches_position; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX IF NOT EXISTS "idx_matches_position" ON "public"."matches" USING "btree" ("position_id");


--
-- Name: idx_matches_user; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX IF NOT EXISTS "idx_matches_user" ON "public"."matches" USING "btree" ("user_id");


--
-- Name: idx_membership_subs_email; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX IF NOT EXISTS "idx_membership_subs_email" ON "public"."membership_subscriptions" USING "btree" ("user_email");


--
-- Name: idx_mentor_name; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX IF NOT EXISTS "idx_mentor_name" ON "public"."mentor_arrangements" USING "btree" ("mentor_name");


--
-- Name: idx_operation_logs_created_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX IF NOT EXISTS "idx_operation_logs_created_at" ON "public"."operation_logs" USING "btree" ("created_at" DESC);


--
-- Name: idx_operation_logs_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX IF NOT EXISTS "idx_operation_logs_user_id" ON "public"."operation_logs" USING "btree" ("user_id");


--
-- Name: idx_payment_orders_email; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX IF NOT EXISTS "idx_payment_orders_email" ON "public"."payment_orders" USING "btree" ("purchaser_email", "created_at" DESC);


--
-- Name: idx_payment_orders_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX IF NOT EXISTS "idx_payment_orders_status" ON "public"."payment_orders" USING "btree" ("status", "created_at" DESC);


--
-- Name: idx_payment_refunds_email; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX IF NOT EXISTS "idx_payment_refunds_email" ON "public"."payment_refunds" USING "btree" ("purchaser_email", "created_at" DESC);


--
-- Name: idx_payment_refunds_order; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX IF NOT EXISTS "idx_payment_refunds_order" ON "public"."payment_refunds" USING "btree" ("order_id");


--
-- Name: idx_perf_monitor_function; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX IF NOT EXISTS "idx_perf_monitor_function" ON "public"."performance_monitor" USING "btree" ("function_name");


--
-- Name: idx_perf_monitor_time; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX IF NOT EXISTS "idx_perf_monitor_time" ON "public"."performance_monitor" USING "btree" ("create_time" DESC);


--
-- Name: idx_performance_monitor_function_time; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX IF NOT EXISTS "idx_performance_monitor_function_time" ON "public"."performance_monitor" USING "btree" ("function_name", "start_time" DESC);


--
-- Name: idx_positions_company_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX IF NOT EXISTS "idx_positions_company_status" ON "public"."positions" USING "btree" ("company_id", "status", "update_time" DESC);


--
-- Name: idx_profiles_name; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX IF NOT EXISTS "idx_profiles_name" ON "public"."student_profiles" USING "btree" ("name");


--
-- Name: idx_project_progress_records_project; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX IF NOT EXISTS "idx_project_progress_records_project" ON "public"."project_progress_records" USING "btree" ("project_id");


--
-- Name: idx_question_bank_type; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX IF NOT EXISTS "idx_question_bank_type" ON "public"."question_bank" USING "btree" ("question_type");


--
-- Name: idx_resume_optimizations_created_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX IF NOT EXISTS "idx_resume_optimizations_created_at" ON "public"."resume_optimizations" USING "btree" ("created_at" DESC);


--
-- Name: idx_resume_optimizations_user; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX IF NOT EXISTS "idx_resume_optimizations_user" ON "public"."resume_optimizations" USING "btree" ("user_id", "created_at" DESC);


--
-- Name: idx_resume_optimizations_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX IF NOT EXISTS "idx_resume_optimizations_user_id" ON "public"."resume_optimizations" USING "btree" ("user_id");


--
-- Name: idx_resume_versions_user; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX IF NOT EXISTS "idx_resume_versions_user" ON "public"."resume_versions" USING "btree" ("user_email", "created_at" DESC);


--
-- Name: idx_student_applications_position; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX IF NOT EXISTS "idx_student_applications_position" ON "public"."student_applications" USING "btree" ("position_id");


--
-- Name: idx_student_applications_student; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX IF NOT EXISTS "idx_student_applications_student" ON "public"."student_applications" USING "btree" ("student_id");


--
-- Name: idx_student_verifications_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX IF NOT EXISTS "idx_student_verifications_status" ON "public"."student_verifications" USING "btree" ("verification_status");


--
-- Name: idx_student_verifications_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX IF NOT EXISTS "idx_student_verifications_user_id" ON "public"."student_verifications" USING "btree" ("user_id");


--
-- Name: idx_study_checkins_user; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX IF NOT EXISTS "idx_study_checkins_user" ON "public"."study_checkins" USING "btree" ("user_email", "checkin_date" DESC);


--
-- Name: idx_training_submissions_student; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX IF NOT EXISTS "idx_training_submissions_student" ON "public"."training_submissions" USING "btree" ("student_no");


--
-- Name: idx_training_submissions_task; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX IF NOT EXISTS "idx_training_submissions_task" ON "public"."training_submissions" USING "btree" ("task_id");


--
-- Name: idx_training_tasks_class; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX IF NOT EXISTS "idx_training_tasks_class" ON "public"."training_tasks" USING "btree" ("class_id");


--
-- Name: idx_training_tasks_difficulty; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX IF NOT EXISTS "idx_training_tasks_difficulty" ON "public"."training_tasks" USING "btree" ("difficulty_level");


--
-- Name: idx_training_tasks_type; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX IF NOT EXISTS "idx_training_tasks_type" ON "public"."training_tasks" USING "btree" ("task_type");


--
-- Name: idx_usage_email_date; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX IF NOT EXISTS "idx_usage_email_date" ON "public"."usage_records" USING "btree" ("user_email", "usage_date" DESC);


--
-- Name: idx_user_achievements_user; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX IF NOT EXISTS "idx_user_achievements_user" ON "public"."user_achievements" USING "btree" ("user_email");


--
-- Name: idx_user_courses_email; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX IF NOT EXISTS "idx_user_courses_email" ON "public"."user_courses" USING "btree" ("user_email", "create_time" DESC);


--
-- Name: idx_user_profiles_alipay_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX IF NOT EXISTS "idx_user_profiles_alipay_user_id" ON "public"."user_profiles" USING "btree" ("alipay_user_id");


--
-- Name: idx_user_profiles_email; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX IF NOT EXISTS "idx_user_profiles_email" ON "public"."user_profiles" USING "btree" ("email");


--
-- Name: idx_user_profiles_qq_openid; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX IF NOT EXISTS "idx_user_profiles_qq_openid" ON "public"."user_profiles" USING "btree" ("qq_openid");


--
-- Name: idx_user_profiles_wechat_openid; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX IF NOT EXISTS "idx_user_profiles_wechat_openid" ON "public"."user_profiles" USING "btree" ("wechat_openid");


--
-- Name: idx_users_email; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX IF NOT EXISTS "idx_users_email" ON "public"."users" USING "btree" ("email");


--
-- Name: idx_users_role; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX IF NOT EXISTS "idx_users_role" ON "public"."users" USING "btree" ("role");


--
-- Name: idx_vip_orders_order_no; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX IF NOT EXISTS "idx_vip_orders_order_no" ON "public"."vip_orders" USING "btree" ("order_no");


--
-- Name: idx_vip_orders_payment_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX IF NOT EXISTS "idx_vip_orders_payment_status" ON "public"."vip_orders" USING "btree" ("payment_status");


--
-- Name: idx_vip_orders_user_email; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX IF NOT EXISTS "idx_vip_orders_user_email" ON "public"."vip_orders" USING "btree" ("user_email");


--
-- Name: idx_web_summary_user; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX IF NOT EXISTS "idx_web_summary_user" ON "public"."web_content_summary_task" USING "btree" ("user_id", "create_time" DESC);


--
-- Name: student_verifications student_verification_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE OR REPLACE TRIGGER "student_verification_updated_at" BEFORE UPDATE ON "public"."student_verifications" FOR EACH ROW EXECUTE FUNCTION "public"."update_student_verification_updated_at"();


--
-- Name: performance_monitor trg_auto_cleanup_monitoring; Type: TRIGGER; Schema: public; Owner: -
--

CREATE OR REPLACE TRIGGER "trg_auto_cleanup_monitoring" AFTER INSERT ON "public"."performance_monitor" FOR EACH STATEMENT EXECUTE FUNCTION "public"."auto_cleanup_monitoring"();


--
-- Name: user_profiles trigger_generate_invite_code_profiles; Type: TRIGGER; Schema: public; Owner: -
--

CREATE OR REPLACE TRIGGER "trigger_generate_invite_code_profiles" BEFORE INSERT ON "public"."user_profiles" FOR EACH ROW EXECUTE FUNCTION "public"."generate_invite_code"();


--
-- Name: colleges update_colleges_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE OR REPLACE TRIGGER "update_colleges_updated_at" BEFORE UPDATE ON "public"."colleges" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();


--
-- Name: companies update_companies_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE OR REPLACE TRIGGER "update_companies_updated_at" BEFORE UPDATE ON "public"."companies" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();


--
-- Name: company_positions update_company_positions_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE OR REPLACE TRIGGER "update_company_positions_updated_at" BEFORE UPDATE ON "public"."company_positions" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();


--
-- Name: cooperation_agreements update_cooperation_agreements_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE OR REPLACE TRIGGER "update_cooperation_agreements_updated_at" BEFORE UPDATE ON "public"."cooperation_agreements" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();


--
-- Name: cooperation_companies update_cooperation_companies_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE OR REPLACE TRIGGER "update_cooperation_companies_updated_at" BEFORE UPDATE ON "public"."cooperation_companies" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();


--
-- Name: cooperation_plans update_cooperation_plans_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE OR REPLACE TRIGGER "update_cooperation_plans_updated_at" BEFORE UPDATE ON "public"."cooperation_plans" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();


--
-- Name: cooperation_projects update_cooperation_projects_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE OR REPLACE TRIGGER "update_cooperation_projects_updated_at" BEFORE UPDATE ON "public"."cooperation_projects" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();


--
-- Name: student_applications update_student_applications_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE OR REPLACE TRIGGER "update_student_applications_updated_at" BEFORE UPDATE ON "public"."student_applications" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();


--
-- Name: universities update_universities_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE OR REPLACE TRIGGER "update_universities_updated_at" BEFORE UPDATE ON "public"."universities" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();


--
-- Name: user_profiles update_user_profiles_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE OR REPLACE TRIGGER "update_user_profiles_updated_at" BEFORE UPDATE ON "public"."user_profiles" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();


--
-- Name: ability_profiles ability_profiles_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

DO $pg_schema_restore$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint con
    JOIN pg_class c ON c.oid = con.conrelid
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE con.conname = 'ability_profiles_user_id_fkey'
      AND n.nspname = 'public'
      AND c.relname = 'ability_profiles'
  ) THEN
    EXECUTE $pg_schema_sql$
ALTER TABLE ONLY "public"."ability_profiles"
    ADD CONSTRAINT "ability_profiles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;
$pg_schema_sql$;
  END IF;
END
$pg_schema_restore$;


--
-- Name: affiliate_rewards affiliate_rewards_invitee_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

DO $pg_schema_restore$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint con
    JOIN pg_class c ON c.oid = con.conrelid
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE con.conname = 'affiliate_rewards_invitee_id_fkey'
      AND n.nspname = 'public'
      AND c.relname = 'affiliate_rewards'
  ) THEN
    EXECUTE $pg_schema_sql$
ALTER TABLE ONLY "public"."affiliate_rewards"
    ADD CONSTRAINT "affiliate_rewards_invitee_id_fkey" FOREIGN KEY ("invitee_id") REFERENCES "public"."user_profiles"("id");
$pg_schema_sql$;
  END IF;
END
$pg_schema_restore$;


--
-- Name: affiliate_rewards affiliate_rewards_order_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

DO $pg_schema_restore$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint con
    JOIN pg_class c ON c.oid = con.conrelid
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE con.conname = 'affiliate_rewards_order_id_fkey'
      AND n.nspname = 'public'
      AND c.relname = 'affiliate_rewards'
  ) THEN
    EXECUTE $pg_schema_sql$
ALTER TABLE ONLY "public"."affiliate_rewards"
    ADD CONSTRAINT "affiliate_rewards_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id");
$pg_schema_sql$;
  END IF;
END
$pg_schema_restore$;


--
-- Name: affiliate_rewards affiliate_rewards_promoter_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

DO $pg_schema_restore$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint con
    JOIN pg_class c ON c.oid = con.conrelid
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE con.conname = 'affiliate_rewards_promoter_id_fkey'
      AND n.nspname = 'public'
      AND c.relname = 'affiliate_rewards'
  ) THEN
    EXECUTE $pg_schema_sql$
ALTER TABLE ONLY "public"."affiliate_rewards"
    ADD CONSTRAINT "affiliate_rewards_promoter_id_fkey" FOREIGN KEY ("promoter_id") REFERENCES "public"."user_profiles"("id");
$pg_schema_sql$;
  END IF;
END
$pg_schema_restore$;


--
-- Name: ai_interview_record ai_interview_record_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

DO $pg_schema_restore$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint con
    JOIN pg_class c ON c.oid = con.conrelid
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE con.conname = 'ai_interview_record_user_id_fkey'
      AND n.nspname = 'public'
      AND c.relname = 'ai_interview_record'
  ) THEN
    EXECUTE $pg_schema_sql$
ALTER TABLE ONLY "public"."ai_interview_record"
    ADD CONSTRAINT "ai_interview_record_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."user_profiles"("id") ON DELETE CASCADE;
$pg_schema_sql$;
  END IF;
END
$pg_schema_restore$;


--
-- Name: assessment_record assessment_record_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

DO $pg_schema_restore$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint con
    JOIN pg_class c ON c.oid = con.conrelid
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE con.conname = 'assessment_record_user_id_fkey'
      AND n.nspname = 'public'
      AND c.relname = 'assessment_record'
  ) THEN
    EXECUTE $pg_schema_sql$
ALTER TABLE ONLY "public"."assessment_record"
    ADD CONSTRAINT "assessment_record_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id");
$pg_schema_sql$;
  END IF;
END
$pg_schema_restore$;


--
-- Name: assessment_records assessment_records_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

DO $pg_schema_restore$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint con
    JOIN pg_class c ON c.oid = con.conrelid
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE con.conname = 'assessment_records_user_id_fkey'
      AND n.nspname = 'public'
      AND c.relname = 'assessment_records'
  ) THEN
    EXECUTE $pg_schema_sql$
ALTER TABLE ONLY "public"."assessment_records"
    ADD CONSTRAINT "assessment_records_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE SET NULL;
$pg_schema_sql$;
  END IF;
END
$pg_schema_restore$;


--
-- Name: assessment_results assessment_results_task_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

DO $pg_schema_restore$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint con
    JOIN pg_class c ON c.oid = con.conrelid
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE con.conname = 'assessment_results_task_id_fkey'
      AND n.nspname = 'public'
      AND c.relname = 'assessment_results'
  ) THEN
    EXECUTE $pg_schema_sql$
ALTER TABLE ONLY "public"."assessment_results"
    ADD CONSTRAINT "assessment_results_task_id_fkey" FOREIGN KEY ("task_id") REFERENCES "public"."assessment_tasks"("id") ON DELETE CASCADE;
$pg_schema_sql$;
  END IF;
END
$pg_schema_restore$;


--
-- Name: assessment_tasks assessment_tasks_template_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

DO $pg_schema_restore$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint con
    JOIN pg_class c ON c.oid = con.conrelid
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE con.conname = 'assessment_tasks_template_id_fkey'
      AND n.nspname = 'public'
      AND c.relname = 'assessment_tasks'
  ) THEN
    EXECUTE $pg_schema_sql$
ALTER TABLE ONLY "public"."assessment_tasks"
    ADD CONSTRAINT "assessment_tasks_template_id_fkey" FOREIGN KEY ("template_id") REFERENCES "public"."assessment_templates"("id") ON DELETE CASCADE;
$pg_schema_sql$;
  END IF;
END
$pg_schema_restore$;


--
-- Name: candidate_assessment_account candidate_assessment_account_enterprise_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

DO $pg_schema_restore$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint con
    JOIN pg_class c ON c.oid = con.conrelid
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE con.conname = 'candidate_assessment_account_enterprise_id_fkey'
      AND n.nspname = 'public'
      AND c.relname = 'candidate_assessment_account'
  ) THEN
    EXECUTE $pg_schema_sql$
ALTER TABLE ONLY "public"."candidate_assessment_account"
    ADD CONSTRAINT "candidate_assessment_account_enterprise_id_fkey" FOREIGN KEY ("enterprise_id") REFERENCES "public"."user_profiles"("id") ON DELETE CASCADE;
$pg_schema_sql$;
  END IF;
END
$pg_schema_restore$;


--
-- Name: candidate_assessment_account candidate_assessment_account_model_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

DO $pg_schema_restore$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint con
    JOIN pg_class c ON c.oid = con.conrelid
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE con.conname = 'candidate_assessment_account_model_id_fkey'
      AND n.nspname = 'public'
      AND c.relname = 'candidate_assessment_account'
  ) THEN
    EXECUTE $pg_schema_sql$
ALTER TABLE ONLY "public"."candidate_assessment_account"
    ADD CONSTRAINT "candidate_assessment_account_model_id_fkey" FOREIGN KEY ("model_id") REFERENCES "public"."enterprise_competency_model"("id") ON DELETE CASCADE;
$pg_schema_sql$;
  END IF;
END
$pg_schema_restore$;


--
-- Name: candidates candidates_student_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

DO $pg_schema_restore$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint con
    JOIN pg_class c ON c.oid = con.conrelid
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE con.conname = 'candidates_student_user_id_fkey'
      AND n.nspname = 'public'
      AND c.relname = 'candidates'
  ) THEN
    EXECUTE $pg_schema_sql$
ALTER TABLE ONLY "public"."candidates"
    ADD CONSTRAINT "candidates_student_user_id_fkey" FOREIGN KEY ("student_user_id") REFERENCES "auth"."users"("id") ON DELETE SET NULL;
$pg_schema_sql$;
  END IF;
END
$pg_schema_restore$;


--
-- Name: career_consultations career_consultations_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

DO $pg_schema_restore$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint con
    JOIN pg_class c ON c.oid = con.conrelid
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE con.conname = 'career_consultations_user_id_fkey'
      AND n.nspname = 'public'
      AND c.relname = 'career_consultations'
  ) THEN
    EXECUTE $pg_schema_sql$
ALTER TABLE ONLY "public"."career_consultations"
    ADD CONSTRAINT "career_consultations_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;
$pg_schema_sql$;
  END IF;
END
$pg_schema_restore$;


--
-- Name: class_students class_students_class_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

DO $pg_schema_restore$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint con
    JOIN pg_class c ON c.oid = con.conrelid
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE con.conname = 'class_students_class_id_fkey'
      AND n.nspname = 'public'
      AND c.relname = 'class_students'
  ) THEN
    EXECUTE $pg_schema_sql$
ALTER TABLE ONLY "public"."class_students"
    ADD CONSTRAINT "class_students_class_id_fkey" FOREIGN KEY ("class_id") REFERENCES "public"."classes"("id") ON DELETE CASCADE;
$pg_schema_sql$;
  END IF;
END
$pg_schema_restore$;


--
-- Name: colleges colleges_university_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

DO $pg_schema_restore$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint con
    JOIN pg_class c ON c.oid = con.conrelid
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE con.conname = 'colleges_university_id_fkey'
      AND n.nspname = 'public'
      AND c.relname = 'colleges'
  ) THEN
    EXECUTE $pg_schema_sql$
ALTER TABLE ONLY "public"."colleges"
    ADD CONSTRAINT "colleges_university_id_fkey" FOREIGN KEY ("university_id") REFERENCES "public"."universities"("university_id") ON DELETE CASCADE;
$pg_schema_sql$;
  END IF;
END
$pg_schema_restore$;


--
-- Name: company_positions company_positions_company_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

DO $pg_schema_restore$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint con
    JOIN pg_class c ON c.oid = con.conrelid
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE con.conname = 'company_positions_company_id_fkey'
      AND n.nspname = 'public'
      AND c.relname = 'company_positions'
  ) THEN
    EXECUTE $pg_schema_sql$
ALTER TABLE ONLY "public"."company_positions"
    ADD CONSTRAINT "company_positions_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "public"."cooperation_companies"("id") ON DELETE CASCADE;
$pg_schema_sql$;
  END IF;
END
$pg_schema_restore$;


--
-- Name: company_positions company_positions_university_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

DO $pg_schema_restore$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint con
    JOIN pg_class c ON c.oid = con.conrelid
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE con.conname = 'company_positions_university_id_fkey'
      AND n.nspname = 'public'
      AND c.relname = 'company_positions'
  ) THEN
    EXECUTE $pg_schema_sql$
ALTER TABLE ONLY "public"."company_positions"
    ADD CONSTRAINT "company_positions_university_id_fkey" FOREIGN KEY ("university_id") REFERENCES "public"."universities"("university_id") ON DELETE CASCADE;
$pg_schema_sql$;
  END IF;
END
$pg_schema_restore$;


--
-- Name: cooperation_agreements cooperation_agreements_company_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

DO $pg_schema_restore$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint con
    JOIN pg_class c ON c.oid = con.conrelid
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE con.conname = 'cooperation_agreements_company_id_fkey'
      AND n.nspname = 'public'
      AND c.relname = 'cooperation_agreements'
  ) THEN
    EXECUTE $pg_schema_sql$
ALTER TABLE ONLY "public"."cooperation_agreements"
    ADD CONSTRAINT "cooperation_agreements_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "public"."cooperation_companies"("id") ON DELETE CASCADE;
$pg_schema_sql$;
  END IF;
END
$pg_schema_restore$;


--
-- Name: cooperation_agreements cooperation_agreements_university_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

DO $pg_schema_restore$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint con
    JOIN pg_class c ON c.oid = con.conrelid
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE con.conname = 'cooperation_agreements_university_id_fkey'
      AND n.nspname = 'public'
      AND c.relname = 'cooperation_agreements'
  ) THEN
    EXECUTE $pg_schema_sql$
ALTER TABLE ONLY "public"."cooperation_agreements"
    ADD CONSTRAINT "cooperation_agreements_university_id_fkey" FOREIGN KEY ("university_id") REFERENCES "public"."universities"("university_id") ON DELETE CASCADE;
$pg_schema_sql$;
  END IF;
END
$pg_schema_restore$;


--
-- Name: cooperation_companies cooperation_companies_university_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

DO $pg_schema_restore$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint con
    JOIN pg_class c ON c.oid = con.conrelid
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE con.conname = 'cooperation_companies_university_id_fkey'
      AND n.nspname = 'public'
      AND c.relname = 'cooperation_companies'
  ) THEN
    EXECUTE $pg_schema_sql$
ALTER TABLE ONLY "public"."cooperation_companies"
    ADD CONSTRAINT "cooperation_companies_university_id_fkey" FOREIGN KEY ("university_id") REFERENCES "public"."universities"("university_id") ON DELETE CASCADE;
$pg_schema_sql$;
  END IF;
END
$pg_schema_restore$;


--
-- Name: cooperation_plans cooperation_plans_company_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

DO $pg_schema_restore$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint con
    JOIN pg_class c ON c.oid = con.conrelid
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE con.conname = 'cooperation_plans_company_id_fkey'
      AND n.nspname = 'public'
      AND c.relname = 'cooperation_plans'
  ) THEN
    EXECUTE $pg_schema_sql$
ALTER TABLE ONLY "public"."cooperation_plans"
    ADD CONSTRAINT "cooperation_plans_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "public"."cooperation_companies"("id") ON DELETE CASCADE;
$pg_schema_sql$;
  END IF;
END
$pg_schema_restore$;


--
-- Name: cooperation_plans cooperation_plans_university_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

DO $pg_schema_restore$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint con
    JOIN pg_class c ON c.oid = con.conrelid
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE con.conname = 'cooperation_plans_university_id_fkey'
      AND n.nspname = 'public'
      AND c.relname = 'cooperation_plans'
  ) THEN
    EXECUTE $pg_schema_sql$
ALTER TABLE ONLY "public"."cooperation_plans"
    ADD CONSTRAINT "cooperation_plans_university_id_fkey" FOREIGN KEY ("university_id") REFERENCES "public"."universities"("university_id") ON DELETE CASCADE;
$pg_schema_sql$;
  END IF;
END
$pg_schema_restore$;


--
-- Name: cooperation_projects cooperation_projects_company_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

DO $pg_schema_restore$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint con
    JOIN pg_class c ON c.oid = con.conrelid
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE con.conname = 'cooperation_projects_company_id_fkey'
      AND n.nspname = 'public'
      AND c.relname = 'cooperation_projects'
  ) THEN
    EXECUTE $pg_schema_sql$
ALTER TABLE ONLY "public"."cooperation_projects"
    ADD CONSTRAINT "cooperation_projects_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "public"."cooperation_companies"("id") ON DELETE CASCADE;
$pg_schema_sql$;
  END IF;
END
$pg_schema_restore$;


--
-- Name: cooperation_projects cooperation_projects_plan_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

DO $pg_schema_restore$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint con
    JOIN pg_class c ON c.oid = con.conrelid
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE con.conname = 'cooperation_projects_plan_id_fkey'
      AND n.nspname = 'public'
      AND c.relname = 'cooperation_projects'
  ) THEN
    EXECUTE $pg_schema_sql$
ALTER TABLE ONLY "public"."cooperation_projects"
    ADD CONSTRAINT "cooperation_projects_plan_id_fkey" FOREIGN KEY ("plan_id") REFERENCES "public"."cooperation_plans"("id") ON DELETE SET NULL;
$pg_schema_sql$;
  END IF;
END
$pg_schema_restore$;


--
-- Name: cooperation_projects cooperation_projects_university_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

DO $pg_schema_restore$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint con
    JOIN pg_class c ON c.oid = con.conrelid
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE con.conname = 'cooperation_projects_university_id_fkey'
      AND n.nspname = 'public'
      AND c.relname = 'cooperation_projects'
  ) THEN
    EXECUTE $pg_schema_sql$
ALTER TABLE ONLY "public"."cooperation_projects"
    ADD CONSTRAINT "cooperation_projects_university_id_fkey" FOREIGN KEY ("university_id") REFERENCES "public"."universities"("university_id") ON DELETE CASCADE;
$pg_schema_sql$;
  END IF;
END
$pg_schema_restore$;


--
-- Name: course_study course_study_course_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

DO $pg_schema_restore$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint con
    JOIN pg_class c ON c.oid = con.conrelid
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE con.conname = 'course_study_course_id_fkey'
      AND n.nspname = 'public'
      AND c.relname = 'course_study'
  ) THEN
    EXECUTE $pg_schema_sql$
ALTER TABLE ONLY "public"."course_study"
    ADD CONSTRAINT "course_study_course_id_fkey" FOREIGN KEY ("course_id") REFERENCES "public"."courses"("id");
$pg_schema_sql$;
  END IF;
END
$pg_schema_restore$;


--
-- Name: course_study course_study_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

DO $pg_schema_restore$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint con
    JOIN pg_class c ON c.oid = con.conrelid
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE con.conname = 'course_study_user_id_fkey'
      AND n.nspname = 'public'
      AND c.relname = 'course_study'
  ) THEN
    EXECUTE $pg_schema_sql$
ALTER TABLE ONLY "public"."course_study"
    ADD CONSTRAINT "course_study_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id");
$pg_schema_sql$;
  END IF;
END
$pg_schema_restore$;


--
-- Name: enterprise_competency_model enterprise_competency_model_enterprise_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

DO $pg_schema_restore$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint con
    JOIN pg_class c ON c.oid = con.conrelid
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE con.conname = 'enterprise_competency_model_enterprise_id_fkey'
      AND n.nspname = 'public'
      AND c.relname = 'enterprise_competency_model'
  ) THEN
    EXECUTE $pg_schema_sql$
ALTER TABLE ONLY "public"."enterprise_competency_model"
    ADD CONSTRAINT "enterprise_competency_model_enterprise_id_fkey" FOREIGN KEY ("enterprise_id") REFERENCES "public"."user_profiles"("id") ON DELETE CASCADE;
$pg_schema_sql$;
  END IF;
END
$pg_schema_restore$;


--
-- Name: enterprise_hiring_query_history enterprise_hiring_query_history_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

DO $pg_schema_restore$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint con
    JOIN pg_class c ON c.oid = con.conrelid
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE con.conname = 'enterprise_hiring_query_history_user_id_fkey'
      AND n.nspname = 'public'
      AND c.relname = 'enterprise_hiring_query_history'
  ) THEN
    EXECUTE $pg_schema_sql$
ALTER TABLE ONLY "public"."enterprise_hiring_query_history"
    ADD CONSTRAINT "enterprise_hiring_query_history_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;
$pg_schema_sql$;
  END IF;
END
$pg_schema_restore$;


--
-- Name: internship_paths internship_paths_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

DO $pg_schema_restore$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint con
    JOIN pg_class c ON c.oid = con.conrelid
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE con.conname = 'internship_paths_user_id_fkey'
      AND n.nspname = 'public'
      AND c.relname = 'internship_paths'
  ) THEN
    EXECUTE $pg_schema_sql$
ALTER TABLE ONLY "public"."internship_paths"
    ADD CONSTRAINT "internship_paths_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;
$pg_schema_sql$;
  END IF;
END
$pg_schema_restore$;


--
-- Name: interview_simulations interview_simulations_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

DO $pg_schema_restore$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint con
    JOIN pg_class c ON c.oid = con.conrelid
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE con.conname = 'interview_simulations_user_id_fkey'
      AND n.nspname = 'public'
      AND c.relname = 'interview_simulations'
  ) THEN
    EXECUTE $pg_schema_sql$
ALTER TABLE ONLY "public"."interview_simulations"
    ADD CONSTRAINT "interview_simulations_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;
$pg_schema_sql$;
  END IF;
END
$pg_schema_restore$;


--
-- Name: job_applications job_applications_position_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

DO $pg_schema_restore$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint con
    JOIN pg_class c ON c.oid = con.conrelid
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE con.conname = 'job_applications_position_id_fkey'
      AND n.nspname = 'public'
      AND c.relname = 'job_applications'
  ) THEN
    EXECUTE $pg_schema_sql$
ALTER TABLE ONLY "public"."job_applications"
    ADD CONSTRAINT "job_applications_position_id_fkey" FOREIGN KEY ("position_id") REFERENCES "public"."positions"("position_id") ON DELETE SET NULL;
$pg_schema_sql$;
  END IF;
END
$pg_schema_restore$;


--
-- Name: job_seeker_profiles job_seeker_profiles_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

DO $pg_schema_restore$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint con
    JOIN pg_class c ON c.oid = con.conrelid
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE con.conname = 'job_seeker_profiles_user_id_fkey'
      AND n.nspname = 'public'
      AND c.relname = 'job_seeker_profiles'
  ) THEN
    EXECUTE $pg_schema_sql$
ALTER TABLE ONLY "public"."job_seeker_profiles"
    ADD CONSTRAINT "job_seeker_profiles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;
$pg_schema_sql$;
  END IF;
END
$pg_schema_restore$;


--
-- Name: learning_plan_task learning_plan_task_plan_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

DO $pg_schema_restore$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint con
    JOIN pg_class c ON c.oid = con.conrelid
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE con.conname = 'learning_plan_task_plan_id_fkey'
      AND n.nspname = 'public'
      AND c.relname = 'learning_plan_task'
  ) THEN
    EXECUTE $pg_schema_sql$
ALTER TABLE ONLY "public"."learning_plan_task"
    ADD CONSTRAINT "learning_plan_task_plan_id_fkey" FOREIGN KEY ("plan_id") REFERENCES "public"."learning_plans"("id") ON DELETE CASCADE;
$pg_schema_sql$;
  END IF;
END
$pg_schema_restore$;


--
-- Name: learning_records learning_records_path_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

DO $pg_schema_restore$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint con
    JOIN pg_class c ON c.oid = con.conrelid
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE con.conname = 'learning_records_path_id_fkey'
      AND n.nspname = 'public'
      AND c.relname = 'learning_records'
  ) THEN
    EXECUTE $pg_schema_sql$
ALTER TABLE ONLY "public"."learning_records"
    ADD CONSTRAINT "learning_records_path_id_fkey" FOREIGN KEY ("path_id") REFERENCES "public"."internship_paths"("id") ON DELETE SET NULL;
$pg_schema_sql$;
  END IF;
END
$pg_schema_restore$;


--
-- Name: learning_records learning_records_task_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

DO $pg_schema_restore$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint con
    JOIN pg_class c ON c.oid = con.conrelid
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE con.conname = 'learning_records_task_id_fkey'
      AND n.nspname = 'public'
      AND c.relname = 'learning_records'
  ) THEN
    EXECUTE $pg_schema_sql$
ALTER TABLE ONLY "public"."learning_records"
    ADD CONSTRAINT "learning_records_task_id_fkey" FOREIGN KEY ("task_id") REFERENCES "public"."training_tasks"("id") ON DELETE CASCADE;
$pg_schema_sql$;
  END IF;
END
$pg_schema_restore$;


--
-- Name: learning_records learning_records_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

DO $pg_schema_restore$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint con
    JOIN pg_class c ON c.oid = con.conrelid
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE con.conname = 'learning_records_user_id_fkey'
      AND n.nspname = 'public'
      AND c.relname = 'learning_records'
  ) THEN
    EXECUTE $pg_schema_sql$
ALTER TABLE ONLY "public"."learning_records"
    ADD CONSTRAINT "learning_records_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;
$pg_schema_sql$;
  END IF;
END
$pg_schema_restore$;


--
-- Name: orders orders_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

DO $pg_schema_restore$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint con
    JOIN pg_class c ON c.oid = con.conrelid
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE con.conname = 'orders_user_id_fkey'
      AND n.nspname = 'public'
      AND c.relname = 'orders'
  ) THEN
    EXECUTE $pg_schema_sql$
ALTER TABLE ONLY "public"."orders"
    ADD CONSTRAINT "orders_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id");
$pg_schema_sql$;
  END IF;
END
$pg_schema_restore$;


--
-- Name: payment_refunds payment_refunds_order_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

DO $pg_schema_restore$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint con
    JOIN pg_class c ON c.oid = con.conrelid
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE con.conname = 'payment_refunds_order_id_fkey'
      AND n.nspname = 'public'
      AND c.relname = 'payment_refunds'
  ) THEN
    EXECUTE $pg_schema_sql$
ALTER TABLE ONLY "public"."payment_refunds"
    ADD CONSTRAINT "payment_refunds_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "public"."payment_orders"("id") ON DELETE CASCADE;
$pg_schema_sql$;
  END IF;
END
$pg_schema_restore$;


--
-- Name: project_progress_records project_progress_records_project_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

DO $pg_schema_restore$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint con
    JOIN pg_class c ON c.oid = con.conrelid
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE con.conname = 'project_progress_records_project_id_fkey'
      AND n.nspname = 'public'
      AND c.relname = 'project_progress_records'
  ) THEN
    EXECUTE $pg_schema_sql$
ALTER TABLE ONLY "public"."project_progress_records"
    ADD CONSTRAINT "project_progress_records_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "public"."cooperation_projects"("id") ON DELETE CASCADE;
$pg_schema_sql$;
  END IF;
END
$pg_schema_restore$;


--
-- Name: resume_optimizations resume_optimizations_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

DO $pg_schema_restore$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint con
    JOIN pg_class c ON c.oid = con.conrelid
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE con.conname = 'resume_optimizations_user_id_fkey'
      AND n.nspname = 'public'
      AND c.relname = 'resume_optimizations'
  ) THEN
    EXECUTE $pg_schema_sql$
ALTER TABLE ONLY "public"."resume_optimizations"
    ADD CONSTRAINT "resume_optimizations_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;
$pg_schema_sql$;
  END IF;
END
$pg_schema_restore$;


--
-- Name: role_permissions role_permissions_permission_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

DO $pg_schema_restore$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint con
    JOIN pg_class c ON c.oid = con.conrelid
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE con.conname = 'role_permissions_permission_id_fkey'
      AND n.nspname = 'public'
      AND c.relname = 'role_permissions'
  ) THEN
    EXECUTE $pg_schema_sql$
ALTER TABLE ONLY "public"."role_permissions"
    ADD CONSTRAINT "role_permissions_permission_id_fkey" FOREIGN KEY ("permission_id") REFERENCES "public"."permissions"("id") ON DELETE CASCADE;
$pg_schema_sql$;
  END IF;
END
$pg_schema_restore$;


--
-- Name: role_permissions role_permissions_role_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

DO $pg_schema_restore$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint con
    JOIN pg_class c ON c.oid = con.conrelid
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE con.conname = 'role_permissions_role_id_fkey'
      AND n.nspname = 'public'
      AND c.relname = 'role_permissions'
  ) THEN
    EXECUTE $pg_schema_sql$
ALTER TABLE ONLY "public"."role_permissions"
    ADD CONSTRAINT "role_permissions_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "public"."roles"("id") ON DELETE CASCADE;
$pg_schema_sql$;
  END IF;
END
$pg_schema_restore$;


--
-- Name: student_applications student_applications_position_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

DO $pg_schema_restore$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint con
    JOIN pg_class c ON c.oid = con.conrelid
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE con.conname = 'student_applications_position_id_fkey'
      AND n.nspname = 'public'
      AND c.relname = 'student_applications'
  ) THEN
    EXECUTE $pg_schema_sql$
ALTER TABLE ONLY "public"."student_applications"
    ADD CONSTRAINT "student_applications_position_id_fkey" FOREIGN KEY ("position_id") REFERENCES "public"."company_positions"("id") ON DELETE CASCADE;
$pg_schema_sql$;
  END IF;
END
$pg_schema_restore$;


--
-- Name: student_verifications student_verifications_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

DO $pg_schema_restore$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint con
    JOIN pg_class c ON c.oid = con.conrelid
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE con.conname = 'student_verifications_user_id_fkey'
      AND n.nspname = 'public'
      AND c.relname = 'student_verifications'
  ) THEN
    EXECUTE $pg_schema_sql$
ALTER TABLE ONLY "public"."student_verifications"
    ADD CONSTRAINT "student_verifications_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;
$pg_schema_sql$;
  END IF;
END
$pg_schema_restore$;


--
-- Name: training_submissions training_submissions_class_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

DO $pg_schema_restore$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint con
    JOIN pg_class c ON c.oid = con.conrelid
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE con.conname = 'training_submissions_class_id_fkey'
      AND n.nspname = 'public'
      AND c.relname = 'training_submissions'
  ) THEN
    EXECUTE $pg_schema_sql$
ALTER TABLE ONLY "public"."training_submissions"
    ADD CONSTRAINT "training_submissions_class_id_fkey" FOREIGN KEY ("class_id") REFERENCES "public"."classes"("id") ON DELETE CASCADE;
$pg_schema_sql$;
  END IF;
END
$pg_schema_restore$;


--
-- Name: training_submissions training_submissions_task_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

DO $pg_schema_restore$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint con
    JOIN pg_class c ON c.oid = con.conrelid
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE con.conname = 'training_submissions_task_id_fkey'
      AND n.nspname = 'public'
      AND c.relname = 'training_submissions'
  ) THEN
    EXECUTE $pg_schema_sql$
ALTER TABLE ONLY "public"."training_submissions"
    ADD CONSTRAINT "training_submissions_task_id_fkey" FOREIGN KEY ("task_id") REFERENCES "public"."training_tasks"("id") ON DELETE CASCADE;
$pg_schema_sql$;
  END IF;
END
$pg_schema_restore$;


--
-- Name: training_tasks training_tasks_class_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

DO $pg_schema_restore$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint con
    JOIN pg_class c ON c.oid = con.conrelid
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE con.conname = 'training_tasks_class_id_fkey'
      AND n.nspname = 'public'
      AND c.relname = 'training_tasks'
  ) THEN
    EXECUTE $pg_schema_sql$
ALTER TABLE ONLY "public"."training_tasks"
    ADD CONSTRAINT "training_tasks_class_id_fkey" FOREIGN KEY ("class_id") REFERENCES "public"."classes"("id") ON DELETE SET NULL;
$pg_schema_sql$;
  END IF;
END
$pg_schema_restore$;


--
-- Name: user_portrait user_portrait_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

DO $pg_schema_restore$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint con
    JOIN pg_class c ON c.oid = con.conrelid
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE con.conname = 'user_portrait_user_id_fkey'
      AND n.nspname = 'public'
      AND c.relname = 'user_portrait'
  ) THEN
    EXECUTE $pg_schema_sql$
ALTER TABLE ONLY "public"."user_portrait"
    ADD CONSTRAINT "user_portrait_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."user_profiles"("id") ON DELETE CASCADE;
$pg_schema_sql$;
  END IF;
END
$pg_schema_restore$;


--
-- Name: user_profiles user_profiles_invited_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

DO $pg_schema_restore$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint con
    JOIN pg_class c ON c.oid = con.conrelid
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE con.conname = 'user_profiles_invited_by_fkey'
      AND n.nspname = 'public'
      AND c.relname = 'user_profiles'
  ) THEN
    EXECUTE $pg_schema_sql$
ALTER TABLE ONLY "public"."user_profiles"
    ADD CONSTRAINT "user_profiles_invited_by_fkey" FOREIGN KEY ("invited_by") REFERENCES "public"."user_profiles"("id");
$pg_schema_sql$;
  END IF;
END
$pg_schema_restore$;


--
-- Name: job_favorites Anonymous users can manage favorites; Type: POLICY; Schema: public; Owner: -
--

DO $pg_schema_restore$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policy pol
    JOIN pg_class c ON c.oid = pol.polrelid
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE pol.polname = 'Anonymous users can manage favorites'
      AND n.nspname = 'public'
      AND c.relname = 'job_favorites'
  ) THEN
    EXECUTE $pg_schema_sql$
CREATE POLICY "Anonymous users can manage favorites" ON "public"."job_favorites" USING (true) WITH CHECK (true);
$pg_schema_sql$;
  END IF;
END
$pg_schema_restore$;


--
-- Name: assessments Anyone can view assessments; Type: POLICY; Schema: public; Owner: -
--

DO $pg_schema_restore$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policy pol
    JOIN pg_class c ON c.oid = pol.polrelid
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE pol.polname = 'Anyone can view assessments'
      AND n.nspname = 'public'
      AND c.relname = 'assessments'
  ) THEN
    EXECUTE $pg_schema_sql$
CREATE POLICY "Anyone can view assessments" ON "public"."assessments" FOR SELECT USING (true);
$pg_schema_sql$;
  END IF;
END
$pg_schema_restore$;


--
-- Name: student_verifications Users can create own verification; Type: POLICY; Schema: public; Owner: -
--

DO $pg_schema_restore$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policy pol
    JOIN pg_class c ON c.oid = pol.polrelid
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE pol.polname = 'Users can create own verification'
      AND n.nspname = 'public'
      AND c.relname = 'student_verifications'
  ) THEN
    EXECUTE $pg_schema_sql$
CREATE POLICY "Users can create own verification" ON "public"."student_verifications" FOR INSERT WITH CHECK (("auth"."uid"() = "user_id"));
$pg_schema_sql$;
  END IF;
END
$pg_schema_restore$;


--
-- Name: job_favorites Users can delete their own favorites; Type: POLICY; Schema: public; Owner: -
--

DO $pg_schema_restore$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policy pol
    JOIN pg_class c ON c.oid = pol.polrelid
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE pol.polname = 'Users can delete their own favorites'
      AND n.nspname = 'public'
      AND c.relname = 'job_favorites'
  ) THEN
    EXECUTE $pg_schema_sql$
CREATE POLICY "Users can delete their own favorites" ON "public"."job_favorites" FOR DELETE USING (("user_email" = (("current_setting"('request.jwt.claims'::"text", true))::json ->> 'email'::"text")));
$pg_schema_sql$;
  END IF;
END
$pg_schema_restore$;


--
-- Name: job_favorites Users can insert their own favorites; Type: POLICY; Schema: public; Owner: -
--

DO $pg_schema_restore$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policy pol
    JOIN pg_class c ON c.oid = pol.polrelid
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE pol.polname = 'Users can insert their own favorites'
      AND n.nspname = 'public'
      AND c.relname = 'job_favorites'
  ) THEN
    EXECUTE $pg_schema_sql$
CREATE POLICY "Users can insert their own favorites" ON "public"."job_favorites" FOR INSERT WITH CHECK (("user_email" = (("current_setting"('request.jwt.claims'::"text", true))::json ->> 'email'::"text")));
$pg_schema_sql$;
  END IF;
END
$pg_schema_restore$;


--
-- Name: student_verifications Users can update own pending verification; Type: POLICY; Schema: public; Owner: -
--

DO $pg_schema_restore$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policy pol
    JOIN pg_class c ON c.oid = pol.polrelid
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE pol.polname = 'Users can update own pending verification'
      AND n.nspname = 'public'
      AND c.relname = 'student_verifications'
  ) THEN
    EXECUTE $pg_schema_sql$
CREATE POLICY "Users can update own pending verification" ON "public"."student_verifications" FOR UPDATE USING ((("auth"."uid"() = "user_id") AND ("verification_status" = 'pending'::"text"))) WITH CHECK (("auth"."uid"() = "user_id"));
$pg_schema_sql$;
  END IF;
END
$pg_schema_restore$;


--
-- Name: student_verifications Users can view own verification; Type: POLICY; Schema: public; Owner: -
--

DO $pg_schema_restore$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policy pol
    JOIN pg_class c ON c.oid = pol.polrelid
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE pol.polname = 'Users can view own verification'
      AND n.nspname = 'public'
      AND c.relname = 'student_verifications'
  ) THEN
    EXECUTE $pg_schema_sql$
CREATE POLICY "Users can view own verification" ON "public"."student_verifications" FOR SELECT USING (("auth"."uid"() = "user_id"));
$pg_schema_sql$;
  END IF;
END
$pg_schema_restore$;


--
-- Name: job_favorites Users can view their own favorites; Type: POLICY; Schema: public; Owner: -
--

DO $pg_schema_restore$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policy pol
    JOIN pg_class c ON c.oid = pol.polrelid
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE pol.polname = 'Users can view their own favorites'
      AND n.nspname = 'public'
      AND c.relname = 'job_favorites'
  ) THEN
    EXECUTE $pg_schema_sql$
CREATE POLICY "Users can view their own favorites" ON "public"."job_favorites" FOR SELECT USING (("user_email" = (("current_setting"('request.jwt.claims'::"text", true))::json ->> 'email'::"text")));
$pg_schema_sql$;
  END IF;
END
$pg_schema_restore$;


--
-- Name: ability_profiles; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE "public"."ability_profiles" ENABLE ROW LEVEL SECURITY;

--
-- Name: ai_interview_record; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE "public"."ai_interview_record" ENABLE ROW LEVEL SECURITY;

--
-- Name: ai_interview_record ai_interview_record_insert; Type: POLICY; Schema: public; Owner: -
--

DO $pg_schema_restore$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policy pol
    JOIN pg_class c ON c.oid = pol.polrelid
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE pol.polname = 'ai_interview_record_insert'
      AND n.nspname = 'public'
      AND c.relname = 'ai_interview_record'
  ) THEN
    EXECUTE $pg_schema_sql$
CREATE POLICY "ai_interview_record_insert" ON "public"."ai_interview_record" FOR INSERT WITH CHECK (true);
$pg_schema_sql$;
  END IF;
END
$pg_schema_restore$;


--
-- Name: ai_interview_record ai_interview_record_select; Type: POLICY; Schema: public; Owner: -
--

DO $pg_schema_restore$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policy pol
    JOIN pg_class c ON c.oid = pol.polrelid
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE pol.polname = 'ai_interview_record_select'
      AND n.nspname = 'public'
      AND c.relname = 'ai_interview_record'
  ) THEN
    EXECUTE $pg_schema_sql$
CREATE POLICY "ai_interview_record_select" ON "public"."ai_interview_record" FOR SELECT USING (true);
$pg_schema_sql$;
  END IF;
END
$pg_schema_restore$;


--
-- Name: ai_interview_record ai_interview_record_update; Type: POLICY; Schema: public; Owner: -
--

DO $pg_schema_restore$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policy pol
    JOIN pg_class c ON c.oid = pol.polrelid
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE pol.polname = 'ai_interview_record_update'
      AND n.nspname = 'public'
      AND c.relname = 'ai_interview_record'
  ) THEN
    EXECUTE $pg_schema_sql$
CREATE POLICY "ai_interview_record_update" ON "public"."ai_interview_record" FOR UPDATE USING (true);
$pg_schema_sql$;
  END IF;
END
$pg_schema_restore$;


--
-- Name: dorm_members anon_read_dorms; Type: POLICY; Schema: public; Owner: -
--

DO $pg_schema_restore$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policy pol
    JOIN pg_class c ON c.oid = pol.polrelid
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE pol.polname = 'anon_read_dorms'
      AND n.nspname = 'public'
      AND c.relname = 'dorm_members'
  ) THEN
    EXECUTE $pg_schema_sql$
CREATE POLICY "anon_read_dorms" ON "public"."dorm_members" FOR SELECT TO "authenticated", "anon" USING (true);
$pg_schema_sql$;
  END IF;
END
$pg_schema_restore$;


--
-- Name: mentor_arrangements anon_read_mentors; Type: POLICY; Schema: public; Owner: -
--

DO $pg_schema_restore$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policy pol
    JOIN pg_class c ON c.oid = pol.polrelid
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE pol.polname = 'anon_read_mentors'
      AND n.nspname = 'public'
      AND c.relname = 'mentor_arrangements'
  ) THEN
    EXECUTE $pg_schema_sql$
CREATE POLICY "anon_read_mentors" ON "public"."mentor_arrangements" FOR SELECT TO "authenticated", "anon" USING (true);
$pg_schema_sql$;
  END IF;
END
$pg_schema_restore$;


--
-- Name: student_profiles anon_read_profiles; Type: POLICY; Schema: public; Owner: -
--

DO $pg_schema_restore$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policy pol
    JOIN pg_class c ON c.oid = pol.polrelid
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE pol.polname = 'anon_read_profiles'
      AND n.nspname = 'public'
      AND c.relname = 'student_profiles'
  ) THEN
    EXECUTE $pg_schema_sql$
CREATE POLICY "anon_read_profiles" ON "public"."student_profiles" FOR SELECT TO "authenticated", "anon" USING (true);
$pg_schema_sql$;
  END IF;
END
$pg_schema_restore$;


--
-- Name: dorm_members anon_write_dorms; Type: POLICY; Schema: public; Owner: -
--

DO $pg_schema_restore$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policy pol
    JOIN pg_class c ON c.oid = pol.polrelid
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE pol.polname = 'anon_write_dorms'
      AND n.nspname = 'public'
      AND c.relname = 'dorm_members'
  ) THEN
    EXECUTE $pg_schema_sql$
CREATE POLICY "anon_write_dorms" ON "public"."dorm_members" TO "authenticated", "anon" USING (true) WITH CHECK (true);
$pg_schema_sql$;
  END IF;
END
$pg_schema_restore$;


--
-- Name: mentor_arrangements anon_write_mentors; Type: POLICY; Schema: public; Owner: -
--

DO $pg_schema_restore$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policy pol
    JOIN pg_class c ON c.oid = pol.polrelid
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE pol.polname = 'anon_write_mentors'
      AND n.nspname = 'public'
      AND c.relname = 'mentor_arrangements'
  ) THEN
    EXECUTE $pg_schema_sql$
CREATE POLICY "anon_write_mentors" ON "public"."mentor_arrangements" TO "authenticated", "anon" USING (true) WITH CHECK (true);
$pg_schema_sql$;
  END IF;
END
$pg_schema_restore$;


--
-- Name: student_profiles anon_write_profiles; Type: POLICY; Schema: public; Owner: -
--

DO $pg_schema_restore$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policy pol
    JOIN pg_class c ON c.oid = pol.polrelid
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE pol.polname = 'anon_write_profiles'
      AND n.nspname = 'public'
      AND c.relname = 'student_profiles'
  ) THEN
    EXECUTE $pg_schema_sql$
CREATE POLICY "anon_write_profiles" ON "public"."student_profiles" TO "authenticated", "anon" USING (true) WITH CHECK (true);
$pg_schema_sql$;
  END IF;
END
$pg_schema_restore$;


--
-- Name: assessment_records; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE "public"."assessment_records" ENABLE ROW LEVEL SECURITY;

--
-- Name: assessment_records assessment_records_insert_own; Type: POLICY; Schema: public; Owner: -
--

DO $pg_schema_restore$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policy pol
    JOIN pg_class c ON c.oid = pol.polrelid
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE pol.polname = 'assessment_records_insert_own'
      AND n.nspname = 'public'
      AND c.relname = 'assessment_records'
  ) THEN
    EXECUTE $pg_schema_sql$
CREATE POLICY "assessment_records_insert_own" ON "public"."assessment_records" FOR INSERT WITH CHECK (true);
$pg_schema_sql$;
  END IF;
END
$pg_schema_restore$;


--
-- Name: assessment_records assessment_records_select_own; Type: POLICY; Schema: public; Owner: -
--

DO $pg_schema_restore$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policy pol
    JOIN pg_class c ON c.oid = pol.polrelid
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE pol.polname = 'assessment_records_select_own'
      AND n.nspname = 'public'
      AND c.relname = 'assessment_records'
  ) THEN
    EXECUTE $pg_schema_sql$
CREATE POLICY "assessment_records_select_own" ON "public"."assessment_records" FOR SELECT USING (true);
$pg_schema_sql$;
  END IF;
END
$pg_schema_restore$;


--
-- Name: assessments; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE "public"."assessments" ENABLE ROW LEVEL SECURITY;

--
-- Name: candidates; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE "public"."candidates" ENABLE ROW LEVEL SECURITY;

--
-- Name: candidates candidates_delete_all; Type: POLICY; Schema: public; Owner: -
--

DO $pg_schema_restore$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policy pol
    JOIN pg_class c ON c.oid = pol.polrelid
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE pol.polname = 'candidates_delete_all'
      AND n.nspname = 'public'
      AND c.relname = 'candidates'
  ) THEN
    EXECUTE $pg_schema_sql$
CREATE POLICY "candidates_delete_all" ON "public"."candidates" FOR DELETE USING (true);
$pg_schema_sql$;
  END IF;
END
$pg_schema_restore$;


--
-- Name: candidates candidates_insert_all; Type: POLICY; Schema: public; Owner: -
--

DO $pg_schema_restore$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policy pol
    JOIN pg_class c ON c.oid = pol.polrelid
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE pol.polname = 'candidates_insert_all'
      AND n.nspname = 'public'
      AND c.relname = 'candidates'
  ) THEN
    EXECUTE $pg_schema_sql$
CREATE POLICY "candidates_insert_all" ON "public"."candidates" FOR INSERT WITH CHECK (true);
$pg_schema_sql$;
  END IF;
END
$pg_schema_restore$;


--
-- Name: candidates candidates_select_all; Type: POLICY; Schema: public; Owner: -
--

DO $pg_schema_restore$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policy pol
    JOIN pg_class c ON c.oid = pol.polrelid
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE pol.polname = 'candidates_select_all'
      AND n.nspname = 'public'
      AND c.relname = 'candidates'
  ) THEN
    EXECUTE $pg_schema_sql$
CREATE POLICY "candidates_select_all" ON "public"."candidates" FOR SELECT USING (true);
$pg_schema_sql$;
  END IF;
END
$pg_schema_restore$;


--
-- Name: candidates candidates_update_all; Type: POLICY; Schema: public; Owner: -
--

DO $pg_schema_restore$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policy pol
    JOIN pg_class c ON c.oid = pol.polrelid
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE pol.polname = 'candidates_update_all'
      AND n.nspname = 'public'
      AND c.relname = 'candidates'
  ) THEN
    EXECUTE $pg_schema_sql$
CREATE POLICY "candidates_update_all" ON "public"."candidates" FOR UPDATE USING (true) WITH CHECK (true);
$pg_schema_sql$;
  END IF;
END
$pg_schema_restore$;


--
-- Name: career_consultations; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE "public"."career_consultations" ENABLE ROW LEVEL SECURITY;

--
-- Name: class_students; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE "public"."class_students" ENABLE ROW LEVEL SECURITY;

--
-- Name: classes; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE "public"."classes" ENABLE ROW LEVEL SECURITY;

--
-- Name: classes classes_delete_auth; Type: POLICY; Schema: public; Owner: -
--

DO $pg_schema_restore$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policy pol
    JOIN pg_class c ON c.oid = pol.polrelid
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE pol.polname = 'classes_delete_auth'
      AND n.nspname = 'public'
      AND c.relname = 'classes'
  ) THEN
    EXECUTE $pg_schema_sql$
CREATE POLICY "classes_delete_auth" ON "public"."classes" FOR DELETE TO "authenticated" USING (true);
$pg_schema_sql$;
  END IF;
END
$pg_schema_restore$;


--
-- Name: classes classes_insert_auth; Type: POLICY; Schema: public; Owner: -
--

DO $pg_schema_restore$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policy pol
    JOIN pg_class c ON c.oid = pol.polrelid
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE pol.polname = 'classes_insert_auth'
      AND n.nspname = 'public'
      AND c.relname = 'classes'
  ) THEN
    EXECUTE $pg_schema_sql$
CREATE POLICY "classes_insert_auth" ON "public"."classes" FOR INSERT TO "authenticated" WITH CHECK (true);
$pg_schema_sql$;
  END IF;
END
$pg_schema_restore$;


--
-- Name: classes classes_select_auth; Type: POLICY; Schema: public; Owner: -
--

DO $pg_schema_restore$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policy pol
    JOIN pg_class c ON c.oid = pol.polrelid
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE pol.polname = 'classes_select_auth'
      AND n.nspname = 'public'
      AND c.relname = 'classes'
  ) THEN
    EXECUTE $pg_schema_sql$
CREATE POLICY "classes_select_auth" ON "public"."classes" FOR SELECT TO "authenticated" USING (true);
$pg_schema_sql$;
  END IF;
END
$pg_schema_restore$;


--
-- Name: classes classes_update_auth; Type: POLICY; Schema: public; Owner: -
--

DO $pg_schema_restore$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policy pol
    JOIN pg_class c ON c.oid = pol.polrelid
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE pol.polname = 'classes_update_auth'
      AND n.nspname = 'public'
      AND c.relname = 'classes'
  ) THEN
    EXECUTE $pg_schema_sql$
CREATE POLICY "classes_update_auth" ON "public"."classes" FOR UPDATE TO "authenticated" USING (true) WITH CHECK (true);
$pg_schema_sql$;
  END IF;
END
$pg_schema_restore$;


--
-- Name: colleges; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE "public"."colleges" ENABLE ROW LEVEL SECURITY;

--
-- Name: company_positions; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE "public"."company_positions" ENABLE ROW LEVEL SECURITY;

--
-- Name: cooperation_agreements; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE "public"."cooperation_agreements" ENABLE ROW LEVEL SECURITY;

--
-- Name: cooperation_companies; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE "public"."cooperation_companies" ENABLE ROW LEVEL SECURITY;

--
-- Name: cooperation_plans; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE "public"."cooperation_plans" ENABLE ROW LEVEL SECURITY;

--
-- Name: cooperation_projects; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE "public"."cooperation_projects" ENABLE ROW LEVEL SECURITY;

--
-- Name: course_progress; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE "public"."course_progress" ENABLE ROW LEVEL SECURITY;

--
-- Name: course_progress course_progress_all; Type: POLICY; Schema: public; Owner: -
--

DO $pg_schema_restore$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policy pol
    JOIN pg_class c ON c.oid = pol.polrelid
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE pol.polname = 'course_progress_all'
      AND n.nspname = 'public'
      AND c.relname = 'course_progress'
  ) THEN
    EXECUTE $pg_schema_sql$
CREATE POLICY "course_progress_all" ON "public"."course_progress" USING (true) WITH CHECK (true);
$pg_schema_sql$;
  END IF;
END
$pg_schema_restore$;


--
-- Name: courses; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE "public"."courses" ENABLE ROW LEVEL SECURITY;

--
-- Name: courses courses_select_all; Type: POLICY; Schema: public; Owner: -
--

DO $pg_schema_restore$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policy pol
    JOIN pg_class c ON c.oid = pol.polrelid
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE pol.polname = 'courses_select_all'
      AND n.nspname = 'public'
      AND c.relname = 'courses'
  ) THEN
    EXECUTE $pg_schema_sql$
CREATE POLICY "courses_select_all" ON "public"."courses" FOR SELECT USING (true);
$pg_schema_sql$;
  END IF;
END
$pg_schema_restore$;


--
-- Name: class_students cs_delete_auth; Type: POLICY; Schema: public; Owner: -
--

DO $pg_schema_restore$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policy pol
    JOIN pg_class c ON c.oid = pol.polrelid
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE pol.polname = 'cs_delete_auth'
      AND n.nspname = 'public'
      AND c.relname = 'class_students'
  ) THEN
    EXECUTE $pg_schema_sql$
CREATE POLICY "cs_delete_auth" ON "public"."class_students" FOR DELETE TO "authenticated" USING (true);
$pg_schema_sql$;
  END IF;
END
$pg_schema_restore$;


--
-- Name: class_students cs_insert_auth; Type: POLICY; Schema: public; Owner: -
--

DO $pg_schema_restore$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policy pol
    JOIN pg_class c ON c.oid = pol.polrelid
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE pol.polname = 'cs_insert_auth'
      AND n.nspname = 'public'
      AND c.relname = 'class_students'
  ) THEN
    EXECUTE $pg_schema_sql$
CREATE POLICY "cs_insert_auth" ON "public"."class_students" FOR INSERT TO "authenticated" WITH CHECK (true);
$pg_schema_sql$;
  END IF;
END
$pg_schema_restore$;


--
-- Name: class_students cs_select_auth; Type: POLICY; Schema: public; Owner: -
--

DO $pg_schema_restore$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policy pol
    JOIN pg_class c ON c.oid = pol.polrelid
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE pol.polname = 'cs_select_auth'
      AND n.nspname = 'public'
      AND c.relname = 'class_students'
  ) THEN
    EXECUTE $pg_schema_sql$
CREATE POLICY "cs_select_auth" ON "public"."class_students" FOR SELECT TO "authenticated" USING (true);
$pg_schema_sql$;
  END IF;
END
$pg_schema_restore$;


--
-- Name: class_students cs_update_auth; Type: POLICY; Schema: public; Owner: -
--

DO $pg_schema_restore$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policy pol
    JOIN pg_class c ON c.oid = pol.polrelid
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE pol.polname = 'cs_update_auth'
      AND n.nspname = 'public'
      AND c.relname = 'class_students'
  ) THEN
    EXECUTE $pg_schema_sql$
CREATE POLICY "cs_update_auth" ON "public"."class_students" FOR UPDATE TO "authenticated" USING (true) WITH CHECK (true);
$pg_schema_sql$;
  END IF;
END
$pg_schema_restore$;


--
-- Name: deep_research_task; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE "public"."deep_research_task" ENABLE ROW LEVEL SECURITY;

--
-- Name: dorm_members; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE "public"."dorm_members" ENABLE ROW LEVEL SECURITY;

--
-- Name: enterprise_hiring_cache; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE "public"."enterprise_hiring_cache" ENABLE ROW LEVEL SECURITY;

--
-- Name: enterprise_hiring_cache enterprise_hiring_cache_select_policy; Type: POLICY; Schema: public; Owner: -
--

DO $pg_schema_restore$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policy pol
    JOIN pg_class c ON c.oid = pol.polrelid
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE pol.polname = 'enterprise_hiring_cache_select_policy'
      AND n.nspname = 'public'
      AND c.relname = 'enterprise_hiring_cache'
  ) THEN
    EXECUTE $pg_schema_sql$
CREATE POLICY "enterprise_hiring_cache_select_policy" ON "public"."enterprise_hiring_cache" FOR SELECT TO "authenticated" USING (true);
$pg_schema_sql$;
  END IF;
END
$pg_schema_restore$;


--
-- Name: enterprise_hiring_query_history; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE "public"."enterprise_hiring_query_history" ENABLE ROW LEVEL SECURITY;

--
-- Name: enterprise_hiring_query_history enterprise_hiring_query_history_insert_policy; Type: POLICY; Schema: public; Owner: -
--

DO $pg_schema_restore$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policy pol
    JOIN pg_class c ON c.oid = pol.polrelid
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE pol.polname = 'enterprise_hiring_query_history_insert_policy'
      AND n.nspname = 'public'
      AND c.relname = 'enterprise_hiring_query_history'
  ) THEN
    EXECUTE $pg_schema_sql$
CREATE POLICY "enterprise_hiring_query_history_insert_policy" ON "public"."enterprise_hiring_query_history" FOR INSERT TO "authenticated" WITH CHECK (("auth"."uid"() = "user_id"));
$pg_schema_sql$;
  END IF;
END
$pg_schema_restore$;


--
-- Name: enterprise_hiring_query_history enterprise_hiring_query_history_select_policy; Type: POLICY; Schema: public; Owner: -
--

DO $pg_schema_restore$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policy pol
    JOIN pg_class c ON c.oid = pol.polrelid
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE pol.polname = 'enterprise_hiring_query_history_select_policy'
      AND n.nspname = 'public'
      AND c.relname = 'enterprise_hiring_query_history'
  ) THEN
    EXECUTE $pg_schema_sql$
CREATE POLICY "enterprise_hiring_query_history_select_policy" ON "public"."enterprise_hiring_query_history" FOR SELECT TO "authenticated" USING (("auth"."uid"() = "user_id"));
$pg_schema_sql$;
  END IF;
END
$pg_schema_restore$;


--
-- Name: error_log; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE "public"."error_log" ENABLE ROW LEVEL SECURITY;

--
-- Name: growth_paths; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE "public"."growth_paths" ENABLE ROW LEVEL SECURITY;

--
-- Name: growth_paths growth_paths_all; Type: POLICY; Schema: public; Owner: -
--

DO $pg_schema_restore$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policy pol
    JOIN pg_class c ON c.oid = pol.polrelid
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE pol.polname = 'growth_paths_all'
      AND n.nspname = 'public'
      AND c.relname = 'growth_paths'
  ) THEN
    EXECUTE $pg_schema_sql$
CREATE POLICY "growth_paths_all" ON "public"."growth_paths" USING (true) WITH CHECK (true);
$pg_schema_sql$;
  END IF;
END
$pg_schema_restore$;


--
-- Name: internship_paths; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE "public"."internship_paths" ENABLE ROW LEVEL SECURITY;

--
-- Name: interview_simulations; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE "public"."interview_simulations" ENABLE ROW LEVEL SECURITY;

--
-- Name: job_applications; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE "public"."job_applications" ENABLE ROW LEVEL SECURITY;

--
-- Name: job_applications job_applications_delete_all; Type: POLICY; Schema: public; Owner: -
--

DO $pg_schema_restore$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policy pol
    JOIN pg_class c ON c.oid = pol.polrelid
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE pol.polname = 'job_applications_delete_all'
      AND n.nspname = 'public'
      AND c.relname = 'job_applications'
  ) THEN
    EXECUTE $pg_schema_sql$
CREATE POLICY "job_applications_delete_all" ON "public"."job_applications" FOR DELETE USING (true);
$pg_schema_sql$;
  END IF;
END
$pg_schema_restore$;


--
-- Name: job_applications job_applications_insert_all; Type: POLICY; Schema: public; Owner: -
--

DO $pg_schema_restore$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policy pol
    JOIN pg_class c ON c.oid = pol.polrelid
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE pol.polname = 'job_applications_insert_all'
      AND n.nspname = 'public'
      AND c.relname = 'job_applications'
  ) THEN
    EXECUTE $pg_schema_sql$
CREATE POLICY "job_applications_insert_all" ON "public"."job_applications" FOR INSERT WITH CHECK (true);
$pg_schema_sql$;
  END IF;
END
$pg_schema_restore$;


--
-- Name: job_applications job_applications_select_all; Type: POLICY; Schema: public; Owner: -
--

DO $pg_schema_restore$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policy pol
    JOIN pg_class c ON c.oid = pol.polrelid
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE pol.polname = 'job_applications_select_all'
      AND n.nspname = 'public'
      AND c.relname = 'job_applications'
  ) THEN
    EXECUTE $pg_schema_sql$
CREATE POLICY "job_applications_select_all" ON "public"."job_applications" FOR SELECT USING (true);
$pg_schema_sql$;
  END IF;
END
$pg_schema_restore$;


--
-- Name: job_applications job_applications_strict_user; Type: POLICY; Schema: public; Owner: -
--

DO $pg_schema_restore$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policy pol
    JOIN pg_class c ON c.oid = pol.polrelid
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE pol.polname = 'job_applications_strict_user'
      AND n.nspname = 'public'
      AND c.relname = 'job_applications'
  ) THEN
    EXECUTE $pg_schema_sql$
CREATE POLICY "job_applications_strict_user" ON "public"."job_applications" USING (("user_email" = (("current_setting"('request.jwt.claims'::"text", true))::json ->> 'email'::"text"))) WITH CHECK (("user_email" = (("current_setting"('request.jwt.claims'::"text", true))::json ->> 'email'::"text")));
$pg_schema_sql$;
  END IF;
END
$pg_schema_restore$;


--
-- Name: job_applications job_applications_update_all; Type: POLICY; Schema: public; Owner: -
--

DO $pg_schema_restore$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policy pol
    JOIN pg_class c ON c.oid = pol.polrelid
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE pol.polname = 'job_applications_update_all'
      AND n.nspname = 'public'
      AND c.relname = 'job_applications'
  ) THEN
    EXECUTE $pg_schema_sql$
CREATE POLICY "job_applications_update_all" ON "public"."job_applications" FOR UPDATE USING (true) WITH CHECK (true);
$pg_schema_sql$;
  END IF;
END
$pg_schema_restore$;


--
-- Name: job_favorites; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE "public"."job_favorites" ENABLE ROW LEVEL SECURITY;

--
-- Name: job_favorites job_favorites_delete_own; Type: POLICY; Schema: public; Owner: -
--

DO $pg_schema_restore$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policy pol
    JOIN pg_class c ON c.oid = pol.polrelid
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE pol.polname = 'job_favorites_delete_own'
      AND n.nspname = 'public'
      AND c.relname = 'job_favorites'
  ) THEN
    EXECUTE $pg_schema_sql$
CREATE POLICY "job_favorites_delete_own" ON "public"."job_favorites" FOR DELETE USING (true);
$pg_schema_sql$;
  END IF;
END
$pg_schema_restore$;


--
-- Name: job_favorites job_favorites_insert_own; Type: POLICY; Schema: public; Owner: -
--

DO $pg_schema_restore$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policy pol
    JOIN pg_class c ON c.oid = pol.polrelid
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE pol.polname = 'job_favorites_insert_own'
      AND n.nspname = 'public'
      AND c.relname = 'job_favorites'
  ) THEN
    EXECUTE $pg_schema_sql$
CREATE POLICY "job_favorites_insert_own" ON "public"."job_favorites" FOR INSERT WITH CHECK (true);
$pg_schema_sql$;
  END IF;
END
$pg_schema_restore$;


--
-- Name: job_favorites job_favorites_select_own; Type: POLICY; Schema: public; Owner: -
--

DO $pg_schema_restore$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policy pol
    JOIN pg_class c ON c.oid = pol.polrelid
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE pol.polname = 'job_favorites_select_own'
      AND n.nspname = 'public'
      AND c.relname = 'job_favorites'
  ) THEN
    EXECUTE $pg_schema_sql$
CREATE POLICY "job_favorites_select_own" ON "public"."job_favorites" FOR SELECT USING (true);
$pg_schema_sql$;
  END IF;
END
$pg_schema_restore$;


--
-- Name: job_seeker_profiles; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE "public"."job_seeker_profiles" ENABLE ROW LEVEL SECURITY;

--
-- Name: learning_plan_task; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE "public"."learning_plan_task" ENABLE ROW LEVEL SECURITY;

--
-- Name: learning_plan_task learning_plan_task_delete_all; Type: POLICY; Schema: public; Owner: -
--

DO $pg_schema_restore$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policy pol
    JOIN pg_class c ON c.oid = pol.polrelid
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE pol.polname = 'learning_plan_task_delete_all'
      AND n.nspname = 'public'
      AND c.relname = 'learning_plan_task'
  ) THEN
    EXECUTE $pg_schema_sql$
CREATE POLICY "learning_plan_task_delete_all" ON "public"."learning_plan_task" FOR DELETE USING (true);
$pg_schema_sql$;
  END IF;
END
$pg_schema_restore$;


--
-- Name: learning_plan_task learning_plan_task_insert_all; Type: POLICY; Schema: public; Owner: -
--

DO $pg_schema_restore$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policy pol
    JOIN pg_class c ON c.oid = pol.polrelid
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE pol.polname = 'learning_plan_task_insert_all'
      AND n.nspname = 'public'
      AND c.relname = 'learning_plan_task'
  ) THEN
    EXECUTE $pg_schema_sql$
CREATE POLICY "learning_plan_task_insert_all" ON "public"."learning_plan_task" FOR INSERT WITH CHECK (true);
$pg_schema_sql$;
  END IF;
END
$pg_schema_restore$;


--
-- Name: learning_plan_task learning_plan_task_select_all; Type: POLICY; Schema: public; Owner: -
--

DO $pg_schema_restore$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policy pol
    JOIN pg_class c ON c.oid = pol.polrelid
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE pol.polname = 'learning_plan_task_select_all'
      AND n.nspname = 'public'
      AND c.relname = 'learning_plan_task'
  ) THEN
    EXECUTE $pg_schema_sql$
CREATE POLICY "learning_plan_task_select_all" ON "public"."learning_plan_task" FOR SELECT USING (true);
$pg_schema_sql$;
  END IF;
END
$pg_schema_restore$;


--
-- Name: learning_plan_task learning_plan_task_update_all; Type: POLICY; Schema: public; Owner: -
--

DO $pg_schema_restore$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policy pol
    JOIN pg_class c ON c.oid = pol.polrelid
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE pol.polname = 'learning_plan_task_update_all'
      AND n.nspname = 'public'
      AND c.relname = 'learning_plan_task'
  ) THEN
    EXECUTE $pg_schema_sql$
CREATE POLICY "learning_plan_task_update_all" ON "public"."learning_plan_task" FOR UPDATE USING (true) WITH CHECK (true);
$pg_schema_sql$;
  END IF;
END
$pg_schema_restore$;


--
-- Name: learning_plans; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE "public"."learning_plans" ENABLE ROW LEVEL SECURITY;

--
-- Name: learning_plans learning_plans_delete_all; Type: POLICY; Schema: public; Owner: -
--

DO $pg_schema_restore$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policy pol
    JOIN pg_class c ON c.oid = pol.polrelid
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE pol.polname = 'learning_plans_delete_all'
      AND n.nspname = 'public'
      AND c.relname = 'learning_plans'
  ) THEN
    EXECUTE $pg_schema_sql$
CREATE POLICY "learning_plans_delete_all" ON "public"."learning_plans" FOR DELETE USING (true);
$pg_schema_sql$;
  END IF;
END
$pg_schema_restore$;


--
-- Name: learning_plans learning_plans_insert_all; Type: POLICY; Schema: public; Owner: -
--

DO $pg_schema_restore$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policy pol
    JOIN pg_class c ON c.oid = pol.polrelid
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE pol.polname = 'learning_plans_insert_all'
      AND n.nspname = 'public'
      AND c.relname = 'learning_plans'
  ) THEN
    EXECUTE $pg_schema_sql$
CREATE POLICY "learning_plans_insert_all" ON "public"."learning_plans" FOR INSERT WITH CHECK (true);
$pg_schema_sql$;
  END IF;
END
$pg_schema_restore$;


--
-- Name: learning_plans learning_plans_select_all; Type: POLICY; Schema: public; Owner: -
--

DO $pg_schema_restore$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policy pol
    JOIN pg_class c ON c.oid = pol.polrelid
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE pol.polname = 'learning_plans_select_all'
      AND n.nspname = 'public'
      AND c.relname = 'learning_plans'
  ) THEN
    EXECUTE $pg_schema_sql$
CREATE POLICY "learning_plans_select_all" ON "public"."learning_plans" FOR SELECT USING (true);
$pg_schema_sql$;
  END IF;
END
$pg_schema_restore$;


--
-- Name: learning_plans learning_plans_strict_user; Type: POLICY; Schema: public; Owner: -
--

DO $pg_schema_restore$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policy pol
    JOIN pg_class c ON c.oid = pol.polrelid
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE pol.polname = 'learning_plans_strict_user'
      AND n.nspname = 'public'
      AND c.relname = 'learning_plans'
  ) THEN
    EXECUTE $pg_schema_sql$
CREATE POLICY "learning_plans_strict_user" ON "public"."learning_plans" USING (("user_email" = (("current_setting"('request.jwt.claims'::"text", true))::json ->> 'email'::"text"))) WITH CHECK (("user_email" = (("current_setting"('request.jwt.claims'::"text", true))::json ->> 'email'::"text")));
$pg_schema_sql$;
  END IF;
END
$pg_schema_restore$;


--
-- Name: learning_plans learning_plans_update_all; Type: POLICY; Schema: public; Owner: -
--

DO $pg_schema_restore$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policy pol
    JOIN pg_class c ON c.oid = pol.polrelid
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE pol.polname = 'learning_plans_update_all'
      AND n.nspname = 'public'
      AND c.relname = 'learning_plans'
  ) THEN
    EXECUTE $pg_schema_sql$
CREATE POLICY "learning_plans_update_all" ON "public"."learning_plans" FOR UPDATE USING (true) WITH CHECK (true);
$pg_schema_sql$;
  END IF;
END
$pg_schema_restore$;


--
-- Name: learning_records; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE "public"."learning_records" ENABLE ROW LEVEL SECURITY;

--
-- Name: membership_subscriptions mem_subs_admin_all; Type: POLICY; Schema: public; Owner: -
--

DO $pg_schema_restore$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policy pol
    JOIN pg_class c ON c.oid = pol.polrelid
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE pol.polname = 'mem_subs_admin_all'
      AND n.nspname = 'public'
      AND c.relname = 'membership_subscriptions'
  ) THEN
    EXECUTE $pg_schema_sql$
CREATE POLICY "mem_subs_admin_all" ON "public"."membership_subscriptions" TO "authenticated" USING (((("current_setting"('request.jwt.claims'::"text", true))::json ->> 'role'::"text") = 'admin'::"text")) WITH CHECK (((("current_setting"('request.jwt.claims'::"text", true))::json ->> 'role'::"text") = 'admin'::"text"));
$pg_schema_sql$;
  END IF;
END
$pg_schema_restore$;


--
-- Name: membership_subscriptions mem_subs_select_own; Type: POLICY; Schema: public; Owner: -
--

DO $pg_schema_restore$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policy pol
    JOIN pg_class c ON c.oid = pol.polrelid
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE pol.polname = 'mem_subs_select_own'
      AND n.nspname = 'public'
      AND c.relname = 'membership_subscriptions'
  ) THEN
    EXECUTE $pg_schema_sql$
CREATE POLICY "mem_subs_select_own" ON "public"."membership_subscriptions" FOR SELECT TO "authenticated", "anon" USING (("user_email" = (("current_setting"('request.jwt.claims'::"text", true))::json ->> 'email'::"text")));
$pg_schema_sql$;
  END IF;
END
$pg_schema_restore$;


--
-- Name: membership_plans; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE "public"."membership_plans" ENABLE ROW LEVEL SECURITY;

--
-- Name: membership_subscriptions; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE "public"."membership_subscriptions" ENABLE ROW LEVEL SECURITY;

--
-- Name: mentor_arrangements; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE "public"."mentor_arrangements" ENABLE ROW LEVEL SECURITY;

--
-- Name: payment_orders pay_orders_admin_all; Type: POLICY; Schema: public; Owner: -
--

DO $pg_schema_restore$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policy pol
    JOIN pg_class c ON c.oid = pol.polrelid
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE pol.polname = 'pay_orders_admin_all'
      AND n.nspname = 'public'
      AND c.relname = 'payment_orders'
  ) THEN
    EXECUTE $pg_schema_sql$
CREATE POLICY "pay_orders_admin_all" ON "public"."payment_orders" TO "authenticated" USING (((("current_setting"('request.jwt.claims'::"text", true))::json ->> 'role'::"text") = 'admin'::"text")) WITH CHECK (((("current_setting"('request.jwt.claims'::"text", true))::json ->> 'role'::"text") = 'admin'::"text"));
$pg_schema_sql$;
  END IF;
END
$pg_schema_restore$;


--
-- Name: payment_orders pay_orders_select_own; Type: POLICY; Schema: public; Owner: -
--

DO $pg_schema_restore$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policy pol
    JOIN pg_class c ON c.oid = pol.polrelid
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE pol.polname = 'pay_orders_select_own'
      AND n.nspname = 'public'
      AND c.relname = 'payment_orders'
  ) THEN
    EXECUTE $pg_schema_sql$
CREATE POLICY "pay_orders_select_own" ON "public"."payment_orders" FOR SELECT TO "authenticated", "anon" USING (("purchaser_email" = (("current_setting"('request.jwt.claims'::"text", true))::json ->> 'email'::"text")));
$pg_schema_sql$;
  END IF;
END
$pg_schema_restore$;


--
-- Name: payment_refunds pay_refunds_admin_all; Type: POLICY; Schema: public; Owner: -
--

DO $pg_schema_restore$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policy pol
    JOIN pg_class c ON c.oid = pol.polrelid
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE pol.polname = 'pay_refunds_admin_all'
      AND n.nspname = 'public'
      AND c.relname = 'payment_refunds'
  ) THEN
    EXECUTE $pg_schema_sql$
CREATE POLICY "pay_refunds_admin_all" ON "public"."payment_refunds" TO "authenticated" USING (((("current_setting"('request.jwt.claims'::"text", true))::json ->> 'role'::"text") = 'admin'::"text")) WITH CHECK (((("current_setting"('request.jwt.claims'::"text", true))::json ->> 'role'::"text") = 'admin'::"text"));
$pg_schema_sql$;
  END IF;
END
$pg_schema_restore$;


--
-- Name: payment_refunds pay_refunds_select_own; Type: POLICY; Schema: public; Owner: -
--

DO $pg_schema_restore$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policy pol
    JOIN pg_class c ON c.oid = pol.polrelid
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE pol.polname = 'pay_refunds_select_own'
      AND n.nspname = 'public'
      AND c.relname = 'payment_refunds'
  ) THEN
    EXECUTE $pg_schema_sql$
CREATE POLICY "pay_refunds_select_own" ON "public"."payment_refunds" FOR SELECT TO "authenticated", "anon" USING (("purchaser_email" = (("current_setting"('request.jwt.claims'::"text", true))::json ->> 'email'::"text")));
$pg_schema_sql$;
  END IF;
END
$pg_schema_restore$;


--
-- Name: payment_orders; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE "public"."payment_orders" ENABLE ROW LEVEL SECURITY;

--
-- Name: payment_refunds; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE "public"."payment_refunds" ENABLE ROW LEVEL SECURITY;

--
-- Name: performance_monitor; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE "public"."performance_monitor" ENABLE ROW LEVEL SECURITY;

--
-- Name: membership_plans plans_admin_all; Type: POLICY; Schema: public; Owner: -
--

DO $pg_schema_restore$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policy pol
    JOIN pg_class c ON c.oid = pol.polrelid
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE pol.polname = 'plans_admin_all'
      AND n.nspname = 'public'
      AND c.relname = 'membership_plans'
  ) THEN
    EXECUTE $pg_schema_sql$
CREATE POLICY "plans_admin_all" ON "public"."membership_plans" TO "authenticated" USING (((("current_setting"('request.jwt.claims'::"text", true))::json ->> 'role'::"text") = 'admin'::"text")) WITH CHECK (((("current_setting"('request.jwt.claims'::"text", true))::json ->> 'role'::"text") = 'admin'::"text"));
$pg_schema_sql$;
  END IF;
END
$pg_schema_restore$;


--
-- Name: membership_plans plans_anon_select; Type: POLICY; Schema: public; Owner: -
--

DO $pg_schema_restore$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policy pol
    JOIN pg_class c ON c.oid = pol.polrelid
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE pol.polname = 'plans_anon_select'
      AND n.nspname = 'public'
      AND c.relname = 'membership_plans'
  ) THEN
    EXECUTE $pg_schema_sql$
CREATE POLICY "plans_anon_select" ON "public"."membership_plans" FOR SELECT TO "anon" USING (true);
$pg_schema_sql$;
  END IF;
END
$pg_schema_restore$;


--
-- Name: membership_plans plans_auth_select; Type: POLICY; Schema: public; Owner: -
--

DO $pg_schema_restore$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policy pol
    JOIN pg_class c ON c.oid = pol.polrelid
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE pol.polname = 'plans_auth_select'
      AND n.nspname = 'public'
      AND c.relname = 'membership_plans'
  ) THEN
    EXECUTE $pg_schema_sql$
CREATE POLICY "plans_auth_select" ON "public"."membership_plans" FOR SELECT TO "authenticated" USING (true);
$pg_schema_sql$;
  END IF;
END
$pg_schema_restore$;


--
-- Name: positions; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE "public"."positions" ENABLE ROW LEVEL SECURITY;

--
-- Name: project_progress_records; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE "public"."project_progress_records" ENABLE ROW LEVEL SECURITY;

--
-- Name: resume_optimizations; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE "public"."resume_optimizations" ENABLE ROW LEVEL SECURITY;

--
-- Name: resume_versions; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE "public"."resume_versions" ENABLE ROW LEVEL SECURITY;

--
-- Name: resume_versions resume_versions_delete_all; Type: POLICY; Schema: public; Owner: -
--

DO $pg_schema_restore$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policy pol
    JOIN pg_class c ON c.oid = pol.polrelid
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE pol.polname = 'resume_versions_delete_all'
      AND n.nspname = 'public'
      AND c.relname = 'resume_versions'
  ) THEN
    EXECUTE $pg_schema_sql$
CREATE POLICY "resume_versions_delete_all" ON "public"."resume_versions" FOR DELETE USING (true);
$pg_schema_sql$;
  END IF;
END
$pg_schema_restore$;


--
-- Name: resume_versions resume_versions_insert_all; Type: POLICY; Schema: public; Owner: -
--

DO $pg_schema_restore$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policy pol
    JOIN pg_class c ON c.oid = pol.polrelid
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE pol.polname = 'resume_versions_insert_all'
      AND n.nspname = 'public'
      AND c.relname = 'resume_versions'
  ) THEN
    EXECUTE $pg_schema_sql$
CREATE POLICY "resume_versions_insert_all" ON "public"."resume_versions" FOR INSERT WITH CHECK (true);
$pg_schema_sql$;
  END IF;
END
$pg_schema_restore$;


--
-- Name: resume_versions resume_versions_select_all; Type: POLICY; Schema: public; Owner: -
--

DO $pg_schema_restore$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policy pol
    JOIN pg_class c ON c.oid = pol.polrelid
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE pol.polname = 'resume_versions_select_all'
      AND n.nspname = 'public'
      AND c.relname = 'resume_versions'
  ) THEN
    EXECUTE $pg_schema_sql$
CREATE POLICY "resume_versions_select_all" ON "public"."resume_versions" FOR SELECT USING (true);
$pg_schema_sql$;
  END IF;
END
$pg_schema_restore$;


--
-- Name: resume_versions resume_versions_strict_user; Type: POLICY; Schema: public; Owner: -
--

DO $pg_schema_restore$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policy pol
    JOIN pg_class c ON c.oid = pol.polrelid
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE pol.polname = 'resume_versions_strict_user'
      AND n.nspname = 'public'
      AND c.relname = 'resume_versions'
  ) THEN
    EXECUTE $pg_schema_sql$
CREATE POLICY "resume_versions_strict_user" ON "public"."resume_versions" USING (("user_email" = (("current_setting"('request.jwt.claims'::"text", true))::json ->> 'email'::"text"))) WITH CHECK (("user_email" = (("current_setting"('request.jwt.claims'::"text", true))::json ->> 'email'::"text")));
$pg_schema_sql$;
  END IF;
END
$pg_schema_restore$;


--
-- Name: resume_versions resume_versions_update_all; Type: POLICY; Schema: public; Owner: -
--

DO $pg_schema_restore$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policy pol
    JOIN pg_class c ON c.oid = pol.polrelid
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE pol.polname = 'resume_versions_update_all'
      AND n.nspname = 'public'
      AND c.relname = 'resume_versions'
  ) THEN
    EXECUTE $pg_schema_sql$
CREATE POLICY "resume_versions_update_all" ON "public"."resume_versions" FOR UPDATE USING (true) WITH CHECK (true);
$pg_schema_sql$;
  END IF;
END
$pg_schema_restore$;


--
-- Name: error_log service_role_all_error_log; Type: POLICY; Schema: public; Owner: -
--

DO $pg_schema_restore$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policy pol
    JOIN pg_class c ON c.oid = pol.polrelid
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE pol.polname = 'service_role_all_error_log'
      AND n.nspname = 'public'
      AND c.relname = 'error_log'
  ) THEN
    EXECUTE $pg_schema_sql$
CREATE POLICY "service_role_all_error_log" ON "public"."error_log" TO "service_role" USING (true) WITH CHECK (true);
$pg_schema_sql$;
  END IF;
END
$pg_schema_restore$;


--
-- Name: performance_monitor service_role_all_perf_monitor; Type: POLICY; Schema: public; Owner: -
--

DO $pg_schema_restore$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policy pol
    JOIN pg_class c ON c.oid = pol.polrelid
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE pol.polname = 'service_role_all_perf_monitor'
      AND n.nspname = 'public'
      AND c.relname = 'performance_monitor'
  ) THEN
    EXECUTE $pg_schema_sql$
CREATE POLICY "service_role_all_perf_monitor" ON "public"."performance_monitor" TO "service_role" USING (true) WITH CHECK (true);
$pg_schema_sql$;
  END IF;
END
$pg_schema_restore$;


--
-- Name: student_applications; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE "public"."student_applications" ENABLE ROW LEVEL SECURITY;

--
-- Name: student_profiles; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE "public"."student_profiles" ENABLE ROW LEVEL SECURITY;

--
-- Name: student_verifications; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE "public"."student_verifications" ENABLE ROW LEVEL SECURITY;

--
-- Name: study_checkins; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE "public"."study_checkins" ENABLE ROW LEVEL SECURITY;

--
-- Name: study_checkins study_checkins_delete_all; Type: POLICY; Schema: public; Owner: -
--

DO $pg_schema_restore$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policy pol
    JOIN pg_class c ON c.oid = pol.polrelid
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE pol.polname = 'study_checkins_delete_all'
      AND n.nspname = 'public'
      AND c.relname = 'study_checkins'
  ) THEN
    EXECUTE $pg_schema_sql$
CREATE POLICY "study_checkins_delete_all" ON "public"."study_checkins" FOR DELETE USING (true);
$pg_schema_sql$;
  END IF;
END
$pg_schema_restore$;


--
-- Name: study_checkins study_checkins_insert_all; Type: POLICY; Schema: public; Owner: -
--

DO $pg_schema_restore$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policy pol
    JOIN pg_class c ON c.oid = pol.polrelid
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE pol.polname = 'study_checkins_insert_all'
      AND n.nspname = 'public'
      AND c.relname = 'study_checkins'
  ) THEN
    EXECUTE $pg_schema_sql$
CREATE POLICY "study_checkins_insert_all" ON "public"."study_checkins" FOR INSERT WITH CHECK (true);
$pg_schema_sql$;
  END IF;
END
$pg_schema_restore$;


--
-- Name: study_checkins study_checkins_select_all; Type: POLICY; Schema: public; Owner: -
--

DO $pg_schema_restore$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policy pol
    JOIN pg_class c ON c.oid = pol.polrelid
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE pol.polname = 'study_checkins_select_all'
      AND n.nspname = 'public'
      AND c.relname = 'study_checkins'
  ) THEN
    EXECUTE $pg_schema_sql$
CREATE POLICY "study_checkins_select_all" ON "public"."study_checkins" FOR SELECT USING (true);
$pg_schema_sql$;
  END IF;
END
$pg_schema_restore$;


--
-- Name: study_checkins study_checkins_strict_user; Type: POLICY; Schema: public; Owner: -
--

DO $pg_schema_restore$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policy pol
    JOIN pg_class c ON c.oid = pol.polrelid
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE pol.polname = 'study_checkins_strict_user'
      AND n.nspname = 'public'
      AND c.relname = 'study_checkins'
  ) THEN
    EXECUTE $pg_schema_sql$
CREATE POLICY "study_checkins_strict_user" ON "public"."study_checkins" USING (("user_email" = (("current_setting"('request.jwt.claims'::"text", true))::json ->> 'email'::"text"))) WITH CHECK (("user_email" = (("current_setting"('request.jwt.claims'::"text", true))::json ->> 'email'::"text")));
$pg_schema_sql$;
  END IF;
END
$pg_schema_restore$;


--
-- Name: study_checkins study_checkins_update_all; Type: POLICY; Schema: public; Owner: -
--

DO $pg_schema_restore$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policy pol
    JOIN pg_class c ON c.oid = pol.polrelid
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE pol.polname = 'study_checkins_update_all'
      AND n.nspname = 'public'
      AND c.relname = 'study_checkins'
  ) THEN
    EXECUTE $pg_schema_sql$
CREATE POLICY "study_checkins_update_all" ON "public"."study_checkins" FOR UPDATE USING (true) WITH CHECK (true);
$pg_schema_sql$;
  END IF;
END
$pg_schema_restore$;


--
-- Name: training_submissions; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE "public"."training_submissions" ENABLE ROW LEVEL SECURITY;

--
-- Name: training_tasks; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE "public"."training_tasks" ENABLE ROW LEVEL SECURITY;

--
-- Name: training_submissions ts_delete_auth; Type: POLICY; Schema: public; Owner: -
--

DO $pg_schema_restore$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policy pol
    JOIN pg_class c ON c.oid = pol.polrelid
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE pol.polname = 'ts_delete_auth'
      AND n.nspname = 'public'
      AND c.relname = 'training_submissions'
  ) THEN
    EXECUTE $pg_schema_sql$
CREATE POLICY "ts_delete_auth" ON "public"."training_submissions" FOR DELETE TO "authenticated" USING (true);
$pg_schema_sql$;
  END IF;
END
$pg_schema_restore$;


--
-- Name: training_submissions ts_insert_auth; Type: POLICY; Schema: public; Owner: -
--

DO $pg_schema_restore$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policy pol
    JOIN pg_class c ON c.oid = pol.polrelid
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE pol.polname = 'ts_insert_auth'
      AND n.nspname = 'public'
      AND c.relname = 'training_submissions'
  ) THEN
    EXECUTE $pg_schema_sql$
CREATE POLICY "ts_insert_auth" ON "public"."training_submissions" FOR INSERT TO "authenticated" WITH CHECK (true);
$pg_schema_sql$;
  END IF;
END
$pg_schema_restore$;


--
-- Name: training_submissions ts_select_auth; Type: POLICY; Schema: public; Owner: -
--

DO $pg_schema_restore$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policy pol
    JOIN pg_class c ON c.oid = pol.polrelid
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE pol.polname = 'ts_select_auth'
      AND n.nspname = 'public'
      AND c.relname = 'training_submissions'
  ) THEN
    EXECUTE $pg_schema_sql$
CREATE POLICY "ts_select_auth" ON "public"."training_submissions" FOR SELECT TO "authenticated" USING (true);
$pg_schema_sql$;
  END IF;
END
$pg_schema_restore$;


--
-- Name: training_submissions ts_update_auth; Type: POLICY; Schema: public; Owner: -
--

DO $pg_schema_restore$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policy pol
    JOIN pg_class c ON c.oid = pol.polrelid
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE pol.polname = 'ts_update_auth'
      AND n.nspname = 'public'
      AND c.relname = 'training_submissions'
  ) THEN
    EXECUTE $pg_schema_sql$
CREATE POLICY "ts_update_auth" ON "public"."training_submissions" FOR UPDATE TO "authenticated" USING (true) WITH CHECK (true);
$pg_schema_sql$;
  END IF;
END
$pg_schema_restore$;


--
-- Name: training_tasks tt_delete_auth; Type: POLICY; Schema: public; Owner: -
--

DO $pg_schema_restore$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policy pol
    JOIN pg_class c ON c.oid = pol.polrelid
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE pol.polname = 'tt_delete_auth'
      AND n.nspname = 'public'
      AND c.relname = 'training_tasks'
  ) THEN
    EXECUTE $pg_schema_sql$
CREATE POLICY "tt_delete_auth" ON "public"."training_tasks" FOR DELETE TO "authenticated" USING (true);
$pg_schema_sql$;
  END IF;
END
$pg_schema_restore$;


--
-- Name: training_tasks tt_insert_auth; Type: POLICY; Schema: public; Owner: -
--

DO $pg_schema_restore$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policy pol
    JOIN pg_class c ON c.oid = pol.polrelid
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE pol.polname = 'tt_insert_auth'
      AND n.nspname = 'public'
      AND c.relname = 'training_tasks'
  ) THEN
    EXECUTE $pg_schema_sql$
CREATE POLICY "tt_insert_auth" ON "public"."training_tasks" FOR INSERT TO "authenticated" WITH CHECK (true);
$pg_schema_sql$;
  END IF;
END
$pg_schema_restore$;


--
-- Name: training_tasks tt_select_auth; Type: POLICY; Schema: public; Owner: -
--

DO $pg_schema_restore$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policy pol
    JOIN pg_class c ON c.oid = pol.polrelid
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE pol.polname = 'tt_select_auth'
      AND n.nspname = 'public'
      AND c.relname = 'training_tasks'
  ) THEN
    EXECUTE $pg_schema_sql$
CREATE POLICY "tt_select_auth" ON "public"."training_tasks" FOR SELECT TO "authenticated" USING (true);
$pg_schema_sql$;
  END IF;
END
$pg_schema_restore$;


--
-- Name: training_tasks tt_update_auth; Type: POLICY; Schema: public; Owner: -
--

DO $pg_schema_restore$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policy pol
    JOIN pg_class c ON c.oid = pol.polrelid
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE pol.polname = 'tt_update_auth'
      AND n.nspname = 'public'
      AND c.relname = 'training_tasks'
  ) THEN
    EXECUTE $pg_schema_sql$
CREATE POLICY "tt_update_auth" ON "public"."training_tasks" FOR UPDATE TO "authenticated" USING (true) WITH CHECK (true);
$pg_schema_sql$;
  END IF;
END
$pg_schema_restore$;


--
-- Name: usage_records usage_admin_all; Type: POLICY; Schema: public; Owner: -
--

DO $pg_schema_restore$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policy pol
    JOIN pg_class c ON c.oid = pol.polrelid
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE pol.polname = 'usage_admin_all'
      AND n.nspname = 'public'
      AND c.relname = 'usage_records'
  ) THEN
    EXECUTE $pg_schema_sql$
CREATE POLICY "usage_admin_all" ON "public"."usage_records" TO "authenticated" USING (((("current_setting"('request.jwt.claims'::"text", true))::json ->> 'role'::"text") = 'admin'::"text")) WITH CHECK (((("current_setting"('request.jwt.claims'::"text", true))::json ->> 'role'::"text") = 'admin'::"text"));
$pg_schema_sql$;
  END IF;
END
$pg_schema_restore$;


--
-- Name: usage_records; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE "public"."usage_records" ENABLE ROW LEVEL SECURITY;

--
-- Name: usage_records usage_select_own; Type: POLICY; Schema: public; Owner: -
--

DO $pg_schema_restore$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policy pol
    JOIN pg_class c ON c.oid = pol.polrelid
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE pol.polname = 'usage_select_own'
      AND n.nspname = 'public'
      AND c.relname = 'usage_records'
  ) THEN
    EXECUTE $pg_schema_sql$
CREATE POLICY "usage_select_own" ON "public"."usage_records" FOR SELECT TO "authenticated", "anon" USING (("user_email" = (("current_setting"('request.jwt.claims'::"text", true))::json ->> 'email'::"text")));
$pg_schema_sql$;
  END IF;
END
$pg_schema_restore$;


--
-- Name: user_achievements; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE "public"."user_achievements" ENABLE ROW LEVEL SECURITY;

--
-- Name: user_achievements user_achievements_all; Type: POLICY; Schema: public; Owner: -
--

DO $pg_schema_restore$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policy pol
    JOIN pg_class c ON c.oid = pol.polrelid
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE pol.polname = 'user_achievements_all'
      AND n.nspname = 'public'
      AND c.relname = 'user_achievements'
  ) THEN
    EXECUTE $pg_schema_sql$
CREATE POLICY "user_achievements_all" ON "public"."user_achievements" USING (true) WITH CHECK (true);
$pg_schema_sql$;
  END IF;
END
$pg_schema_restore$;


--
-- Name: user_courses; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE "public"."user_courses" ENABLE ROW LEVEL SECURITY;

--
-- Name: user_portrait; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE "public"."user_portrait" ENABLE ROW LEVEL SECURITY;

--
-- Name: user_portrait user_portrait_insert; Type: POLICY; Schema: public; Owner: -
--

DO $pg_schema_restore$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policy pol
    JOIN pg_class c ON c.oid = pol.polrelid
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE pol.polname = 'user_portrait_insert'
      AND n.nspname = 'public'
      AND c.relname = 'user_portrait'
  ) THEN
    EXECUTE $pg_schema_sql$
CREATE POLICY "user_portrait_insert" ON "public"."user_portrait" FOR INSERT WITH CHECK (true);
$pg_schema_sql$;
  END IF;
END
$pg_schema_restore$;


--
-- Name: user_portrait user_portrait_select; Type: POLICY; Schema: public; Owner: -
--

DO $pg_schema_restore$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policy pol
    JOIN pg_class c ON c.oid = pol.polrelid
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE pol.polname = 'user_portrait_select'
      AND n.nspname = 'public'
      AND c.relname = 'user_portrait'
  ) THEN
    EXECUTE $pg_schema_sql$
CREATE POLICY "user_portrait_select" ON "public"."user_portrait" FOR SELECT USING (true);
$pg_schema_sql$;
  END IF;
END
$pg_schema_restore$;


--
-- Name: user_portrait user_portrait_update; Type: POLICY; Schema: public; Owner: -
--

DO $pg_schema_restore$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policy pol
    JOIN pg_class c ON c.oid = pol.polrelid
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE pol.polname = 'user_portrait_update'
      AND n.nspname = 'public'
      AND c.relname = 'user_portrait'
  ) THEN
    EXECUTE $pg_schema_sql$
CREATE POLICY "user_portrait_update" ON "public"."user_portrait" FOR UPDATE USING (true);
$pg_schema_sql$;
  END IF;
END
$pg_schema_restore$;


--
-- Name: user_profiles; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE "public"."user_profiles" ENABLE ROW LEVEL SECURITY;

--
-- Name: user_profiles user_profiles_insert_own; Type: POLICY; Schema: public; Owner: -
--

DO $pg_schema_restore$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policy pol
    JOIN pg_class c ON c.oid = pol.polrelid
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE pol.polname = 'user_profiles_insert_own'
      AND n.nspname = 'public'
      AND c.relname = 'user_profiles'
  ) THEN
    EXECUTE $pg_schema_sql$
CREATE POLICY "user_profiles_insert_own" ON "public"."user_profiles" FOR INSERT WITH CHECK (true);
$pg_schema_sql$;
  END IF;
END
$pg_schema_restore$;


--
-- Name: user_profiles user_profiles_select_all; Type: POLICY; Schema: public; Owner: -
--

DO $pg_schema_restore$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policy pol
    JOIN pg_class c ON c.oid = pol.polrelid
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE pol.polname = 'user_profiles_select_all'
      AND n.nspname = 'public'
      AND c.relname = 'user_profiles'
  ) THEN
    EXECUTE $pg_schema_sql$
CREATE POLICY "user_profiles_select_all" ON "public"."user_profiles" FOR SELECT USING (true);
$pg_schema_sql$;
  END IF;
END
$pg_schema_restore$;


--
-- Name: user_profiles user_profiles_update_own; Type: POLICY; Schema: public; Owner: -
--

DO $pg_schema_restore$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policy pol
    JOIN pg_class c ON c.oid = pol.polrelid
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE pol.polname = 'user_profiles_update_own'
      AND n.nspname = 'public'
      AND c.relname = 'user_profiles'
  ) THEN
    EXECUTE $pg_schema_sql$
CREATE POLICY "user_profiles_update_own" ON "public"."user_profiles" FOR UPDATE USING (true);
$pg_schema_sql$;
  END IF;
END
$pg_schema_restore$;


--
-- Name: user_stats; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE "public"."user_stats" ENABLE ROW LEVEL SECURITY;

--
-- Name: user_stats user_stats_all; Type: POLICY; Schema: public; Owner: -
--

DO $pg_schema_restore$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policy pol
    JOIN pg_class c ON c.oid = pol.polrelid
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE pol.polname = 'user_stats_all'
      AND n.nspname = 'public'
      AND c.relname = 'user_stats'
  ) THEN
    EXECUTE $pg_schema_sql$
CREATE POLICY "user_stats_all" ON "public"."user_stats" USING (true) WITH CHECK (true);
$pg_schema_sql$;
  END IF;
END
$pg_schema_restore$;


--
-- Name: vip_orders; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE "public"."vip_orders" ENABLE ROW LEVEL SECURITY;

--
-- Name: vip_orders vip_orders_insert_own; Type: POLICY; Schema: public; Owner: -
--

DO $pg_schema_restore$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policy pol
    JOIN pg_class c ON c.oid = pol.polrelid
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE pol.polname = 'vip_orders_insert_own'
      AND n.nspname = 'public'
      AND c.relname = 'vip_orders'
  ) THEN
    EXECUTE $pg_schema_sql$
CREATE POLICY "vip_orders_insert_own" ON "public"."vip_orders" FOR INSERT WITH CHECK (true);
$pg_schema_sql$;
  END IF;
END
$pg_schema_restore$;


--
-- Name: vip_orders vip_orders_select_own; Type: POLICY; Schema: public; Owner: -
--

DO $pg_schema_restore$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policy pol
    JOIN pg_class c ON c.oid = pol.polrelid
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE pol.polname = 'vip_orders_select_own'
      AND n.nspname = 'public'
      AND c.relname = 'vip_orders'
  ) THEN
    EXECUTE $pg_schema_sql$
CREATE POLICY "vip_orders_select_own" ON "public"."vip_orders" FOR SELECT USING (true);
$pg_schema_sql$;
  END IF;
END
$pg_schema_restore$;


--
-- Name: vip_orders vip_orders_update_own; Type: POLICY; Schema: public; Owner: -
--

DO $pg_schema_restore$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policy pol
    JOIN pg_class c ON c.oid = pol.polrelid
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE pol.polname = 'vip_orders_update_own'
      AND n.nspname = 'public'
      AND c.relname = 'vip_orders'
  ) THEN
    EXECUTE $pg_schema_sql$
CREATE POLICY "vip_orders_update_own" ON "public"."vip_orders" FOR UPDATE USING (true);
$pg_schema_sql$;
  END IF;
END
$pg_schema_restore$;


--
-- Name: vip_plans; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE "public"."vip_plans" ENABLE ROW LEVEL SECURITY;

--
-- Name: vip_plans vip_plans_select_all; Type: POLICY; Schema: public; Owner: -
--

DO $pg_schema_restore$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policy pol
    JOIN pg_class c ON c.oid = pol.polrelid
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE pol.polname = 'vip_plans_select_all'
      AND n.nspname = 'public'
      AND c.relname = 'vip_plans'
  ) THEN
    EXECUTE $pg_schema_sql$
CREATE POLICY "vip_plans_select_all" ON "public"."vip_plans" FOR SELECT USING (true);
$pg_schema_sql$;
  END IF;
END
$pg_schema_restore$;


--
-- Name: web_content_summary_task; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE "public"."web_content_summary_task" ENABLE ROW LEVEL SECURITY;

--
-- Name: web_content_summary_task 任意用户创建总结任务; Type: POLICY; Schema: public; Owner: -
--

DO $pg_schema_restore$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policy pol
    JOIN pg_class c ON c.oid = pol.polrelid
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE pol.polname = '任意用户创建总结任务'
      AND n.nspname = 'public'
      AND c.relname = 'web_content_summary_task'
  ) THEN
    EXECUTE $pg_schema_sql$
CREATE POLICY "任意用户创建总结任务" ON "public"."web_content_summary_task" FOR INSERT TO "authenticated", "anon" WITH CHECK (true);
$pg_schema_sql$;
  END IF;
END
$pg_schema_restore$;


--
-- Name: user_courses 任意用户创建用户课程; Type: POLICY; Schema: public; Owner: -
--

DO $pg_schema_restore$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policy pol
    JOIN pg_class c ON c.oid = pol.polrelid
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE pol.polname = '任意用户创建用户课程'
      AND n.nspname = 'public'
      AND c.relname = 'user_courses'
  ) THEN
    EXECUTE $pg_schema_sql$
CREATE POLICY "任意用户创建用户课程" ON "public"."user_courses" FOR INSERT TO "authenticated", "anon" WITH CHECK (true);
$pg_schema_sql$;
  END IF;
END
$pg_schema_restore$;


--
-- Name: deep_research_task 任意用户创建研究任务; Type: POLICY; Schema: public; Owner: -
--

DO $pg_schema_restore$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policy pol
    JOIN pg_class c ON c.oid = pol.polrelid
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE pol.polname = '任意用户创建研究任务'
      AND n.nspname = 'public'
      AND c.relname = 'deep_research_task'
  ) THEN
    EXECUTE $pg_schema_sql$
CREATE POLICY "任意用户创建研究任务" ON "public"."deep_research_task" FOR INSERT TO "authenticated", "anon" WITH CHECK (true);
$pg_schema_sql$;
  END IF;
END
$pg_schema_restore$;


--
-- Name: web_content_summary_task 任意用户删除总结任务; Type: POLICY; Schema: public; Owner: -
--

DO $pg_schema_restore$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policy pol
    JOIN pg_class c ON c.oid = pol.polrelid
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE pol.polname = '任意用户删除总结任务'
      AND n.nspname = 'public'
      AND c.relname = 'web_content_summary_task'
  ) THEN
    EXECUTE $pg_schema_sql$
CREATE POLICY "任意用户删除总结任务" ON "public"."web_content_summary_task" FOR DELETE TO "authenticated", "anon" USING (true);
$pg_schema_sql$;
  END IF;
END
$pg_schema_restore$;


--
-- Name: user_courses 任意用户删除用户课程; Type: POLICY; Schema: public; Owner: -
--

DO $pg_schema_restore$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policy pol
    JOIN pg_class c ON c.oid = pol.polrelid
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE pol.polname = '任意用户删除用户课程'
      AND n.nspname = 'public'
      AND c.relname = 'user_courses'
  ) THEN
    EXECUTE $pg_schema_sql$
CREATE POLICY "任意用户删除用户课程" ON "public"."user_courses" FOR DELETE TO "authenticated", "anon" USING (true);
$pg_schema_sql$;
  END IF;
END
$pg_schema_restore$;


--
-- Name: deep_research_task 任意用户删除研究任务; Type: POLICY; Schema: public; Owner: -
--

DO $pg_schema_restore$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policy pol
    JOIN pg_class c ON c.oid = pol.polrelid
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE pol.polname = '任意用户删除研究任务'
      AND n.nspname = 'public'
      AND c.relname = 'deep_research_task'
  ) THEN
    EXECUTE $pg_schema_sql$
CREATE POLICY "任意用户删除研究任务" ON "public"."deep_research_task" FOR DELETE TO "authenticated", "anon" USING (true);
$pg_schema_sql$;
  END IF;
END
$pg_schema_restore$;


--
-- Name: web_content_summary_task 任意用户更新总结任务; Type: POLICY; Schema: public; Owner: -
--

DO $pg_schema_restore$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policy pol
    JOIN pg_class c ON c.oid = pol.polrelid
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE pol.polname = '任意用户更新总结任务'
      AND n.nspname = 'public'
      AND c.relname = 'web_content_summary_task'
  ) THEN
    EXECUTE $pg_schema_sql$
CREATE POLICY "任意用户更新总结任务" ON "public"."web_content_summary_task" FOR UPDATE TO "authenticated", "anon" USING (true) WITH CHECK (true);
$pg_schema_sql$;
  END IF;
END
$pg_schema_restore$;


--
-- Name: user_courses 任意用户更新用户课程; Type: POLICY; Schema: public; Owner: -
--

DO $pg_schema_restore$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policy pol
    JOIN pg_class c ON c.oid = pol.polrelid
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE pol.polname = '任意用户更新用户课程'
      AND n.nspname = 'public'
      AND c.relname = 'user_courses'
  ) THEN
    EXECUTE $pg_schema_sql$
CREATE POLICY "任意用户更新用户课程" ON "public"."user_courses" FOR UPDATE TO "authenticated", "anon" USING (true) WITH CHECK (true);
$pg_schema_sql$;
  END IF;
END
$pg_schema_restore$;


--
-- Name: deep_research_task 任意用户更新研究任务; Type: POLICY; Schema: public; Owner: -
--

DO $pg_schema_restore$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policy pol
    JOIN pg_class c ON c.oid = pol.polrelid
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE pol.polname = '任意用户更新研究任务'
      AND n.nspname = 'public'
      AND c.relname = 'deep_research_task'
  ) THEN
    EXECUTE $pg_schema_sql$
CREATE POLICY "任意用户更新研究任务" ON "public"."deep_research_task" FOR UPDATE TO "authenticated", "anon" USING (true) WITH CHECK (true);
$pg_schema_sql$;
  END IF;
END
$pg_schema_restore$;


--
-- Name: web_content_summary_task 任意用户查看总结任务; Type: POLICY; Schema: public; Owner: -
--

DO $pg_schema_restore$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policy pol
    JOIN pg_class c ON c.oid = pol.polrelid
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE pol.polname = '任意用户查看总结任务'
      AND n.nspname = 'public'
      AND c.relname = 'web_content_summary_task'
  ) THEN
    EXECUTE $pg_schema_sql$
CREATE POLICY "任意用户查看总结任务" ON "public"."web_content_summary_task" FOR SELECT TO "authenticated", "anon" USING (true);
$pg_schema_sql$;
  END IF;
END
$pg_schema_restore$;


--
-- Name: user_courses 任意用户查看用户课程; Type: POLICY; Schema: public; Owner: -
--

DO $pg_schema_restore$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policy pol
    JOIN pg_class c ON c.oid = pol.polrelid
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE pol.polname = '任意用户查看用户课程'
      AND n.nspname = 'public'
      AND c.relname = 'user_courses'
  ) THEN
    EXECUTE $pg_schema_sql$
CREATE POLICY "任意用户查看用户课程" ON "public"."user_courses" FOR SELECT TO "authenticated", "anon" USING (true);
$pg_schema_sql$;
  END IF;
END
$pg_schema_restore$;


--
-- Name: deep_research_task 任意用户查看研究任务; Type: POLICY; Schema: public; Owner: -
--

DO $pg_schema_restore$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policy pol
    JOIN pg_class c ON c.oid = pol.polrelid
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE pol.polname = '任意用户查看研究任务'
      AND n.nspname = 'public'
      AND c.relname = 'deep_research_task'
  ) THEN
    EXECUTE $pg_schema_sql$
CREATE POLICY "任意用户查看研究任务" ON "public"."deep_research_task" FOR SELECT TO "authenticated", "anon" USING (true);
$pg_schema_sql$;
  END IF;
END
$pg_schema_restore$;


--
-- Name: positions 允许匿名用户操作positions; Type: POLICY; Schema: public; Owner: -
--

DO $pg_schema_restore$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policy pol
    JOIN pg_class c ON c.oid = pol.polrelid
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE pol.polname = '允许匿名用户操作positions'
      AND n.nspname = 'public'
      AND c.relname = 'positions'
  ) THEN
    EXECUTE $pg_schema_sql$
CREATE POLICY "允许匿名用户操作positions" ON "public"."positions" TO "anon" USING (true) WITH CHECK (true);
$pg_schema_sql$;
  END IF;
END
$pg_schema_restore$;


--
-- Name: training_tasks 所有人可以查看实训任务; Type: POLICY; Schema: public; Owner: -
--

DO $pg_schema_restore$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policy pol
    JOIN pg_class c ON c.oid = pol.polrelid
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE pol.polname = '所有人可以查看实训任务'
      AND n.nspname = 'public'
      AND c.relname = 'training_tasks'
  ) THEN
    EXECUTE $pg_schema_sql$
CREATE POLICY "所有人可以查看实训任务" ON "public"."training_tasks" FOR SELECT USING (("is_active" = true));
$pg_schema_sql$;
  END IF;
END
$pg_schema_restore$;


--
-- Name: career_consultations 用户可以创建咨询记录; Type: POLICY; Schema: public; Owner: -
--

DO $pg_schema_restore$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policy pol
    JOIN pg_class c ON c.oid = pol.polrelid
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE pol.polname = '用户可以创建咨询记录'
      AND n.nspname = 'public'
      AND c.relname = 'career_consultations'
  ) THEN
    EXECUTE $pg_schema_sql$
CREATE POLICY "用户可以创建咨询记录" ON "public"."career_consultations" FOR INSERT WITH CHECK (("auth"."uid"() = "user_id"));
$pg_schema_sql$;
  END IF;
END
$pg_schema_restore$;


--
-- Name: learning_records 用户可以创建学习记录; Type: POLICY; Schema: public; Owner: -
--

DO $pg_schema_restore$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policy pol
    JOIN pg_class c ON c.oid = pol.polrelid
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE pol.polname = '用户可以创建学习记录'
      AND n.nspname = 'public'
      AND c.relname = 'learning_records'
  ) THEN
    EXECUTE $pg_schema_sql$
CREATE POLICY "用户可以创建学习记录" ON "public"."learning_records" FOR INSERT WITH CHECK (("auth"."uid"() = "user_id"));
$pg_schema_sql$;
  END IF;
END
$pg_schema_restore$;


--
-- Name: resume_optimizations 用户可以创建简历优化记录; Type: POLICY; Schema: public; Owner: -
--

DO $pg_schema_restore$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policy pol
    JOIN pg_class c ON c.oid = pol.polrelid
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE pol.polname = '用户可以创建简历优化记录'
      AND n.nspname = 'public'
      AND c.relname = 'resume_optimizations'
  ) THEN
    EXECUTE $pg_schema_sql$
CREATE POLICY "用户可以创建简历优化记录" ON "public"."resume_optimizations" FOR INSERT WITH CHECK (("auth"."uid"() = "user_id"));
$pg_schema_sql$;
  END IF;
END
$pg_schema_restore$;


--
-- Name: internship_paths 用户可以创建自己的实习路径; Type: POLICY; Schema: public; Owner: -
--

DO $pg_schema_restore$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policy pol
    JOIN pg_class c ON c.oid = pol.polrelid
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE pol.polname = '用户可以创建自己的实习路径'
      AND n.nspname = 'public'
      AND c.relname = 'internship_paths'
  ) THEN
    EXECUTE $pg_schema_sql$
CREATE POLICY "用户可以创建自己的实习路径" ON "public"."internship_paths" FOR INSERT WITH CHECK (("auth"."uid"() = "user_id"));
$pg_schema_sql$;
  END IF;
END
$pg_schema_restore$;


--
-- Name: job_seeker_profiles 用户可以创建自己的画像; Type: POLICY; Schema: public; Owner: -
--

DO $pg_schema_restore$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policy pol
    JOIN pg_class c ON c.oid = pol.polrelid
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE pol.polname = '用户可以创建自己的画像'
      AND n.nspname = 'public'
      AND c.relname = 'job_seeker_profiles'
  ) THEN
    EXECUTE $pg_schema_sql$
CREATE POLICY "用户可以创建自己的画像" ON "public"."job_seeker_profiles" FOR INSERT WITH CHECK (("auth"."uid"() = "user_id"));
$pg_schema_sql$;
  END IF;
END
$pg_schema_restore$;


--
-- Name: ability_profiles 用户可以创建自己的能力画像; Type: POLICY; Schema: public; Owner: -
--

DO $pg_schema_restore$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policy pol
    JOIN pg_class c ON c.oid = pol.polrelid
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE pol.polname = '用户可以创建自己的能力画像'
      AND n.nspname = 'public'
      AND c.relname = 'ability_profiles'
  ) THEN
    EXECUTE $pg_schema_sql$
CREATE POLICY "用户可以创建自己的能力画像" ON "public"."ability_profiles" FOR INSERT WITH CHECK (("auth"."uid"() = "user_id"));
$pg_schema_sql$;
  END IF;
END
$pg_schema_restore$;


--
-- Name: interview_simulations 用户可以创建面试模拟记录; Type: POLICY; Schema: public; Owner: -
--

DO $pg_schema_restore$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policy pol
    JOIN pg_class c ON c.oid = pol.polrelid
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE pol.polname = '用户可以创建面试模拟记录'
      AND n.nspname = 'public'
      AND c.relname = 'interview_simulations'
  ) THEN
    EXECUTE $pg_schema_sql$
CREATE POLICY "用户可以创建面试模拟记录" ON "public"."interview_simulations" FOR INSERT WITH CHECK (("auth"."uid"() = "user_id"));
$pg_schema_sql$;
  END IF;
END
$pg_schema_restore$;


--
-- Name: career_consultations 用户可以更新自己的咨询记录; Type: POLICY; Schema: public; Owner: -
--

DO $pg_schema_restore$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policy pol
    JOIN pg_class c ON c.oid = pol.polrelid
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE pol.polname = '用户可以更新自己的咨询记录'
      AND n.nspname = 'public'
      AND c.relname = 'career_consultations'
  ) THEN
    EXECUTE $pg_schema_sql$
CREATE POLICY "用户可以更新自己的咨询记录" ON "public"."career_consultations" FOR UPDATE USING (("auth"."uid"() = "user_id"));
$pg_schema_sql$;
  END IF;
END
$pg_schema_restore$;


--
-- Name: learning_records 用户可以更新自己的学习记录; Type: POLICY; Schema: public; Owner: -
--

DO $pg_schema_restore$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policy pol
    JOIN pg_class c ON c.oid = pol.polrelid
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE pol.polname = '用户可以更新自己的学习记录'
      AND n.nspname = 'public'
      AND c.relname = 'learning_records'
  ) THEN
    EXECUTE $pg_schema_sql$
CREATE POLICY "用户可以更新自己的学习记录" ON "public"."learning_records" FOR UPDATE USING (("auth"."uid"() = "user_id"));
$pg_schema_sql$;
  END IF;
END
$pg_schema_restore$;


--
-- Name: internship_paths 用户可以更新自己的实习路径; Type: POLICY; Schema: public; Owner: -
--

DO $pg_schema_restore$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policy pol
    JOIN pg_class c ON c.oid = pol.polrelid
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE pol.polname = '用户可以更新自己的实习路径'
      AND n.nspname = 'public'
      AND c.relname = 'internship_paths'
  ) THEN
    EXECUTE $pg_schema_sql$
CREATE POLICY "用户可以更新自己的实习路径" ON "public"."internship_paths" FOR UPDATE USING (("auth"."uid"() = "user_id"));
$pg_schema_sql$;
  END IF;
END
$pg_schema_restore$;


--
-- Name: job_seeker_profiles 用户可以更新自己的画像; Type: POLICY; Schema: public; Owner: -
--

DO $pg_schema_restore$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policy pol
    JOIN pg_class c ON c.oid = pol.polrelid
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE pol.polname = '用户可以更新自己的画像'
      AND n.nspname = 'public'
      AND c.relname = 'job_seeker_profiles'
  ) THEN
    EXECUTE $pg_schema_sql$
CREATE POLICY "用户可以更新自己的画像" ON "public"."job_seeker_profiles" FOR UPDATE USING (("auth"."uid"() = "user_id"));
$pg_schema_sql$;
  END IF;
END
$pg_schema_restore$;


--
-- Name: resume_optimizations 用户可以更新自己的简历优化记录; Type: POLICY; Schema: public; Owner: -
--

DO $pg_schema_restore$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policy pol
    JOIN pg_class c ON c.oid = pol.polrelid
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE pol.polname = '用户可以更新自己的简历优化记录'
      AND n.nspname = 'public'
      AND c.relname = 'resume_optimizations'
  ) THEN
    EXECUTE $pg_schema_sql$
CREATE POLICY "用户可以更新自己的简历优化记录" ON "public"."resume_optimizations" FOR UPDATE USING (("auth"."uid"() = "user_id"));
$pg_schema_sql$;
  END IF;
END
$pg_schema_restore$;


--
-- Name: ability_profiles 用户可以更新自己的能力画像; Type: POLICY; Schema: public; Owner: -
--

DO $pg_schema_restore$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policy pol
    JOIN pg_class c ON c.oid = pol.polrelid
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE pol.polname = '用户可以更新自己的能力画像'
      AND n.nspname = 'public'
      AND c.relname = 'ability_profiles'
  ) THEN
    EXECUTE $pg_schema_sql$
CREATE POLICY "用户可以更新自己的能力画像" ON "public"."ability_profiles" FOR UPDATE USING (("auth"."uid"() = "user_id"));
$pg_schema_sql$;
  END IF;
END
$pg_schema_restore$;


--
-- Name: interview_simulations 用户可以更新自己的面试模拟记录; Type: POLICY; Schema: public; Owner: -
--

DO $pg_schema_restore$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policy pol
    JOIN pg_class c ON c.oid = pol.polrelid
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE pol.polname = '用户可以更新自己的面试模拟记录'
      AND n.nspname = 'public'
      AND c.relname = 'interview_simulations'
  ) THEN
    EXECUTE $pg_schema_sql$
CREATE POLICY "用户可以更新自己的面试模拟记录" ON "public"."interview_simulations" FOR UPDATE USING (("auth"."uid"() = "user_id"));
$pg_schema_sql$;
  END IF;
END
$pg_schema_restore$;


--
-- Name: career_consultations 用户可以查看自己的咨询记录; Type: POLICY; Schema: public; Owner: -
--

DO $pg_schema_restore$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policy pol
    JOIN pg_class c ON c.oid = pol.polrelid
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE pol.polname = '用户可以查看自己的咨询记录'
      AND n.nspname = 'public'
      AND c.relname = 'career_consultations'
  ) THEN
    EXECUTE $pg_schema_sql$
CREATE POLICY "用户可以查看自己的咨询记录" ON "public"."career_consultations" FOR SELECT USING (("auth"."uid"() = "user_id"));
$pg_schema_sql$;
  END IF;
END
$pg_schema_restore$;


--
-- Name: learning_records 用户可以查看自己的学习记录; Type: POLICY; Schema: public; Owner: -
--

DO $pg_schema_restore$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policy pol
    JOIN pg_class c ON c.oid = pol.polrelid
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE pol.polname = '用户可以查看自己的学习记录'
      AND n.nspname = 'public'
      AND c.relname = 'learning_records'
  ) THEN
    EXECUTE $pg_schema_sql$
CREATE POLICY "用户可以查看自己的学习记录" ON "public"."learning_records" FOR SELECT USING (("auth"."uid"() = "user_id"));
$pg_schema_sql$;
  END IF;
END
$pg_schema_restore$;


--
-- Name: internship_paths 用户可以查看自己的实习路径; Type: POLICY; Schema: public; Owner: -
--

DO $pg_schema_restore$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policy pol
    JOIN pg_class c ON c.oid = pol.polrelid
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE pol.polname = '用户可以查看自己的实习路径'
      AND n.nspname = 'public'
      AND c.relname = 'internship_paths'
  ) THEN
    EXECUTE $pg_schema_sql$
CREATE POLICY "用户可以查看自己的实习路径" ON "public"."internship_paths" FOR SELECT USING (("auth"."uid"() = "user_id"));
$pg_schema_sql$;
  END IF;
END
$pg_schema_restore$;


--
-- Name: job_seeker_profiles 用户可以查看自己的画像; Type: POLICY; Schema: public; Owner: -
--

DO $pg_schema_restore$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policy pol
    JOIN pg_class c ON c.oid = pol.polrelid
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE pol.polname = '用户可以查看自己的画像'
      AND n.nspname = 'public'
      AND c.relname = 'job_seeker_profiles'
  ) THEN
    EXECUTE $pg_schema_sql$
CREATE POLICY "用户可以查看自己的画像" ON "public"."job_seeker_profiles" FOR SELECT USING (("auth"."uid"() = "user_id"));
$pg_schema_sql$;
  END IF;
END
$pg_schema_restore$;


--
-- Name: resume_optimizations 用户可以查看自己的简历优化记录; Type: POLICY; Schema: public; Owner: -
--

DO $pg_schema_restore$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policy pol
    JOIN pg_class c ON c.oid = pol.polrelid
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE pol.polname = '用户可以查看自己的简历优化记录'
      AND n.nspname = 'public'
      AND c.relname = 'resume_optimizations'
  ) THEN
    EXECUTE $pg_schema_sql$
CREATE POLICY "用户可以查看自己的简历优化记录" ON "public"."resume_optimizations" FOR SELECT USING (("auth"."uid"() = "user_id"));
$pg_schema_sql$;
  END IF;
END
$pg_schema_restore$;


--
-- Name: ability_profiles 用户可以查看自己的能力画像; Type: POLICY; Schema: public; Owner: -
--

DO $pg_schema_restore$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policy pol
    JOIN pg_class c ON c.oid = pol.polrelid
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE pol.polname = '用户可以查看自己的能力画像'
      AND n.nspname = 'public'
      AND c.relname = 'ability_profiles'
  ) THEN
    EXECUTE $pg_schema_sql$
CREATE POLICY "用户可以查看自己的能力画像" ON "public"."ability_profiles" FOR SELECT USING (("auth"."uid"() = "user_id"));
$pg_schema_sql$;
  END IF;
END
$pg_schema_restore$;


--
-- Name: interview_simulations 用户可以查看自己的面试模拟记录; Type: POLICY; Schema: public; Owner: -
--

DO $pg_schema_restore$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policy pol
    JOIN pg_class c ON c.oid = pol.polrelid
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE pol.polname = '用户可以查看自己的面试模拟记录'
      AND n.nspname = 'public'
      AND c.relname = 'interview_simulations'
  ) THEN
    EXECUTE $pg_schema_sql$
CREATE POLICY "用户可以查看自己的面试模拟记录" ON "public"."interview_simulations" FOR SELECT USING (("auth"."uid"() = "user_id"));
$pg_schema_sql$;
  END IF;
END
$pg_schema_restore$;


--
-- Name: cooperation_companies 认证用户可查看企业; Type: POLICY; Schema: public; Owner: -
--

DO $pg_schema_restore$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policy pol
    JOIN pg_class c ON c.oid = pol.polrelid
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE pol.polname = '认证用户可查看企业'
      AND n.nspname = 'public'
      AND c.relname = 'cooperation_companies'
  ) THEN
    EXECUTE $pg_schema_sql$
CREATE POLICY "认证用户可查看企业" ON "public"."cooperation_companies" FOR SELECT TO "authenticated" USING (true);
$pg_schema_sql$;
  END IF;
END
$pg_schema_restore$;


--
-- Name: cooperation_agreements 认证用户可查看协议; Type: POLICY; Schema: public; Owner: -
--

DO $pg_schema_restore$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policy pol
    JOIN pg_class c ON c.oid = pol.polrelid
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE pol.polname = '认证用户可查看协议'
      AND n.nspname = 'public'
      AND c.relname = 'cooperation_agreements'
  ) THEN
    EXECUTE $pg_schema_sql$
CREATE POLICY "认证用户可查看协议" ON "public"."cooperation_agreements" FOR SELECT TO "authenticated" USING (true);
$pg_schema_sql$;
  END IF;
END
$pg_schema_restore$;


--
-- Name: colleges 认证用户可查看学院; Type: POLICY; Schema: public; Owner: -
--

DO $pg_schema_restore$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policy pol
    JOIN pg_class c ON c.oid = pol.polrelid
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE pol.polname = '认证用户可查看学院'
      AND n.nspname = 'public'
      AND c.relname = 'colleges'
  ) THEN
    EXECUTE $pg_schema_sql$
CREATE POLICY "认证用户可查看学院" ON "public"."colleges" FOR SELECT TO "authenticated" USING (true);
$pg_schema_sql$;
  END IF;
END
$pg_schema_restore$;


--
-- Name: company_positions 认证用户可查看岗位; Type: POLICY; Schema: public; Owner: -
--

DO $pg_schema_restore$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policy pol
    JOIN pg_class c ON c.oid = pol.polrelid
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE pol.polname = '认证用户可查看岗位'
      AND n.nspname = 'public'
      AND c.relname = 'company_positions'
  ) THEN
    EXECUTE $pg_schema_sql$
CREATE POLICY "认证用户可查看岗位" ON "public"."company_positions" FOR SELECT TO "authenticated" USING (true);
$pg_schema_sql$;
  END IF;
END
$pg_schema_restore$;


--
-- Name: student_applications 认证用户可查看投递; Type: POLICY; Schema: public; Owner: -
--

DO $pg_schema_restore$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policy pol
    JOIN pg_class c ON c.oid = pol.polrelid
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE pol.polname = '认证用户可查看投递'
      AND n.nspname = 'public'
      AND c.relname = 'student_applications'
  ) THEN
    EXECUTE $pg_schema_sql$
CREATE POLICY "认证用户可查看投递" ON "public"."student_applications" FOR SELECT TO "authenticated" USING (true);
$pg_schema_sql$;
  END IF;
END
$pg_schema_restore$;


--
-- Name: cooperation_plans 认证用户可查看方案; Type: POLICY; Schema: public; Owner: -
--

DO $pg_schema_restore$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policy pol
    JOIN pg_class c ON c.oid = pol.polrelid
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE pol.polname = '认证用户可查看方案'
      AND n.nspname = 'public'
      AND c.relname = 'cooperation_plans'
  ) THEN
    EXECUTE $pg_schema_sql$
CREATE POLICY "认证用户可查看方案" ON "public"."cooperation_plans" FOR SELECT TO "authenticated" USING (true);
$pg_schema_sql$;
  END IF;
END
$pg_schema_restore$;


--
-- Name: project_progress_records 认证用户可查看进度; Type: POLICY; Schema: public; Owner: -
--

DO $pg_schema_restore$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policy pol
    JOIN pg_class c ON c.oid = pol.polrelid
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE pol.polname = '认证用户可查看进度'
      AND n.nspname = 'public'
      AND c.relname = 'project_progress_records'
  ) THEN
    EXECUTE $pg_schema_sql$
CREATE POLICY "认证用户可查看进度" ON "public"."project_progress_records" FOR SELECT TO "authenticated" USING (true);
$pg_schema_sql$;
  END IF;
END
$pg_schema_restore$;


--
-- Name: cooperation_projects 认证用户可查看项目; Type: POLICY; Schema: public; Owner: -
--

DO $pg_schema_restore$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policy pol
    JOIN pg_class c ON c.oid = pol.polrelid
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE pol.polname = '认证用户可查看项目'
      AND n.nspname = 'public'
      AND c.relname = 'cooperation_projects'
  ) THEN
    EXECUTE $pg_schema_sql$
CREATE POLICY "认证用户可查看项目" ON "public"."cooperation_projects" FOR SELECT TO "authenticated" USING (true);
$pg_schema_sql$;
  END IF;
END
$pg_schema_restore$;


--
-- Name: cooperation_companies 认证用户可管理企业; Type: POLICY; Schema: public; Owner: -
--

DO $pg_schema_restore$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policy pol
    JOIN pg_class c ON c.oid = pol.polrelid
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE pol.polname = '认证用户可管理企业'
      AND n.nspname = 'public'
      AND c.relname = 'cooperation_companies'
  ) THEN
    EXECUTE $pg_schema_sql$
CREATE POLICY "认证用户可管理企业" ON "public"."cooperation_companies" TO "authenticated" USING (true) WITH CHECK (true);
$pg_schema_sql$;
  END IF;
END
$pg_schema_restore$;


--
-- Name: cooperation_agreements 认证用户可管理协议; Type: POLICY; Schema: public; Owner: -
--

DO $pg_schema_restore$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policy pol
    JOIN pg_class c ON c.oid = pol.polrelid
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE pol.polname = '认证用户可管理协议'
      AND n.nspname = 'public'
      AND c.relname = 'cooperation_agreements'
  ) THEN
    EXECUTE $pg_schema_sql$
CREATE POLICY "认证用户可管理协议" ON "public"."cooperation_agreements" TO "authenticated" USING (true) WITH CHECK (true);
$pg_schema_sql$;
  END IF;
END
$pg_schema_restore$;


--
-- Name: colleges 认证用户可管理学院; Type: POLICY; Schema: public; Owner: -
--

DO $pg_schema_restore$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policy pol
    JOIN pg_class c ON c.oid = pol.polrelid
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE pol.polname = '认证用户可管理学院'
      AND n.nspname = 'public'
      AND c.relname = 'colleges'
  ) THEN
    EXECUTE $pg_schema_sql$
CREATE POLICY "认证用户可管理学院" ON "public"."colleges" TO "authenticated" USING (true) WITH CHECK (true);
$pg_schema_sql$;
  END IF;
END
$pg_schema_restore$;


--
-- Name: company_positions 认证用户可管理岗位; Type: POLICY; Schema: public; Owner: -
--

DO $pg_schema_restore$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policy pol
    JOIN pg_class c ON c.oid = pol.polrelid
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE pol.polname = '认证用户可管理岗位'
      AND n.nspname = 'public'
      AND c.relname = 'company_positions'
  ) THEN
    EXECUTE $pg_schema_sql$
CREATE POLICY "认证用户可管理岗位" ON "public"."company_positions" TO "authenticated" USING (true) WITH CHECK (true);
$pg_schema_sql$;
  END IF;
END
$pg_schema_restore$;


--
-- Name: student_applications 认证用户可管理投递; Type: POLICY; Schema: public; Owner: -
--

DO $pg_schema_restore$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policy pol
    JOIN pg_class c ON c.oid = pol.polrelid
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE pol.polname = '认证用户可管理投递'
      AND n.nspname = 'public'
      AND c.relname = 'student_applications'
  ) THEN
    EXECUTE $pg_schema_sql$
CREATE POLICY "认证用户可管理投递" ON "public"."student_applications" TO "authenticated" USING (true) WITH CHECK (true);
$pg_schema_sql$;
  END IF;
END
$pg_schema_restore$;


--
-- Name: cooperation_plans 认证用户可管理方案; Type: POLICY; Schema: public; Owner: -
--

DO $pg_schema_restore$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policy pol
    JOIN pg_class c ON c.oid = pol.polrelid
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE pol.polname = '认证用户可管理方案'
      AND n.nspname = 'public'
      AND c.relname = 'cooperation_plans'
  ) THEN
    EXECUTE $pg_schema_sql$
CREATE POLICY "认证用户可管理方案" ON "public"."cooperation_plans" TO "authenticated" USING (true) WITH CHECK (true);
$pg_schema_sql$;
  END IF;
END
$pg_schema_restore$;


--
-- Name: project_progress_records 认证用户可管理进度; Type: POLICY; Schema: public; Owner: -
--

DO $pg_schema_restore$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policy pol
    JOIN pg_class c ON c.oid = pol.polrelid
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE pol.polname = '认证用户可管理进度'
      AND n.nspname = 'public'
      AND c.relname = 'project_progress_records'
  ) THEN
    EXECUTE $pg_schema_sql$
CREATE POLICY "认证用户可管理进度" ON "public"."project_progress_records" TO "authenticated" USING (true) WITH CHECK (true);
$pg_schema_sql$;
  END IF;
END
$pg_schema_restore$;


--
-- Name: cooperation_projects 认证用户可管理项目; Type: POLICY; Schema: public; Owner: -
--

DO $pg_schema_restore$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policy pol
    JOIN pg_class c ON c.oid = pol.polrelid
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE pol.polname = '认证用户可管理项目'
      AND n.nspname = 'public'
      AND c.relname = 'cooperation_projects'
  ) THEN
    EXECUTE $pg_schema_sql$
CREATE POLICY "认证用户可管理项目" ON "public"."cooperation_projects" TO "authenticated" USING (true) WITH CHECK (true);
$pg_schema_sql$;
  END IF;
END
$pg_schema_restore$;


--
-- PostgreSQL database dump complete
--




-- ============================================================
-- SECTION: DIFF FILTER OBJECTS
-- ============================================================
-- Objects that match diff-filter.json but cannot be represented
-- precisely by pg_dump --filter.

-- policy: "Anyone can view student cards" on storage.objects
DO $pg_schema_restore$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policy pol
    JOIN pg_class c ON c.oid = pol.polrelid
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE pol.polname = 'Anyone can view student cards'
      AND n.nspname = 'storage'
      AND c.relname = 'objects'
  ) THEN
    EXECUTE 'CREATE POLICY "Anyone can view student cards" ON storage.objects AS PERMISSIVE FOR SELECT TO PUBLIC USING ((bucket_id = ''student-cards''::text));';
  END IF;
END
$pg_schema_restore$;
-- policy: "Users can upload own student card" on storage.objects
DO $pg_schema_restore$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policy pol
    JOIN pg_class c ON c.oid = pol.polrelid
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE pol.polname = 'Users can upload own student card'
      AND n.nspname = 'storage'
      AND c.relname = 'objects'
  ) THEN
    EXECUTE 'CREATE POLICY "Users can upload own student card" ON storage.objects AS PERMISSIVE FOR INSERT TO PUBLIC WITH CHECK (((bucket_id = ''student-cards''::text) AND ((auth.uid())::text = (storage.foldername(name))[1])));';
  END IF;
END
$pg_schema_restore$;
-- policy: avatars_authenticated_delete on storage.objects
DO $pg_schema_restore$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policy pol
    JOIN pg_class c ON c.oid = pol.polrelid
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE pol.polname = 'avatars_authenticated_delete'
      AND n.nspname = 'storage'
      AND c.relname = 'objects'
  ) THEN
    EXECUTE 'CREATE POLICY avatars_authenticated_delete ON storage.objects AS PERMISSIVE FOR DELETE TO PUBLIC USING ((bucket_id = ''avatars''::text));';
  END IF;
END
$pg_schema_restore$;
-- policy: avatars_authenticated_update on storage.objects
DO $pg_schema_restore$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policy pol
    JOIN pg_class c ON c.oid = pol.polrelid
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE pol.polname = 'avatars_authenticated_update'
      AND n.nspname = 'storage'
      AND c.relname = 'objects'
  ) THEN
    EXECUTE 'CREATE POLICY avatars_authenticated_update ON storage.objects AS PERMISSIVE FOR UPDATE TO PUBLIC USING ((bucket_id = ''avatars''::text));';
  END IF;
END
$pg_schema_restore$;
-- policy: avatars_authenticated_upload on storage.objects
DO $pg_schema_restore$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policy pol
    JOIN pg_class c ON c.oid = pol.polrelid
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE pol.polname = 'avatars_authenticated_upload'
      AND n.nspname = 'storage'
      AND c.relname = 'objects'
  ) THEN
    EXECUTE 'CREATE POLICY avatars_authenticated_upload ON storage.objects AS PERMISSIVE FOR INSERT TO PUBLIC WITH CHECK ((bucket_id = ''avatars''::text));';
  END IF;
END
$pg_schema_restore$;
-- policy: avatars_public_read on storage.objects
DO $pg_schema_restore$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policy pol
    JOIN pg_class c ON c.oid = pol.polrelid
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE pol.polname = 'avatars_public_read'
      AND n.nspname = 'storage'
      AND c.relname = 'objects'
  ) THEN
    EXECUTE 'CREATE POLICY avatars_public_read ON storage.objects AS PERMISSIVE FOR SELECT TO PUBLIC USING ((bucket_id = ''avatars''::text));';
  END IF;
END
$pg_schema_restore$;
-- policy: user_uploads_delete on storage.objects
DO $pg_schema_restore$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policy pol
    JOIN pg_class c ON c.oid = pol.polrelid
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE pol.polname = 'user_uploads_delete'
      AND n.nspname = 'storage'
      AND c.relname = 'objects'
  ) THEN
    EXECUTE 'CREATE POLICY user_uploads_delete ON storage.objects AS PERMISSIVE FOR DELETE TO anon, authenticated USING ((bucket_id = ''user-uploads''::text));';
  END IF;
END
$pg_schema_restore$;
-- policy: user_uploads_insert on storage.objects
DO $pg_schema_restore$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policy pol
    JOIN pg_class c ON c.oid = pol.polrelid
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE pol.polname = 'user_uploads_insert'
      AND n.nspname = 'storage'
      AND c.relname = 'objects'
  ) THEN
    EXECUTE 'CREATE POLICY user_uploads_insert ON storage.objects AS PERMISSIVE FOR INSERT TO anon, authenticated WITH CHECK ((bucket_id = ''user-uploads''::text));';
  END IF;
END
$pg_schema_restore$;
-- policy: user_uploads_read on storage.objects
DO $pg_schema_restore$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policy pol
    JOIN pg_class c ON c.oid = pol.polrelid
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE pol.polname = 'user_uploads_read'
      AND n.nspname = 'storage'
      AND c.relname = 'objects'
  ) THEN
    EXECUTE 'CREATE POLICY user_uploads_read ON storage.objects AS PERMISSIVE FOR SELECT TO anon, authenticated USING ((bucket_id = ''user-uploads''::text));';
  END IF;
END
$pg_schema_restore$;
-- policy: user_uploads_update on storage.objects
DO $pg_schema_restore$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policy pol
    JOIN pg_class c ON c.oid = pol.polrelid
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE pol.polname = 'user_uploads_update'
      AND n.nspname = 'storage'
      AND c.relname = 'objects'
  ) THEN
    EXECUTE 'CREATE POLICY user_uploads_update ON storage.objects AS PERMISSIVE FOR UPDATE TO anon, authenticated USING ((bucket_id = ''user-uploads''::text));';
  END IF;
END
$pg_schema_restore$;

-- ============================================================
-- SECTION: STORAGE BUCKETS DATA
-- ============================================================

INSERT INTO "storage"."buckets" ("id", "name", "owner", "created_at", "updated_at", "public", "avif_autodetection", "file_size_limit", "allowed_mime_types", "owner_id", "type") VALUES ('avatars', 'avatars', NULL, '2026-04-01 16:56:16.632954+00', '2026-04-01 16:56:16.632954+00', 'true', 'false', '1048576', '{image/jpeg,image/jpg,image/png,image/gif,image/webp}', NULL, 'STANDARD') ON CONFLICT ("id") DO UPDATE SET "name" = EXCLUDED."name", "owner" = EXCLUDED."owner", "created_at" = EXCLUDED."created_at", "updated_at" = EXCLUDED."updated_at", "public" = EXCLUDED."public", "avif_autodetection" = EXCLUDED."avif_autodetection", "file_size_limit" = EXCLUDED."file_size_limit", "allowed_mime_types" = EXCLUDED."allowed_mime_types", "owner_id" = EXCLUDED."owner_id", "type" = EXCLUDED."type";
INSERT INTO "storage"."buckets" ("id", "name", "owner", "created_at", "updated_at", "public", "avif_autodetection", "file_size_limit", "allowed_mime_types", "owner_id", "type") VALUES ('student-cards', 'student-cards', NULL, '2026-04-08 18:41:56.916457+00', '2026-04-08 18:41:56.916457+00', 'true', 'false', NULL, NULL, NULL, 'STANDARD') ON CONFLICT ("id") DO UPDATE SET "name" = EXCLUDED."name", "owner" = EXCLUDED."owner", "created_at" = EXCLUDED."created_at", "updated_at" = EXCLUDED."updated_at", "public" = EXCLUDED."public", "avif_autodetection" = EXCLUDED."avif_autodetection", "file_size_limit" = EXCLUDED."file_size_limit", "allowed_mime_types" = EXCLUDED."allowed_mime_types", "owner_id" = EXCLUDED."owner_id", "type" = EXCLUDED."type";
INSERT INTO "storage"."buckets" ("id", "name", "owner", "created_at", "updated_at", "public", "avif_autodetection", "file_size_limit", "allowed_mime_types", "owner_id", "type") VALUES ('user-uploads', 'user-uploads', NULL, '2026-08-06 09:12:41.344305+00', '2026-08-06 09:12:41.344305+00', 'true', 'false', '1048576', '{image/jpeg,image/png,image/gif,image/webp,image/avif}', NULL, 'STANDARD') ON CONFLICT ("id") DO UPDATE SET "name" = EXCLUDED."name", "owner" = EXCLUDED."owner", "created_at" = EXCLUDED."created_at", "updated_at" = EXCLUDED."updated_at", "public" = EXCLUDED."public", "avif_autodetection" = EXCLUDED."avif_autodetection", "file_size_limit" = EXCLUDED."file_size_limit", "allowed_mime_types" = EXCLUDED."allowed_mime_types", "owner_id" = EXCLUDED."owner_id", "type" = EXCLUDED."type";

-- ============================================================
-- SECTION: CRON JOBS
-- ============================================================
-- 用户自定义 pg_cron 任务。

