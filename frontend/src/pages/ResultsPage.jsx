import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useRecommendations, useGenerateRecommendations } from '../hooks/useApi';
import { useToast } from '../context/ToastContext';
import Button from '../components/Button';
import { Select } from '../components/Input';
import { Badge, EmptyState, SkeletonLoader, Tabs } from '../components/ui';
import RecommendationCard from '../components/RecommendationCard';
import { useReveal } from '../hooks/useReveal';


const SORT_TABS = [
  { value: 'match',   label: 'По совпадению' },
  { value: 'tuition', label: 'По стоимости'  },
  { value: 'grant',   label: 'С грантом'     },
];

function normalizeArray(value) {
  return Array.isArray(value) ? value.filter(Boolean) : [];
}

function getPercent(item) {
  const v = item.match_percent ?? item.matchPercent ?? item.score ?? 0;
  return Math.max(0, Math.min(100, Number(v) || 0));
}

export default function ResultsPage() {
  useReveal();
  const { showToast } = useToast();

  const { data: recommendations = [], isLoading } = useRecommendations();
  const generateMutation = useGenerateRecommendations();

  const [typeFilter,  setTypeFilter]  = useState('all');
  const [grantFilter, setGrantFilter] = useState('all');
  const [sort,        setSort]        = useState('match');

  function handleGenerate() {
    generateMutation.mutate(undefined, {
      onSuccess: () => showToast({ title: 'Подбор обновлён', description: 'Рекомендации сформированы на основе вашего профиля.' }),
      onError: (err) => showToast({ tone: 'danger', title: 'Ошибка', description: err.response?.data?.message || 'Не удалось сформировать рекомендации' })
    });
  }

  const filtered = useMemo(() => {
    const next = recommendations.filter(item => {
      if (typeFilter !== 'all' && item.institution_type !== typeFilter) return false;
      if (grantFilter === 'true'  && !item.has_grant) return false;
      if (grantFilter === 'false' &&  item.has_grant) return false;
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
  const isGenerating = generateMutation.isPending;

  return (
    <main className="page">
      <section className="results-header reveal-up">
        <div>
          <p className="kicker">Интеллектуальный подбор</p>
          <h1>Рекомендации, которые можно сравнивать спокойно</h1>
          <p className="lead">
            Не просто список специальностей — объяснимый подбор: совпадение,
            требования, стоимость, гранты и причина рекомендации.
          </p>
        </div>
        <div className="results-actions">
          <Button onClick={handleGenerate} isLoading={isGenerating}>Обновить подбор</Button>
          <Link className="secondary-button" to="/profile">Уточнить анкету</Link>
        </div>
      </section>

      <section className="compact-stats reveal-up" style={{ '--delay': '90ms' }}>
        <div><strong>{recommendations.length}</strong><span>программ найдено</span></div>
        <div><strong>{bestMatch}%</strong><span>лучшее совпадение</span></div>
        <div><strong>{grantCount}</strong><span>вариантов с грантом</span></div>
      </section>

      {isLoading && <SkeletonLoader rows={3} />}

      {!isLoading && recommendations.length === 0 && (
        <EmptyState
          eyebrow="Рекомендации"
          title="Пока нет персонального подбора"
          description="Заполните анкету и пройдите тест, чтобы система сопоставила ваши интересы с программами обучения."
          action={
            <div className="actions">
              <Button onClick={handleGenerate} isLoading={isGenerating}>Сформировать рекомендации</Button>
              <Link className="secondary-button" to="/test">Пройти тест</Link>
            </div>
          }
        />
      )}

      {!isLoading && recommendations.length > 0 && (
        <>
          <section className="filters-strip">
            <Select label="Тип заведения" name="type" value={typeFilter} onChange={e => setTypeFilter(e.target.value)}>
              <option value="all">Все</option>
              <option value="college">Колледжи</option>
              <option value="university">Университеты</option>
            </Select>
            <Select label="Грант" name="grant" value={grantFilter} onChange={e => setGrantFilter(e.target.value)}>
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
              <RecommendationCard item={item} index={index} key={item.id ?? `${item.title}-${index}`} />
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