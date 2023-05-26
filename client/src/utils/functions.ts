export const blobToBase64 = (blob: Blob): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
    reader.readAsDataURL(blob);
  });
};

export const base64ToBlob = (base64Data: string): Blob => {
  const splittedData = base64Data.split(",");
  const contentType = splittedData[0].match(/:(.*?);/)?.[1] || "";
  const decodedData = atob(splittedData[1]);
  const byteArray = new Uint8Array(decodedData.length);

  for (let i = 0; i < decodedData.length; i++) {
    byteArray[i] = decodedData.charCodeAt(i);
  }

  return new Blob([byteArray], { type: contentType });
};
