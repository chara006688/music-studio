import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import DrumKit from './pages/DrumKit';
import Visualizer from './pages/Visualizer';
import Effects from './pages/Effects';
import Piano from './pages/Piano';
import './App.css';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/drum-kit" element={<DrumKit />} />
        <Route path="/visualizer" element={<Visualizer />} />
        <Route path="/effects" element={<Effects />} />
        <Route path="/piano" element={<Piano />} />
      </Routes>
    </Router>
  );
}

export default App;
