import { Type } from 'ol/geom/Geometry';
import Style from 'ol/style/Style';
import { ObjectType, SidebarState } from '../../store/sidebarSlice';
import { WidgetsLayout } from '../../store/widgetSettingsSlice';

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

export type drawStylesType = {
  [key: string]: Style;
};

export type drawType = Type | 'None';

export type markerSettingsType = {
  [key: number]: {
    image: string,
    size: number,
    alpha: number,
    polygonModel: string,
  }
};

export type polygonModelsType = {
  [key: string]: [number, number][]
};

export type sidebarSettingsType = {
  [key: number]: {
    drawingMode: drawType,
    featureInfoID: number,
    infoModalSettings: {
      object: number,
      placement: 'fixed' | 'binded',
    }[],
    viewSettings: {
      object: number,
      zoom: number,
      rotation: number,
      gridStep: number,
      locked: boolean,
    },
    distanceSettings: {
      color: string;
      object1: ObjectType,
      object2: ObjectType,
    },
    routeSettings: {
      object: ObjectType,
      color: string,
    },
  },
};

export type mapSettings = {
  distances: {
    distance: string,
    color: string,
  }[],
  routes: {
    object: number,
    color: string,
  }[],
  infoModals: {
    fixed: number,
    binded: number[],
  },
};

export type mapSettingsByIdType = {
  [key: string]: mapSettings;
}

export type sessionSettingsType = mapSettingsByIdType & {
  widgetsLayout: WidgetsLayout,
  sidebarSettings: SidebarState,
};