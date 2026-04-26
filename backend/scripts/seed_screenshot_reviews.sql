-- =============================================================================
-- SCREENSHOT-ONLY SEED DATA - DO NOT RUN IN PRODUCTION
-- =============================================================================
-- Skapar 6 fejk-användare, 6 uppdrag och 6 completed offers med rating så att
-- target-användaren ser ut att ha ett etablerat track record på profilsidan.
--
-- Endast för app store screenshots / marknadsföringsmaterial.
-- Fejk-användarna kan inte logga in (ogiltig bcrypt-hash i password-kolumnen).
-- Email-domänen är .invalid (reserverad RFC 2606) så det går inte att kollidera
-- med riktiga användare.
--
-- Användning:
--   psql -h localhost -U postgres -d grannfix -f scripts/seed_screenshot_reviews.sql
--
-- För att rensa: kör DELETE-blocket längst ned (utkommenterat).
-- =============================================================================

BEGIN;

-- Tvinga UTF-8 så svenska tecken (å ä ö —) lagras korrekt även när psql körs
-- från MINGW64/Windows där default-encodingen ofta är WIN1252.
SET client_encoding = 'UTF8';

-- target user som ska få recensioner
\set target_user '''a7c9c960-b4b6-4752-8d7e-56cc5c56a51b'''

-- ----- Fejk-recensenter (task posters) ----------------------------------------
INSERT INTO users (
  id, phone_number, password, name, email, city, area, active, verified, role,
  rating_average, rating_count, completed_offers_count, created_at, updated_at
) VALUES
  ('b1a00001-0000-4000-8000-000000000001', '+46700000001',
   '$2a$10$AAAAAAAAAAAAAAAAAAAAAABBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB',
   'Anna Lindberg', 'anna.lindberg.demo@grannfix.invalid',
   'Stockholm', 'Södermalm', true, true, 'USER',
   0, 0, 0, NOW() - INTERVAL '7 months', NOW() - INTERVAL '7 months'),

  ('b1a00002-0000-4000-8000-000000000002', '+46700000002',
   '$2a$10$AAAAAAAAAAAAAAAAAAAAAABBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB',
   'Erik Johansson', 'erik.johansson.demo@grannfix.invalid',
   'Stockholm', 'Vasastan', true, true, 'USER',
   0, 0, 0, NOW() - INTERVAL '6 months', NOW() - INTERVAL '6 months'),

  ('b1a00003-0000-4000-8000-000000000003', '+46700000003',
   '$2a$10$AAAAAAAAAAAAAAAAAAAAAABBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB',
   'Maria Andersson', 'maria.andersson.demo@grannfix.invalid',
   'Stockholm', 'Bromma', true, true, 'USER',
   0, 0, 0, NOW() - INTERVAL '5 months', NOW() - INTERVAL '5 months'),

  ('b1a00004-0000-4000-8000-000000000004', '+46700000004',
   '$2a$10$AAAAAAAAAAAAAAAAAAAAAABBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB',
   'Johan Karlsson', 'johan.karlsson.demo@grannfix.invalid',
   'Stockholm', 'Östermalm', true, true, 'USER',
   0, 0, 0, NOW() - INTERVAL '4 months', NOW() - INTERVAL '4 months'),

  ('b1a00005-0000-4000-8000-000000000005', '+46700000005',
   '$2a$10$AAAAAAAAAAAAAAAAAAAAAABBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB',
   'Lisa Bergström', 'lisa.bergstrom.demo@grannfix.invalid',
   'Stockholm', 'Kungsholmen', true, true, 'USER',
   0, 0, 0, NOW() - INTERVAL '3 months', NOW() - INTERVAL '3 months'),

  ('b1a00006-0000-4000-8000-000000000006', '+46700000006',
   '$2a$10$AAAAAAAAAAAAAAAAAAAAAABBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB',
   'Oskar Eriksson', 'oskar.eriksson.demo@grannfix.invalid',
   'Stockholm', 'Hammarby Sjöstad', true, true, 'USER',
   0, 0, 0, NOW() - INTERVAL '2 months', NOW() - INTERVAL '2 months')
ON CONFLICT (id) DO NOTHING;

