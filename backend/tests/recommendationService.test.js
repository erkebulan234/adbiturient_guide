import { describe, it, expect, beforeEach, vi } from 'vitest';

vi.mock('../src/repositories/profileRepository.js', () => ({
  findByUserId: vi.fn()
}));

vi.mock('../src/repositories/recommendationsRepository.js', () => ({
  findProgramsByLevel: vi.fn(),
  findByUserId: vi.fn()
}));

vi.mock('../src/repositories/testRepository.js', () => ({
  getLastTestTags: vi.fn()
}));

const mockClient = { query: vi.fn(), release: vi.fn() };

vi.mock('../src/config/db.js', () => ({
  default: { connect: vi.fn() }
}));

import * as profileRepository from '../src/repositories/profileRepository.js';
import * as recommendationsRepository from '../src/repositories/recommendationsRepository.js';
import * as testRepository from '../src/repositories/testRepository.js';
import pool from '../src/config/db.js';
import { generate, getForUser } from '../src/services/recommendationsService.js';

const defaultProgram = {
  institution_id: 1, specialty_id: 1, program_id: 1,
  tags: ['it'], required_subjects: ['математика'],
  required_skills: ['логика'], demand_level: 'высокая',
  has_grant: true, tuition_fee: 0, min_score: 0
};

const defaultProfile = {
  education_level: 'grade_11', city: 'Астана',
  interests: ['it'], subjects: ['математика'], skills: ['логика'],
  career_goals: null, ent_score: 90, dislike_subjects: [], dislike_fields: []
};

describe('recommendationsService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    pool.connect.mockResolvedValue(mockClient);
    mockClient.query.mockResolvedValue({ rows: [] });
    profileRepository.findByUserId.mockResolvedValue(defaultProfile);
    testRepository.getLastTestTags.mockResolvedValue(['it']);
    recommendationsRepository.findProgramsByLevel.mockResolvedValue([defaultProgram]);
    recommendationsRepository.findByUserId.mockResolvedValue([{ score: 90 }]);
  });

  it('throws if profile does not exist', async () => {
    profileRepository.findByUserId.mockResolvedValue(null);
    await expect(generate(1)).rejects.toMatchObject({ status: 400 });
  });

  it('falls back to all cities when no programs found in user city', async () => {
    recommendationsRepository.findProgramsByLevel
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([defaultProgram]);

    await generate(1);

    expect(recommendationsRepository.findProgramsByLevel).toHaveBeenNthCalledWith(2, 'grade_11', null);
  });

  it('starts transaction', async () => {
    await generate(1);
    expect(mockClient.query).toHaveBeenCalledWith('BEGIN');
  });

  it('commits transaction', async () => {
    await generate(1);
    expect(mockClient.query).toHaveBeenCalledWith('COMMIT');
  });

  it('rolls back transaction on error', async () => {
    mockClient.query
      .mockResolvedValueOnce({ rows: [] })   // BEGIN
      .mockRejectedValueOnce(new Error('DB error')); // DELETE в _saveRecommendations

    await expect(generate(1)).rejects.toThrow('DB error');
    expect(mockClient.query).toHaveBeenCalledWith('ROLLBACK');
  });

  it('releases client', async () => {
    await generate(1);
    expect(mockClient.release).toHaveBeenCalled();
  });

  it('returns recommendations for user', async () => {
    const result = await getForUser(1);
    expect(recommendationsRepository.findByUserId).toHaveBeenCalledWith(1);
    expect(result).toEqual([{ score: 90 }]);
  });
});