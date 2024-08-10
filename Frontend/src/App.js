import './App.css';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import ChatInterface from './components/ChatInterface';
import Home from './components/Home'
import Loading from './components/Loading';

function App() {
  return (
    <>
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/chat" element={<ChatInterface />} />
      </Routes>
    </Router>
    </>
  );
}

export default App;
