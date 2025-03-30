import { useState, useEffect, useRef } from 'react';
import * as Tone from 'tone';

const useAudio = () => {
  const [audioReady, setAudioReady] = useState(false);
  const synth = useRef(null);
  const successSound = useRef(null);
  const failSound = useRef(null);
  const loadedSounds = useRef(false);

  // Notes for each lane (pentatonic scale)
  const laneNotes = ['C4', 'D4', 'E4', 'G4'];

  useEffect(() => {
    // Initialize Tone.js only once
    const setupAudio = async () => {
      // Create synth
      if (!synth.current) {
        synth.current = new Tone.PolySynth(Tone.Synth).toDestination();
      }
      
      try {
        // Load sounds only once
        if (!loadedSounds.current) {
          // Create players for sounds
          successSound.current = new Tone.Player({
            url: "https://tonejs.github.io/audio/berklee/gong_1.mp3",
            autostart: false,
            volume: -10,
            onload: () => console.log("Success sound loaded")
          }).toDestination();
          
          failSound.current = new Tone.Player({
            url: "https://tonejs.github.io/audio/drum-samples/808/tom-short.mp3",
            autostart: false,
            volume: -5,
            onload: () => console.log("Fail sound loaded")
          }).toDestination();
          
          loadedSounds.current = true;
        }
      } catch (error) {
        console.error("Error setting up audio:", error);
      }
    };
    
    setupAudio();
    
    // Cleanup function
    return () => {
      // Properly dispose of resources
      if (synth.current) {
        synth.current.dispose();
        synth.current = null;
      }
      
      if (successSound.current) {
        successSound.current.dispose();
        successSound.current = null;
      }
      
      if (failSound.current) {
        failSound.current.dispose();
        failSound.current = null;
      }
      
      loadedSounds.current = false;
    };
  }, []);

  // Function to start audio context on user interaction
  const initAudio = async () => {
    if (Tone.context.state !== 'running') {
      try {
        await Tone.start();
        console.log("Audio context started!");
        setAudioReady(true);
      } catch (error) {
        console.error("Could not start audio context:", error);
      }
    } else {
      setAudioReady(true);
    }
  };

  // Play a note for a specific lane
  const playNote = (laneIndex) => {
    if (!audioReady || !synth.current || laneIndex < 0 || laneIndex >= laneNotes.length) return;
    
    try {
      // Play the note with a short duration
      synth.current.triggerAttackRelease(laneNotes[laneIndex], "8n");
    } catch (error) {
      console.error("Error playing note:", error);
    }
  };

  // Play success sound (for combo or high score)
  const playSuccess = () => {
    if (!audioReady || !successSound.current) return;
    
    try {
      // Check if the buffer is loaded and player is not playing
      if (successSound.current.loaded && !successSound.current.state === "started") {
        successSound.current.start();
      }
    } catch (error) {
      console.error("Error playing success sound:", error);
    }
  };

  // Play fail sound (when missing a tile)
  const playFail = () => {
    if (!audioReady || !failSound.current) return;
    
    try {
      // Check if the buffer is loaded and player is not playing
      if (failSound.current.loaded && !failSound.current.state === "started") {
        failSound.current.start();
      }
    } catch (error) {
      console.error("Error playing fail sound:", error);
    }
  };

  return {
    playNote,
    playSuccess,
    playFail,
    initAudio,
    audioReady
  };
};

export default useAudio;