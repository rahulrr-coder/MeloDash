import React, { useState, useEffect, useCallback } from 'react';

const PianoTileGame = () => {
  const [gameState, setGameState] = useState({
    tiles: [],
    score: 0,
    isGameOver: false,
    isPaused: false,
    tileSpeed: 2,
    lastTileTime: Date.now(),
    pressedKeys: { ArrowLeft: false, ArrowDown: false, ArrowRight: false, ArrowUp: false }
  });

  const lanes = [
    { key: "ArrowLeft", label: "←", color: "bg-red-500" },
    { key: "ArrowDown", label: "↓", color: "bg-blue-500" },
    { key: "ArrowRight", label: "→", color: "bg-green-500" },
    { key: "ArrowUp", label: "↑", color: "bg-yellow-500" }
  ];

  const generateTile = useCallback(() => {
    const laneIndex = Math.floor(Math.random() * 4);
    return {
      id: Date.now() + Math.random(),
      lane: laneIndex,
      y: -100,
      hit: false,
      missed: false
    };
  }, []);

  const handleKeyDown = useCallback((e) => {
    if (!gameState.isGameOver && !gameState.isPaused) {
      if (lanes.some(lane => lane.key === e.key)) {
        e.preventDefault();
        
        const laneIndex = lanes.findIndex(lane => lane.key === e.key);
        const bottomTiles = gameState.tiles.filter(
          tile => tile.lane === laneIndex && 
          tile.y >= 350 && 
          tile.y <= 450 && 
          !tile.hit && 
          !tile.missed
        );
        
        if (bottomTiles.length > 0) {
          setGameState(prev => {
            const updatedTiles = prev.tiles.map(tile => {
              if (tile.id === bottomTiles[0].id) {
                return { ...tile, hit: true };
              }
              return tile;
            });
            
            return {
              ...prev,
              tiles: updatedTiles,
              score: prev.score + 1,
              pressedKeys: { ...prev.pressedKeys, [e.key]: true }
            };
          });
        } else {
          setGameState(prev => ({
            ...prev,
            isGameOver: true
          }));
        }
      }
    }
    
    if (e.key === " " && (gameState.isGameOver || gameState.isPaused)) {
      restartGame();
    }
  }, [gameState, lanes]);

  
  const handleKeyUp = useCallback((e) => {
    if (lanes.some(lane => lane.key === e.key)) {
      setGameState(prev => ({
        ...prev,
        pressedKeys: { ...prev.pressedKeys, [e.key]: false }
      }));
    }
  }, [lanes]);

  const updateGame = useCallback(() => {
    if (gameState.isGameOver || gameState.isPaused) return;

    const now = Date.now();
    const timeSinceLastTile = now - gameState.lastTileTime;
    let newTiles = [...gameState.tiles];
    let gameOver = false;
    let newTileSpeed = gameState.tileSpeed;
    
    // Speed increases with score
    newTileSpeed = 2 + Math.floor(gameState.score / 10) * 0.5;
    
    // Generate new tile
    if (timeSinceLastTile > 1000) {
      newTiles.push(generateTile());
      setGameState(prev => ({
        ...prev,
        lastTileTime: now
      }));
    }
    
    // Update tile positions and check for missed tiles
    newTiles = newTiles.map(tile => {
      const newY = tile.y + newTileSpeed;
      
      // Mark tiles as missed if they go beyond the piano keys
      if (newY > 450 && !tile.hit && !tile.missed) {
        gameOver = true;
        return { ...tile, y: newY, missed: true };
      }
      
      // Remove tiles that are off-screen
      if (newY > 600) {
        return null;
      }
      
      return { ...tile, y: newY };
    }).filter(Boolean);
    
    setGameState(prev => ({
      ...prev,
      tiles: newTiles,
      isGameOver: gameOver,
      tileSpeed: newTileSpeed
    }));
  }, [gameState, generateTile]);

  const restartGame = () => {
    setGameState({
      tiles: [],
      score: 0,
      isGameOver: false,
      isPaused: false,
      tileSpeed: 2,
      lastTileTime: Date.now(),
      pressedKeys: { ArrowLeft: false, ArrowDown: false, ArrowRight: false, ArrowUp: false }
    });
  };

  const togglePause = () => {
    setGameState(prev => ({
      ...prev,
      isPaused: !prev.isPaused
    }));
  };

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [handleKeyDown, handleKeyUp]);

  useEffect(() => {
    const gameLoop = setInterval(updateGame, 16);
    return () => clearInterval(gameLoop);
  }, [updateGame]);

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-900 text-white">
      <div className="mb-4 text-2xl">
        Score: {gameState.score}
      </div>
      
      <div className="relative w-96 h-96 bg-gray-800 overflow-hidden rounded-lg">
        {/* Game board with 4 lanes */}
        <div className="absolute top-0 left-0 w-full h-full flex">
          {lanes.map((lane, index) => (
            <div key={index} className="flex-1 border-r border-gray-700 relative">
              {/* Lane guidelines */}
              <div className="absolute top-0 bottom-0 left-0 right-0 flex justify-center">
                <div className="w-0.5 h-full bg-gray-700 opacity-30"></div>
              </div>
            </div>
          ))}
        </div>
        
        {/* Falling tiles */}
        {gameState.tiles.map(tile => (
          <div
            key={tile.id}
            className={`absolute w-20 h-20 ${lanes[tile.lane].color} rounded ${tile.hit ? 'opacity-50' : 'opacity-90'}`}
            style={{
              left: `${tile.lane * 25}%`,
              top: `${tile.y}px`,
              width: '25%',
              height: '100px',
              transform: tile.hit ? 'scale(0.9)' : 'scale(1)',
              transition: 'transform 0.1s'
            }}
          />
        ))}
        
        {/* Piano keys at the bottom */}
        <div className="absolute bottom-0 left-0 w-full flex">
          {lanes.map((lane, index) => (
            <div
              key={index}
              className={`flex-1 h-24 ${
                gameState.pressedKeys[lane.key] 
                  ? 'bg-gray-600 -translate-y-2'
                  : 'bg-gray-300 hover:bg-gray-400'
              } border-r border-gray-700 flex items-center justify-center text-3xl text-black font-bold transition-transform duration-100`}
            >
              {lane.label}
            </div>
          ))}
        </div>
        
        {/* Game over overlay */}
        {gameState.isGameOver && (
          <div className="absolute inset-0 bg-black bg-opacity-70 flex flex-col items-center justify-center">
            <div className="text-4xl mb-4">Game Over</div>
            <div className="text-2xl mb-8">Score: {gameState.score}</div>
            <button
              onClick={restartGame}
              className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded text-xl"
            >
              Play Again
            </button>
          </div>
        )}
        
        {/* Pause overlay */}
        {gameState.isPaused && !gameState.isGameOver && (
          <div className="absolute inset-0 bg-black bg-opacity-70 flex flex-col items-center justify-center">
            <div className="text-4xl mb-8">Paused</div>
            <button
              onClick={togglePause}
              className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded text-xl"
            >
              Resume
            </button>
          </div>
        )}
      </div>
      
      {/* Game controls */}
      <div className="mt-6 flex gap-4">
        {!gameState.isGameOver && (
          <button
            onClick={togglePause}
            className="bg-yellow-600 hover:bg-yellow-700 text-white py-2 px-4 rounded"
          >
            {gameState.isPaused ? 'Resume' : 'Pause'}
          </button>
        )}
        <button
          onClick={restartGame}
          className="bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded"
        >
          Restart
        </button>
      </div>
      
      <div className="mt-6 text-gray-400">
        Use the arrow keys to play. Press Space to restart after game over.
      </div>
    </div>
  );
};

export default PianoTileGame;