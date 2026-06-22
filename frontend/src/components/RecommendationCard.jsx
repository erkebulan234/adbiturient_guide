import React from 'react';
import ProgramCardBase from './ProgramCardBase';
import FavoriteButton from './FavoriteButton';
import CompareButton from './CompareButton';

function getPercent(item) {
  const v = item.match_percent ?? item.matchPercent ?? item.score ?? 0;
  return Math.max(0, Math.min(100, Number(v) || 0));
}

export default function RecommendationCard({ item, index }) {
  const percent = getPercent(item);
  const program = { ...item, id: item.program_id };

  return (
    <article className="recommendation-row" style={{ '--delay': `${index * 55}ms` }}>
      <ProgramCardBase
        program={program}
        matchPercent={percent}
        actions={
          <>
            <FavoriteButton programId={item.program_id} />
            <CompareButton program={program} />
            <div className="match-score">
              <strong>{percent}%</strong>
              <span>совпадение</span>
            </div>
          </>
        }
        extraFooter={
          <div className="reason-box">
            <span>Логика рекомендации</span>
            <p>{item.reason || 'Система нашла пересечение между вашими предметами, навыками, интересами и требованиями программы.'}</p>
          </div>
        }
      />
    </article>
  );
}