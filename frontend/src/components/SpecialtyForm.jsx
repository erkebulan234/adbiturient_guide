import React from 'react';
import Button from '../components/Button';
import Input, { Select, Textarea } from '../components/Input';

// ── Форма специальности ───────────────────────────────────────
export default function SpecialtyForm({ value, onChange, onSubmit, onCancel, isEditing, saving, errors = {} }) {
  return (
    <form onSubmit={onSubmit} className="stack-form">
      <Input
        label="Название" name="title" value={value.title} onChange={onChange}
        required error={errors.title}
      />
      <Input label="Код" name="code" value={value.code} onChange={onChange} />
      <Select label="Уровень" name="educationLevel" value={value.educationLevel} onChange={onChange}>
        <option value="grade_9">После 9 класса</option>
        <option value="grade_11">После 11 класса</option>
      </Select>
      <Input label="Профессия" name="profession" value={value.profession} onChange={onChange} />
      <Textarea label="Описание" name="description" value={value.description} onChange={onChange} rows="3" />
      <Input
        label="Предметы через запятую" name="requiredSubjects"
        value={value.requiredSubjects} onChange={onChange}
      />
      <Input
        label="Навыки через запятую" name="requiredSkills"
        value={value.requiredSkills} onChange={onChange}
      />
      <Input label="Средняя зарплата" name="averageSalary" value={value.averageSalary} onChange={onChange} />
      <Input label="Востребованность" name="demandLevel" value={value.demandLevel} onChange={onChange} />
      <Input label="Теги через запятую" name="tags" value={value.tags} onChange={onChange} />

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