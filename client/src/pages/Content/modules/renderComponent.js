import { render } from 'react-dom';

export const renderComponent = (reactComponent, containerElement) => {
  if (!!!containerElement) return;
  const mounterElement = document.createElement('div');
  containerElement.appendChild(mounterElement);
  render(reactComponent, mounterElement);
};

export const setMutationObserver = (
  onChangeCallback,
  targetNode,
  connectedElementClassName
) => {
  const config = { attributes: true, childList: true, subtree: true };
  const observer = new MutationObserver((mutationsList, observer) => {
    mutationObserverCallback(
      mutationsList,
      observer,
      connectedElementClassName,
      onChangeCallback
    );
  });
  observer.observe(targetNode, config);
};

const mutationObserverCallback = (
  mutationsList,
  observer,
  connectedElementClassName,
  onChangeCallback
) => {
  if (!!!mutationsList) return;
  // check if the connected element is mutated
  const isMutated = !!mutationsList.filter((mutation) => {
    return (
      mutation.type === 'childList' &&
      document.getElementsByClassName(connectedElementClassName)[0]
    );
  });

  if (!isMutated) return;

  // disconnect and reset observer if the connected element is mutated

  observer.disconnect();
  onChangeCallback();
  setMutationObserver(
    onChangeCallback,
    document.body,
    connectedElementClassName
  );
};
