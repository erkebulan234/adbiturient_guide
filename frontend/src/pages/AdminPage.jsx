import React, { useEffect, useRef, useState } from 'react';
import api from '../api/axios';
import { useToast } from '../context/ToastContext';

const statLabels = {
  users: 'Пользователи',
  profiles: 'Анкеты',
  institutions: 'Заведения',
  specialties: 'Специальности',
  programs: 'Программы',
  recommendations: 'Рекомендации'
};

function splitText(value) {
  return value
    .split(',')
    .map(item => item.trim())
    .filter(Boolean);
}

function normalize(value) {
  return String(value || '').trim().toLowerCase();
}

function AdminStat({ label, value }) {
  return (
    <div className="admin-stat">
      <span>{label}</span>
      <strong>{value ?? 0}</strong>
    </div>
  );
}



export default function AdminPage() {
  const [stats, setStats] = useState(null);
  const [editingInstitutionId, setEditingInstitutionId] = useState(null);
  const [editingSpecialtyId, setEditingSpecialtyId] = useState(null);
  const [editingProgramId, setEditingProgramId] = useState(null);
  const institutionFormRef = useRef(null);
  const specialtyFormRef = useRef(null);
  const programFormRef = useRef(null);

  const [institutions, setInstitutions] = useState([]);
  const [specialties, setSpecialties] = useState([]);
  const [programs, setPrograms] = useState([]);
  const { showToast } = useToast();


  const [institution, setInstitution] = useState({
    name: '',
    type: 'college',
    city: '',
    address: '',
    website: '',
    description: ''
  });

  const [specialty, setSpecialty] = useState({
    title: '',
    code: '',
    educationLevel: 'grade_9',
    profession: '',
    description: '',
    requiredSubjects: '',
    requiredSkills: '',
    averageSalary: '',
    demandLevel: '',
    tags: ''
  });

  const [program, setProgram] = useState({
    institutionId: '',
    specialtyId: '',
    tuitionFee: '',
    durationYears: '',
    studyLanguage: '',
    studyForm: '',
    requiredDocuments: '',
    minScore: '',
    hasGrant: false
  });

  useEffect(() => {
    loadStats();
    loadCatalogData();
  }, []);

  async function loadStats() {
    try {
      const response = await api.get('/admin/stats');
      setStats(response.data);
    } catch (error) {
      console.log(error);
    }
  }

  async function loadCatalogData() {
    try {
      const [institutionsResponse, specialtiesResponse, programsResponse] = await Promise.all([
        api.get('/api/institutions'),
        api.get('/api/specialties'),
        api.get('/api/programs')
      ]);

      setInstitutions(institutionsResponse.data);
      setSpecialties(specialtiesResponse.data);
      setPrograms(programsResponse.data);
    } catch (error) {
      console.log(error);
    }
  }

  function scrollToForm(ref) {
    setTimeout(() => {
      ref.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 50);
  }

  function changeInstitution(event) {
    setInstitution({ ...institution, [event.target.name]: event.target.value });
  }

  function changeSpecialty(event) {
    setSpecialty({ ...specialty, [event.target.name]: event.target.value });
  }

  function changeProgram(event) {
    const { name, value, type, checked } = event.target;
    setProgram({ ...program, [name]: type === 'checkbox' ? checked : value });
  }

  async function createInstitution(event) {
    event.preventDefault();
    showToast('');

    const exists = institutions.some(item =>
      item.id !== editingInstitutionId &&
      normalize(item.name) === normalize(institution.name) &&
      normalize(item.type) === normalize(institution.type) &&
      normalize(item.city) === normalize(institution.city)
    );

    if (exists) {
      showToast({tone: 'danger', text: 'Такое учебное заведение уже существует'});
      return;
    }

    try {
      const response = editingInstitutionId
        ? await api.put(`/admin/institutions/${editingInstitutionId}`, institution)
        : await api.post('/admin/institutions', institution);

      showToast({tone: 'success', text: response.data.message || 'Учебное заведение сохранено'});
      setEditingInstitutionId(null);
      setInstitution({ name: '', type: 'college', city: '', address: '', website: '', description: '' });

      await loadStats();
      await loadCatalogData();
    } catch (error) {
      showToast({tone: 'danger', text: error.response?.data?.message || 'Ошибка сохранения учебного заведения'});
    }
  }

  async function createSpecialty(event) {
    event.preventDefault();
    showToast('');

    const exists = specialties.some(item =>
      item.id !== editingSpecialtyId &&
      normalize(item.title) === normalize(specialty.title) &&
      normalize(item.education_level) === normalize(specialty.educationLevel)
    );

    if (exists) {
      showToast({tone: 'danger', text: 'Такая специальность уже существует'});
      return;
    }

    try {
      const payload = {
        ...specialty,
        requiredSubjects: splitText(specialty.requiredSubjects),
        requiredSkills: splitText(specialty.requiredSkills),
        tags: splitText(specialty.tags)
      };

      const response = editingSpecialtyId
        ? await api.put(`/admin/specialties/${editingSpecialtyId}`, payload)
        : await api.post('/admin/specialties', payload);

      showToast({tone: 'success', text: response.data.message || 'Специальность сохранена'});
      setEditingSpecialtyId(null);
      setSpecialty({
        title: '',
        code: '',
        educationLevel: 'grade_9',
        profession: '',
        description: '',
        requiredSubjects: '',
        requiredSkills: '',
        averageSalary: '',
        demandLevel: '',
        tags: ''
      });

      await loadStats();
      await loadCatalogData();
    } catch (error) {
      showToast({tone: 'danger', text: error.response?.data?.message || 'Ошибка сохранения специальности'});
    }
  }

  async function createProgram(event) {
    event.preventDefault();
    showToast('');

    const exists = programs.some(item =>
      item.id !== editingProgramId &&
      Number(item.institution_id) === Number(program.institutionId) &&
      Number(item.specialty_id) === Number(program.specialtyId)
    );

    if (exists) {
      showToast({tone: 'danger', text: 'Такая программа уже существует'});
      return;
    }

    try {
      const payload = {
        ...program,
        institutionId: Number(program.institutionId),
        specialtyId: Number(program.specialtyId),
        tuitionFee: Number(program.tuitionFee),
        durationYears: Number(program.durationYears),
        minScore: Number(program.minScore),
        requiredDocuments: splitText(program.requiredDocuments)
      };

      const response = editingProgramId
        ? await api.put(`/admin/programs/${editingProgramId}`, payload)
        : await api.post('/admin/programs', payload);

      showToast({tone: 'success', text: response.data.message || 'Программа сохранена'});
      setEditingProgramId(null);
      setProgram({
        institutionId: '',
        specialtyId: '',
        tuitionFee: '',
        durationYears: '',
        studyLanguage: '',
        studyForm: '',
        requiredDocuments: '',
        minScore: '',
        hasGrant: false
      });

      await loadStats();
      await loadCatalogData();
    } catch (error) {
      showToast({tone: 'danger', text: error.response?.data?.message || 'Ошибка сохранения программы'});
    }
  }

  function editInstitution(item) {
    setEditingInstitutionId(item.id);
    setInstitution({
      name: item.name || '',
      type: item.type || 'college',
      city: item.city || '',
      address: item.address || '',
      website: item.website || '',
      description: item.description || ''
    });
    showToast({tone: 'info', text: 'Редактирование учебного заведения'});
    scrollToForm(institutionFormRef);
  }

  async function deleteInstitution(id) {
    if (!window.confirm('Удалить учебное заведение?')) return;

    try {
      const response = await api.delete(`/admin/institutions/${id}`);
      showToast({tone: 'success', text: 'Учебное заведение удалено'});
      await loadStats();
      await loadCatalogData();
    } catch (error) {
      showToast({tone: 'danger', text: error.response?.data?.message || 'Ошибка удаления учебного заведения'});
    }
  }

  function editSpecialty(item) {
    setEditingSpecialtyId(item.id);
    setSpecialty({
      title: item.title || '',
      code: item.code || '',
      educationLevel: item.education_level || 'grade_9',
      profession: item.profession || '',
      description: item.description || '',
      requiredSubjects: (item.required_subjects || []).join(', '),
      requiredSkills: (item.required_skills || []).join(', '),
      averageSalary: item.average_salary || '',
      demandLevel: item.demand_level || '',
      tags: (item.tags || []).join(', ')
    });
    showToast({tone: 'info', text: 'Редактирование специальности'});
    scrollToForm(specialtyFormRef);
  }

  async function deleteSpecialty(id) {
    if (!window.confirm('Удалить специальность?')) return;

    try {
      const response = await api.delete(`/admin/specialties/${id}`);
      showToast({tone: 'success', text: 'Специальность удалена'});
      await loadStats();
      await loadCatalogData();
    } catch (error) {
      showToast({tone: 'danger', text: error.response?.data?.message || 'Ошибка удаления специальности'});
    }
  }

  function editProgram(item) {
    setEditingProgramId(item.id);
    setProgram({
      institutionId: item.institution_id || '',
      specialtyId: item.specialty_id || '',
      tuitionFee: item.tuition_fee || '',
      durationYears: item.duration_years || '',
      studyLanguage: item.study_language || '',
      studyForm: item.study_form || '',
      requiredDocuments: (item.required_documents || []).join(', '),
      minScore: item.min_score || '',
      hasGrant: Boolean(item.has_grant)
    });
    showToast({tone: 'info', text: 'Редактирование программы'});
    scrollToForm(programFormRef);
  }

  async function deleteProgram(id) {
    if (!window.confirm('Удалить программу?')) return;

    try {
      const response = await api.delete(`/admin/programs/${id}`);
      showToast({tone: 'success', text: 'Программа удалена'});
      await loadStats();
      await loadCatalogData();
    } catch (error) {
      showToast({tone: 'danger', text: error.response?.data?.message || 'Ошибка удаления программы'});
    }
  }

  return (
    <main className="page admin-page">
      <section className="results-header">
        <div>
          <p className="kicker">Администрирование</p>
          <h1>Управление каталогом и образовательными программами</h1>
          <p className="lead">
            Добавляйте учебные заведения, специальности и программы в единой структуре данных.
          </p>
        </div>
      </section>

      {stats && (
        <section className="admin-stats">
          {Object.entries(statLabels).map(([key, label]) => (
            <AdminStat label={label} value={stats[key]} key={key} />
          ))}
        </section>
      )}

      <section className="admin-grid">
        <article className="panel admin-form" ref={institutionFormRef}>
          <p className="kicker">Учебные заведения</p>
          <h2>{editingInstitutionId ? 'Редактировать заведение' : 'Добавить заведение'}</h2>

          <form onSubmit={createInstitution} className="stack-form">
            <label>Название<input className="input" name="name" value={institution.name} onChange={changeInstitution} required /></label>
            <label>Тип
              <select className="select" name="type" value={institution.type} onChange={changeInstitution}>
                <option value="college">Колледж</option>
                <option value="university">Университет</option>
              </select>
            </label>
            <label>Город<input className="input" name="city" value={institution.city} onChange={changeInstitution} required /></label>
            <label>Адрес<input className="input" name="address" value={institution.address} onChange={changeInstitution} /></label>
            <label>Сайт<input className="input" name="website" value={institution.website} onChange={changeInstitution} /></label>
            <label>Описание<textarea className="textarea" name="description" value={institution.description} onChange={changeInstitution} rows="3" /></label>
            <button className="primary-button" type="submit">{editingInstitutionId ? 'Сохранить изменения' : 'Добавить'}</button>
          </form>
        </article>

        <article className="panel admin-form" ref={specialtyFormRef}>
          <p className="kicker">Специальности</p>
          <h2>{editingSpecialtyId ? 'Редактировать специальность' : 'Добавить специальность'}</h2>

          <form onSubmit={createSpecialty} className="stack-form">
            <label>Название<input className="input" name="title" value={specialty.title} onChange={changeSpecialty} required /></label>
            <label>Код<input className="input" name="code" value={specialty.code} onChange={changeSpecialty} /></label>
            <label>Уровень
              <select className="select" name="educationLevel" value={specialty.educationLevel} onChange={changeSpecialty}>
                <option value="grade_9">После 9 класса</option>
                <option value="grade_11">После 11 класса</option>
              </select>
            </label>
            <label>Профессия<input className="input" name="profession" value={specialty.profession} onChange={changeSpecialty} /></label>
            <label>Описание<textarea className="textarea" name="description" value={specialty.description} onChange={changeSpecialty} rows="3" /></label>
            <label>Предметы через запятую<input className="input" name="requiredSubjects" value={specialty.requiredSubjects} onChange={changeSpecialty} /></label>
            <label>Навыки через запятую<input className="input" name="requiredSkills" value={specialty.requiredSkills} onChange={changeSpecialty} /></label>
            <label>Средняя зарплата<input className="input" name="averageSalary" value={specialty.averageSalary} onChange={changeSpecialty} /></label>
            <label>Востребованность<input className="input" name="demandLevel" value={specialty.demandLevel} onChange={changeSpecialty} /></label>
            <label>Теги через запятую<input className="input" name="tags" value={specialty.tags} onChange={changeSpecialty} /></label>
            <button className="primary-button" type="submit">{editingSpecialtyId ? 'Сохранить изменения' : 'Добавить'}</button>
          </form>
        </article>

        <article className="panel admin-form" ref={programFormRef}>
          <p className="kicker">Программы</p>
          <h2>{editingProgramId ? 'Редактировать программу' : 'Добавить программу'}</h2>

          <form onSubmit={createProgram} className="stack-form">
            <label>Учебное заведение
              <select className="select" name="institutionId" value={program.institutionId} onChange={changeProgram} required>
                <option value="">Выберите заведение</option>
                {institutions.map(item => (
                  <option key={item.id} value={item.id}>
                    {item.name} — {item.type === 'college' ? 'колледж' : 'университет'} — {item.city}
                  </option>
                ))}
              </select>
            </label>
            <label>Специальность
              <select className="select" name="specialtyId" value={program.specialtyId} onChange={changeProgram} required>
                <option value="">Выберите специальность</option>
                {specialties.map(item => (
                  <option key={item.id} value={item.id}>
                    {item.title} — {item.education_level === 'grade_9' ? 'после 9 класса' : 'после 11 класса'}
                  </option>
                ))}
              </select>
            </label>
            <label>Стоимость<input className="input" name="tuitionFee" value={program.tuitionFee} onChange={changeProgram} /></label>
            <label>Срок обучения<input className="input" name="durationYears" value={program.durationYears} onChange={changeProgram} /></label>
            <label>Язык<input className="input" name="studyLanguage" value={program.studyLanguage} onChange={changeProgram} /></label>
            <label>Форма<input className="input" name="studyForm" value={program.studyForm} onChange={changeProgram} /></label>
            <label>Документы через запятую<input className="input" name="requiredDocuments" value={program.requiredDocuments} onChange={changeProgram} /></label>
            <label>Минимальный балл<input className="input" name="minScore" value={program.minScore} onChange={changeProgram} /></label>
            <label className="checkbox-field">
              <input type="checkbox" name="hasGrant" checked={program.hasGrant} onChange={changeProgram} />
              Есть грант
            </label>
            <button className="primary-button" type="submit">{editingProgramId ? 'Сохранить изменения' : 'Добавить'}</button>
          </form>
        </article>
      </section>

      <section className="admin-lists">
        <article className="panel">
          <h2>Учебные заведения</h2>
          <div className="admin-list">
            {institutions.map(item => (
              <div className="admin-list-row" key={item.id}>
                <div>
                  <strong>{item.name}</strong>
                  <span>{item.type === 'college' ? 'Колледж' : 'Университет'} · {item.city}</span>
                </div>
                <div className="row-actions">
                  <button className="secondary-button" type="button" onClick={() => editInstitution(item)}>Изменить</button>
                  <button className="danger-button" type="button" onClick={() => deleteInstitution(item.id)}>Удалить</button>
                </div>
              </div>
            ))}
          </div>
        </article>

        <article className="panel">
          <h2>Специальности</h2>
          <div className="admin-list">
            {specialties.map(item => (
              <div className="admin-list-row" key={item.id}>
                <div>
                  <strong>{item.title}</strong>
                  <span>{item.education_level === 'grade_9' ? 'После 9 класса' : 'После 11 класса'} · {item.profession || 'профессия не указана'}</span>
                </div>
                <div className="row-actions">
                  <button className="secondary-button" type="button" onClick={() => editSpecialty(item)}>Изменить</button>
                  <button className="danger-button" type="button" onClick={() => deleteSpecialty(item.id)}>Удалить</button>
                </div>
              </div>
            ))}
          </div>
        </article>

        <article className="panel">
          <h2>Программы</h2>
          <div className="admin-list">
            {programs.map(item => (
              <div className="admin-list-row" key={item.id}>
                <div>
                  <strong>{item.specialty_title}</strong>
                  <span>{item.institution_name} · {item.tuition_fee ? `${Number(item.tuition_fee).toLocaleString('ru-RU')} тг/год` : 'стоимость не указана'}</span>
                </div>
                <div className="row-actions">
                  <button className="secondary-button" type="button" onClick={() => editProgram(item)}>Изменить</button>
                  <button className="danger-button" type="button" onClick={() => deleteProgram(item.id)}>Удалить</button>
                </div>
              </div>
            ))}
          </div>
        </article>
      </section>
    </main>
  );
}
