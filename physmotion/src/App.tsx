import { Route, Routes } from 'react-router-dom';
import Layout from './components/layout/Layout';
import HomePage from './pages/HomePage';
import AnalyzerPage from './pages/AnalyzerPage';
import HowItWorksPage from './pages/HowItWorksPage';
import AboutPage from './pages/AboutPage';

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/analizador" element={<AnalyzerPage />} />
        <Route path="/como-funciona" element={<HowItWorksPage />} />
        <Route path="/equipo" element={<AboutPage />} />
      </Route>
    </Routes>
  );
}
