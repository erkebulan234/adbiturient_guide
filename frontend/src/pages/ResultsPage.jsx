import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { getRecommendations, generateRecommendations as generateApi } from '../api/recommendations.api';
import { useToast } from '../context/ToastContext';
import Button from '../components/Button';
import { Select } from '../components/Input';
import { Badge, EmptyState, SkeletonLoader, Tabs } from '../components/ui';

const SORT_TABS = [
  { value: 'match',   label: 'По совпадению' },
  { value: 'tuition', label: 'По стоимости'  },
  { value: 'grant',   label: 'С грантом'     },
];

function getPercent(item) {
  const v = item.match_percent ?? item.matchPercent ?? item.score ?? 0;
  return Math.max(0, Math.min(100, Number(v) || 0));
}

function formatMoney(value) {
  if (!value) return null;
  return `${Number(value).toLocaleString('ru-RU')} тг/год`;
}

function normalizeArray(value) {
  return Array.isArray(value) ? value.filter(Boolean) : [];
}

/* ─── карточка рекомендации ─────────────────────────────── */
function RecommendationCard({ item, index }) {
  const percent = getPercent(item);
  const subjects = normalizeArray(item.required_subjects);
  const skills   = normalizeArray(item.required_skills);
  const tags     = [...subjects, ...skills].slice(0, 8);
  const isCollege = item.institution_type === 'college';

  return (
    <article className="recommendation-row" style={{ '--delay': `${index * 55}ms` }}>

      {/* заголовок + score */}
      <div className="recommendation-title">
        <div>
          <div className="meta-row">
            <Badge tone="neutral">{isCollege ? 'Колледж' : 'Университет'}</Badge>
            {item.has_grant   && <Badge tone="success">Грант</Badge>}
            {item.institution_city && <Badge tone="neutral">{item.institution_city}</Badge>}
          </div>

          <h2>{item.title || item.specialty_title || 'Образовательная программа'}</h2>
          <p>
            {item.description ||
              'Программа соответствует вашему профилю и результатам теста.'}
          </p>
        </div>

        <div className="match-score">
          <strong>{percent}%</strong>
          <span>совпадение</span>
        </div>
      </div>

      {/* прогресс-бар совпадения */}
      <div className="match-bar">
        <span style={{ width: `${percent}%` }} />
      </div>

      {/* детали */}
      <div className="details-grid">
        <div>
          <span>Профессия</span>
          <strong>{item.profession || '—'}</strong>
        </div>
        <div>
          <span>Учебное заведение</span>
          <strong>{item.institution_name || '—'}</strong>
        </div>
        <div>
          <span>Стоимость</span>
          <strong>{formatMoney(item.tuition_fee) || '—'}</strong>
        </div>
        <div>
          <span>Срок обучения</span>
          <strong>{item.duration_years ? `${item.duration_years} года` : '—'}</strong>
        </div>
        <div>
          <span>Язык</span>
          <strong>{item.study_language || '—'}</strong>
        </div>
        <div>
          <span>Мин. балл ЕНТ</span>
          <strong>{item.min_score || '—'}</strong>
        </div>
      </div>

      {/* теги предметов и навыков */}
      {tags.length > 0 && (
        <div className="tag-row">
          {[...subjects, ...skills].slice(0, 8).map((tag, index) => (
            <span className="tag" key={`${tag}-${index}`}>{tag}</span>
          ))}
        </div>
      )}

      {/* причина рекомендации */}
      <div className="reason-box">
        <span>Логика рекомендации</span>
        <p>
          {item.reason ||
            'Система нашла пересечение между вашими предметами, навыками, интересами и требованиями программы.'}
        </p>
      </div>

      {/* ссылка на сайт */}
      {item.institution_website && (
        <div className="actions" style={{ marginTop: 18 }}>
          <a
            className="secondary-button"
            href={item.institution_website}
            target="_blank"
            rel="noreferrer"
          >
            Сайт заведения →
          </a>
        </div>
      )}
    </article>
  );
}

