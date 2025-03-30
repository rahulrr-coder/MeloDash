import React, { useEffect, useState } from 'react';
import Lane from './Lane';
import PianoKey from './PianoKey';
import Tile from './Tile';
import GameControls from './GameControls';
import GameOverlay from './GameOverlay';
import useGameLogic from '../hooks/useGameLogic';
import { LANES } from '../constants';

const Game = () => {
  const [debugMode, setDebugMode] = useState(false);
  
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

  // Toggle debug mode with 'D' key
  useEffect(() => {
    const toggleDebug = (e) => {
      if (e.key === 'd' || e.key === 'D') {
        setDebugMode(prev => !prev);
      }
    };
    
    window.addEventListener('keydown', toggleDebug);
    return () => window.removeEventListener('keydown', toggleDebug);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen text-white p-4">
      <h1 className="text-4xl font-bold mb-2">Piano Tiles</h1>
      <div className="mb-4 text-2xl flex items-center gap-4">
        <span>Score: {gameState.score}</span>
        {debugMode && (
          <span className="text-yellow-300">
            Tiles: {gameState.tiles.length} | 
            Speed: {gameState.tileSpeed.toFixed(1)} | 
            Started: {gameState.isStarted ? 'Yes' : 'No'}
          </span>
        )}
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
        
        {/* Debug info for tiles */}
        {debugMode && gameState.tiles.length > 0 && (
          <div className="absolute top-2 left-2 bg-black bg-opacity-70 p-2 rounded z-30 text-xs">
            {gameState.tiles.map((tile, i) => (
              <div key={i}>
                Tile {i}: Lane {tile.lane}, Y-pos: {tile.y.toFixed(1)}, Hit: {tile.hit ? 'Yes' : 'No'}
              </div>
            ))}
          </div>
        )}
        
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
        {debugMode && " | Debug mode: ON (press 'D' to toggle)"}
      </div>
      
      {!debugMode && (
        <button 
          onClick={() => setDebugMode(true)} 
          className="mt-2 text-xs text-gray-500 hover:text-gray-300"
        >
          Enable Debug Mode
        </button>
      )}
    </div>
  );
};

export default Game;