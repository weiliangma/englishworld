import { BrowserRouter, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import MapPage from './pages/MapPage';
import QuestionPage from './pages/QuestionPage';
import PetPage from './pages/PetPage';
import VocabShootPage from './pages/VocabShootPage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/map" element={<MapPage />} />
        <Route path="/skill/:skillId" element={<QuestionPage />} />
        <Route path="/pet" element={<PetPage />} />
        <Route path="/vocab/shoot" element={<VocabShootPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
