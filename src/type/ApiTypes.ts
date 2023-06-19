export interface ImageMetaPayload {
  results: {
    total: number;
    exclude: string[];
    location: string;
    data: string;
  };
  posters: {
    total: number;
  };
}