-- ----- Uppdrag (ett per recensent, alla COMPLETED) ----------------------------
INSERT INTO tasks (
  id, created_by_id, assigned_to_id, title, description, category, urgency,
  city, area, offered_price, status, active, created_at, updated_at, completed_at
) VALUES
  ('b1b00001-0000-4000-8000-000000000001',
   'b1a00001-0000-4000-8000-000000000001',
   'a7c9c960-b4b6-4752-8d7e-56cc5c56a51b',
   'Hjälp att bära soffa upp till lägenhet',
   'Behöver hjälp att bära upp en 3-sits soffa till tredje våningen, ingen hiss.',
   'CARRYING', 'FLEXIBLE', 'Stockholm', 'Södermalm', 350,
   'COMPLETED', true,
   NOW() - INTERVAL '5 months', NOW() - INTERVAL '5 months', NOW() - INTERVAL '5 months'),

  ('b1b00002-0000-4000-8000-000000000002',
   'b1a00002-0000-4000-8000-000000000002',
   'a7c9c960-b4b6-4752-8d7e-56cc5c56a51b',
   'Montera IKEA-bokhylla',
   'Två bokhyllor från IKEA som behöver monteras. Verktyg finns på plats.',
   'MOUNTING', 'THIS_WEEK', 'Stockholm', 'Vasastan', 400,
   'COMPLETED', true,
   NOW() - INTERVAL '4 months', NOW() - INTERVAL '4 months', NOW() - INTERVAL '4 months'),

  ('b1b00003-0000-4000-8000-000000000003',
   'b1a00003-0000-4000-8000-000000000003',
   'a7c9c960-b4b6-4752-8d7e-56cc5c56a51b',
   'Klippa gräsmattan',
   'Behöver hjälp att klippa gräsmattan i trädgården, ca 200 kvm.',
   'GARDENING', 'FLEXIBLE', 'Stockholm', 'Bromma', 500,
   'COMPLETED', true,
   NOW() - INTERVAL '3 months', NOW() - INTERVAL '3 months', NOW() - INTERVAL '3 months'),

  ('b1b00004-0000-4000-8000-000000000004',
   'b1a00004-0000-4000-8000-000000000004',
   'a7c9c960-b4b6-4752-8d7e-56cc5c56a51b',
   'Flytthjälp Östermalm → Bromma',
   'Behöver en extra person för att hjälpa till med flytt under helgen.',
   'MOVING', 'THIS_WEEK', 'Stockholm', 'Östermalm', 1200,
   'COMPLETED', true,
   NOW() - INTERVAL '2 months', NOW() - INTERVAL '2 months', NOW() - INTERVAL '2 months'),

  ('b1b00005-0000-4000-8000-000000000005',
   'b1a00005-0000-4000-8000-000000000005',
   'a7c9c960-b4b6-4752-8d7e-56cc5c56a51b',
   'Sätta upp tavlor i hallen',
   'Fem tavlor som behöver hängas upp. Hammare och spik finns hemma.',
   'MOUNTING', 'FLEXIBLE', 'Stockholm', 'Kungsholmen', 250,
   'COMPLETED', true,
   NOW() - INTERVAL '6 weeks', NOW() - INTERVAL '6 weeks', NOW() - INTERVAL '6 weeks'),

  ('b1b00006-0000-4000-8000-000000000006',
   'b1a00006-0000-4000-8000-000000000006',
   'a7c9c960-b4b6-4752-8d7e-56cc5c56a51b',
   'Bära kassar från ICA',
   'Vecko-handling som behöver bäras hem från ICA Maxi. Tyngre varor.',
   'CARRYING', 'TODAY', 'Stockholm', 'Hammarby Sjöstad', 200,
   'COMPLETED', true,
   NOW() - INTERVAL '3 weeks', NOW() - INTERVAL '3 weeks', NOW() - INTERVAL '3 weeks')
ON CONFLICT (id) DO NOTHING;

