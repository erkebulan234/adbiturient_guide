const pool = require('../config/db');

// ── Stats ────────────────────────────────────────────────────────────────────

async function getStats() {
  const tables = ['users', 'profiles', 'institutions', 'specialties', 'programs', 'recommendations'];
  const counts = await Promise.all(
    tables.map(t => pool.query(`SELECT COUNT(*) FROM ${t}`))
  );
  return Object.fromEntries(
    tables.map((t, i) => [t, Number(counts[i].rows[0].count)])
  );
}

// ── Institutions ─────────────────────────────────────────────────────────────

async function createInstitution(data) {
  const result = await pool.query(
    `INSERT INTO institutions (name, type, city, address, website, description)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING *`,
    [data.name, data.type, data.city, data.address || null, data.website || null, data.description || null]
  );
  return result.rows[0];
}

async function updateInstitution(id, data) {
  const result = await pool.query(
    `UPDATE institutions
     SET name=$1, type=$2, city=$3, address=$4, website=$5, description=$6
     WHERE id=$7
     RETURNING *`,
    [data.name, data.type, data.city, data.address || null, data.website || null, data.description || null, id]
  );
  return result.rows[0] || null;
}

async function deleteInstitution(id) {
  const result = await pool.query(
    'DELETE FROM institutions WHERE id=$1 RETURNING id',
    [id]
  );
  return result.rows[0] || null;
}

// ── Specialties ───────────────────────────────────────────────────────────────

async function createSpecialty(data) {
  const result = await pool.query(
    `INSERT INTO specialties
       (title, code, education_level, profession, description,
        required_subjects, required_skills, average_salary, demand_level, tags)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
     RETURNING *`,
    [
      data.title,
      data.code || null,
      data.educationLevel,
      data.profession || null,
      data.description || null,
      data.requiredSubjects || [],
      data.requiredSkills || [],
      data.averageSalary || null,
      data.demandLevel || null,
      data.tags || []
    ]
  );
  return result.rows[0];
}

async function updateSpecialty(id, data) {
  const result = await pool.query(
    `UPDATE specialties
     SET title=$1, code=$2, education_level=$3, profession=$4, description=$5,
         required_subjects=$6, required_skills=$7, average_salary=$8, demand_level=$9, tags=$10
     WHERE id=$11
     RETURNING *`,
    [
      data.title,
      data.code || null,
      data.educationLevel,
      data.profession || null,
      data.description || null,
      data.requiredSubjects || [],
      data.requiredSkills || [],
      data.averageSalary || null,
      data.demandLevel || null,
      data.tags || [],
      id
    ]
  );
  return result.rows[0] || null;
}

async function deleteSpecialty(id) {
  const result = await pool.query(
    'DELETE FROM specialties WHERE id=$1 RETURNING id',
    [id]
  );
  return result.rows[0] || null;
}

// ── Programs ──────────────────────────────────────────────────────────────────

async function createProgram(data) {
  const result = await pool.query(
    `INSERT INTO programs
       (institution_id, specialty_id, tuition_fee, duration_years,
        study_language, study_form, required_documents, min_score, has_grant)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
     RETURNING *`,
    [
      data.institutionId,
      data.specialtyId,
      data.tuitionFee || null,
      data.durationYears || null,
      data.studyLanguage || null,
      data.studyForm || null,
      data.requiredDocuments || [],
      data.minScore || 0,
      data.hasGrant || false
    ]
  );
  return result.rows[0];
}

async function updateProgram(id, data) {
  const result = await pool.query(
    `UPDATE programs
     SET institution_id=$1, specialty_id=$2, tuition_fee=$3, duration_years=$4,
         study_language=$5, study_form=$6, required_documents=$7, min_score=$8, has_grant=$9
     WHERE id=$10
     RETURNING *`,
    [
      data.institutionId,
      data.specialtyId,
      data.tuitionFee || null,
      data.durationYears || null,
      data.studyLanguage || null,
      data.studyForm || null,
      data.requiredDocuments || [],
      data.minScore || 0,
      data.hasGrant || false,
      id
    ]
  );
  return result.rows[0] || null;
}

async function deleteProgram(id) {
  const result = await pool.query(
    'DELETE FROM programs WHERE id=$1 RETURNING id',
    [id]
  );
  return result.rows[0] || null;
}

module.exports = {
  getStats,
  createInstitution, updateInstitution, deleteInstitution,
  createSpecialty,   updateSpecialty,   deleteSpecialty,
  createProgram,     updateProgram,     deleteProgram
};
