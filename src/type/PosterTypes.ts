export interface PosterSpacePosition {
  z: number;
  y: number;
  r: number;
  s: number;
  rX: number;
  rY: number;
}

export interface PosterConfig {
  sizeMax: number;
  sizeMin: number;
}

export interface PosterConfigCluster {
  clusterWidth: number;
  clusterWidthOffset: number;
  clusterHeight: number;
}

export interface PosterElementDiv extends HTMLElement {
  posterType: "div";
  updateAnimation: () => void;
}

export interface PosterElementImg extends HTMLImageElement {
  posterType: "img";
  updateAnimation: () => void;
}

export type PosterElement = PosterElementDiv | PosterElementImg;
