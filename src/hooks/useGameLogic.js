import { useState, useEffect, useCallback, useRef } from 'react';
import { LANES } from '../constants';
import useAudio from './useAudio';

const useGameLogic = () => {
  // Use audio hook
  const { playNote, playSuccess, playFail, initAudio } = useAudio();
  
  // Use a ref to keep track of game area height
  const gameAreaHeight = useRef(window.innerHeight * 0.7);
  
  // Load high score from localStorage initially
  const initialHighScore = localStorage.getItem('pianoTilesHighScore') 
    ? parseInt(localStorage.getItem('pianoTilesHighScore')) 
    : 0;
  
  const [highScore, setHighScore] = useState(initialHighScore);
  
  const [gameState, setGameState] = useState({
    tiles: [],
    score: 0,
    isGameOver: false,
    isPaused: false,
    isStarted: false,
    tileSpeed: 1,
    lastTileTime: 0,
    pressedKeys: { ArrowLeft: false, ArrowDown: false, ArrowRight: false, ArrowUp: false },
    difficulty: 1,
    combo: 0
  });

  // Generate a tile at the top of the screen (negative y position)
  const generateTile = useCallback(() => {
    const laneIndex = Math.floor(Math.random() * 4);
    return {
      id: Date.now() + Math.random(),
      lane: laneIndex,
      y: -10, // Use percentage instead of pixels, starting above the visible area
      hit: false,
      missed: false
    };
  }, []);

  const handleKeyDown = useCallback((e) => {
    if (!gameState.isStarted || gameState.isGameOver || gameState.isPaused) return;
    
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
        tile.y >= 60 && // Using percentage
        tile.y <= 75 && // Using percentage
        !tile.hit && 
        !tile.missed
      );
      
      if (bottomTiles.length > 0) {
        // Hit successful
        // Play note for the lane
        playNote(laneIndex);
        
        setGameState(prev => {
          const updatedTiles = prev.tiles.map(tile => {
            if (tile.id === bottomTiles[0].id) {
              return { ...tile, hit: true };
            }
            return tile;
          });
          
          const newCombo = prev.combo + 1;
          const comboBonus = Math.floor(newCombo / 5) * 0.1;
          const scoreIncrease = 1 + comboBonus;
          const newScore = prev.score + scoreIncrease;
          
          // Play success sound on milestone combos
          if (newCombo % 10 === 0) {
            playSuccess();
          }
          
          // Check if this is a new high score
          if (newScore > highScore) {
            setHighScore(newScore);
            localStorage.setItem('pianoTilesHighScore', newScore.toString());
          }
          
          return {
            ...prev,
            tiles: updatedTiles,
            score: newScore,
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
    
    if (e.key === " " && (gameState.isGameOver || gameState.isPaused)) {
      restartGame();
    }
  }, [gameState, highScore, playNote, playSuccess]);

  const handleKeyUp = useCallback((e) => {
    if (LANES.some(lane => lane.key === e.key)) {
      setGameState(prev => ({
        ...prev,
        pressedKeys: { ...prev.pressedKeys, [e.key]: false }
      }));
    }
  }, []);

  // Game update logic - this is where tiles move down
  const updateGame = useCallback(() => {
    if (!gameState.isStarted || gameState.isGameOver || gameState.isPaused) return;
    
    const now = Date.now();
    const timeSinceLastTile = now - gameState.lastTileTime;
    
    // Calculate difficulty based on score
    const difficulty = 1 + Math.floor(gameState.score / 10) * 0.2;
    
    // Adjust tile generation frequency based on difficulty
    const tileInterval = Math.max(800, 2000 - (difficulty * 200));
    
    // Speed increases with score but starts slower for debugging
    const tileSpeed = 0.5 + Math.floor(gameState.score / 10) * 0.2;
    
    // Generate new tile on interval
    if (timeSinceLastTile > tileInterval) {
      const newTile = generateTile();
      
      setGameState(prev => ({
        ...prev,
        tiles: [...prev.tiles, newTile],
        lastTileTime: now
      }));
    }
    
    // Move existing tiles down
    setGameState(prev => {
      let newMissedTile = false;
      
      // Create a new array of tiles with updated positions
      const updatedTiles = prev.tiles.map(tile => {
        // Add speed to y position to move the tile down
        const newY = tile.y + tileSpeed;
        
        // Check if tile has been missed (reached bottom without being hit)
        if (newY > 90 && !tile.hit && !tile.missed) { // Using percentage (90% of game area)
          newMissedTile = true;
          return { ...tile, y: newY, missed: true };
        }
        
        // Remove tiles that are far off-screen
        if (newY > 110) { // Using percentage (110% of game area)
          return null;
        }
        
        // Update tile position
        return { ...tile, y: newY };
      }).filter(Boolean); // Remove null tiles
      
      // Play fail sound if a tile was missed
      if (newMissedTile) {
        playFail();
      }
      
      // Check for game over condition
      const missedTiles = updatedTiles.filter(tile => tile.missed);
      const gameOver = missedTiles.length > 0;
      
      // If game is over, check for high score
      if (gameOver && prev.score > highScore) {
        setHighScore(prev.score);
        localStorage.setItem('pianoTilesHighScore', prev.score.toString());
      }
      
      return {
        ...prev,
        tiles: updatedTiles,
        isGameOver: gameOver,
        tileSpeed,
        difficulty
      };
    });
  }, [gameState, generateTile, highScore, playFail]);

  const startGame = () => {
    // Initialize audio context when game starts
    initAudio();
    
    setGameState(prev => ({
      ...prev,
      isStarted: true,
      lastTileTime: Date.now()
    }));
  };

  const restartGame = () => {
    setGameState({
      tiles: [],
      score: 0,
      isGameOver: false,
      isPaused: false,
      isStarted: false,
      tileSpeed: 1,
      lastTileTime: Date.now(),
      pressedKeys: { ArrowLeft: false, ArrowDown: false, ArrowRight: false, ArrowUp: false },
      difficulty: 1,
      combo: 0
    });
    
    // Initialize audio for restart
    initAudio();
  };

  const togglePause = () => {
    setGameState(prev => ({
      ...prev,
      isPaused: !prev.isPaused
    }));
  };

  // Reset high score function
  const resetHighScore = () => {
    setHighScore(0);
    localStorage.removeItem('pianoTilesHighScore');
  };

  // Set up game loop
  useEffect(() => {
    const gameLoop = setInterval(() => {
      updateGame();
    }, 33); // ~30 FPS
    
    return () => clearInterval(gameLoop);
  }, [updateGame]);

  return {
    gameState,
    highScore,
    handleKeyDown,
    handleKeyUp,
    togglePause,
    restartGame,
    startGame,
    resetHighScore
  };
};

export default useGameLogic;
