import React from 'react';

const PianoKey = ({ lane, isPressed }) => {
  return (
    <div
      className={`flex-1 h-24 ${
        isPressed 
          ? 'bg-gray-600 -translate-y-2'
          : 'bg-gray-300 hover:bg-gray-400'
      } border-r border-gray-700 flex items-center justify-center text-3xl text-black font-bold transition-transform duration-100`}
    >
      {lane.label}
    </div>
  );
};

export default PianoKey;

