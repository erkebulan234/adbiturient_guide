import React, { useEffect, useRef, useState } from 'react';
import api from '../api/axios';

export default function AdminPage() {
  const [stats, setStats] = useState(null);
  const [institutions, setInstitutions] = useState([]);
  const [specialties, setSpecialties] = useState([]);
  const [programs, setPrograms] = useState([]);
  const [editingInstitutionId, setEditingInstitutionId] = useState(null);
  const [editingSpecialtyId, setEditingSpecialtyId] = useState(null);
  const [editingProgramId, setEditingProgramId] = useState(null);
  const institutionFormRef = useRef(null);
  const specialtyFormRef = useRef(null);
  const programFormRef = useRef(null);

  const [institutionMessage, setInstitutionMessage] = useState('');
  const [specialtyMessage, setSpecialtyMessage] = useState('');
  const [programMessage, setProgramMessage] = useState('');

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

  function splitText(value) {
    return value
      .split(',')
      .map(item => item.trim())
      .filter(Boolean);
  }

  function normalize(value) {
    return String(value || '').trim().toLowerCase();
  }

  function changeInstitution(event) {
    setInstitution({
      ...institution,
      [event.target.name]: event.target.value
    });
  }

  function changeSpecialty(event) {
    setSpecialty({
      ...specialty,
      [event.target.name]: event.target.value
    });
  }

  function scrollToForm(ref) {
    setTimeout(() => {
      ref.current?.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
    }, 50);
  } 

  function changeProgram(event) {
    const { name, value, type, checked } = event.target;

    setProgram({
      ...program,
      [name]: type === 'checkbox' ? checked : value
    });
  }

  async function createInstitution(event) {
    event.preventDefault();
    setInstitutionMessage('');

    const exists = institutions.some(item =>
        item.id !== editingInstitutionId &&
        normalize(item.name) === normalize(institution.name) &&
        normalize(item.type) === normalize(institution.type) &&
        normalize(item.city) === normalize(institution.city)
    );

    if (exists) {
        setInstitutionMessage('Такое учебное заведение уже существует');
        return;
    }

    try {
        const response = editingInstitutionId
        ? await api.put(`/admin/institutions/${editingInstitutionId}`, institution)
        : await api.post('/admin/institutions', institution);

        setInstitutionMessage(response.data.message);

        setEditingInstitutionId(null);
        setInstitution({
        name: '',
        type: 'college',
        city: '',
        address: '',
        website: '',
        description: ''
        });

        await loadStats();
        await loadCatalogData();
    } catch (error) {
        setInstitutionMessage(error.response?.data?.message || 'Ошибка сохранения учебного заведения');
    }
   }

  async function createSpecialty(event) {
    event.preventDefault();
    setSpecialtyMessage('');

    const exists = specialties.some(item =>
        item.id !== editingSpecialtyId &&
        normalize(item.title) === normalize(specialty.title) &&
        normalize(item.education_level) === normalize(specialty.educationLevel)
    );

    if (exists) {
        setSpecialtyMessage('Такая специальность уже существует');
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

        setSpecialtyMessage(response.data.message);

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
        setSpecialtyMessage(error.response?.data?.message || 'Ошибка сохранения специальности');
    }
   }

  async function createProgram(event) {
    event.preventDefault();
    setProgramMessage('');

    const exists = programs.some(item =>
        item.id !== editingProgramId &&
        Number(item.institution_id) === Number(program.institutionId) &&
        Number(item.specialty_id) === Number(program.specialtyId)
    );

    if (exists) {
        setProgramMessage('Такая программа уже существует');
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

        setProgramMessage(response.data.message);

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
        setProgramMessage(error.response?.data?.message || 'Ошибка сохранения программы');
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
    setInstitutionMessage('Редактирование учебного заведения');

    scrollToForm(institutionFormRef);
    }

    async function deleteInstitution(id) {
    if (!window.confirm('Удалить учебное заведение?')) return;

    try {
        const response = await api.delete(`/admin/institutions/${id}`);
        setInstitutionMessage(response.data.message);
        await loadStats();
        await loadCatalogData();
    } catch (error) {
        setInstitutionMessage(error.response?.data?.message || 'Ошибка удаления учебного заведения');
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
    setSpecialtyMessage('Редактирование специальности');
    scrollToForm(specialtyFormRef);
    }

    async function deleteSpecialty(id) {
    if (!window.confirm('Удалить специальность?')) return;

    try {
        const response = await api.delete(`/admin/specialties/${id}`);
        setSpecialtyMessage(response.data.message);
        await loadStats();
        await loadCatalogData();
    } catch (error) {
        setSpecialtyMessage(error.response?.data?.message || 'Ошибка удаления специальности');
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
    setProgramMessage('Редактирование программы');
    scrollToForm(programFormRef);
    }

    async function deleteProgram(id) {
    if (!window.confirm('Удалить программу?')) return;

    try {
        const response = await api.delete(`/admin/programs/${id}`);
        setProgramMessage(response.data.message);
        await loadStats();
        await loadCatalogData();
    } catch (error) {
        setProgramMessage(error.response?.data?.message || 'Ошибка удаления программы');
    }
  }

  function Message({ text }) {
    if (!text) return null;

    const isError = text.includes('существует') || text.includes('Ошибка');

    return (
      <p className={isError ? 'error' : 'success'} style={{ fontWeight: 700 }}>
        {text}
      </p>
    );
  }

  return (
    <div className="page">
      <div className="card">
        <h1>Админ-панель</h1>
        <p>Управление учебными заведениями, специальностями и программами.</p>

        {stats && (
          <div className="grid">
            <div className="card"><h3>Пользователи</h3><p>{stats.users}</p></div>
            <div className="card"><h3>Анкеты</h3><p>{stats.profiles}</p></div>
            <div className="card"><h3>Заведения</h3><p>{stats.institutions}</p></div>
            <div className="card"><h3>Специальности</h3><p>{stats.specialties}</p></div>
            <div className="card"><h3>Программы</h3><p>{stats.programs}</p></div>
            <div className="card"><h3>Рекомендации</h3><p>{stats.recommendations}</p></div>
          </div>
        )}
      </div>

      <div className="grid">
        <div className="card" ref={institutionFormRef}>
            <h2>{editingInstitutionId ? 'Редактировать заведение' : 'Добавить заведение'}</h2>

          <form onSubmit={createInstitution}>
            <label>Название</label>
            <input className="input" name="name" value={institution.name} onChange={changeInstitution} required />

            <label>Тип</label>
            <select className="select" name="type" value={institution.type} onChange={changeInstitution}>
              <option value="college">Колледж</option>
              <option value="university">Университет</option>
            </select>

            <label>Город</label>
            <input className="input" name="city" value={institution.city} onChange={changeInstitution} required />

            <label>Адрес</label>
            <input className="input" name="address" value={institution.address} onChange={changeInstitution} />

            <label>Сайт</label>
            <input className="input" name="website" value={institution.website} onChange={changeInstitution} />

            <label>Описание</label>
            <textarea className="textarea" name="description" value={institution.description} onChange={changeInstitution} />

            <button className="button" type="submit">
            {editingInstitutionId ? 'Сохранить изменения' : 'Добавить'}
            </button>
            <Message text={institutionMessage} />
          </form>
        </div>

        <div className="card" ref={specialtyFormRef}>
            <h2>{editingSpecialtyId ? 'Редактировать специальность' : 'Добавить специальность'}</h2>

          <form onSubmit={createSpecialty}>
            <label>Название</label>
            <input className="input" name="title" value={specialty.title} onChange={changeSpecialty} required />

            <label>Код</label>
            <input className="input" name="code" value={specialty.code} onChange={changeSpecialty} />

            <label>Уровень</label>
            <select className="select" name="educationLevel" value={specialty.educationLevel} onChange={changeSpecialty}>
              <option value="grade_9">После 9 класса</option>
              <option value="grade_11">После 11 класса</option>
            </select>

            <label>Профессия</label>
            <input className="input" name="profession" value={specialty.profession} onChange={changeSpecialty} />

            <label>Описание</label>
            <textarea className="textarea" name="description" value={specialty.description} onChange={changeSpecialty} />

            <label>Предметы через запятую</label>
            <input className="input" name="requiredSubjects" value={specialty.requiredSubjects} onChange={changeSpecialty} />

            <label>Навыки через запятую</label>
            <input className="input" name="requiredSkills" value={specialty.requiredSkills} onChange={changeSpecialty} />

            <label>Средняя зарплата</label>
            <input className="input" name="averageSalary" value={specialty.averageSalary} onChange={changeSpecialty} />

            <label>Востребованность</label>
            <input className="input" name="demandLevel" value={specialty.demandLevel} onChange={changeSpecialty} />

            <label>Теги через запятую</label>
            <input className="input" name="tags" value={specialty.tags} onChange={changeSpecialty} />

            <button className="button" type="submit">
            {editingSpecialtyId ? 'Сохранить изменения' : 'Добавить'}
            </button>
            <Message text={specialtyMessage} />
          </form>
        </div>

        <div className="card" ref={programFormRef}>
            <h2>{editingProgramId ? 'Редактировать программу' : 'Добавить программу'}</h2>

          <form onSubmit={createProgram}>
            <label>Учебное заведение</label>
            <select className="select" name="institutionId" value={program.institutionId} onChange={changeProgram} required>
              <option value="">Выберите заведение</option>
              {institutions.map(item => (
                <option key={item.id} value={item.id}>
                  {item.name} — {item.type === 'college' ? 'колледж' : 'университет'} — {item.city}
                </option>
              ))}
            </select>

            <label>Специальность</label>
            <select className="select" name="specialtyId" value={program.specialtyId} onChange={changeProgram} required>
              <option value="">Выберите специальность</option>
              {specialties.map(item => (
                <option key={item.id} value={item.id}>
                  {item.title} — {item.education_level === 'grade_9' ? 'после 9 класса' : 'после 11 класса'}
                </option>
              ))}
            </select>

            <label>Стоимость</label>
            <input className="input" name="tuitionFee" value={program.tuitionFee} onChange={changeProgram} />

            <label>Срок обучения</label>
            <input className="input" name="durationYears" value={program.durationYears} onChange={changeProgram} />

            <label>Язык</label>
            <input className="input" name="studyLanguage" value={program.studyLanguage} onChange={changeProgram} />

            <label>Форма</label>
            <input className="input" name="studyForm" value={program.studyForm} onChange={changeProgram} />

            <label>Документы через запятую</label>
            <input className="input" name="requiredDocuments" value={program.requiredDocuments} onChange={changeProgram} />

            <label>Минимальный балл</label>
            <input className="input" name="minScore" value={program.minScore} onChange={changeProgram} />

            <label>
              <input type="checkbox" name="hasGrant" checked={program.hasGrant} onChange={changeProgram} /> Есть грант
            </label>

            <br /><br />

            <button className="button" type="submit">
            {editingProgramId ? 'Сохранить изменения' : 'Добавить'}
            </button>
            <Message text={programMessage} />
          </form>
        </div>
      </div>
            <div className="card">
        <h2>Учебные заведения</h2>
        {institutions.map(item => (
          <div className="card" key={item.id}>
            <h3>{item.name}</h3>
            <p>{item.type} — {item.city}</p>
            <div className="actions">
              <button className="button secondary" onClick={() => editInstitution(item)}>
                Изменить
              </button>
              <button className="button" onClick={() => deleteInstitution(item.id)} style={{ background: '#dc2626' }}>
                Удалить
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="card">
        <h2>Специальности</h2>
        {specialties.map(item => (
          <div className="card" key={item.id}>
            <h3>{item.title}</h3>
            <p>{item.education_level} — {item.profession}</p>
            <div className="actions">
              <button className="button secondary" onClick={() => editSpecialty(item)}>
                Изменить
              </button>
              <button className="button" onClick={() => deleteSpecialty(item.id)} style={{ background: '#dc2626' }}>
                Удалить
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="card">
        <h2>Программы</h2>
        {programs.map(item => (
          <div className="card" key={item.id}>
            <h3>{item.specialty_title}</h3>
            <p>{item.institution_name} — {item.tuition_fee} тг/год</p>
            <div className="actions">
              <button className="button secondary" onClick={() => editProgram(item)}>
                Изменить
              </button>
              <button className="button" onClick={() => deleteProgram(item.id)} style={{ background: '#dc2626' }}>
                Удалить
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}