import React from 'react';

const GameControls = ({ isPaused, isGameOver, onTogglePause, onRestart }) => {
  return (
    <div className="mt-6 flex gap-4">
      {!isGameOver && (
        <button
          onClick={onTogglePause}
          className="bg-yellow-600 hover:bg-yellow-700 text-white py-2 px-6 rounded-lg text-lg transition-colors"
        >
          {isPaused ? 'Resume' : 'Pause'}
        </button>
      )}
      <button
        onClick={onRestart}
        className="bg-red-600 hover:bg-red-700 text-white py-2 px-6 rounded-lg text-lg transition-colors"
      >
        Restart
      </button>
    </div>
  );
};

export default GameControls;

