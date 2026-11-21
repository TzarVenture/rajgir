-- =====================================================================================
-- Normalize user identity + cascading role profiles  (2026-11-20)
-- -------------------------------------------------------------------------------------
-- * users gets first_name / last_name (replacing full_name), backfilled from existing data
-- * runner_registrations, volunteers, influencers lose their duplicated identity columns
--   (first_name, last_name, full_name, email, phone); identity now lives only in users
-- * user_id on those three tables becomes NOT NULL with ON DELETE CASCADE
--
-- Data safety:
-- * Every identity value that is dropped is first copied to archive.identity_20261120.
-- * Role rows not linked to any user (legacy anonymous form submissions) cannot satisfy the
--   required user_id. They are copied in full to archive.orphan_<table>_20261120, then removed.
-- * The whole script is one transaction: any failure changes nothing.
--
-- This project syncs the schema with `prisma db push` (no migration history). Run this script
-- BEFORE `prisma db push`, otherwise db push would drop the old columns without copying names.
--
--   cd rajgir/backend
--   npx prisma db execute --file prisma/sql/2026-11-20_normalize_user_identity_and_cascades.sql --schema prisma/schema.prisma
--   npx prisma db push          # should report the database is already in sync
--   npx prisma generate
-- =====================================================================================

BEGIN;

-- 0. Archives (schema "archive": not managed by Prisma, not exposed by the Supabase API) ---------
CREATE SCHEMA IF NOT EXISTS archive;
REVOKE ALL ON SCHEMA archive FROM anon, authenticated;
CREATE TABLE IF NOT EXISTS archive.identity_20261120 (
  source_table  text        NOT NULL,
  source_id     uuid        NOT NULL,
  user_id       uuid,
  first_name    text,
  last_name     text,
  full_name     text,
  email         text,
  phone         text,
  archived_at   timestamptz NOT NULL DEFAULT now()
);

INSERT INTO archive.identity_20261120 (source_table, source_id, user_id, full_name, email, phone)
SELECT 'users', id, id, full_name, email, phone FROM "users";

INSERT INTO archive.identity_20261120 (source_table, source_id, user_id, first_name, last_name, email, phone)
SELECT 'runner_registrations', id, user_id, first_name, last_name, email, phone FROM "runner_registrations";

INSERT INTO archive.identity_20261120 (source_table, source_id, user_id, full_name, email, phone)
SELECT 'volunteers', id, user_id, full_name, email, phone FROM "volunteers";

INSERT INTO archive.identity_20261120 (source_table, source_id, user_id, full_name, email, phone)
SELECT 'influencers', id, user_id, full_name, email, phone FROM "influencers";

-- Full copies of role rows that have no user (all columns, incl. their dependants).
CREATE TABLE IF NOT EXISTS archive.orphan_volunteers_20261120  AS SELECT * FROM "volunteers"           WHERE false;
CREATE TABLE IF NOT EXISTS archive.orphan_influencers_20261120 AS SELECT * FROM "influencers"          WHERE false;
CREATE TABLE IF NOT EXISTS archive.orphan_runners_20261120     AS SELECT * FROM "runner_registrations" WHERE false;
INSERT INTO archive.orphan_volunteers_20261120  SELECT * FROM "volunteers"           WHERE user_id IS NULL;
INSERT INTO archive.orphan_influencers_20261120 SELECT * FROM "influencers"          WHERE user_id IS NULL;
INSERT INTO archive.orphan_runners_20261120     SELECT * FROM "runner_registrations" WHERE user_id IS NULL;


-- Remove orphans (their attendance / results cascade; incidents keep the report with volunteer_id NULL).
DELETE FROM "volunteers"           WHERE user_id IS NULL;
DELETE FROM "influencers"          WHERE user_id IS NULL;
DELETE FROM "runner_registrations" WHERE user_id IS NULL;

-- 1. users.first_name / users.last_name ---------------------------------------------------
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "first_name" VARCHAR(64);
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "last_name"  VARCHAR(64);

-- 1a. Runners typed their name (as on their ID) during registration: prefer it.
UPDATE "users" u
SET    "first_name" = left(trim(r."first_name"), 64),
       "last_name"  = left(trim(r."last_name"), 64)
FROM   "runner_registrations" r
WHERE  r."user_id" = u."id"
  AND  u."first_name" IS NULL
  AND  trim(coalesce(r."first_name", '')) <> '';

-- 1b. Everyone else: split the sign-up full name at the first space.
--     "Rahul Kumar Verma" -> first "Rahul", last "Kumar Verma". A single word keeps last_name ''.
UPDATE "users"
SET    "first_name" = left(split_part(regexp_replace(trim("full_name"), '\s+', ' ', 'g'), ' ', 1), 64),
       "last_name"  = left(
                        CASE WHEN position(' ' IN regexp_replace(trim("full_name"), '\s+', ' ', 'g')) > 0
                             THEN substr(regexp_replace(trim("full_name"), '\s+', ' ', 'g'),
                                         position(' ' IN regexp_replace(trim("full_name"), '\s+', ' ', 'g')) + 1)
                             ELSE '' END, 64)
WHERE  "first_name" IS NULL;

-- 1c. Last resort for empty names: the part of the email before '@'.
UPDATE "users"
SET    "first_name" = left(split_part("email", '@', 1), 64),
       "last_name"  = coalesce("last_name", '')
WHERE  coalesce(trim("first_name"), '') = '';

ALTER TABLE "users" ALTER COLUMN "first_name" SET NOT NULL;
ALTER TABLE "users" ALTER COLUMN "last_name"  SET NOT NULL;
ALTER TABLE "users" DROP COLUMN IF EXISTS "full_name";

-- 2. Remove duplicated identity columns from role tables -----------------------------------
DROP INDEX IF EXISTS "runner_registrations_email_idx";
DROP INDEX IF EXISTS "runner_registrations_phone_idx";
DROP INDEX IF EXISTS "volunteers_email_idx";
DROP INDEX IF EXISTS "influencers_email_idx";

ALTER TABLE "runner_registrations"
  DROP COLUMN IF EXISTS "first_name",
  DROP COLUMN IF EXISTS "last_name",
  DROP COLUMN IF EXISTS "email",
  DROP COLUMN IF EXISTS "phone";

ALTER TABLE "volunteers"
  DROP COLUMN IF EXISTS "full_name",
  DROP COLUMN IF EXISTS "email",
  DROP COLUMN IF EXISTS "phone";

ALTER TABLE "influencers"
  DROP COLUMN IF EXISTS "full_name",
  DROP COLUMN IF EXISTS "email",
  DROP COLUMN IF EXISTS "phone";

-- 3. Required 1:1 link with cascading delete -----------------------------------------------
ALTER TABLE "runner_registrations" ALTER COLUMN "user_id" SET NOT NULL;
ALTER TABLE "volunteers"           ALTER COLUMN "user_id" SET NOT NULL;
ALTER TABLE "influencers"          ALTER COLUMN "user_id" SET NOT NULL;

ALTER TABLE "runner_registrations" DROP CONSTRAINT IF EXISTS "runner_registrations_user_id_fkey";
ALTER TABLE "volunteers"           DROP CONSTRAINT IF EXISTS "volunteers_user_id_fkey";
ALTER TABLE "influencers"          DROP CONSTRAINT IF EXISTS "influencers_user_id_fkey";

ALTER TABLE "runner_registrations" ADD CONSTRAINT "runner_registrations_user_id_fkey"
  FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "volunteers" ADD CONSTRAINT "volunteers_user_id_fkey"
  FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "influencers" ADD CONSTRAINT "influencers_user_id_fkey"
  FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

COMMIT;
