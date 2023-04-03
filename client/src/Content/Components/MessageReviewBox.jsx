/* global chrome */
import React, { useState, useEffect } from 'react';
import { getProfileInfo } from '../modules/parseProfile';
import CollapsibleContainer from './CollapsibleContainer';
import ExtPay from 'extpay';
import { extPayName, promptOptions } from '../constants';
const extpay = ExtPay(extPayName);

export const MessageReviewBox = ({ id }) => {
  const [message, setMessage] = useState('');
  const [summary, setSummary] = useState('');
  const [currentUserDefined, setCurrentUserDefined] = useState(false);
  const [intent, setUserIntent] = useState('');
  const [userData, setUserData] = useState('');
  const [isRetrieving, setIsRetrieving] = useState(false);
  const [userCredits, setUserCredits] = useState(0);
  const [validLicense, setValidLicense] = useState(false);

  const deductCredits = (credits) => {
    // Only deduct if the license is invalid
    console.log('deducting...');
    !validLicense &&
      chrome.storage.local.get(['userCredits']).then((result) => {
        const newCredits = result.userCredits - credits;
        chrome.storage.local.set({ userCredits: newCredits });
        console.log('deducted!!');
      });
  };

  const fetchMessage = () => {
    console.log('fetching... ');
    setIsRetrieving(true);
    const receiverInfo = getProfileInfo();

    // Check if user has credits and they have a valid license
    if (userCredits <= 0 && !validLicense) {
      console.log('No credits or license');
      setMessage("You have no credits left (Chad doesn't work for free)");
      setSummary('Please purchase a license to continue');
      setIsRetrieving(false);
      return;
    }

    // Send to background script and retrieve message
    chrome.runtime.sendMessage(
      {
        type: 'get-rating',
        receiver: receiverInfo,
        sender: JSON.parse(userData),
        intent: intent,
      },
      (response) => {
        // Message
        console.log(response);
        const responseMessage = response.message;

        // Message
        if (responseMessage) {
          setMessage(responseMessage);
          deductCredits(1);
        } else {
          setMessage('Aw snap, something went wrong!');
        }

        // Summary
        const responseSummary = response.summary;
        if (responseSummary) {
          setSummary(responseSummary);
          deductCredits(1);
        } else {
          setSummary('Try generating another message');
        }

        // End of retrieval
        console.log('ending retrieval');
        setIsRetrieving(false);
      }
    );
  };

  const handleClick = async () => {
    console.log('clicked');
    setMessage('');
    setSummary('');
    fetchMessage();
  };

  useEffect(() => {
    const textBox = document.querySelectorAll('textarea#custom-message')[0];
    textBox.value = message;
    textBox.style.height = '200px';
    textBox.placeholder = isRetrieving
      ? 'Chad is thinking of a message, hang tight...'
      : !!!userData
      ? 'You need to link a profile to generate messages'
      : 'Click the button to generate a message ';
  }, [message, currentUserDefined]);

  useEffect(() => {
    // fetch user credits
    chrome.storage.local.get(['userCredits']).then((result) => {
      setUserCredits(result.userCredits);
    });

    // get license status
    extpay.getUser().then((user) => {
      user.paid ? setValidLicense(true) : setValidLicense(false);
    });

    chrome.storage.local.get(['userData']).then((result) => {
      const userName = !!result.userData;
      setUserData(result.userData);
      setCurrentUserDefined(userName);
    });

    // get and set intent
    chrome.storage.local.get(['intent']).then((result) => {
      // console.log('intent', result);
      const intent = result.intent;
      if (!!intent) {
        setUserIntent(intent);
      } else {
        setUserIntent(promptOptions.options[0].name);
        chrome.storage.local.set({ intent: promptOptions.options[0].name });
      }
    });
  }, []);

  return (
    <div
      id={id}
      style={{
        border: '1px solid #eaeaea',
        borderRadius: '5px',
        padding: '10px',
      }}
    >
      <div
        style={{
          display: 'flex',
          flexDirection: 'row',
          justifyContent: 'space-between',
          whiteSpace: 'break-spaces',
        }}
      >
        {<h3>Message insights 💡</h3>}
        <button
          className="regenerate-button"
          disabled={isRetrieving || !currentUserDefined}
          onClick={handleClick}
          // hover color darker
          style={{
            cursor: isRetrieving ? 'not-allowed' : 'pointer',
          }}
        >
          {!currentUserDefined
            ? '⚠️ No profile linked'
            : userCredits === 0 && !validLicense
            ? '⚠️ No credits remaining'
            : !isRetrieving
            ? '🔁 Generate new message'
            : 'Generating...'}
        </button>
      </div>
      {!currentUserDefined ? (
        <div>
          No sender profile is linked. Visit your personal LinkedIn profile to
          link it.
        </div>
      ) : !isRetrieving ? (
        <div style={{ whiteSpace: 'break-spaces' }}>
          <p>
            {!!summary
              ? summary.trim()
              : "Your message will be analyzed after it's generated"}
          </p>
        </div>
      ) : (
        <div className={'loading'}>Loading</div>
      )}
      <CollapsibleContainer />
    </div>
  );
};
