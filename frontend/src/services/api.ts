import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000',
  headers: { 'Content-Type': 'application/json' },
});

export default api;

// === User / Stats ===
export const getStats = () => api.get('/api/v1/stats').then(r => r.data);

// === Skills ===
export const getSkills = () => api.get('/api/v1/skills').then(r => r.data);

// === Questions ===
export const getQuestions = (skillId: number) =>
  api.get(`/api/v1/skills/${skillId}/questions`).then(r => r.data);

export const submitAnswer = (data: {
  question_id: number;
  user_answer: string;
  time_spent: number;
}) => api.post('/api/v1/answer', data).then(r => r.data);

// === Pet ===
export const getPet = () => api.get('/api/v1/pet').then(r => r.data);
export const feedPet = () => api.post('/api/v1/pet/feed').then(r => r.data);
export const playPet = () => api.post('/api/v1/pet/play').then(r => r.data);
export const cleanPet = () => api.post('/api/v1/pet/clean').then(r => r.data);
export const sleepPet = () => api.post('/api/v1/pet/sleep').then(r => r.data);
export const getPetShop = () => api.get('/api/v1/pet/shop').then(r => r.data);
export const buyPetItem = (itemId: number) =>
  api.post('/api/v1/pet/shop/buy', { item_id: itemId }).then(r => r.data);

// === Vocab ===
export const getVocabTopics = () => api.get('/api/v1/vocab/topics').then(r => r.data);

// === Reading ===
export const getReadingTower = () => api.get('/api/v1/reading/tower').then(r => r.data);
export const getReadingFloor = (floorId: number) =>
  api.get(`/api/v1/reading/floor/${floorId}`).then(r => r.data);

// === Listening ===
export const getListeningChannels = () =>
  api.get('/api/v1/listening/channels').then(r => r.data);

// === Review ===
export const getDueReviews = () => api.get('/api/v1/review/due').then(r => r.data);
export const getNextReview = () => api.get('/api/v1/review/next').then(r => r.data);
export const submitReview = (data: { question_id: number; user_answer: string }) =>
  api.post('/api/v1/review/answer', data).then(r => r.data);
export const getReviewStats = () => api.get('/api/v1/review/stats').then(r => r.data);

// === Pronounce ===
export const getPronunciation = (word: string) =>
  api.get(`/api/v1/pronounce/${encodeURIComponent(word)}`).then(r => r.data);

// === Achievements ===
export const getAchievements = () => api.get('/api/v1/achievements').then(r => r.data);

// === Wrong Book ===
export const getWrongBook = () => api.get('/api/v1/wrong-book').then(r => r.data);
