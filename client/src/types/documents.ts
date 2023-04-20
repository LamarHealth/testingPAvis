export interface OCRDocumentInfo {
  docID: string;
  keyValuePairs: KeyValuePairs;
  lines: string[];
}
export interface DocumentInfo extends OCRDocumentInfo {
  docType: string;
  docName: string;
}

export interface KeyValuePairs {
  /**
   *  e.g. "Date": "7/5/2015"
   */
  [key: string]: string;
}
