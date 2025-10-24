import React, { useState, useEffect, useMemo } from 'react';

const Hotspot = ({ keyword }: { keyword: string }) => {
  const [isHovered, setIsHovered] = useState(false);
  const doodleUrl = chrome.runtime.getURL(`doodles/${keyword.toLowerCase()}.svg`);

  return (
    <span 
      className="hotspot"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {keyword}
      {isHovered && (
        <div className="doodle-popup">
          <img src={doodleUrl} alt={keyword} />
        </div>
      )}
    </span>
  );
};

const StoryPage = () => {
  const [story, setStory] = useState('Loading your adventure...');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Function to load the story from storage
    const loadStory = async () => {
      const result = await chrome.storage.local.get('storyResult');
      if (result.storyResult) {
        setStory(result.storyResult);
      } else {
        setStory("Couldn't find a story. Please try generating one again.");
      }
    };

    loadStory();

    // Listen for changes (like when an alternate ending is generated)
    const storageListener = (changes: { [key: string]: chrome.storage.StorageChange; }, areaName: string) => {
      if (areaName === 'local' && changes.storyResult) {
        setStory(changes.storyResult.newValue);
        setIsLoading(false);
      }
    };
    chrome.storage.onChanged.addListener(storageListener);

    // Cleanup listener on component unmount
    return () => {
      chrome.storage.onChanged.removeListener(storageListener);
    };
  }, []);

  const handleAlternateEnding = () => {
    setIsLoading(true);
    chrome.runtime.sendMessage({ type: 'generateAlternateEnding', data: { story } });
  };

  const parsedStory = useMemo(() => {
    const parts = story.split(/(\[[a-zA-Z0-9]+\])/g);
    return parts.map((part, index) => {
      if (part.startsWith('[') && part.endsWith(']')) {
        const keyword = part.slice(1, -1);
        return <Hotspot key={index} keyword={keyword} />;
      }
      return part;
    });
  }, [story]);

  return (
    <div className="story-container">
      <h1>Your DoodleQuest Adventure!</h1>
      <div className="story-text">
        {parsedStory}
      </div>
      <button onClick={handleAlternateEnding} disabled={isLoading}>
        {isLoading ? 'Rewriting...' : 'Give Me a Different Ending!'}
      </button>
    </div>
  );
};

export default StoryPage;