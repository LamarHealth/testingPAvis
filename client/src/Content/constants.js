// export const localMode = process.env.REACT_APP_LOCAL === 'true';

export const pinklavender = '#efbdebff';
export const africanviolet = '#b68cb8ff';
export const darkbluegray = '#6461a0ff';
export const violetblue = '#314cb6ff';
export const greenbluecrayola = '#0a81d1ff';
export const offwhite = '#F7F7F7';
export const orange = '#EA5E00';
export const lightorange = '#FFD2B5';
export const gray = '#585858';
export const lightgray = '#555555';

export const actionsBarButtonContainer = 'pv-top-card-v2-ctas';
export const buttonsBarClassName = 'pv-top-card-v2-ctas';
export const connectButtonClassName = 'pvs-profile-actions__action';
export const addANote =
  'artdeco-button artdeco-button--muted artdeco-button--2 artdeco-button--secondary ember-view mr1';
export const sendButton =
  'artdeco-button artdeco-button--2 artdeco-button--primary ember-view ml1';
export const addANoteContainer =
  'artdeco-modal__actionbar ember-view text-align-right';
export const textContainerClass = 'artdeco-modal__content ember-view';
export const textBox =
  'ember-text-area ember-view connect-button-send-invite__custom-message mb3';
export const deleteBoxClass = 'pt3 pb4';
export const connectButtonClass = 'pvs-profile-actions';

export const promptOptions = {
  options: [
    { name: 'growing their network', description: 'I want to grow my network' },
    { name: 'finding a new job', description: "I'm looking for a job" },
    { name: 'hiring the recipient', description: "I'm hiring" },
    {
      name: 'seeking mentorship from the recipient',
      description: 'Seeking a mentor',
    },
    {
      name: 'selling the recipient a product',
      description: 'Selling a product',
    },
    {
      name: 'providing professional services to the recipient',
      description: 'Selling a service',
    },
  ],
  default: 'Hiring',
};

export const extPayName = 'chadgpt';
// 'http://127.0.0.1:5001/warmer-cold-intros/us-central1/genericConnectRequest';
export const endpoint =
  'https://us-central1-warmer-cold-intros.cloudfunctions.net/genericConnectRequest';
