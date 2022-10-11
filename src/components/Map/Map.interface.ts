import { Type } from 'ol/geom/Geometry';
import Style from 'ol/style/Style';
import { type } from 'os';

export type mapObjectType = {
  id: number;
  type: number;
  parentID: number;
  lat: number;
  lon: number;
  yaw: number;
  yawOld: number;
  altitude: number;
}

export type udpJsonDataType = {
  [key: string]: mapObjectType;
};

export type mapSettingsType = {
  feature?: string;
  zoom?: string;
  blocked?: boolean;
  center?: [number, number];
};

export type geoJsonObjectType = {
  type: string;
  crs: {
    type: string;
  };
  features: any[];
}

export type dataSortedAltitudeType = {
  [key: number]: mapObjectType;
}

export type stylesType = {
  [key: number]: Style;
};

export type drawType = Type | 'None';