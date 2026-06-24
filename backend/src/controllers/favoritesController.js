import * as favoritesRepository from '../repositories/favoritesRepository.js';

async function getFavorites(req, res, next) {
  try {
    const favorites = await favoritesRepository.findByUserId(req.user.id);
    res.json(favorites);
  } catch (error) {
    next(error);
  }
}

async function getFavoriteIds(req, res, next) {
  try {
    const ids = await favoritesRepository.findIds(req.user.id);
    res.json(ids);
  } catch (error) {
    next(error);
  }
}

async function addFavorite(req, res, next) {
  try {
    const programId = Number(req.params.programId);
    await favoritesRepository.add(req.user.id, programId);
    res.json({ message: 'Добавлено в избранное' });
  } catch (error) {
    next(error);
  }
}

async function removeFavorite(req, res, next) {
  try {
    const programId = Number(req.params.programId);
    await favoritesRepository.remove(req.user.id, programId);
    res.json({ message: 'Удалено из избранного' });
  } catch (error) {
    next(error);
  }
}

export { getFavorites, getFavoriteIds, addFavorite, removeFavorite };
