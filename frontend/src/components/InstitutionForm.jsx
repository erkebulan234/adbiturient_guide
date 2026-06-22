import React from 'react';
import Button from '../components/Button';
import Input, { Select, Textarea } from '../components/Input';

// ── Форма заведения ───────────────────────────────────────────
export default function InstitutionForm({ value, onChange, onSubmit, onCancel, isEditing, saving, errors = {} }) {
  return (
    <form onSubmit={onSubmit} className="stack-form">
      <Input
        label="Название" name="name" value={value.name} onChange={onChange}
        required error={errors.name}
      />
      <Select label="Тип" name="type" value={value.type} onChange={onChange}>
        <option value="college">Колледж</option>
        <option value="university">Университет</option>
      </Select>
      <Input
        label="Город" name="city" value={value.city} onChange={onChange}
        required error={errors.city}
      />
      <Input label="Адрес" name="address" value={value.address} onChange={onChange} />
      <Input label="Сайт" name="website" value={value.website} onChange={onChange} />
      <Textarea label="Описание" name="description" value={value.description} onChange={onChange} rows="3" />

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