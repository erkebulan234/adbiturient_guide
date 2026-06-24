import * as institutionsRepository from '../repositories/institutionsRepository.js';

async function getInstitutions(filters) {
  return institutionsRepository.findAll(filters);
}

export { getInstitutions };
