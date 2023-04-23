export interface OCRDocumentInfo {
  docID: string;
  keyValuePairs: KeyValuePairs;
  lines: Line[];
  message: string;
}
export interface DocumentInfo {
  docType: string;
  docName: string;
  docID: string;
  keyValuePairs: KeyValuePairs;
  lines: Line[];
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

interface Point {
  X: number;
  Y: number;
}

interface BoundingBox {
  Width: number;
  Height: number;
  Left: number;
  Top: number;
}

interface Geometry {
  BoundingBox: BoundingBox;
  Polygon: Point[];
}

export interface Line {
  Text: string;
  Geometry: Geometry;
  Page: number;
}