-- ----- Completed offers från target-användaren med rating + kommentar ---------
INSERT INTO offers (
  id, task_id, helper_id, status, rating, rating_comment, proposed_price,
  message, created_at, updated_at, completed_at
) VALUES
  ('b1c00001-0000-4000-8000-000000000001',
   'b1b00001-0000-4000-8000-000000000001',
   'a7c9c960-b4b6-4752-8d7e-56cc5c56a51b',
   'COMPLETED', 5,
   'Snabbt och proffsigt jobb! Var jättesnäll och hjälpsam. Rekommenderas varmt.',
   350, 'Jag kan hjälpa dig idag eller imorgon, har erfarenhet av flyttar.',
   NOW() - INTERVAL '5 months', NOW() - INTERVAL '5 months', NOW() - INTERVAL '5 months'),

  ('b1c00002-0000-4000-8000-000000000002',
   'b1b00002-0000-4000-8000-000000000002',
   'a7c9c960-b4b6-4752-8d7e-56cc5c56a51b',
   'COMPLETED', 5,
   'Verkligen kunnig — hade allt med sig och båda hyllorna stod klara på en timme.',
   400, NULL,
   NOW() - INTERVAL '4 months', NOW() - INTERVAL '4 months', NOW() - INTERVAL '4 months'),

  ('b1c00003-0000-4000-8000-000000000003',
   'b1b00003-0000-4000-8000-000000000003',
   'a7c9c960-b4b6-4752-8d7e-56cc5c56a51b',
   'COMPLETED', 4,
   'Trevlig och pålitlig. Lite sen men gjorde ett bra jobb när han väl var här.',
   500, NULL,
   NOW() - INTERVAL '3 months', NOW() - INTERVAL '3 months', NOW() - INTERVAL '3 months'),

  ('b1c00004-0000-4000-8000-000000000004',
   'b1b00004-0000-4000-8000-000000000004',
   'a7c9c960-b4b6-4752-8d7e-56cc5c56a51b',
   'COMPLETED', 5,
   'Räddade min flytt! Stark och positiv hela dagen. Anlitar gärna igen.',
   1200, 'Har flyttbil-vana, kan börja på lördag morgon.',
   NOW() - INTERVAL '2 months', NOW() - INTERVAL '2 months', NOW() - INTERVAL '2 months'),

  ('b1c00005-0000-4000-8000-000000000005',
   'b1b00005-0000-4000-8000-000000000005',
   'a7c9c960-b4b6-4752-8d7e-56cc5c56a51b',
   'COMPLETED', 5,
   'Lugn och ordningsam. Jag är 78 år och kände mig trygg hela tiden.',
   250, NULL,
   NOW() - INTERVAL '6 weeks', NOW() - INTERVAL '6 weeks', NOW() - INTERVAL '6 weeks'),

  ('b1c00006-0000-4000-8000-000000000006',
   'b1b00006-0000-4000-8000-000000000006',
   'a7c9c960-b4b6-4752-8d7e-56cc5c56a51b',
   'COMPLETED', 5,
   'Mycket vänlig och hjälpsam. Bar in allt och packade upp utan att jag behövde be.',
   200, NULL,
   NOW() - INTERVAL '3 weeks', NOW() - INTERVAL '3 weeks', NOW() - INTERVAL '3 weeks')
ON CONFLICT (id) DO NOTHING;

-- ----- Uppdatera target-användarens denormaliserade siffror -------------------
UPDATE users
SET
  rating_average = COALESCE((
    SELECT AVG(rating)::double precision
    FROM offers
    WHERE helper_id = 'a7c9c960-b4b6-4752-8d7e-56cc5c56a51b'
      AND status = 'COMPLETED'
      AND rating IS NOT NULL
  ), 0.0),
  rating_count = (
    SELECT COUNT(*)
    FROM offers
    WHERE helper_id = 'a7c9c960-b4b6-4752-8d7e-56cc5c56a51b'
      AND status = 'COMPLETED'
      AND rating IS NOT NULL
  ),
  completed_offers_count = (
    SELECT COUNT(*)
    FROM offers
    WHERE helper_id = 'a7c9c960-b4b6-4752-8d7e-56cc5c56a51b'
      AND status = 'COMPLETED'
  ),
  updated_at = NOW()
WHERE id = 'a7c9c960-b4b6-4752-8d7e-56cc5c56a51b';

COMMIT;

-- ----- Bekräftelse ------------------------------------------------------------
SELECT
  name,
  rating_average,
  rating_count,
  completed_offers_count
FROM users
WHERE id = 'a7c9c960-b4b6-4752-8d7e-56cc5c56a51b';

-- =============================================================================
-- CLEANUP (avkommentera och kör för att ta bort seedat data)
-- =============================================================================
-- BEGIN;
-- DELETE FROM offers WHERE id LIKE 'b1c00%';
-- DELETE FROM tasks  WHERE id LIKE 'b1b00%';
-- DELETE FROM users  WHERE id LIKE 'b1a00%';
-- UPDATE users SET rating_average = 0, rating_count = 0, completed_offers_count = 0
--   WHERE id = 'a7c9c960-b4b6-4752-8d7e-56cc5c56a51b';
-- COMMIT;
