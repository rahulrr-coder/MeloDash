import React from 'react';

const Tile = ({ tile, laneColor }) => {
  return (
    <div
      className={`absolute ${laneColor} rounded ${tile.hit ? 'opacity-50' : 'opacity-90'}`}
      style={{
        left: `${tile.lane * 25}%`,
        top: `${tile.y}%`, // Change from pixels to percentage for more consistent positioning
        width: '25%',
        height: '100px',
        transform: tile.hit ? 'scale(0.9)' : 'scale(1)',
        transition: 'transform 0.1s'
      }}
    />
  );
};

export default Tile;