import React from 'react';

const GameOverlay = ({ type, score, highScore, onRestart, onResume, onStart, isNewHighScore, initAudio }) => {
  // Function to handle both audio initialization and action
  const handleAction = (action) => {
    // First initialize audio context with user gesture
    initAudio();
    // Then perform the action
    action();
  };

  return (
    <div className="absolute inset-0 bg-black bg-opacity-70 flex flex-col items-center justify-center z-20">
      {type === 'start' ? (
        <>
          <div className="text-5xl mb-4 font-bold">MeloDash</div>
          {highScore > 0 && (
            <div className="text-xl mb-2 text-yellow-400">
              High Score: {Math.floor(highScore)}
            </div>
          )}
          <div className="text-2xl mb-8 text-center max-w-lg">
            Hit the tiles as they reach the white zone using the arrow keys
          </div>
          <button
            onClick={() => handleAction(onStart)}
            className="bg-green-600 hover:bg-green-700 text-white py-3 px-8 rounded-lg text-2xl transition-colors"
          >
            Start Game
          </button>
        </>
      ) : type === 'gameover' ? (
        <>
          <div className="text-5xl mb-4 font-bold">Game Over</div>
          <div className="text-3xl mb-2">Score: {Math.floor(score)}</div>
          
          {isNewHighScore ? (
            <div className="text-3xl mb-8 text-yellow-400 animate-pulse">
              New High Score!
            </div>
          ) : (
            <div className="text-xl mb-8">
              High Score: {Math.floor(highScore)}
            </div>
          )}
          
          <button
            onClick={() => handleAction(onRestart)}
            className="bg-blue-600 hover:bg-blue-700 text-white py-3 px-8 rounded-lg text-2xl transition-colors"
          >
            Play Again
          </button>
        </>
      ) : (
        <>
          <div className="text-5xl mb-8 font-bold">Paused</div>
          <button
            onClick={() => handleAction(onResume)}
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