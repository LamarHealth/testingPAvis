interface ITextractDocument {
  Relationships: [
    {
      Type: string;
      Ids: string[];
    }
  ];
  Confidence: number;
  Geometry: {
    Geometry: {
      BoundingBox: {
        Width: number;
        Top: number;
        Left: number;
        Height: number;
      };
    };
  };
  Polygon: [
    {
      Y: number;
      X: number;
    },
    {
      Y: number;
      X: number;
    },
    {
      Y: number;
      X: number;
    },
    {
      Y: number;
      X: number;
    }
  ];
  BlockType: string;
  EntityTypes: string[];
  Id: string;
}
