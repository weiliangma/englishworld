import { BrowserRouter, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import MapPage from './pages/MapPage';
import QuestionPage from './pages/QuestionPage';
import PetPage from './pages/PetPage';
import VocabShootPage from './pages/VocabShootPage';
import VocabSpellPage from './pages/VocabSpellPage';
import CollocationPage from './pages/CollocationPage';
import ConfusablePage from './pages/ConfusablePage';
import ReviewPage from './pages/ReviewPage';
import WrongBookPage from './pages/WrongBookPage';
import AchievementsPage from './pages/AchievementsPage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/map" element={<MapPage />} />
        <Route path="/skill/:skillId" element={<QuestionPage />} />
        <Route path="/pet" element={<PetPage />} />
        <Route path="/vocab/shoot" element={<VocabShootPage />} />
        <Route path="/vocab/spell" element={<VocabSpellPage />} />
        <Route path="/vocab/collocation" element={<CollocationPage />} />
        <Route path="/vocab/confusable" element={<ConfusablePage />} />
        <Route path="/review" element={<ReviewPage />} />
        <Route path="/wrong-book" element={<WrongBookPage />} />
        <Route path="/achievements" element={<AchievementsPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
