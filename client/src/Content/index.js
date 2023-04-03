import React from 'react';
import {
  renderComponent,
  setMutationObserver,
} from './modules/renderComponent';
import {
  connectButtonClass,
  addANoteContainer,
  orange,
  buttonsBarClassName,
  addANote,
  textContainerClass,
} from './constants';
import { Logo } from './components/Logo';
import { MessageReviewBox } from './components/MessageReviewBox';
import './index.css';

const modifyAddNoteButton = () => {
  const addANoteButton = document.getElementsByClassName(addANote)[0];
  if (!addANoteButton) return;
  addANoteButton.innerText = 'Compose Note 🪄';
  addANoteButton.style.backgroundColor = orange;
  addANoteButton.style.color = 'white';
  addANoteButton.style.border = '0px';
};

const modifyConnectButton = () => {
  const parent = Array.from(
    document.getElementsByClassName('pv-top-card-v2-ctas')
  ).find((el) => el.textContent.includes('Connect'));

  const element = parent
    ? Array.from(parent.querySelectorAll('button'))
        .reverse()
        .find(
          (el) => el.textContent === 'Connect' || el.innerText === 'Connect'
        )
    : null;

  if (!element) return; // return if element does not exist

  // code to modify element goes here
  element.style.background = orange;
  element.innerText = 'Magic Connect 🪄';
  element.onmouseenter = () => {
    element.style.background = '#c5550a';
  };
  element.onmouseleave = () => {
    element.style.background = orange;
  };
};

const addLogo = () => {
  const logoContainerElement =
    document.getElementsByClassName(buttonsBarClassName)[0];
  !!!document.getElementById('logo-id') &&
    renderComponent(<Logo logoId={'logo-id'} />, logoContainerElement);
};

const addReviewContainer = () => {
  const textBox = document.querySelectorAll('textarea#custom-message')[0]
    ?.parentElement;
  !!!document.getElementById('review-box-id') &&
    renderComponent(<MessageReviewBox id={'review-box-id'} />, textBox);
};

setMutationObserver(addLogo, document.body, buttonsBarClassName);
setMutationObserver(modifyConnectButton, document.body, connectButtonClass);
setMutationObserver(modifyAddNoteButton, document.body, addANoteContainer);
setMutationObserver(addReviewContainer, document.body, textContainerClass);

if (module.hot) module.hot.accept();
