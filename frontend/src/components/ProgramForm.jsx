import React from 'react';
import Button from '../components/Button';
import Input, { Select } from '../components/Input';

// ── Форма программы ───────────────────────────────────────────
export default function ProgramForm({
  value, onChange, onSubmit, onCancel, isEditing,
  institutions, specialties, saving, errors = {}
}) {
  return (
    <form onSubmit={onSubmit} className="stack-form">
      <Select
        label="Учебное заведение" name="institutionId"
        value={value.institutionId} onChange={onChange} required
        error={errors.institutionId}
      >
        <option value="">Выберите заведение</option>
        {institutions.map(i => (
          <option key={i.id} value={i.id}>
            {i.name} — {i.type === 'college' ? 'колледж' : 'университет'} — {i.city}
          </option>
        ))}
      </Select>

      <Select
        label="Специальность" name="specialtyId"
        value={value.specialtyId} onChange={onChange} required
        error={errors.specialtyId}
      >
        <option value="">Выберите специальность</option>
        {specialties.map(s => (
          <option key={s.id} value={s.id}>
            {s.title} — {s.education_level === 'grade_9' ? 'после 9 класса' : 'после 11 класса'}
          </option>
        ))}
      </Select>

      <Input
        label="Стоимость" name="tuitionFee" type="number" min="0"
        value={value.tuitionFee} onChange={onChange}
      />
      <Input
        label="Срок обучения" name="durationYears" type="number" min="0" step="0.5"
        value={value.durationYears} onChange={onChange}
      />

      <Select label="Язык обучения" name="studyLanguage" value={value.studyLanguage} onChange={onChange}>
        <option value="">Выберите язык</option>
        <option value="русский">Русский</option>
        <option value="казахский">Казахский</option>
        <option value="английский">Английский</option>
      </Select>

      <Select label="Форма обучения" name="studyForm" value={value.studyForm} onChange={onChange}>
        <option value="">Выберите форму</option>
        <option value="очное">Очное</option>
      </Select>

      <Input
        label="Документы через запятую" name="requiredDocuments"
        value={value.requiredDocuments} onChange={onChange}
      />
      <Input
        label="Минимальный балл" name="minScore" type="number" min="0" max="140"
        value={value.minScore} onChange={onChange}
      />

      <label className="checkbox-field">
        <input type="checkbox" name="hasGrant" checked={value.hasGrant} onChange={onChange} />
        Есть грант
      </label>

      <div style={{ display: 'flex', gap: 10 }}>
        {isEditing && (
          <Button type="button" variant="secondary" onClick={onCancel} style={{ flex: 1 }}>
            Отмена
          </Button>
        )}
        <Button type="submit" isLoading={saving} style={{ flex: 2 }}>
          {isEditing ? 'Сохранить изменения' : 'Добавить'}
        </Button>
      </div>
    </form>
  );
}