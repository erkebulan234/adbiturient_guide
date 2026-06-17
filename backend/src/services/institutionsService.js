const institutionsRepository = require('../repositories/institutionsRepository');

async function getInstitutions(filters) {
  return institutionsRepository.findAll(filters);
}

module.exports = { getInstitutions };
