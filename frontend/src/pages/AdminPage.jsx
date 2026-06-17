import React, { useRef, useState } from 'react';
import api from '../api/axios';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useToast } from '../context/ToastContext';

const statLabels = {
  users: 'Пользователи', profiles: 'Анкеты', institutions: 'Заведения',
  specialties: 'Специальности', programs: 'Программы', recommendations: 'Рекомендации'
};

const TABS = [
  { id: 'institutions', label: 'Заведения' },
  { id: 'specialties',  label: 'Специальности' },
  { id: 'programs',     label: 'Программы' },
];



function splitText(v) { return v.split(',').map(s => s.trim()).filter(Boolean); }
function normalize(v) { return String(v || '').trim().toLowerCase(); }

// ── Модал подтверждения удаления ─────────────────────────────
function DeleteModal({ item, onConfirm, onCancel }) {
  if (!item) return null;
  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 200,
      background: 'rgba(25,24,23,0.32)', backdropFilter: 'blur(8px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20
    }} onMouseDown={onCancel}>
      <div style={{
        width: 'min(440px, 100%)', padding: 28, borderRadius: 24,
        background: 'var(--paper)', border: '1px solid var(--line)',
        boxShadow: '0 24px 60px rgba(25,24,23,0.18)'
      }} onMouseDown={e => e.stopPropagation()}>
        <div style={{
          width: 48, height: 48, borderRadius: '50%',
          background: '#fff1ef', color: 'var(--danger)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16
        }}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
          </svg>
        </div>
        <h3 style={{ fontSize: 20, fontWeight: 730, letterSpacing: '-0.03em', marginBottom: 8 }}>
          Удалить запись?
        </h3>
        <p style={{ color: 'var(--muted)', marginBottom: 24, fontSize: 15 }}>
          <strong style={{ color: 'var(--text)' }}>{item.name || item.title}</strong> будет удалено безвозвратно.
        </p>
        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={onCancel} style={{
            flex: 1, padding: '11px 0', borderRadius: 999,
            border: '1px solid var(--line)', background: 'var(--paper)',
            cursor: 'pointer', fontWeight: 700, fontSize: 15
          }}>
            Отмена
          </button>
          <button onClick={onConfirm} style={{
            flex: 1, padding: '11px 0', borderRadius: 999,
            border: '1px solid #efc9c3', background: '#fff7f5',
            color: 'var(--danger)', cursor: 'pointer', fontWeight: 700, fontSize: 15,
            transition: '0.16s'
          }}>
            Удалить
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Стат-карточка ─────────────────────────────────────────────
function AdminStat({ label, value }) {
  return (
    <div className="admin-stat">
      <span>{label}</span>
      <strong>{value ?? 0}</strong>
    </div>
  );
}

// ── Форма заведения ───────────────────────────────────────────
function InstitutionForm({ value, onChange, onSubmit, onCancel, isEditing, saving }) {
  return (
    <form onSubmit={onSubmit} className="stack-form">
      <label>Название<input className="input" name="name" value={value.name} onChange={onChange} required /></label>
      <label>Тип
        <select className="select" name="type" value={value.type} onChange={onChange}>
          <option value="college">Колледж</option>
          <option value="university">Университет</option>
        </select>
      </label>
      <label>Город<input className="input" name="city" value={value.city} onChange={onChange} required /></label>
      <label>Адрес<input className="input" name="address" value={value.address} onChange={onChange} /></label>
      <label>Сайт<input className="input" name="website" value={value.website} onChange={onChange} /></label>
      <label>Описание<textarea className="textarea" name="description" value={value.description} onChange={onChange} rows="3" /></label>
      <div style={{ display: 'flex', gap: 10 }}>
        {isEditing && (
          <button type="button" onClick={onCancel} style={{
            flex: 1, padding: '11px 0', borderRadius: 999,
            border: '1px solid var(--line)', background: 'var(--paper)',
            cursor: 'pointer', fontWeight: 700
          }}>Отмена</button>
        )}
        <button className="primary-button" type="submit" style={{ flex: 2 }} disabled={saving}>
          {saving
            ? <><span className="button-spinner" /> Сохраняем…</>
            : isEditing ? 'Сохранить изменения' : 'Добавить'
          }
        </button>
      </div>
    </form>
  );
}

