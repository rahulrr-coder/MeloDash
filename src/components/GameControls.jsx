import React from 'react';

const GameControls = ({ isPaused, isGameOver, isStarted, onTogglePause, onRestart, onStart }) => {
  return (
    <div className="mt-6 flex gap-4">
      {!isStarted && !isGameOver && (
        <button
          onClick={onStart}
          className="bg-green-600 hover:bg-green-700 text-white py-2 px-6 rounded-lg text-lg transition-colors"
        >
          Start Game
        </button>
      )}
      
      {isStarted && !isGameOver && (
        <button
          onClick={onTogglePause}
          className="bg-yellow-600 hover:bg-yellow-700 text-white py-2 px-6 rounded-lg text-lg transition-colors"
        >
          {isPaused ? 'Resume' : 'Pause'}
        </button>
      )}
      
      {(isStarted || isGameOver) && (
        <button
          onClick={onRestart}
          className="bg-red-600 hover:bg-red-700 text-white py-2 px-6 rounded-lg text-lg transition-colors"
        >
          Restart
        </button>
      )}
    </div>
  );
};

export default GameControls;