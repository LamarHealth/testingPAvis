// Profile extractor. Need to do this once for sender, once for receiver.
const getProfileName = () => {
  return document.querySelectorAll('.text-heading-xlarge')[0].innerText;
};

export const extractProfileInfo = () => {
  const hiddenElements = Array.from(
    document.querySelectorAll('.visually-hidden')
  );
  const keyElementsTextList = [
    'About',
    'Education',
    'Experience',
    'Volunteering',
    'Licenses & certifications',
    'Skills',
    'Recommendations',
    'Honors & awards',
    'Organizations',
    'Causes',
    'Publications',
    'Courses',
    'Interests',
    'Projects',
    'Patents',
  ];

  const profileInfo = hiddenElements.reduce((acc, element) => {
    const hiddenElementText = element.innerText;
    keyElementsTextList.includes(hiddenElementText)
      ? (acc[hiddenElementText] = '')
      : (acc[
          Object.keys(acc)[Object.keys(acc).length - 1]
        ] += ` ${hiddenElementText}`);
    return acc;
  }, {});

  delete profileInfo[undefined];
  return profileInfo;
};

export const getProfileInfo = () => {
  const profileName = getProfileName();
  const profileInfo = extractProfileInfo();
  profileInfo['Name'] = profileName;
  profileInfo['URL'] = window.location.href;
  return profileInfo;
};
