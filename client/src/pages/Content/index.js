import React from 'react';
import ReactDOM from 'react-dom/client';
import $ from 'jquery';

import { App } from './App';
import { ManualSelectNewTab } from './components/ManualSelectNewTab';

import { LOCAL_MODE, Z_INDEX_ALLOCATOR } from './common/constants';

// set the document body to 0 z-index in build, so that our sidebar and modal outrank them
if (!LOCAL_MODE) {
  document.body.style.zIndex = Z_INDEX_ALLOCATOR.baseIndex;
  document.body.style.position = 'relative';
}

const insertionPoint = document.createElement('div');
insertionPoint.id = 'insertion-point';
insertionPoint.style.position = 'relative';
insertionPoint.style.zIndex = Z_INDEX_ALLOCATOR.insertionPoint();
$(insertionPoint).insertBefore(document.body);

const isDocViewOnly = Boolean(document.getElementById('DOCIT-DOCVIEW-ONLY'));

const root = ReactDOM.createRoot(document.getElementById('insertion-point'));

isDocViewOnly // makeshift react-router. can't use react-router bc docview.html is opened as a completely different URL; react-router can only render in relative URLs
  ? root.render(<ManualSelectNewTab />)
  : root.render(<App />);

if (module.hot) module.hot.accept();

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
// serviceWorker.unregister();

// registerServiceWorker();
