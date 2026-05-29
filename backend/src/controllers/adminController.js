const pool = require('../config/db');

async function getStats(req, res) {
  try {
    const users = await pool.query('SELECT COUNT(*) FROM users');
    const profiles = await pool.query('SELECT COUNT(*) FROM profiles');
    const institutions = await pool.query('SELECT COUNT(*) FROM institutions');
    const specialties = await pool.query('SELECT COUNT(*) FROM specialties');
    const programs = await pool.query('SELECT COUNT(*) FROM programs');
    const recommendations = await pool.query('SELECT COUNT(*) FROM recommendations');

    res.json({
      users: Number(users.rows[0].count),
      profiles: Number(profiles.rows[0].count),
      institutions: Number(institutions.rows[0].count),
      specialties: Number(specialties.rows[0].count),
      programs: Number(programs.rows[0].count),
      recommendations: Number(recommendations.rows[0].count)
    });
  } catch (error) {
    res.status(500).json({ message: 'Ошибка получения статистики', error: error.message });
  }
}

async function createInstitution(req, res) {
  try {
    const { name, type, city, address, website, description } = req.body;

    const result = await pool.query(
      `
      INSERT INTO institutions (name, type, city, address, website, description)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
      `,
      [name, type, city, address || null, website || null, description || null]
    );

    res.status(201).json({
      message: 'Учебное заведение добавлено',
      institution: result.rows[0]
    });
  } catch (error) {
    res.status(500).json({ message: 'Ошибка добавления учебного заведения', error: error.message });
  }
}

async function createSpecialty(req, res) {
  try {
    const {
      title,
      code,
      educationLevel,
      profession,
      description,
      requiredSubjects,
      requiredSkills,
      averageSalary,
      demandLevel,
      tags
    } = req.body;

    const result = await pool.query(
      `
      INSERT INTO specialties (
        title,
        code,
        education_level,
        profession,
        description,
        required_subjects,
        required_skills,
        average_salary,
        demand_level,
        tags
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING *
      `,
      [
        title,
        code || null,
        educationLevel,
        profession || null,
        description || null,
        requiredSubjects || [],
        requiredSkills || [],
        averageSalary || null,
        demandLevel || null,
        tags || []
      ]
    );

    res.status(201).json({
      message: 'Специальность добавлена',
      specialty: result.rows[0]
    });
  } catch (error) {
    res.status(500).json({ message: 'Ошибка добавления специальности', error: error.message });
  }
}

async function createProgram(req, res) {
  try {
    const {
      institutionId,
      specialtyId,
      tuitionFee,
      durationYears,
      studyLanguage,
      studyForm,
      requiredDocuments,
      minScore,
      hasGrant
    } = req.body;

    const result = await pool.query(
      `
      INSERT INTO programs (
        institution_id,
        specialty_id,
        tuition_fee,
        duration_years,
        study_language,
        study_form,
        required_documents,
        min_score,
        has_grant
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *
      `,
      [
        institutionId,
        specialtyId,
        tuitionFee || null,
        durationYears || null,
        studyLanguage || null,
        studyForm || null,
        requiredDocuments || [],
        minScore || 0,
        hasGrant || false
      ]
    );

    res.status(201).json({
      message: 'Образовательная программа добавлена',
      program: result.rows[0]
    });
  } catch (error) {
    res.status(500).json({ message: 'Ошибка добавления программы', error: error.message });
  }
}

