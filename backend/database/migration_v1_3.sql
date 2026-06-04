-- 1. Балл ЕНТ и нежелательные предметы/сферы в профиле
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS ent_score       INTEGER,
  ADD COLUMN IF NOT EXISTS dislike_subjects TEXT[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS dislike_fields   TEXT[] DEFAULT '{}';

-- 2. Статистика взаимодействий — фундамент для Collaborative Filtering v2.0
--    event: 'view' | 'save' | 'apply' | 'dismiss'
CREATE TABLE IF NOT EXISTS recommendation_events (
  id                SERIAL PRIMARY KEY,
  user_id           INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  recommendation_id INTEGER REFERENCES recommendations(id) ON DELETE SET NULL,
  program_id        INTEGER REFERENCES programs(id)        ON DELETE SET NULL,
  specialty_id      INTEGER REFERENCES specialties(id)     ON DELETE SET NULL,
  event             VARCHAR(30) NOT NULL,
  created_at        TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_rec_events_user    ON recommendation_events(user_id);
CREATE INDEX IF NOT EXISTS idx_rec_events_program ON recommendation_events(program_id);
CREATE INDEX IF NOT EXISTS idx_rec_events_event   ON recommendation_events(event);