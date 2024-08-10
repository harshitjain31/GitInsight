import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import github from '../assets/github-mark.svg';
import Loading from './Loading';
import '../App.css';
import Footer from './Footer';

const Home = () => {
  const [repoURL, setRepoURL] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleRepoURLChange = (e) => {
    setRepoURL(e.target.value);
  };

  const handleSubmit = async (e) => {

    setLoading(true);
    const res = await fetch('http://127.0.0.1:5000/initialize_github', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ repoUrl: repoURL})
    });

    const data = await res.json();
    setLoading(false);
    navigate('/chat')
  };

  return (
    <>
    {!loading && <div className='repository-gpt'>
      <h1><img src={github} alt="" className='gitImg'></img>GitInsight</h1>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="repo-url">Enter the GitHub repository URL</label>
          <input 
            type="url" 
            id="repo-url" 
            value={repoURL} 
            onChange={handleRepoURLChange} 
            placeholder="https://github.com/facebook/react"
          />
        </div>
        <button type="submit">Ask →</button>
      </form>
      <Footer/>
    </div>}
    {loading && <Loading />}
    </>
  );
};

export default Home;
