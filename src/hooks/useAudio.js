//Using Tone.js for audio

import { useEffect, useRef } from 'react';
import * as Tone from 'tone';

const useAudio = () => {
  const synth = useRef(null);
  const isInitialized = useRef(false);

  // Notes for each lane (pentatonic scale)
  const laneNotes = ['C4', 'D4', 'E4', 'G4'];
  
  // Success and fail sounds
  const successSound = useRef(null);
  const failSound = useRef(null);

  useEffect(() => {
    // Initialize Tone.js
    if (!isInitialized.current) {
      // Create polyphonic synth for multiple notes
      synth.current = new Tone.PolySynth(Tone.Synth).toDestination();
      
      // Create player for success sound
      successSound.current = new Tone.Player({
        url: "https://tonejs.github.io/audio/berklee/gong_1.mp3",
        autostart: false,
        volume: -10
      }).toDestination();
      
      // Create player for fail sound
      failSound.current = new Tone.Player({
        url: "https://tonejs.github.io/audio/drum-samples/808/tom-short.mp3",
        autostart: false,
        volume: -5
      }).toDestination();
      
      isInitialized.current = true;
    }
    
    return () => {
      // Clean up
      if (synth.current) {
        synth.current.dispose();
      }
      if (successSound.current) {
        successSound.current.dispose();
      }
      if (failSound.current) {
        failSound.current.dispose();
      }
    };
  }, []);

  // Function to start audio context
  const initAudio = async () => {
    if (Tone.context.state !== 'running') {
      await Tone.start();
    }
  };

  // Play a note for a specific lane
  const playNote = (laneIndex) => {
    if (!synth.current || laneIndex < 0 || laneIndex >= laneNotes.length) return;
    
    // Ensure audio context is running
    initAudio();
    
    // Play the note with a short duration
    synth.current.triggerAttackRelease(laneNotes[laneIndex], "8n");
  };

  // Play success sound (for combo or high score)
  const playSuccess = () => {
    if (!successSound.current) return;
    
    initAudio();
    successSound.current.start();
  };

  // Play fail sound (when missing a tile)
  const playFail = () => {
    if (!failSound.current) return;
    
    initAudio();
    failSound.current.start();
  };

  return {
    playNote,
    playSuccess,
    playFail,
    initAudio
  };
};

export default useAudio;
