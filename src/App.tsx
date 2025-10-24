import React, { useState, useEffect } from 'react';
import './App.css'; // Use index.css for Tailwind

type Status = 'idle' | 'loadingContent' | 'downloading' | 'generating' | 'error';

function App() {
  const [status, setStatus] = useState<Status>('idle');
  const [statusMessage, setStatusMessage] = useState('Turn any webpage into a fun, illustrated adventure!');

  useEffect(() => {
    const messageListener = (message: any) => {
      if (message.type === 'modelStatus') {
        switch (message.status) {
          case 'downloading':
            setStatus('downloading');
            const msg = message.progress >= 100 ? 'Creating your adventure...' : `Downloading AI model... ${message.progress}%`
            setStatusMessage(msg);
             
            break;
          case 'generating':
            setStatus('generating');
            setStatusMessage('Creating your magical story...');
            break;
          case 'error':
            setStatus('error');
            setStatusMessage(message.message);
            break;
        }
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
        files: ['src/content.ts.js'],
      });
      
      const pageData: any = results[0].result;
      
      chrome.runtime.sendMessage({ 
        type: 'generateAdventure', 
        data: { text: pageData.text, imageDataUrl: pageData.imageDataUrl } 
      });
      
    } catch (err) {
      setStatus('error');
      setStatusMessage('Failed to read the page. Please try again.');
      console.error(err);
    }
  };
  
  const isLoading = status !== 'idle' && status !== 'error';

  return (
    <div className="extension-popup">
      <h2 className="adventure-title">DoodleQuest AI</h2>
      <div className="quest-status">
        <p className={`status-text ${status === 'error' ? 'error-text' : 'text-gray'}`}>
          {statusMessage}
        </p>
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