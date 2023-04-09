import React from 'react';

import { Sidebar } from './components/Sidebar';
import { RenderModal } from './components/RenderModal';
import { RenderAutocomplete } from './components/RenderAutocomplete';

import { LOCAL_MODE, Z_INDEX_ALLOCATOR } from './common/constants';

export const App = () => {
  return (
    <>
      <RenderModal />
      <RenderAutocomplete />
      <Sidebar />
      {LOCAL_MODE && (
        <body
          style={{
            position: 'relative',
            zIndex: Z_INDEX_ALLOCATOR.body(),
          }}
        ></body>
      )}
    </>
  );
};
