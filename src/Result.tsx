import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import './Result.css';
import { motion, AnimatePresence, animate } from 'framer-motion';
import { DoodleScene, Hotspot } from './ai/DoodleQuestAi';
import { shuffleArray } from './helpers/Functions';

// No changes needed here, this component is perfect.
const GeneratedDoodle = ({ svgString, className }: { svgString: string, className?: string }) => {
  if (!svgString) return null;
  const renderableSvg = svgString.replaceAll('\\"', '"');
  return <div className={className} dangerouslySetInnerHTML={{ __html: renderableSvg }} />;
};

const AdventureStepCard = ({ hotspot, onCardClick }: { hotspot: Hotspot, onCardClick: () => void }) => {
  const [feedback, setFeedback] = useState<'correct' | 'incorrect' | null>(null);
  const [validationIcon, setValidationIcon] = useState<string | null>(null);

  // This effect resets the feedback animation after a short delay
  useEffect(() => {
    if (feedback) {
      const timer = setTimeout(() => setFeedback(null), 1000);
      return () => clearTimeout(timer);
    }
  }, [feedback]);
  
  const cardVariants = {
    hidden: { opacity: 0, scale: 0.8, y: 20 },
    visible: { opacity: 1, scale: 1, y: 0 },
  };

  const handleValidationClick = (e: React.MouseEvent, isValid: boolean) => {
    e.stopPropagation(); // VERY IMPORTANT: Prevents the modal from opening when a button is clicked
    setFeedback(isValid ? 'correct' : 'incorrect');
    setValidationIcon(isValid ? '✅' : '❌');
  };
  const feedbackClass = 
    feedback === 'correct' ? 'border-green-500' :
    feedback === 'incorrect' ? 'border-red-500' :
    'border-purple-400';


  return (
    <motion.div
      variants={cardVariants}
      whileHover={{ scale: 1.05, y: -5 }}
      transition={{ type: 'spring', stiffness: 300 }}
      className={`bg-white p-4 rounded-2xl border-4 border-dashed flex flex-col items-center gap-4 shadow-xl w-48 text-center flex-shrink-0 cursor-pointer transition-colors duration-300 ${feedbackClass}`}
      onClick={onCardClick} // Set the click handler
    >
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
      <div className={``}>
        <GeneratedDoodle svgString={hotspot.hotspot_doodle_svg} className='emoji'/>
      </div>
      <div className="doodle-text">
        <p className="text-xs font-bold uppercase tracking-wider">{hotspot.pop_up_text}</p>
      </div>
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
  const [selectedHotspot, setSelectedHotspot] = useState<Hotspot | null>(null);

  useEffect(() => {
    chrome.storage.session.get('adventureResult').then(data => {
      if (data.adventureResult && data.adventureResult.length > 0) {
        
        // --- THIS IS THE KEY CHANGE ---
        // 1. Get the adventure data from the AI.
        const receivedAdventure = data.adventureResult[0];

        // 2. Shuffle the hotspots array before setting the state.
        const shuffledHotspots = shuffleArray(receivedAdventure.hotspots);

        // 3. Set the state with the shuffled data.
        setAdventure({
          ...receivedAdventure,
          hotspots: shuffledHotspots,
        });
        
      } else {
        setError("Could not find the generated adventure. Please try creating one again!");
      }
    });
  }, []);

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.3 },
    },
  };

  const fadeIn = {
    hidden: { opacity: 0, y: -20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, animate: "easeOut" } },
  };

  return (
    <div className="p-4 sm:p-8 bg-gradient-to-br from-yellow-100 to-orange-200 font-mono text-gray-900 min-h-screen  w-full flex items-center justify-center">


      <AnimatePresence>
        {error && <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-8 text-center text-red-600 font-bold text-2xl">{error}</motion.div>}
        {!adventure && !error && <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center justify-center min-h-screen text-2xl font-bold">Loading your adventure...</motion.div>}
        
        {adventure && (
          <div className="adventure-card">
            
            <motion.header variants={fadeIn}  transition={{ delay: 0.2 }}  className="mt-8 w-full">
              <h1 className="adventure-banner">
                {adventure.theme}
              </h1>
              <motion.div variants={fadeIn} transition={{ delay: 0.2 }} className="max-w-3xl mx-auto text-lg text-gray-700 leading-relaxed">
                
              <div className="adventure-description">
                {adventure.summary}
              </div>
              </motion.div>
            </motion.header>

            <motion.div 
              variants={staggerContainer}
              initial="hidden"
              animate="visible"
              className="flex flex-col items-center gap-8 mt-8 w-full"
            >
              <motion.div variants={fadeIn} className="main-adventure-container ">
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

              {/* --- THIS IS THE CORRECTED SINGLE-ROW LAYOUT --- */}
              <motion.div variants={fadeIn} className="quest-panel">
                <h2 className="quest-heading">Select all valid Quests for {adventure.theme}</h2>
                {/* Use flex and flex-nowrap to create a scrolling horizontal row */}
                <div className="horizontal-scroll">
                  {adventure.hotspots.map((hotspot, index) => (                     
                    <AdventureStepCard 
                      key={index}
                      hotspot={hotspot}
                      onCardClick={() => setSelectedHotspot(hotspot)}
                    />
                  ))}
                </div>
              </motion.div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ResultPage />
  </React.StrictMode>,
);