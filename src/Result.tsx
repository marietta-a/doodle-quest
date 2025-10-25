import React, { useState, useEffect, useMemo } from 'react';
import ReactDOM from 'react-dom/client';
import './Result.css'; // Your existing CSS
import './GameOver.css'; // The new CSS for the game over screen
import { motion, AnimatePresence, animate } from 'framer-motion';
import { shuffleArray } from './helpers/Functions';
import { DoodleScene, Hotspot } from './ai/DoodleQuestAi';


const GeneratedDoodle = ({ svgString, className }: { svgString: string, className?: string }) => {
  if (!svgString) return null;
  const renderableSvg = svgString.replaceAll('\\"', '"');
  return <div className={className} dangerouslySetInnerHTML={{ __html: renderableSvg }} />;
};

// --- INTERACTIVE CARD COMPONENT ---
const AdventureStepCard = ({ hotspot, handleDescription, handleValidation}: { 
  hotspot: Hotspot, 
  handleDescription: () => void,
  handleValidation: () => void
}) => {
  const [feedback, setFeedback] = useState<'correct' | 'incorrect' | null>(null);
  

  const feedbackClass = 
    feedback === 'correct' ? 'border-green-500' :
    feedback === 'incorrect' ? 'border-red-500' :
    'border-purple-400';

  return (
    <motion.div
      onClick={handleDescription}
      className={`bg-white p-4 rounded-2xl border-4 border-dashed flex flex-col items-center gap-4 shadow-xl w-48 text-center flex-shrink-0 cursor-pointer transition-colors duration-300 ${feedbackClass}`}
    >
      <ValidationButton hotspot={hotspot} handleValidation={handleValidation }  />
      <div className="w-full h-32 doodle-container p-2">
        <GeneratedDoodle svgString={hotspot.hotspot_doodle_svg} className='emoji' />
      </div>
      <div className="doodle-text">
        <p className="doodle-label">{hotspot.pop_up_text}</p>
      </div>
    </motion.div>
  );
};

const ValidationButton = ({hotspot, handleValidation} : {hotspot: Hotspot, handleValidation: () => void}) => {
  const [validationIcon, setValidationIcon] = useState<string | null>(null);
  
  const handleValidationClick = (e: React.MouseEvent, isValid: boolean) => {
    e.stopPropagation(); // VERY IMPORTANT: Prevents the modal from opening when a button is clicked
    setValidationIcon(isValid ? '✅' : '❌');
    handleValidation();
  };

  return (
    <div className="icon-btn-container">
          <div className="flex-gap">
            <button
              onClick={(e) => handleValidationClick(e,  hotspot.isValid == true)}
              className={`icon-btn icon-btn-success`}
              title="Validation"
            >
            {validationIcon}
          </button>
          {/* <button
            onClick={(e) => handleValidationClick(e, hotspot.isValid == true)}
            className="icon-btn icon-btn-danger"
            title="No"
          >
            
          </button> */}
        </div>  
    </div>
  );
      
};

// --- GAME OVER SCREEN COMPONENT ---
const GameOverScreen = ({ didWin, onReplay }: { didWin: boolean, onReplay: () => void }) => {
  const backdropVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
    exit: { opacity: 0 },
  };

  const modalVariants = {
    hidden: { opacity: 0, scale: 0.7 },
    visible: { opacity: 1, scale: 1, transition: { animate: 'spring', stiffness: 250, damping: 20 } },
    exit: { opacity: 0, scale: 0.7 },
  };

  return (
    <motion.div variants={backdropVariants} initial="hidden" animate="visible" exit="exit" className="game-over-overlay">
      <motion.div variants={modalVariants} className={`game-over-content ${didWin ? 'win' : 'loss'}`}>
        <div className="game-over-emoji">{didWin ? '🎉' : '🤔'}</div>
        <h2 className={`game-over-title ${didWin ? 'win' : 'loss'}`}>
          {didWin ? 'You Won!' : 'Try Again!'}
        </h2>
        <p className="game-over-message">
          {didWin
            ? 'Great job! You found all the correct steps for the adventure.'
            : "Oops! It looks like you selected a step that wasn't part of the quest."}
        </p>
        <button onClick={onReplay} className="replay-button">
          Replay
        </button>
      </motion.div>
    </motion.div>
  );
};

