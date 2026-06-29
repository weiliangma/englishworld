import { BrowserRouter, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import MapPage from './pages/MapPage';
import QuestionPage from './pages/QuestionPage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/map" element={<MapPage />} />
        <Route path="/skill/:skillId" element={<QuestionPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
