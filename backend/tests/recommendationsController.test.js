import { describe, test, expect, vi } from 'vitest';

const { _saveRecommendations, _deduplicatePrograms, _pickTop } = await import('../src/services/recommendationsService');

describe('recommendationsService helpers', () => {
  test('_saveRecommendations deletes and batch inserts using transaction client', async () => {
    const client = { query: vi.fn().mockResolvedValue({ rows: [] }) };

    await _saveRecommendations(client, 7, [
      { specialty_id: 1, program_id: 10, score: 91, reason: 'match 1' },
      { specialty_id: 2, program_id: 20, score: 84, reason: 'match 2' }
    ]);

    expect(client.query).toHaveBeenNthCalledWith(1, 'DELETE FROM recommendations WHERE user_id = $1', [7]);
    expect(client.query).toHaveBeenNthCalledWith(
      2,
      expect.stringContaining('INSERT INTO recommendations'),
      [7, 1, 10, 91, 'match 1', 2, 20, 84, 'match 2']
    );
  });

  test('_saveRecommendations only deletes when list is empty', async () => {
    const client = { query: vi.fn().mockResolvedValue({ rows: [] }) };

    await _saveRecommendations(client, 7, []);

    expect(client.query).toHaveBeenCalledTimes(1);
    expect(client.query).toHaveBeenCalledWith('DELETE FROM recommendations WHERE user_id = $1', [7]);
  });

  test('_deduplicatePrograms keeps grant option for same institution and specialty', () => {
    const result = _deduplicatePrograms([
      { institution_id: 1, specialty_id: 2, has_grant: false, tuition_fee: 100000, score: 80 },
      { institution_id: 1, specialty_id: 2, has_grant: true, tuition_fee: 150000, score: 78 }
    ]);

    expect(result).toHaveLength(1);
    expect(result[0].has_grant).toBe(true);
  });

  test('_pickTop prefers scored recommendations', () => {
    const result = _pickTop([{ score: 90 }, { score: 0 }, { score: 80 }], 2);
    expect(result).toEqual([{ score: 90 }, { score: 80 }]);
  });
});