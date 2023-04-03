import React, { useState } from 'react';
import { OptionsSelectBox } from './Logo';

const CollapsibleContainer = () => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleOpen = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div>
      <button onClick={toggleOpen} style={{ borderBottom: '1px dashed black' }}>
        Message Settings
      </button>
      <div className={`collapsible-container ${isOpen ? 'open' : ''}`}>
        <div className={`collapsible-content ${isOpen ? 'visible' : 'hidden'}`}>
          Why are you connecting?
          <OptionsSelectBox />
        </div>
      </div>
    </div>
  );
};

export default CollapsibleContainer;
