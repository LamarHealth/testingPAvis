/* global chrome */
import React, { useState, useEffect, useRef } from 'react';
import ExtPay from 'extpay';
import Confetti from 'react-confetti';
import { getProfileInfo } from '../modules/parseProfile';
// load pictures
import virgin from '../assets/virgin.png';
import chad from '../assets/chad.png';
import { promptOptions } from '../constants';
import { extPayName } from '../constants';
const extpay = ExtPay(extPayName);

// radio buttons to toggle setting about the intent of the message
const RadioButton = ({ text, name, checked, preset, onChange }) => {
  const handleChange = () => {
    onChange(name);
  };

  return (
    <div className="radio-button" onClick={handleChange}>
      <>{text}</> {checked && <>✅</>}
    </div>
  );
};

export const OptionsSelectBox = () => {
  const [selectedOption, setSelectedOption] = useState();

  useEffect(() => {
    // set default option as defined in chrome storage
    chrome.storage.local.get(['intent']).then((result) => {
      const intent = result.intent
        ? result.intent
        : promptOptions.options[0].name;
      setSelectedOption(intent);
    });
  }, []);

  const handleChange = (name) => {
    setSelectedOption(name);
    // set intent in chrome storage
    chrome.storage.local.set({ intent: name });
    console.log('intent set to: ' + name);
  };

  return promptOptions.options.map((option, ndx) => (
    <RadioButton
      key={ndx}
      F
      text={option.description}
      name={option.name}
      checked={selectedOption === option.name}
      preset={selectedOption}
      onChange={handleChange}
    />
  ));
};

export const Logo = (props) => {
  const { logoId } = props;
  const [isShown, setIsShown] = useState(false);
  const logoRef = useRef(null);
  const [imageUrl, setImageUrl] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [validLicense, setValidLicense] = useState(false);
  const [confettiActive, setConfettiActive] = useState(false);

  useEffect(() => {
    // get user profile from chrome storage
    chrome.storage.local.get(['userData']).then((result) => {
      const userData = result.userData
        ? JSON.parse(result.userData)['Name']
        : null;
      setCurrentUser(userData);
    });

    // get license status
    extpay.getUser().then((user) => {
      user.paid ? setValidLicense(true) : setValidLicense(false);
    }, []);
  }, []);

  useEffect(() => {
    async function getImageUrl() {
      const url = chrome.runtime.getURL(currentUser ? chad : virgin);
      setImageUrl(url);
    }
    getImageUrl();
  }, [currentUser]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (logoRef.current && !logoRef.current.contains(event.target)) {
        setIsShown(false);
      }
    };

    if (isShown) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isShown]);

  return (
    <div ref={logoRef}>
      {
        <img
          src={imageUrl}
          alt=""
          className="imageCircle"
          id={logoId}
          onClick={() => {
            setIsShown(!isShown);
          }}
        />
      }

      {isShown && (
        <div>
          <div className="hover-container">
            <h1>User settings</h1>
            {validLicense ? (
              <>
                <p>
                  Before you connect with a new profile, you'll have extra help
                  sending your message.
                </p>
                {currentUser ? (
                  <b>Currently sending as {currentUser}</b>
                ) : (
                  <b>Link a sender before creating a note</b>
                )}
              </>
            ) : (
              <p>
                You do not have an active license. Click the popup icon in the
                Chrome menu bar for more info
              </p>
            )}
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <button
                className="connect-profile-button"
                onClick={() => {
                  // show confetti
                  setConfettiActive(true);
                  setTimeout(() => {
                    setConfettiActive(false);
                  }, 1000);

                  // set user profile to chrome storage
                  chrome.storage.local.set({
                    userData: JSON.stringify(getProfileInfo()),
                  });

                  chrome.storage.local.get(['userData']).then((result) => {
                    setCurrentUser(JSON.parse(result.userData)['Name']);
                  });
                }}
              >
                <Confetti
                  width={200}
                  gravity={0.3}
                  recycle={false}
                  numberOfPieces={confettiActive ? 300 : 0}
                />
                Link this profile as sender
              </button>
              Why do you want to connect?
              <OptionsSelectBox options={promptOptions} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
