import React from 'react';
import { Badge } from './ui';

function formatMoney(value) {
  if (!value) return null;
  return `${Number(value).toLocaleString('ru-RU')} тг/год`;
}

/**
 * Базовая карточка программы.
 *
 * Пропы:
 *   program        — объект программы (specialty_title, profession, institution_name и т.д.)
 *   actions        — JSX в правом углу шапки (кнопки избранного/сравнения/удаления)
 *   extraHeader    — JSX под match-bar (например, match-score для ResultsPage)
 *   extraFooter    — JSX под тегами (например, reason-box для ResultsPage)
 *   matchPercent   — число 0-100, если передан — рисует match-bar
 */
export default function ProgramCardBase({ program, actions, extraHeader, extraFooter, matchPercent }) {
  const isCollege  = program.institution_type === 'college';
  const subjects   = Array.isArray(program.required_subjects) ? program.required_subjects : [];
  const skills     = Array.isArray(program.required_skills)   ? program.required_skills   : [];
  const tags       = [...subjects, ...skills].slice(0, 7);

  return (
    <article className="program-card">
      {/* Шапка: мета + заголовок + actions */}
      <div className="program-card-header">
        <div>
          <div className="meta-row">
            <Badge tone="neutral">{isCollege ? 'Колледж' : 'Университет'}</Badge>
            {program.has_grant        && <Badge tone="success">Грант</Badge>}
            {program.institution_city && <Badge tone="neutral">{program.institution_city}</Badge>}
          </div>
          <h2>{program.specialty_title || program.title || '—'}</h2>
          <p>{program.profession || 'Профессия не указана'}</p>
        </div>
        {actions && <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 8 }}>{actions}</div>}
      </div>

      {/* Опциональный контент между шапкой и деталями */}
      {extraHeader}

      {/* Match-bar — только если передан matchPercent */}
      {matchPercent !== undefined && (
        <div className="match-bar" style={{ margin: '14px 0' }}>
          <span style={{ width: `${matchPercent}%` }} />
        </div>
      )}

      {/* Детали */}
      <div className="details-grid compact">
        <div><span>Учебное заведение</span><strong>{program.institution_name || '—'}</strong></div>
        <div><span>Стоимость</span><strong>{formatMoney(program.tuition_fee) || '—'}</strong></div>
        <div><span>Срок</span><strong>{program.duration_years ? `${program.duration_years} года` : '—'}</strong></div>
        <div><span>Язык</span><strong>{program.study_language || '—'}</strong></div>
        <div><span>Форма</span><strong>{program.study_form || '—'}</strong></div>
        <div><span>Мин. балл ЕНТ</span><strong>{program.min_score || '—'}</strong></div>
      </div>

      {/* Теги */}
      {tags.length > 0 && (
        <div className="tag-row">
          {tags.map((tag, i) => <span className="tag" key={`${tag}-${i}`}>{tag}</span>)}
        </div>
      )}

      {/* Опциональный контент под тегами (reason-box и т.д.) */}
      {extraFooter}

      {/* Сайт заведения */}
      {program.institution_website && (
        <div className="actions" style={{ marginTop: 16 }}>
          <a className="secondary-button" href={program.institution_website} target="_blank" rel="noreferrer">
            Сайт заведения →
          </a>
        </div>
      )}
    </article>
  );
}