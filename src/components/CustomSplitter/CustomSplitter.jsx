import React, { useState, useRef } from 'react';
import { Box } from '@twilio-paste/core/box';

// Custom Splitter Component
const CustomSplitter = ({ onResize }) => {
  const [dragging, setDragging] = useState(false);

  const handleMouseDown = () => {
    setDragging(true);
  };

  const handleMouseUp = () => {
    if (dragging) {
      setDragging(false);
    }
  };

  const handleMouseMove = (e) => {
    if (dragging) {
      onResize(e.movementX); // Adjust the width based on mouse movement
    }
  };

  return (
    <Box
      width="10px"
      backgroundColor="gray"
      cursor="ew-resize"
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
    />
  );
};

export default CustomSplitter;
