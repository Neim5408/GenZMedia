const storyModel = require('../models/storyModel');

const createStory = async (userId, contentText, mediaUrl, mediaType, backgroundColor) => {
  if (!userId) throw new Error('User ID wajib dikirim');
  return await storyModel.createStory(userId, contentText, mediaUrl, mediaType, backgroundColor);
};

const fetchFeedForUser = async (userId) => {
  return await storyModel.getStoriesForFollowers(userId);
};

const fetchUserStories = async (userId) => {
  return await storyModel.getStoriesByUser(userId);
};

const deleteExpiredStories = async () => {
  return await storyModel.deleteExpiredStories();
};

const fetchAllStories = async () => {
  return await storyModel.getAllStories();
};

const removeStory = async (storyId) => {
  if (!storyId) throw new Error('Story ID wajib dikirim');
  return await storyModel.deleteStoryById(storyId);
};

module.exports = { createStory, fetchFeedForUser, fetchUserStories, deleteExpiredStories, fetchAllStories, removeStory };
