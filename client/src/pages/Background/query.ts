const sleep = (ms: number): Promise<void> => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

const fetchData = async (
  url: string,
  timeout: number,
  interval: number
): Promise<Response> => {
  const startTime = Date.now();

  while (Date.now() < startTime + timeout) {
    const response = await fetch(url);
    if (response.ok) {
      console.log(`Got response for ${url}`, response);
      return response;
    }
    console.log("sleeping", url);
    await sleep(interval);
  }

  throw new Error("Request timed out");
};
type ResponseObject = { [key: string]: any };

const withTimeout = <T>(
  promise: Promise<T>,
  timeout: number
): Promise<T | null> => {
  return new Promise(async (resolve, reject) => {
    setTimeout(() => {
      resolve(null);
    }, timeout);

    try {
      const response = await promise;
      resolve(response);
    } catch (error) {
      reject(error);
    }
  });
};
const parseResponse = async (response: Response): Promise<any> => {
  const contentType = response.headers.get("content-type");
  console.log("Content type:", contentType);
  console.log("Response:", response);
  return contentType && contentType.includes("application/json")
    ? response.json()
    : contentType && contentType.includes("text/csv")
    ? response.text()
    : response.blob();
};

export const fetchAndReturnData = async (
  urls: string[]
): Promise<ResponseObject> => {
  const startTime = Date.now();
  let responseObject: ResponseObject = {};

  console.log("Fetching urls", urls);
  while (Date.now() - startTime < 60000) {
    try {
      // Fetch the URLs with short polls and wait for their responses
      const responses = await withTimeout(
        Promise.all(urls.map((url) => fetchData(url, 60000, 10000))),
        60000
      );

      if (responses === null) {
        console.log("Timeout reached, waiting to poll again");
        await sleep(10000);
        continue;
      }

      // Parse the responses based on their content type (JSON, CSV, or PDF)
      const parsedResponses = await Promise.all(
        responses.map((res) => parseResponse(res))
      );

      // Attach the parsed responses to an object
      responseObject = parsedResponses.reduce((acc, data, index) => {
        acc[`response${index + 1}`] = data;
        return acc;
      }, {});

      // If valid responses are received, stop polling
      break;
    } catch (error) {
      console.log("An error occurred, waiting to poll again");
      console.log(error);
      await sleep(10000);
    }
  }

  return responseObject;
};
