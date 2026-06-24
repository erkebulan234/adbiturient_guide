import * as profileService from '../services/profileService.js';

async function getProfile(req, res, next) {
  try {
    const profile = await profileService.getProfile(req.user.id);
    res.json(profile);
  } catch (error) {
    next(error);
  }
}

async function saveProfile(req, res, next) {
  try {
    const profile = await profileService.saveProfile(req.user.id, req.body);
    res.json({ message: 'Анкета сохранена', profile });
  } catch (error) {
    next(error);
  }
}

export {
  getProfile,
  saveProfile
};
