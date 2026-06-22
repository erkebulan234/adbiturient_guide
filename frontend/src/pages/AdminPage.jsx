import React, { useRef, useState } from 'react';
import api from '../api/axios';
import DeleteModal from '../components/DeleteModal';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useToast } from '../context/ToastContext';
import InstitutionForm from '../components/InstitutionForm';
import SpecialtyForm   from '../components/SpecialtyForm';
import ProgramForm     from '../components/ProgramForm';

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



// ── Стат-карточка ─────────────────────────────────────────────
function AdminStat({ label, value }) {
  return (
    <div className="admin-stat">
      <span>{label}</span>
      <strong>{value ?? 0}</strong>
    </div>
  );
}



// ── Главный компонент ─────────────────────────────────────────
export default function AdminPage() {
  const queryClient = useQueryClient();
  const { showToast } = useToast();

  const [activeTab, setActiveTab] = useState('institutions');
  const [deleteTarget, setDeleteTarget] = useState(null); // { type, item }
  const [isDeleting, setIsDeleting] = React.useState(false);

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

  const [institutionErrors, setInstitutionErrors] = useState({});
  const [specialtyErrors,   setSpecialtyErrors]   = useState({});
  const [programErrors,     setProgramErrors]     = useState({});

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
    setInstitutionErrors({});
    const exists = institutions.some(i =>
      (editingInstitutionId === null || Number(i.id) !== Number(editingInstitutionId)) &&
      normalize(i.name) === normalize(institution.name) &&
      normalize(i.city) === normalize(institution.city)
    );
    if (exists) {
      setInstitutionErrors({ name: 'Заведение с этим названием и городом уже есть' });
      showToast({ tone: 'danger', title: 'Уже существует' });
      return;
    }
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
    setInstitutionErrors({});
  }

  async function confirmDelete() {
    const { type, item } = deleteTarget;
    setIsDeleting(true);
    try {
      if (type === 'institution') await api.delete(`/admin/institutions/${item.id}`);
      if (type === 'specialty')   await api.delete(`/admin/specialties/${item.id}`);
      if (type === 'program')     await api.delete(`/admin/programs/${item.id}`);
      showToast({ title: 'Удалено' });
      invalidateAll();
      setDeleteTarget(null);
    } catch (err) {
      showToast({ tone: 'danger', title: 'Ошибка', description: err.response?.data?.message || 'Попробуйте ещё раз' });
    } finally {
      setIsDeleting(false);
    }
  }

  // ── Специальности ────────────────────────────────────────────
  async function submitSpecialty(e) {
    e.preventDefault();
    setSpecialtyErrors({});
    const exists = specialties.some(s =>
      (editingSpecialtyId === null || Number(s.id) !== Number(editingSpecialtyId)) &&
      normalize(s.title) === normalize(specialty.title) &&
      normalize(s.education_level) === normalize(specialty.educationLevel)
    );
    if (exists) {
      setSpecialtyErrors({ title: 'Специальность с этим названием и уровнем уже есть' });
      showToast({ tone: 'danger', title: 'Уже существует' });
      return;
    }
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
    } finally {
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
    setSpecialtyErrors({});
  }

  // ── Программы ────────────────────────────────────────────────
  async function submitProgram(e) {
    e.preventDefault();
    setProgramErrors({});
    const exists = programs.some(p =>
      p.id !== editingProgramId &&
      Number(p.institution_id) === Number(program.institutionId) &&
      Number(p.specialty_id)   === Number(program.specialtyId)
    );
    if (exists) {
      setProgramErrors({ specialtyId: 'Такая программа для этого заведения уже существует' });
      showToast({ tone: 'danger', title: 'Уже существует' });
      return;
    }
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
    setProgramErrors({});
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
        isDeleting={isDeleting}
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
                errors={institutionErrors}
                onChange={e => {
                  setInstitution({ ...institution, [e.target.name]: e.target.value });
                  if (institutionErrors[e.target.name]) setInstitutionErrors({});
                }}
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
                errors={specialtyErrors}
                onChange={e => {
                  setSpecialty({ ...specialty, [e.target.name]: e.target.value });
                  if (specialtyErrors[e.target.name]) setSpecialtyErrors({});
                }}
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
                errors={programErrors}
                onChange={e => {
                  const { name, value: v, type, checked } = e.target;
                  setProgram({ ...program, [name]: type === 'checkbox' ? checked : v });
                  if (programErrors[name]) setProgramErrors({});
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