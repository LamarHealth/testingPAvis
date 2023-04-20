export interface OCRDocumentInfo {
  docID: string;
  keyValuePairs: KeyValuePairs;
  lines: string[];
  message: string;
}
export interface DocumentInfo {
  docType: string;
  docName: string;
  docID: string;
  keyValuePairs: KeyValuePairs;
  lines: string[];
}

export interface KeyValuePairs {
  /**
   *  e.g. "Date": "7/5/2015"
   */
  [key: string]: string;
}

export enum StatusCodes {
  SUCCESS = 200,
  FAILURE = 400,
}