/* ─── основной компонент ────────────────────────────────── */
export default function ResultsPage() {
  const { showToast } = useToast();

  const [recommendations, setRecommendations] = useState([]);
  const [isLoading,    setIsLoading]    = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [typeFilter,   setTypeFilter]   = useState('all');
  const [grantFilter,  setGrantFilter]  = useState('all');
  const [sort,         setSort]         = useState('match');

  useEffect(() => { loadRecommendations(); }, []);

  async function loadRecommendations() {
    setIsLoading(true);
    try {
      const data = await getRecommendations();
      setRecommendations(Array.isArray(data) ? data : []);
    } catch (err) {
      showToast({
        tone: 'danger',
        title: 'Ошибка загрузки',
        description: err.response?.data?.message || 'Не удалось загрузить рекомендации',
      });
    } finally {
      setIsLoading(false);
    }
  }

  async function handleGenerate() {
    setIsGenerating(true);
    try {
      await generateApi();
      await loadRecommendations();
      showToast({
        title: 'Подбор обновлён',
        description: 'Рекомендации сформированы на основе вашего профиля.',
      });
    } catch (err) {
      showToast({
        tone: 'danger',
        title: 'Ошибка',
        description: err.response?.data?.message || 'Не удалось сформировать рекомендации',
      });
    } finally {
      setIsGenerating(false);
    }
  }

  const filtered = useMemo(() => {
    const next = recommendations.filter(item => {
      if (typeFilter !== 'all' && item.institution_type !== typeFilter) return false;
      if (grantFilter === 'true'  && !item.has_grant)  return false;
      if (grantFilter === 'false' &&  item.has_grant)  return false;
      return true;
    });

    return [...next].sort((a, b) => {
      if (sort === 'tuition') return Number(a.tuition_fee || Infinity) - Number(b.tuition_fee || Infinity);
      if (sort === 'grant')   return Number(Boolean(b.has_grant)) - Number(Boolean(a.has_grant));
      return getPercent(b) - getPercent(a);
    });
  }, [recommendations, typeFilter, grantFilter, sort]);

  const bestMatch  = recommendations.reduce((m, item) => Math.max(m, getPercent(item)), 0);
  const grantCount = recommendations.filter(item => item.has_grant).length;

  return (
    <main className="page">

      {/* шапка */}
      <section className="results-header">
        <div>
          <p className="kicker">Интеллектуальный подбор</p>
          <h1>Рекомендации, которые можно сравнивать спокойно</h1>
          <p className="lead">
            Не просто список специальностей — объяснимый подбор: совпадение,
            требования, стоимость, гранты и причина рекомендации.
          </p>
        </div>

        <div className="results-actions">
          <Button onClick={handleGenerate} isLoading={isGenerating}>
            Обновить подбор
          </Button>
          <Link className="secondary-button" to="/profile">Уточнить анкету</Link>
        </div>
      </section>

      {/* статистика */}
      <section className="compact-stats">
        <div>
          <strong>{recommendations.length}</strong>
          <span>программ найдено</span>
        </div>
        <div>
          <strong>{bestMatch}%</strong>
          <span>лучшее совпадение</span>
        </div>
        <div>
          <strong>{grantCount}</strong>
          <span>вариантов с грантом</span>
        </div>
      </section>

      {/* загрузка */}
      {isLoading && <SkeletonLoader rows={3} />}

      {/* пусто */}
      {!isLoading && recommendations.length === 0 && (
        <EmptyState
          eyebrow="Рекомендации"
          title="Пока нет персонального подбора"
          description="Заполните анкету и пройдите тест, чтобы система сопоставила ваши интересы с программами обучения."
          action={
            <div className="actions">
              <Button onClick={handleGenerate} isLoading={isGenerating}>
                Сформировать рекомендации
              </Button>
              <Link className="secondary-button" to="/test">Пройти тест</Link>
            </div>
          }
        />
      )}

      {/* список */}
      {!isLoading && recommendations.length > 0 && (
        <>
          {/* фильтры */}
          <section className="filters-strip">
            <Select
              label="Тип заведения"
              name="type"
              value={typeFilter}
              onChange={e => setTypeFilter(e.target.value)}
            >
              <option value="all">Все</option>
              <option value="college">Колледжи</option>
              <option value="university">Университеты</option>
            </Select>

            <Select
              label="Грант"
              name="grant"
              value={grantFilter}
              onChange={e => setGrantFilter(e.target.value)}
            >
              <option value="all">Все</option>
              <option value="true">Есть грант</option>
              <option value="false">Без гранта</option>
            </Select>

            <div style={{ display: 'grid', gap: 8 }}>
              <span style={{ fontSize: 14, fontWeight: 700 }}>Сортировка</span>
              <Tabs tabs={SORT_TABS} value={sort} onChange={setSort} />
            </div>
          </section>

          <section className="recommendations-list">
            {filtered.map((item, index) => (
              <RecommendationCard
                item={item}
                index={index}
                key={item.id ?? `${item.title}-${index}`}
              />
            ))}
          </section>

          {filtered.length === 0 && (
            <EmptyState
              title="По этим фильтрам ничего не найдено"
              description="Попробуйте выбрать другой тип учреждения или убрать фильтр по гранту."
            />
          )}
        </>
      )}
    </main>
  );
}