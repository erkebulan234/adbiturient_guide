import * as programsRepository from '../repositories/programsRepository.js';

const DEFAULT_LIMIT = 12;
const MAX_LIMIT = 1000;

async function getPrograms(filters) {
  const page  = Math.max(1, Number(filters.page) || 1);
  let limit = Number(filters.limit) || DEFAULT_LIMIT;
  limit = Math.min(Math.max(1, limit), MAX_LIMIT);

  const { rows, total, stats } = await programsRepository.findAll({
    ...filters,
    page,
    limit
  });

  return {
    items: rows,
    stats,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.max(1, Math.ceil(total / limit))
    }
  };
}

export { getPrograms };