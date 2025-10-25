import React, { useState, useEffect } from 'react';
import './App.css'; // Your custom CSS file
import { Language, languages } from './models/Language';
import { Difficulty, levelDifficulties } from './models/Difficulty';

type Status = 'idle' | 'loadingContent' | 'downloading' | 'generating' | 'error';

function App() {
  const [status, setStatus] = useState<Status>('idle');
  const [statusMessage, setStatusMessage] = useState('Turn any webpage into a fun, illustrated adventure!');
  
  // --- NEW STATE FOR DROPDOWNS ---
  const [language, setLanguage] = useState<Language>(languages[0]); // Default to English
  const [difficulty, setDifficulty] = useState<Difficulty>(levelDifficulties[0]); // Default to Easy

  useEffect(() => {
    const messageListener = (message: any) => {
      if (message.type === 'modelStatus') {
        // ... (this part remains the same)
      }
    };
    chrome.runtime.onMessage.addListener(messageListener);
    return () => chrome.runtime.onMessage.removeListener(messageListener);
  }, []);

  const handleCreateAdventure = async () => {
    setStatus('loadingContent');
    setStatusMessage('Reading the webpage...');
    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (!tab.id) throw new Error("Could not find active tab.");

      const results = await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        files: ['src/content.ts.js'], // Ensure this filename is correct
      });
      
      const pageData: any = results[0].result;
      
      // --- SEND NEW OPTIONS TO BACKGROUND ---
      const data = { 
        text: pageData.text, 
        imageDataUrl: pageData.imageDataUrl,
        language: language,
        difficulty: difficulty
      };
      
      chrome.runtime.sendMessage({ 
        type: 'generateAdventure', 
        data: data
      });
      
    } catch (err) {
      console.log(err);
    }
  };
  
  const isLoading = status !== 'idle' && status !== 'error';

  const updateLanguage = (value: string) => {
    try{
      var lang = languages.find((b) => b.code == value);
      if(lang){
        setLanguage(lang);
      }
    }
    catch(err){
      console.log(err);
    }
  }
  const updateDifficulty = (value: string) => {
    try{
      var diff = levelDifficulties.find((b) => b.code == value);
      console.log({diff});
      if(diff){
        setDifficulty(diff);
      }
    }
    catch(err){
      console.log(err);
    }
  }

  return (
    <div className="extension-popup">
      <h2 className="adventure-title">DoodleQuest AI</h2>

      <div className="quest-status">
        <p className={`status-text ${status === 'error' ? 'error-text' : ''}`}>
          {statusMessage}
        </p>
      </div>
      
      {/* --- NEW DROPDOWNS UI --- */}
      <div className="options-container">
        <div className="option-group">
          <label htmlFor="language-select" className="option-label">Language</label>
          <select id="language-select" value={language?.code} onChange={(e) => updateLanguage(e.target.value)} className="option-select" disabled={isLoading}>
            {languages.map((val) => (<option key={val.code} value={val.code}>{val.description}</option>))}
          </select>
        </div>
        <div className="option-group">
          <label htmlFor="difficulty-select" className="option-label">Difficulty</label>
          <select id="difficulty-select" value={difficulty?.code} onChange={(e) => updateDifficulty(e.target.value)} className="option-select" disabled={isLoading}>
            {levelDifficulties.map((val) => ( <option key={val.code} value={val.code}>{val.description}</option>))}
          </select>
        </div>
      </div>

      <button 
        onClick={handleCreateAdventure} 
        disabled={isLoading}
        className="primary-btn"
      >
        {isLoading ? 'Working...' : 'Create Adventure!'}
      </button>
    </div>
  );
}

export default App;