const DescriptionModal = ({ hotspot, onClose }: { hotspot: Hotspot | null, onClose: () => void }) => {
  if (!hotspot) return null;

  const backdropVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
    exit: { opacity: 0 },
  };

  const modalVariants = {
    hidden: { opacity: 0, y: 50, scale: 0.8 },
    visible: { opacity: 1, y: 0, scale: 1, transition: { animate: 'spring', stiffness: 300, damping: 25 } },
    exit: { opacity: 0, y: 50, scale: 0.8 },
  };
  
    return (
      <motion.div
        variants={backdropVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
        className="modal-overlay"
        onClick={onClose} // Close modal on backdrop click
      >
        <motion.div
          variants={modalVariants}
          className="modal-content"
          onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside the modal
        >
          <h3 className="section-title">{hotspot.pop_up_text}</h3>
          <p className="relaxed-text">{hotspot. description}</p>
          <button
            onClick={onClose}
            className="cta-button"
          >
            Got it!
          </button>
        </motion.div>
      </motion.div>
    );
  };


function ResultPage() {
  const [adventure, setAdventure] = useState<DoodleScene | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  // --- NEW GAME STATE MANAGEMENT ---
  const [gameState, setGameState] = useState<'playing' | 'win' | 'loss'>('playing');
  const [correctlySelected, setCorrectlySelected] = useState<Set<string>>(new Set());
  
  // Memoize the total number of valid hotspots to prevent recalculation
  const totalValidHotspots = useMemo(() => {
    return adventure?.hotspots.filter(h => h.isValid).length || 0;
  }, [adventure]);

  // Function to load and shuffle data
  const loadAdventure = () => {
    chrome.storage.session.get('adventureResult').then(data => {
      if (data.adventureResult && data.adventureResult.length > 0) {
        const receivedAdventure = data.adventureResult[0];
        const shuffledHotspots = shuffleArray(receivedAdventure.hotspots);
        setAdventure({ ...receivedAdventure, hotspots: shuffledHotspots });
        setGameState('playing');
        setCorrectlySelected(new Set());
      } else {
        setError("Could not find the generated adventure. Please try creating one again!");
      }
    });
  };

  useEffect(() => {
    loadAdventure();
  }, []); // Load on initial mount

  const handleReplay = () => {
    loadAdventure(); // Reload and reshuffle the data
  };

  const handleValidation = (hotspot: Hotspot) => {
    if (gameState !== 'playing') return;

    if (!hotspot.isValid) {
      setGameState('loss'); // If they click an invalid card, they lose
    } else {
      const newCorrectlySelected = new Set(correctlySelected);
      newCorrectlySelected.add(hotspot.pop_up_text);
      setCorrectlySelected(newCorrectlySelected);

      // Check for win condition
      if (newCorrectlySelected.size === totalValidHotspots) {
        setGameState('win');
      }
    }
  };
  const [selectedHotspot, setSelectedHotspot] = useState<Hotspot | null>(null);

  // --- JSX for the page ---
  return (
    <div className="p-4 sm:p-8 bg-gradient-to-br from-yellow-100 to-orange-200 font-mono text-gray-900 min-h-screen w-full flex items-center justify-center">
      <AnimatePresence>
        {(gameState === 'win' || gameState === 'loss') && (
          <GameOverScreen didWin={gameState === 'win'} onReplay={handleReplay} />
        )}
      </AnimatePresence>

      <div className="max-w-7xl mx-auto flex flex-col items-center justify-center text-center">
        {error && <div>{error}</div>}
        {!adventure && !error && <div>Loading your adventure...</div>}
        
        {adventure && (
          <div className="adventure-card">
            <motion.header className="mt-8 w-full">
              <h1 className="adventure-banner">{adventure.theme}</h1>
              <div className="adventure-description">{adventure.summary}</div>
            </motion.header>

            <motion.div className="flex flex-col items-center gap-8 mt-8 w-full">
              <motion.div className="main-adventure-container">
                <h2 className="main-adventure-heading">THEME</h2>
                <div className="h-64 sm:h-80 doodle-container p-2">
                  <GeneratedDoodle svgString={adventure.main_doodle_svg} className='emoji'/>
                </div>
                <p className="main-scene-description">{adventure.doodle_description}</p>
              </motion.div>

              
            <AnimatePresence>
              {selectedHotspot && (
                <DescriptionModal 
                  hotspot={selectedHotspot} 
                  onClose={() => setSelectedHotspot(null)} 
                />
              )}
            </AnimatePresence>


              <motion.div className="quest-panel">
                <h2 className="quest-heading">Select all valid Quests for "{adventure.theme}"</h2>
                <div className="horizontal-scroll">
                  {adventure.hotspots.map((hotspot, index) => (                     
                    <AdventureStepCard 
                      key={`${hotspot.pop_up_text}-${index}`} // A more stable key
                      hotspot={hotspot}
                      handleDescription={() => setSelectedHotspot(hotspot)} 
                      handleValidation= { () => handleValidation(hotspot)}                    
                    />
                  ))}
                </div>
              </motion.div>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ResultPage />
  </React.StrictMode>,
);