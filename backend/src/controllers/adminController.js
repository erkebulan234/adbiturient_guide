import * as adminService from '../services/adminService.js';

// ── Stats ─────────────────────────────────────────────────────────────────────

async function getStats(req, res, next) {
  try {
    res.json(await adminService.getStats());
  } catch (error) {
    next(error);
  }
}

// ── Institutions ──────────────────────────────────────────────────────────────

async function createInstitution(req, res, next) {
  try {
    const institution = await adminService.createInstitution(req.body);
    res.status(201).json({ message: 'Учебное заведение добавлено', institution });
  } catch (error) {
    next(error);
  }
}

async function updateInstitution(req, res, next) {
  try {
    const institution = await adminService.updateInstitution(req.params.id, req.body);
    res.json({ message: 'Учебное заведение обновлено', institution });
  } catch (error) {
    next(error);
  }
}

async function deleteInstitution(req, res, next) {
  try {
    await adminService.deleteInstitution(req.params.id);
    res.json({ message: 'Учебное заведение удалено' });
  } catch (error) {
    next(error);
  }
}

// ── Specialties ───────────────────────────────────────────────────────────────

async function createSpecialty(req, res, next) {
  try {
    const specialty = await adminService.createSpecialty(req.body);
    res.status(201).json({ message: 'Специальность добавлена', specialty });
  } catch (error) {
    next(error);
  }
}

async function updateSpecialty(req, res, next) {
  try {
    const specialty = await adminService.updateSpecialty(req.params.id, req.body);
    res.json({ message: 'Специальность обновлена', specialty });
  } catch (error) {
    next(error);
  }
}

async function deleteSpecialty(req, res, next) {
  try {
    await adminService.deleteSpecialty(req.params.id);
    res.json({ message: 'Специальность удалена' });
  } catch (error) {
    next(error);
  }
}

// ── Programs ──────────────────────────────────────────────────────────────────

async function createProgram(req, res, next) {
  try {
    const program = await adminService.createProgram(req.body);
    res.status(201).json({ message: 'Образовательная программа добавлена', program });
  } catch (error) {
    next(error);
  }
}

async function updateProgram(req, res, next) {
  try {
    const program = await adminService.updateProgram(req.params.id, req.body);
    res.json({ message: 'Программа обновлена', program });
  } catch (error) {
    next(error);
  }
}

async function deleteProgram(req, res, next) {
  try {
    await adminService.deleteProgram(req.params.id);
    res.json({ message: 'Программа удалена' });
  } catch (error) {
    next(error);
  }
}

export {
  getStats,
  createInstitution, updateInstitution, deleteInstitution,
  createSpecialty,   updateSpecialty,   deleteSpecialty,
  createProgram,     updateProgram,     deleteProgram
};
