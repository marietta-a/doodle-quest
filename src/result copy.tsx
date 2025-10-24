import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import './App.css'; 
import { motion, AnimatePresence, animate } from 'framer-motion';
import { DoodleScene, Hotspot } from './ai/DoodleQuestAi';


const GeneratedDoodle = ({ svgString, className }: { svgString: string, className?: string }) => {
  if (!svgString) return null;
  const renderableSvg = svgString.replaceAll('\\"', '"');
  return <div className={className} dangerouslySetInnerHTML={{ __html: renderableSvg }} />;
};


const AdventureStepCard = ({ hotspot, onClick }: { hotspot: Hotspot, onClick: () => void }) => {
  const cardVariants = {
    hidden: { opacity: 0, scale: 0.8, y: 20 },
    visible: { opacity: 1, scale: 1, y: 0 },
  };

  return (
    <motion.div
      variants={cardVariants}
      whileHover={{ scale: 1.05, y: -5 }}
      transition={{ type: 'spring', stiffness: 300 }}
      className="bg-white p-4 rounded-2xl border-4 border-dashed border-purple-400 flex flex-col items-center gap-4 shadow-xl w-48 text-center flex-shrink-0 cursor-pointer"
      onClick={onClick} // Set the click handler
    >
      <div className="w-full h-32 doodle-container p-2">
        <GeneratedDoodle svgString={hotspot.hotspot_doodle_svg} />
      </div>
      <div className="bg-gradient-to-r from-purple-500 to-indigo-600 text-white px-3 py-2 rounded-xl w-full flex-grow flex items-center justify-center">
        <p className="text-xs font-bold uppercase tracking-wider">{hotspot.pop_up_text}</p>
      </div>
    </motion.div>
  );
};

// --- NEW COMPONENT: The Description Popup Modal ---
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
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={onClose} // Close modal on backdrop click
    >
      <motion.div
        variants={modalVariants}
        className="bg-white p-6 rounded-3xl border-4 border-dashed border-blue-500 shadow-2xl w-full max-w-md text-center"
        onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside the modal
      >
        <div className="w-48 h-48 mx-auto doodle-container mb-4">
          <GeneratedDoodle svgString={hotspot.hotspot_doodle_svg} />
        </div>
        <h3 className="text-2xl font-bold text-gray-800 mb-2">{hotspot.pop_up_text}</h3>
        <p className="text-gray-600 leading-relaxed">{hotspot.summary}</p>
        <button
          onClick={onClose}
          className="mt-6 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-bold py-2 px-6 rounded-xl shadow-lg hover:scale-105 transition-transform"
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
  // NEW STATE: To track which hotspot is selected for the popup
  const [selectedHotspot, setSelectedHotspot] = useState<Hotspot | null>(null);

  useEffect(() => {
    chrome.storage.session.get('adventureResult').then(data => {
      if (data.adventureResult && data.adventureResult.length > 0) {
        setAdventure(data.adventureResult[0]);
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
    <div className="p-4 sm:p-8 bg-gradient-to-br from-yellow-100 to-orange-200 font-mono text-gray-900 min-h-screen w-full flex items-center justify-center">
      {/* --- RENDER THE MODAL using AnimatePresence for smooth exit animations --- */}
      <AnimatePresence>
        {selectedHotspot && (
          <DescriptionModal 
            hotspot={selectedHotspot} 
            onClose={() => setSelectedHotspot(null)} 
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {error && <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-8 text-center text-red-600 font-bold text-2xl">{error}</motion.div>}
        {!adventure && !error && <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center justify-center min-h-screen text-2xl font-bold">Loading your adventure...</motion.div>}
        
        {adventure && (
          <div className="max-w-7xl mx-auto flex flex-col items-center justify-center text-center">
            
            <motion.header variants={fadeIn} initial="hidden" animate="visible" className="mb-8 w-full">
              <h1 className="text-4xl sm:text-6xl font-black mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent capitalize tracking-tight">
                {adventure.theme}
              </h1>
              <div className="w-32 h-2 bg-gradient-to-r from-blue-500 to-purple-600 mx-auto rounded-full shadow-lg mb-6"></div>
              <motion.p variants={fadeIn} transition={{ delay: 0.2 }} className="max-w-3xl mx-auto text-lg text-gray-700 leading-relaxed">
                <h2 className="text-xl sm:text-2xl font-semibold text-blue-700 italic text-center mb-2">
                  {adventure.summary}
                </h2>
              </motion.p>
            </motion.header>

            <motion.div 
              variants={staggerContainer}
              initial="hidden"
              animate="visible"
              className="flex flex-col items-center gap-8 mt-8 w-full"
            >
              <motion.div variants={fadeIn} className="p-6 bg-white/90 backdrop-blur-sm rounded-3xl border-4 border-dashed border-blue-500 shadow-2xl w-full max-w-lg">
                <h2 className="text-2xl font-bold mb-4">The Main Scene</h2>
                <div className="h-64 sm:h-80 doodle-container p-2">
                  <GeneratedDoodle svgString={adventure.main_doodle_svg} />
                </div>
                <p className="text-center text-md italic text-gray-600 mt-4">{adventure.doodle_description}</p>
              </motion.div>

              <motion.div variants={fadeIn} className="p-6 bg-white/80 backdrop-blur-sm rounded-3xl border-4 border-dashed border-purple-500 shadow-2xl w-full">
                <h2 className="text-2xl font-bold mb-6 text-center">Quest Steps (Click a card to learn more!)</h2>
                <div className="flex flex-nowrap gap-6 overflow-x-auto pb-4">
                  {adventure.hotspots.map((hotspot, index) => (                     
                    <AdventureStepCard 
                      key={index}
                      hotspot={hotspot}
                      onClick={() => setSelectedHotspot(hotspot)} // Set the selected hotspot on click
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