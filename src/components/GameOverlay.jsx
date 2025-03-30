import React from 'react';

const GameOverlay = ({ type, score, onRestart, onResume }) => {
  return (
    <div className="absolute inset-0 bg-black bg-opacity-70 flex flex-col items-center justify-center z-20">
      {type === 'gameover' ? (
        <>
          <div className="text-5xl mb-4 font-bold">Game Over</div>
          <div className="text-3xl mb-8">Score: {score}</div>
          <button
            onClick={onRestart}
            className="bg-blue-600 hover:bg-blue-700 text-white py-3 px-8 rounded-lg text-2xl transition-colors"
          >
            Play Again
          </button>
        </>
      ) : (
        <>
          <div className="text-5xl mb-8 font-bold">Paused</div>
          <button
            onClick={onResume}
            className="bg-blue-600 hover:bg-blue-700 text-white py-3 px-8 rounded-lg text-2xl transition-colors"
          >
            Resume
          </button>
        </>
      )}
    </div>
  );
};

export default GameOverlay;
