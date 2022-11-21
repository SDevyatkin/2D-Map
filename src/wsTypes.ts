export interface IMapConfig {
  feature: number;
  zoom: number;
  locked: boolean;
  origin: [number, number];
}

export interface IFeatures {
  [key: number]: {
    id: number;
    type: number;
    state?: 0 | 1 | 2;
    longitude: number;
    latitude: number;
    yaw: number;
    altitude: number;
    parentID: number;
  }
}

export interface IFeaturesData {
  features: IFeatures;
  idsByAltitude: number[];
}

export interface IPolygonModelsData {
  [key: string]: [number, number][];
}

export interface IMarkersData {
  [key: string]: {
    image: string;
    size: number;
    alpha: number;
    polygonModel: string;
  };
}

export interface IMapMetaData {
  mapURL: string;
  TCPHost: string;
}

export interface IFile {
  name: string;
  url: string;
}

export interface UserSettings {
  widgets?: IMapConfig[]; 
  mapMetaData?: IMapMetaData[];
  markersData?: IMapMetaData[];
}

export type IImagesNames = string[];

// export interface IInitialSettings extends  {}