// ── Форма специальности ───────────────────────────────────────
function SpecialtyForm({ value, onChange, onSubmit, onCancel, isEditing, saving }) {
  return (
    <form onSubmit={onSubmit} className="stack-form">
      <label>Название<input className="input" name="title" value={value.title} onChange={onChange} required /></label>
      <label>Код<input className="input" name="code" value={value.code} onChange={onChange} /></label>
      <label>Уровень
        <select className="select" name="educationLevel" value={value.educationLevel} onChange={onChange}>
          <option value="grade_9">После 9 класса</option>
          <option value="grade_11">После 11 класса</option>
        </select>
      </label>
      <label>Профессия<input className="input" name="profession" value={value.profession} onChange={onChange} /></label>
      <label>Описание<textarea className="textarea" name="description" value={value.description} onChange={onChange} rows="3" /></label>
      <label>Предметы через запятую<input className="input" name="requiredSubjects" value={value.requiredSubjects} onChange={onChange} /></label>
      <label>Навыки через запятую<input className="input" name="requiredSkills" value={value.requiredSkills} onChange={onChange} /></label>
      <label>Средняя зарплата<input className="input" name="averageSalary" value={value.averageSalary} onChange={onChange} /></label>
      <label>Востребованность<input className="input" name="demandLevel" value={value.demandLevel} onChange={onChange} /></label>
      <label>Теги через запятую<input className="input" name="tags" value={value.tags} onChange={onChange} /></label>
      <div style={{ display: 'flex', gap: 10 }}>
        {isEditing && (
          <button type="button" onClick={onCancel} style={{
            flex: 1, padding: '11px 0', borderRadius: 999,
            border: '1px solid var(--line)', background: 'var(--paper)',
            cursor: 'pointer', fontWeight: 700
          }}>Отмена</button>
        )}
        <button className="primary-button" type="submit" style={{ flex: 2 }} disabled={saving}>
          {saving
            ? <><span className="button-spinner" /> Сохраняем…</>
            : isEditing ? 'Сохранить изменения' : 'Добавить'
          }
        </button>
      </div>
    </form>
  );
}

// ── Форма программы ───────────────────────────────────────────
function ProgramForm({ value, onChange, onSubmit, onCancel, isEditing, institutions, specialties, saving }) {
  return (
    <form onSubmit={onSubmit} className="stack-form">
      <label>Учебное заведение
        <select className="select" name="institutionId" value={value.institutionId} onChange={onChange} required>
          <option value="">Выберите заведение</option>
          {institutions.map(i => (
            <option key={i.id} value={i.id}>{i.name} — {i.type === 'college' ? 'колледж' : 'университет'} — {i.city}</option>
          ))}
        </select>
      </label>
      <label>Специальность
        <select className="select" name="specialtyId" value={value.specialtyId} onChange={onChange} required>
          <option value="">Выберите специальность</option>
          {specialties.map(s => (
            <option key={s.id} value={s.id}>{s.title} — {s.education_level === 'grade_9' ? 'после 9 класса' : 'после 11 класса'}</option>
          ))}
        </select>
      </label>
      <label>Стоимость<input className="input" name="tuitionFee" value={value.tuitionFee} onChange={onChange} /></label>
      <label>Срок обучения<input className="input" name="durationYears" value={value.durationYears} onChange={onChange} /></label>
      <label>Язык<input className="input" name="studyLanguage" value={value.studyLanguage} onChange={onChange} /></label>
      <label>Форма<input className="input" name="studyForm" value={value.studyForm} onChange={onChange} /></label>
      <label>Документы через запятую<input className="input" name="requiredDocuments" value={value.requiredDocuments} onChange={onChange} /></label>
      <label>Минимальный балл<input className="input" name="minScore" value={value.minScore} onChange={onChange} /></label>
      <label className="checkbox-field">
        <input type="checkbox" name="hasGrant" checked={value.hasGrant} onChange={onChange} />
        Есть грант
      </label>
      <div style={{ display: 'flex', gap: 10 }}>
        {isEditing && (
          <button type="button" onClick={onCancel} style={{
            flex: 1, padding: '11px 0', borderRadius: 999,
            border: '1px solid var(--line)', background: 'var(--paper)',
            cursor: 'pointer', fontWeight: 700
          }}>Отмена</button>
        )}
        <button className="primary-button" type="submit" style={{ flex: 2 }} disabled={saving}>
          {saving
            ? <><span className="button-spinner" /> Сохраняем…</>
            : isEditing ? 'Сохранить изменения' : 'Добавить'
          }
        </button>
      </div>
    </form>
  );
}

