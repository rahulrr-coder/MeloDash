import React from 'react';

const Lane = ({ index }) => {
  return (
    <div className="flex-1 border-r border-gray-700 relative">
      {/* Lane guidelines */}
      <div className="absolute top-0 bottom-0 left-0 right-0 flex justify-center">
        <div className="w-0.5 h-full bg-gray-700 opacity-30"></div>
      </div>
    </div>
  );
};

export default Lane;
