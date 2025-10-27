import React, { useState, useEffect, useMemo } from 'react';
import ReactDOM from 'react-dom/client';
import './Result.css'; // Your existing CSS
import './GameOver.css'; // The new CSS for the game over screen
import { motion, AnimatePresence, animate } from 'framer-motion';
import { shuffleArray } from './helpers/Functions';
import { DoodleScene, Hotspot } from './ai/DoodleQuestAi';
import { Difficulty, levelDifficulties } from './models/Difficulty';


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
      className={`bg-white p-4 rounded-2xl border-4 border-dashed flex flex-col items-center gap-4 shadow-xl w-48 text-center flex-shrink-0 cursor-pointer transition-colors duration-300 ${feedbackClass}`}
    >
      <div className="w-full h-32 doodle-container p-2">
        <GeneratedDoodle svgString={hotspot.hotspot_doodle_svg} className='emoji-small' />
      </div>
      <div className="doodle-text" title='' onClick={handleDescription}>
        <p className={`doodle-label`} title='Check the button if quest is valid'>{hotspot.pop_up_text}</p>
        <ValidationButton hotspot={hotspot} handleValidation={handleValidation }  />
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
              title="Check the button if quest is valid"
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
const GameOverScreen = ({ didWin, onReplay, hotspot }: { didWin: boolean, onReplay: () => void, hotspot: Hotspot | null }) => {
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
        <div className="game-over-emoji">{didWin ? '🎉' : '😢'}</div>
        <h2 className={`game-over-title ${didWin ? 'win' : 'loss'}`}>
          {didWin ? 'You Won!' : 'Game Over!'}
        </h2>
        <p className="game-over-message">
          {didWin
            ? 'Great job! You found all the quests for the adventure.'
            : `The quest you selected is invalid. \n ${hotspot?.description}`}
        </p>
        <button onClick={onReplay} className="replay-button">
          Replay
        </button>
      </motion.div>
    </motion.div>
  );
};

const DescriptionModal = ({ hotspot, onClose, descriptionStyle }: { hotspot: Hotspot | null, onClose: () => void, descriptionStyle: string }) => {
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
          <h1 className={`section-title ${descriptionStyle}`}>{hotspot.pop_up_text}</h1>
          <p className={`relaxed-text ${descriptionStyle}`}>{hotspot. description}</p>
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
  const [difficulty, setDifficulty] = useState<Difficulty>(levelDifficulties[0]);
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
  // Function to load and shuffle data
  const loadDifficulty = () => {
    chrome.storage.session.get('difficulty').then(data => {
      if (data.difficulty) {
        setDifficulty(data.difficulty);
      } else {
        setError("Could not find the generated adventure. Please try creating one again!");
      }
    });
  };

  useEffect(() => {
    loadAdventure();
    loadDifficulty();
  }, []); // Load on initial mount

  const handleReplay = () => {
    window.location.reload();
  };

  const handleValidation = (hotspot: Hotspot) => {
    setSelectedHotspot(hotspot);
    setShowDescriptionModal(hotspot.isValid);
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
  const [showDescriptionModal, setShowDescriptionModal] = useState<boolean>(true);

  // --- JSX for the page ---
  return (
    <>
      {
        adventure && <div className='adventure-header'>
          <h1 className="adventure-banner text-primary">{adventure.theme}</h1>
      </div>
      }
      <div className="page">
        <AnimatePresence>
          {(gameState === 'win' || gameState === 'loss') && (
            <GameOverScreen didWin={gameState === 'win'} onReplay={handleReplay} hotspot={selectedHotspot} />
          )}
        </AnimatePresence>

        <div className="main-container">
          {error && <div>{error}</div>}
          {!adventure && !error && <div>Loading your adventure...</div>}
          
          {adventure && (
            <div className="adventure-card">
              <motion.header className="adventure-banner">
                <div className="adventure-theme-panel">
                  <p className='quest-heading '>{adventure.summary}</p>
                  <motion.div className="main-adventure-container">
                    <h1 className="text-primary main-adventure-heading ">THEME</h1>
                    <h2 className="text-primary main-adventure-heading "><u>{adventure.doodle_description}</u></h2>
                    <div className="h-64 sm:h-80 doodle-container p-2">
                      <GeneratedDoodle svgString={adventure.main_doodle_svg} className='emoji-small'/>
                    </div>
                    {/* <p className="main-scene-description">{adventure.doodle_description}</p> */}
                  </motion.div>
                </div>
              </motion.header>

              <motion.div className="quest-container">

                
              <AnimatePresence>
                {selectedHotspot && showDescriptionModal && (
                  <DescriptionModal 
                    hotspot={selectedHotspot} 
                    onClose={() => setSelectedHotspot(null)} 
                    // descriptionStyle={['easy', 'medium'].includes(difficulty.code) 
                    //   ? (selectedHotspot.isValid ? 'text-success' : 'text-danger')
                    //   : 'text-default' }
                    descriptionStyle={selectedHotspot.isValid ? 'text-success' : 'text-danger'}
                  />
                )}
              </AnimatePresence>


                <motion.div className="quest-panel">
                  <h2 className="quest-heading adventure-theme-panel">
                    Find all {adventure.hotspots.filter((b) => b.isValid)?.length} valid Quests for "{adventure.theme}"
                  </h2>
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
    </>
  );
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ResultPage />
  </React.StrictMode>,
);