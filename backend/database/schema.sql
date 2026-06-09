CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(120),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role VARCHAR(30) DEFAULT 'user',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS profiles (
  id SERIAL PRIMARY KEY,
  user_id INTEGER UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  education_level VARCHAR(30),
  city VARCHAR(120),
  interests TEXT[],
  subjects TEXT[],
  skills TEXT[],
  career_goals TEXT,
  ent_score INTEGER,
  dislike_subjects TEXT[] DEFAULT '{}',
  dislike_fields TEXT[] DEFAULT '{}',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS institutions (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  type VARCHAR(30) NOT NULL,
  city VARCHAR(120),
  address TEXT,
  website TEXT,
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS specialties (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  code VARCHAR(50),
  education_level VARCHAR(30) NOT NULL,
  profession VARCHAR(255),
  description TEXT,
  required_subjects TEXT[],
  required_skills TEXT[],
  average_salary VARCHAR(120),
  demand_level VARCHAR(120),
  tags TEXT[],
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS programs (
  id SERIAL PRIMARY KEY,
  institution_id INTEGER REFERENCES institutions(id) ON DELETE CASCADE,
  specialty_id INTEGER REFERENCES specialties(id) ON DELETE CASCADE,
  tuition_fee INTEGER,
  duration_years INTEGER,
  study_language VARCHAR(80),
  study_form VARCHAR(80),
  required_documents TEXT[],
  min_score INTEGER,
  has_grant BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS tests (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS questions (
  id SERIAL PRIMARY KEY,
  test_id INTEGER REFERENCES tests(id) ON DELETE CASCADE,
  question_text TEXT NOT NULL,
  category VARCHAR(120)
);

CREATE TABLE IF NOT EXISTS answers (
  id SERIAL PRIMARY KEY,
  question_id INTEGER REFERENCES questions(id) ON DELETE CASCADE,
  answer_text TEXT NOT NULL,
  score INTEGER DEFAULT 0,
  tag VARCHAR(120)
);

CREATE TABLE IF NOT EXISTS test_results (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  test_id INTEGER REFERENCES tests(id) ON DELETE CASCADE,
  result_tags TEXT[],
  total_score INTEGER,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS recommendations (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  specialty_id INTEGER REFERENCES specialties(id) ON DELETE CASCADE,
  program_id INTEGER REFERENCES programs(id) ON DELETE SET NULL,
  score INTEGER NOT NULL,
  reason TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS recommendation_events (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  recommendation_id INTEGER REFERENCES recommendations(id) ON DELETE SET NULL,
  program_id INTEGER REFERENCES programs(id) ON DELETE SET NULL,
  specialty_id INTEGER REFERENCES specialties(id) ON DELETE SET NULL,
  event VARCHAR(30) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_institutions_type_city ON institutions(type, city);
CREATE INDEX IF NOT EXISTS idx_specialties_education_level ON specialties(education_level);
CREATE INDEX IF NOT EXISTS idx_programs_institution_id ON programs(institution_id);
CREATE INDEX IF NOT EXISTS idx_programs_specialty_id ON programs(specialty_id);
CREATE INDEX IF NOT EXISTS idx_test_results_user_created ON test_results(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_recommendations_user_score ON recommendations(user_id, score DESC);
CREATE INDEX IF NOT EXISTS idx_rec_events_user ON recommendation_events(user_id);
CREATE INDEX IF NOT EXISTS idx_rec_events_program ON recommendation_events(program_id);
CREATE INDEX IF NOT EXISTS idx_rec_events_event ON recommendation_events(event);