// ── Главный компонент ─────────────────────────────────────────
export default function AdminPage() {
  const queryClient = useQueryClient();
  const { showToast } = useToast();

  const [activeTab, setActiveTab] = useState('institutions');
  const [deleteTarget, setDeleteTarget] = useState(null); // { type, item }

  const [editingInstitutionId, setEditingInstitutionId] = useState(null);
  const [editingSpecialtyId,   setEditingSpecialtyId]   = useState(null);
  const [editingProgramId,     setEditingProgramId]     = useState(null);
  const [saving, setSaving] = useState(false);

  const formRef = useRef(null);

  const EMPTY_INSTITUTION = { name: '', type: 'college', city: '', address: '', website: '', description: '' };
  const EMPTY_SPECIALTY   = { title: '', code: '', educationLevel: 'grade_9', profession: '', description: '', requiredSubjects: '', requiredSkills: '', averageSalary: '', demandLevel: '', tags: '' };
  const EMPTY_PROGRAM     = { institutionId: '', specialtyId: '', tuitionFee: '', durationYears: '', studyLanguage: '', studyForm: '', requiredDocuments: '', minScore: '', hasGrant: false };

  const [institution, setInstitution] = useState(EMPTY_INSTITUTION);
  const [specialty,   setSpecialty]   = useState(EMPTY_SPECIALTY);
  const [program,     setProgram]     = useState(EMPTY_PROGRAM);

  const { data: stats }           = useQuery({ queryKey: ['admin', 'stats'],         queryFn: async () => (await api.get('/admin/stats')).data });
  const { data: institutions = [] } = useQuery({ queryKey: ['admin', 'institutions'], queryFn: async () => (await api.get('/api/institutions')).data });
  const { data: specialties = [] }  = useQuery({ queryKey: ['admin', 'specialties'],  queryFn: async () => (await api.get('/api/specialties')).data });
  const { data: programs = [] }     = useQuery({ queryKey: ['admin', 'programs'],     queryFn: async () => (await api.get('/api/programs?limit=1000')).data.items });

  const tabCounts = {
    institutions: institutions.length,
    specialties:  specialties.length,
    programs:     programs.length,
  };

  const [search, setSearch] = useState('');

  const filteredInstitutions = institutions.filter(i =>
    normalize(i.name).includes(normalize(search)) ||
    normalize(i.city).includes(normalize(search))
  );
  const filteredSpecialties = specialties.filter(s =>
    normalize(s.title).includes(normalize(search)) ||
    normalize(s.profession || '').includes(normalize(search))
  );
  const filteredPrograms = programs.filter(p =>
    normalize(p.specialty_title).includes(normalize(search)) ||
    normalize(p.institution_name).includes(normalize(search))
  );

  function invalidateAll() {
    ['admin', 'programs', 'specialties', 'institutions'].forEach(k =>
      queryClient.invalidateQueries({ queryKey: [k] })
    );
  }

  function scrollToForm() {
    setTimeout(() => formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 50);
  }

  // ── Институции ───────────────────────────────────────────────
  async function submitInstitution(e) {
    e.preventDefault();
    const exists = institutions.some(i =>
      i.id !== editingInstitutionId &&
      normalize(i.name) === normalize(institution.name) &&
      normalize(i.city) === normalize(institution.city)
    );
    if (exists) { showToast({ tone: 'danger', title: 'Уже существует' }); return; }
    setSaving(true);
    try {
      const res = editingInstitutionId
        ? await api.put(`/admin/institutions/${editingInstitutionId}`, institution)
        : await api.post('/admin/institutions', institution);
      showToast({ title: res.data.message || 'Сохранено' });
      cancelInstitution();
      invalidateAll();
    } catch (err) {
      showToast({ tone: 'danger', title: 'Ошибка', description: err.response?.data?.message || 'Попробуйте ещё раз' });
    } finally {
      setSaving(false);
    }
  }

  function editInstitution(item) {
    setEditingInstitutionId(item.id);
    setInstitution({ name: item.name || '', type: item.type || 'college', city: item.city || '', address: item.address || '', website: item.website || '', description: item.description || '' });
    setActiveTab('institutions');
    scrollToForm();
  }

  function cancelInstitution() {
    setEditingInstitutionId(null);
    setInstitution(EMPTY_INSTITUTION);
  }

  async function confirmDelete() {
    const { type, item } = deleteTarget;
    try {
      if (type === 'institution') await api.delete(`/admin/institutions/${item.id}`);
      if (type === 'specialty')   await api.delete(`/admin/specialties/${item.id}`);
      if (type === 'program')     await api.delete(`/admin/programs/${item.id}`);
      showToast({ title: 'Удалено' });
      invalidateAll();
    } catch (err) {
      showToast({ tone: 'danger', title: 'Ошибка', description: err.response?.data?.message || 'Попробуйте ещё раз' });
    } finally {
      setDeleteTarget(null); // ← было setSaving(false), должно быть это
    }
  }

  // ── Специальности ────────────────────────────────────────────
  async function submitSpecialty(e) {
    e.preventDefault();
    const exists = specialties.some(s =>
      s.id !== editingSpecialtyId &&
      normalize(s.title) === normalize(specialty.title) &&
      normalize(s.education_level) === normalize(specialty.educationLevel)
    );
    if (exists) { showToast({ tone: 'danger', title: 'Уже существует' }); return; }
    setSaving(true);
    try {
      const payload = { ...specialty, requiredSubjects: splitText(specialty.requiredSubjects), requiredSkills: splitText(specialty.requiredSkills), tags: splitText(specialty.tags) };
      const res = editingSpecialtyId
        ? await api.put(`/admin/specialties/${editingSpecialtyId}`, payload)
        : await api.post('/admin/specialties', payload);
      showToast({ title: res.data.message || 'Сохранено' });
      cancelSpecialty();
      invalidateAll();
    } catch (err) {
      showToast({ tone: 'danger', title: 'Ошибка', description: err.response?.data?.message });
    }
    finally {
      setSaving(false);
    }
  }

  function editSpecialty(item) {
    setEditingSpecialtyId(item.id);
    setSpecialty({ title: item.title || '', code: item.code || '', educationLevel: item.education_level || 'grade_9', profession: item.profession || '', description: item.description || '', requiredSubjects: (item.required_subjects || []).join(', '), requiredSkills: (item.required_skills || []).join(', '), averageSalary: item.average_salary || '', demandLevel: item.demand_level || '', tags: (item.tags || []).join(', ') });
    setActiveTab('specialties');
    scrollToForm();
  }

  function cancelSpecialty() {
    setEditingSpecialtyId(null);
    setSpecialty(EMPTY_SPECIALTY);
  }

  // ── Программы ────────────────────────────────────────────────
  async function submitProgram(e) {
    e.preventDefault();
    const exists = programs.some(p =>
      p.id !== editingProgramId &&
      Number(p.institution_id) === Number(program.institutionId) &&
      Number(p.specialty_id)   === Number(program.specialtyId)
    );
    if (exists) { showToast({ tone: 'danger', title: 'Уже существует' }); return; }
    setSaving(true);
    try {
      const payload = { ...program, institutionId: Number(program.institutionId), specialtyId: Number(program.specialtyId), tuitionFee: Number(program.tuitionFee), durationYears: Number(program.durationYears), minScore: Number(program.minScore), requiredDocuments: splitText(program.requiredDocuments) };
      const res = editingProgramId
        ? await api.put(`/admin/programs/${editingProgramId}`, payload)
        : await api.post('/admin/programs', payload);
      showToast({ title: res.data.message || 'Сохранено' });
      cancelProgram();
      invalidateAll();
    } catch (err) {
      showToast({ tone: 'danger', title: 'Ошибка', description: err.response?.data?.message || 'Попробуйте ещё раз' });
    } finally {
      setSaving(false);
    }
  }

  function editProgram(item) {
    setEditingProgramId(item.id);
    setProgram({ institutionId: item.institution_id || '', specialtyId: item.specialty_id || '', tuitionFee: item.tuition_fee || '', durationYears: item.duration_years || '', studyLanguage: item.study_language || '', studyForm: item.study_form || '', requiredDocuments: (item.required_documents || []).join(', '), minScore: item.min_score || '', hasGrant: Boolean(item.has_grant) });
    setActiveTab('programs');
    scrollToForm();
  }

  function cancelProgram() {
    setEditingProgramId(null);
    setProgram(EMPTY_PROGRAM);
  }

  const isEditing = {
    institutions: !!editingInstitutionId,
    specialties:  !!editingSpecialtyId,
    programs:     !!editingProgramId,
  };

  return (
    <main className="page admin-page">
      <DeleteModal
        item={deleteTarget?.item}
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />

      <section className="results-header">
        <div>
          <p className="kicker">Администрирование</p>
          <h1>Управление каталогом</h1>
          <p className="lead">Добавляйте заведения, специальности и программы.</p>
        </div>
      </section>

      {stats && (
        <section className="admin-stats">
          {Object.entries(statLabels).map(([key, label]) => (
            <AdminStat label={label} value={stats[key]} key={key} />
          ))}
        </section>
      )}

      {/* Вкладки */}
      <div style={{ display: 'flex', gap: 4, padding: 4, border: '1px solid var(--line)', borderRadius: 999, background: 'var(--paper-soft)', width: 'fit-content', marginBottom: 24 }}>
        {TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => { setActiveTab(tab.id); setSearch(''); }}
            style={{
              padding: '8px 20px', borderRadius: 999, border: 'none', cursor: 'pointer',
              fontWeight: 720, fontSize: 14, transition: '0.18s',
              background: activeTab === tab.id ? 'var(--text)' : 'transparent',
              color: activeTab === tab.id ? 'var(--bg)' : 'var(--text)',
            }}
          >
            {tab.label}
            {tabCounts[tab.id] > 0 && (
              <span style={{
                marginLeft: 7,
                padding: '1px 7px',
                borderRadius: 999,
                fontSize: 12,
                fontWeight: 700,
                background: activeTab === tab.id ? 'rgba(128,128,128,0.25)' : 'var(--line)',
                color: activeTab === tab.id ? 'var(--bg)' : 'var(--muted)',
              }}>
                {tabCounts[tab.id]}
              </span>
            )}
            {isEditing[tab.id] && (
              <span style={{ marginLeft: 6, width: 6, height: 6, borderRadius: '50%', background: '#f59e0b', display: 'inline-block', verticalAlign: 'middle' }} />
            )}
          </button>
        ))}
      </div>

      {/* Форма + список для активной вкладки */}
      <div className="admin-form-layout">

        {/* Форма */}
        <article className="panel admin-form" ref={formRef}>
          {activeTab === 'institutions' && (
            <>
              <p className="kicker">Учебные заведения</p>
              <h2>{editingInstitutionId ? 'Редактировать заведение' : 'Добавить заведение'}</h2>
              <InstitutionForm
                saving={saving}
                value={institution}
                onChange={e => setInstitution({ ...institution, [e.target.name]: e.target.value })}
                onSubmit={submitInstitution}
                onCancel={cancelInstitution}
                isEditing={!!editingInstitutionId}
              />
            </>
          )}
          {activeTab === 'specialties' && (
            <>
              <p className="kicker">Специальности</p>
              <h2>{editingSpecialtyId ? 'Редактировать специальность' : 'Добавить специальность'}</h2>
              <SpecialtyForm
                saving={saving}
                value={specialty}
                onChange={e => setSpecialty({ ...specialty, [e.target.name]: e.target.value })}
                onSubmit={submitSpecialty}
                onCancel={cancelSpecialty}
                isEditing={!!editingSpecialtyId}
              />
            </>
          )}
          {activeTab === 'programs' && (
            <>
              <p className="kicker">Программы</p>
              <h2>{editingProgramId ? 'Редактировать программу' : 'Добавить программу'}</h2>
              <ProgramForm
                saving={saving}
                value={program}
                onChange={e => {
                  const { name, value: v, type, checked } = e.target;
                  setProgram({ ...program, [name]: type === 'checkbox' ? checked : v });
                }}
                onSubmit={submitProgram}
                onCancel={cancelProgram}
                isEditing={!!editingProgramId}
                institutions={institutions}
                specialties={specialties}
              />
            </>
          )}
        </article>

        {/* Список */}
        <article className="panel">
            <input
              className="input"
              placeholder="Поиск…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{ marginBottom: 16 }}
            />
          {activeTab === 'institutions' && (
            <>
              <h2 style={{ marginBottom: 16 }}>Заведения <span style={{ color: 'var(--muted)', fontWeight: 600, fontSize: 16 }}>({institutions.length})</span></h2>
              <div className="admin-list">
                {filteredInstitutions.map(item => (
                  <div className="admin-list-row" key={item.id} style={{ background: editingInstitutionId === item.id ? 'var(--accent-soft)' : undefined }}>
                    <div>
                      <strong>{item.name}</strong>
                      <span>{item.type === 'college' ? 'Колледж' : 'Университет'} · {item.city}</span>
                    </div>
                    <div className="row-actions">
                      <button className="secondary-button" onClick={() => editInstitution(item)}>Изменить</button>
                      <button className="danger-button" onClick={() => setDeleteTarget({ type: 'institution', item })}>Удалить</button>
                    </div>
                  </div>
                ))}
                {filteredInstitutions.length === 0 && <p style={{ padding: 16, color: 'var(--muted)' }}>{search ? 'Ничего не найдено' : 'Пока нет заведений'}</p>}
              </div>
            </>
          )}
          {activeTab === 'specialties' && (
            <>
              <h2 style={{ marginBottom: 16 }}>Специальности <span style={{ color: 'var(--muted)', fontWeight: 600, fontSize: 16 }}>({specialties.length})</span></h2>
              <div className="admin-list">
                {filteredSpecialties.map(item => (
                  <div className="admin-list-row" key={item.id} style={{ background: editingSpecialtyId === item.id ? 'var(--accent-soft)' : undefined }}>
                    <div>
                      <strong>{item.title}</strong>
                      <span>{item.education_level === 'grade_9' ? 'После 9 класса' : 'После 11 класса'} · {item.profession || 'профессия не указана'}</span>
                    </div>
                    <div className="row-actions">
                      <button className="secondary-button" onClick={() => editSpecialty(item)}>Изменить</button>
                      <button className="danger-button" onClick={() => setDeleteTarget({ type: 'specialty', item })}>Удалить</button>
                    </div>
                  </div>
                ))}
                {filteredSpecialties.length === 0 && <p style={{ padding: 16, color: 'var(--muted)' }}>{search ? 'Ничего не найдено' : 'Пока нет специальностей'}</p>}
              </div>
            </>
          )}
          {activeTab === 'programs' && (
            <>
              <h2 style={{ marginBottom: 16 }}>Программы <span style={{ color: 'var(--muted)', fontWeight: 600, fontSize: 16 }}>({programs.length})</span></h2>
              <div className="admin-list">
                {filteredPrograms.map(item => (
                  <div className="admin-list-row" key={item.id} style={{ background: editingProgramId === item.id ? 'var(--accent-soft)' : undefined }}>
                    <div>
                      <strong>{item.specialty_title}</strong>
                      <span>{item.institution_name} · {item.tuition_fee ? `${Number(item.tuition_fee).toLocaleString('ru-RU')} тг/год` : 'стоимость не указана'}</span>
                    </div>
                    <div className="row-actions">
                      <button className="secondary-button" onClick={() => editProgram(item)}>Изменить</button>
                      <button className="danger-button" onClick={() => setDeleteTarget({ type: 'program', item: { ...item, name: item.specialty_title } })}>Удалить</button>
                    </div>
                  </div>
                ))}
                {filteredPrograms.length === 0 && <p style={{ padding: 16, color: 'var(--muted)' }}>{search ? 'Ничего не найдено' : 'Пока нет программ'}</p>}
              </div>
            </>
          )}
        </article>
      </div>
    </main>
  );
}