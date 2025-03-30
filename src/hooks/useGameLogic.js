import { useState, useEffect, useCallback } from 'react';
import { LANES } from '../constants';

const useGameLogic = () => {
  const [gameState, setGameState] = useState({
    tiles: [],
    score: 0,
    isGameOver: false,
    isPaused: false,
    tileSpeed: 2,
    lastTileTime: Date.now(),
    pressedKeys: { ArrowLeft: false, ArrowDown: false, ArrowRight: false, ArrowUp: false },
    difficulty: 1,
    combo: 0
  });

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
      if (LANES.some(lane => lane.key === e.key)) {
        e.preventDefault();
        
        const laneIndex = LANES.findIndex(lane => lane.key === e.key);
        
        // Update pressedKeys state
        setGameState(prev => ({
          ...prev,
          pressedKeys: { ...prev.pressedKeys, [e.key]: true }
        }));
        
        // Hit zone is 60-75% of the game board height
        const bottomTiles = gameState.tiles.filter(
          tile => tile.lane === laneIndex && 
          tile.y >= window.innerHeight * 0.6 * 0.7 && 
          tile.y <= window.innerHeight * 0.75 * 0.7 && 
          !tile.hit && 
          !tile.missed
        );
        
        if (bottomTiles.length > 0) {
          // Hit successful
          setGameState(prev => {
            const updatedTiles = prev.tiles.map(tile => {
              if (tile.id === bottomTiles[0].id) {
                return { ...tile, hit: true };
              }
              return tile;
            });
            
            // Increase combo for successful hits
            const newCombo = prev.combo + 1;
            // Calculate score with combo multiplier
            const comboBonus = Math.floor(newCombo / 5) * 0.1;
            const scoreIncrease = 1 + comboBonus;
            
            return {
              ...prev,
              tiles: updatedTiles,
              score: prev.score + scoreIncrease,
              combo: newCombo
            };
          });
        } else {
          // Reset combo when pressing key with no tile
          setGameState(prev => ({
            ...prev,
            combo: 0
          }));
        }
      }
    }
    
    if (e.key === " " && (gameState.isGameOver || gameState.isPaused)) {
      restartGame();
    }
  }, [gameState]);

  const handleKeyUp = useCallback((e) => {
    if (LANES.some(lane => lane.key === e.key)) {
      setGameState(prev => ({
        ...prev,
        pressedKeys: { ...prev.pressedKeys, [e.key]: false }
      }));
    }
  }, []);

  const updateGame = useCallback(() => {
    if (gameState.isGameOver || gameState.isPaused) return;

    const now = Date.now();
    const timeSinceLastTile = now - gameState.lastTileTime;
    let newTiles = [...gameState.tiles];
    let gameOver = false;
    
    // Calculate difficulty based on score
    const difficulty = 1 + Math.floor(gameState.score / 10) * 0.2;
    
    // Adjust tile generation frequency based on difficulty
    const tileInterval = Math.max(300, 1000 - (difficulty * 100));
    
    // Speed increases with score
    const tileSpeed = 2 + Math.floor(gameState.score / 10) * 0.5;
    
    // Generate new tile
    if (timeSinceLastTile > tileInterval) {
      // Generate multiple tiles at higher difficulties
      const tilesToAdd = Math.min(3, Math.floor(difficulty / 2));
      
      for (let i = 0; i < tilesToAdd; i++) {
        // Add delay between tiles when generating multiple
        setTimeout(() => {
          setGameState(prev => ({
            ...prev,
            tiles: [...prev.tiles, generateTile()],
            lastTileTime: now
          }));
        }, i * 100);
      }
    }
    
    // Update tile positions and check for missed tiles
    newTiles = newTiles.map(tile => {
      const newY = tile.y + tileSpeed;
      
      // Calculate screen height percentage for missed tiles
      const missThreshold = window.innerHeight * 0.85 * 0.7; // 85% of game area height
      
      // Mark tiles as missed if they go beyond the piano keys
      if (newY > missThreshold && !tile.hit && !tile.missed) {
        gameOver = true;
        return { ...tile, y: newY, missed: true };
      }
      
      // Remove tiles that are off-screen
      if (newY > window.innerHeight) {
        return null;
      }
      
      return { ...tile, y: newY };
    }).filter(Boolean);
    
    setGameState(prev => ({
      ...prev,
      tiles: newTiles,
      isGameOver: gameOver,
      tileSpeed,
      difficulty
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
      pressedKeys: { ArrowLeft: false, ArrowDown: false, ArrowRight: false, ArrowUp: false },
      difficulty: 1,
      combo: 0
    });
  };

  const togglePause = () => {
    setGameState(prev => ({
      ...prev,
      isPaused: !prev.isPaused
    }));
  };

  useEffect(() => {
    const gameLoop = setInterval(updateGame, 16);
    return () => clearInterval(gameLoop);
  }, [updateGame]);

  return {
    gameState,
    handleKeyDown,
    handleKeyUp,
    togglePause,
    restartGame
  };
};

export default useGameLogic;

