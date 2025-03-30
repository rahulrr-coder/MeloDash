import React, { useEffect } from 'react';
import Lane from './Lane';
import PianoKey from './PianoKey';
import Tile from './Tile';
import GameControls from './GameControls';
import GameOverlay from './GameOverlay';
import useGameLogic from '../hooks/useGameLogic';
import { LANES } from '../constants';

const Game = () => {
  const {
    gameState,
    handleKeyDown,
    handleKeyUp,
    togglePause,
    restartGame,
    startGame
  } = useGameLogic();

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [handleKeyDown, handleKeyUp]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen text-white p-4">
      <h1 className="text-4xl font-bold mb-2">Piano Tiles</h1>
      <div className="mb-4 text-2xl">
        Score: {gameState.score}
      </div>
      
      <div className="relative w-full max-w-4xl h-[70vh] bg-gray-800 overflow-hidden rounded-lg shadow-2xl">
        {/* Hit zone indicator */}
        <div className="absolute top-[60%] left-0 w-full h-[15%] border-t-2 border-b-2 border-white border-opacity-20 z-10"></div>
        
        {/* Game board with 4 lanes */}
        <div className="absolute top-0 left-0 w-full h-full flex">
          {LANES.map((lane, index) => (
            <Lane key={index} index={index} />
          ))}
        </div>
        
        {/* Falling tiles */}
        {gameState.tiles.map(tile => (
          <Tile 
            key={tile.id} 
            tile={tile} 
            laneColor={LANES[tile.lane].color} 
          />
        ))}
        
        {/* Piano keys at the bottom */}
        <div className="absolute bottom-0 left-0 w-full flex">
          {LANES.map((lane, index) => (
            <PianoKey 
              key={index} 
              lane={lane} 
              isPressed={gameState.pressedKeys[lane.key]} 
            />
          ))}
        </div>
        
        {/* Show start screen if game is not started */}
        {!gameState.isStarted && !gameState.isGameOver && (
          <GameOverlay 
            type="start" 
            onStart={startGame} 
          />
        )}
        
        {/* Game over overlay */}
        {gameState.isGameOver && (
          <GameOverlay 
            type="gameover" 
            score={gameState.score} 
            onRestart={restartGame} 
          />
        )}
        
        {/* Pause overlay */}
        {gameState.isPaused && !gameState.isGameOver && (
          <GameOverlay 
            type="paused" 
            onResume={togglePause} 
          />
        )}
      </div>
      
      {/* Game controls */}
      <GameControls 
        isPaused={gameState.isPaused} 
        isGameOver={gameState.isGameOver} 
        isStarted={gameState.isStarted}
        onTogglePause={togglePause} 
        onRestart={restartGame} 
        onStart={startGame}
      />
      
      <div className="mt-6 text-gray-400">
        Use the arrow keys to play. Press Space to restart after game over.
      </div>
    </div>
  );
};

export default Game;