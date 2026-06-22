import React from 'react';
import ProgramCardBase from './ProgramCardBase';
import FavoriteButton from './FavoriteButton';
import CompareButton from './CompareButton';

export default function ProgramCard({ program }) {
  return (
    <ProgramCardBase
      program={program}
      actions={
        <>
          <FavoriteButton programId={program.id} />
          <CompareButton program={program} />
        </>
      }
    />
  );
}