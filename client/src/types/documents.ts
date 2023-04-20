export interface DocumentInfo {
  docID: string;
  keyValuePairs: KeyValuePairs;
}

export interface KeyValuePairs {
  /**
   *  e.g. "Date": "7/5/2015"
   */
  [key: string]: string;
}