async function updateInstitution(req, res) {
  try {
    const { name, type, city, address, website, description } = req.body;

    const result = await pool.query(
      `
      UPDATE institutions
      SET name = $1,
          type = $2,
          city = $3,
          address = $4,
          website = $5,
          description = $6
      WHERE id = $7
      RETURNING *
      `,
      [name, type, city, address || null, website || null, description || null, req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Учебное заведение не найдено' });
    }

    res.json({ message: 'Учебное заведение обновлено', institution: result.rows[0] });
  } catch (error) {
    if (error.code === '23505') {
      return res.status(400).json({ message: 'Такое учебное заведение уже существует' });
    }

    res.status(500).json({ message: 'Ошибка обновления учебного заведения', error: error.message });
  }
}

async function deleteInstitution(req, res) {
  try {
    const result = await pool.query(
      'DELETE FROM institutions WHERE id = $1 RETURNING *',
      [req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Учебное заведение не найдено' });
    }

    res.json({ message: 'Учебное заведение удалено' });
  } catch (error) {
    res.status(500).json({ message: 'Ошибка удаления учебного заведения', error: error.message });
  }
}

async function updateSpecialty(req, res) {
  try {
    const {
      title,
      code,
      educationLevel,
      profession,
      description,
      requiredSubjects,
      requiredSkills,
      averageSalary,
      demandLevel,
      tags
    } = req.body;

    const result = await pool.query(
      `
      UPDATE specialties
      SET title = $1,
          code = $2,
          education_level = $3,
          profession = $4,
          description = $5,
          required_subjects = $6,
          required_skills = $7,
          average_salary = $8,
          demand_level = $9,
          tags = $10
      WHERE id = $11
      RETURNING *
      `,
      [
        title,
        code || null,
        educationLevel,
        profession || null,
        description || null,
        requiredSubjects || [],
        requiredSkills || [],
        averageSalary || null,
        demandLevel || null,
        tags || [],
        req.params.id
      ]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Специальность не найдена' });
    }

    res.json({ message: 'Специальность обновлена', specialty: result.rows[0] });
  } catch (error) {
    if (error.code === '23505') {
      return res.status(400).json({ message: 'Такая специальность уже существует' });
    }

    res.status(500).json({ message: 'Ошибка обновления специальности', error: error.message });
  }
}

async function deleteSpecialty(req, res) {
  try {
    const result = await pool.query(
      'DELETE FROM specialties WHERE id = $1 RETURNING *',
      [req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Специальность не найдена' });
    }

    res.json({ message: 'Специальность удалена' });
  } catch (error) {
    res.status(500).json({ message: 'Ошибка удаления специальности', error: error.message });
  }
}

async function updateProgram(req, res) {
  try {
    const {
      institutionId,
      specialtyId,
      tuitionFee,
      durationYears,
      studyLanguage,
      studyForm,
      requiredDocuments,
      minScore,
      hasGrant
    } = req.body;

    const result = await pool.query(
      `
      UPDATE programs
      SET institution_id = $1,
          specialty_id = $2,
          tuition_fee = $3,
          duration_years = $4,
          study_language = $5,
          study_form = $6,
          required_documents = $7,
          min_score = $8,
          has_grant = $9
      WHERE id = $10
      RETURNING *
      `,
      [
        institutionId,
        specialtyId,
        tuitionFee || null,
        durationYears || null,
        studyLanguage || null,
        studyForm || null,
        requiredDocuments || [],
        minScore || 0,
        hasGrant || false,
        req.params.id
      ]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Программа не найдена' });
    }

    res.json({ message: 'Программа обновлена', program: result.rows[0] });
  } catch (error) {
    if (error.code === '23505') {
      return res.status(400).json({ message: 'Такая программа уже существует' });
    }

    res.status(500).json({ message: 'Ошибка обновления программы', error: error.message });
  }
}

async function deleteProgram(req, res) {
  try {
    const result = await pool.query(
      'DELETE FROM programs WHERE id = $1 RETURNING *',
      [req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Программа не найдена' });
    }

    res.json({ message: 'Программа удалена' });
  } catch (error) {
    res.status(500).json({ message: 'Ошибка удаления программы', error: error.message });
  }
}

module.exports = {
  getStats,
  createInstitution,
  createSpecialty,
  createProgram,
  updateInstitution,
  deleteInstitution,
  updateSpecialty,
  deleteSpecialty,
  updateProgram,
  deleteProgram
};