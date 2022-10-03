import { Map, View } from 'ol';
import { Geometry } from 'ol/geom';
import { Vector as LVector, Tile } from 'ol/layer';
import VectorSource from 'ol/source/Vector';
import VectorLayer from 'ol/layer/Vector';
import TileLayer from 'ol/layer/Tile';

import Style from 'ol/style/Style';
import Fill from 'ol/style/Fill';
import Stroke from 'ol/style/Stroke';
import CircleStyle from 'ol/style/Circle';

import Modify from 'ol/interaction/Modify';
import { OSM, Vector as SVector, XYZ } from 'ol/source';
import MousePosition from 'ol/control/MousePosition';
import { createStringXY } from 'ol/coordinate';
import GeoJSON from 'ol/format/GeoJSON';

type udpJsonDataType = {
  [key: string]: {
    id: number;
    type: number;
    parentID: number;
    lat: number;
    lon: number;
    yaw: number;
    yawOld: number;
    altitude: number;
  };
};

type mapSettingsType = {
  feature?: string;
  zoom?: string;
  blocked?: boolean;
  center?: [number, number];
};

type geoJsonObjectType = {
  type: string;
  crs: {
    type: string;
  };
  features: any[];
}

class MapObject {
  private map: Map;
  private mapSource: XYZ;
  private vectorSource: VectorSource;
  private vectorLayer: VectorLayer<VectorSource>;
  private realVectorSource: VectorSource;
  private realVectorLayer: VectorLayer<VectorSource>;
  private udpJsonData: udpJsonDataType;
  private mapSettings: mapSettingsType = {};
  private draw_feature = {};
  private geoJsonObject: geoJsonObjectType;

  constructor() {
    this.mapSource = new XYZ({});
    this.vectorSource = new VectorSource({});
    this.vectorLayer = new VectorLayer({
      source: this.vectorSource,
      // style: styleFunction,
    });
    this.realVectorSource = new VectorSource({});
    this.realVectorLayer = new VectorLayer({
      source: this.realVectorSource,
    });
    this.udpJsonData = {};
    this.geoJsonObject = { 'type': 'FeatureCollection', 'crs': { 'type': 'name' }, 'features': [] };
    this.map = this.createMap();

    this.getData();
    this.getMapSettings();
  }

  private createMap(): Map {
    const map = new Map({
      layers: [
        // new Tile({
        //     source: this.mapSource,
        // }),
        new TileLayer({
          source: new OSM(),
        }),
        this.vectorLayer,
        new VectorLayer({
            source: this.realVectorSource,
        })
      ],
      target: 'map',
      view: new View({
          // center: [4421604, 5397436],
          // zoom: 8,
          center: [-1, -1],
          zoom: 3,
          // projection: 'EPSG:3857'
      }),
    });

    // ---------------------------------------------

    const mousePositionControl = new MousePosition({
      coordinateFormat: createStringXY(6),
      projection: 'EPSG:4326',
      target: 'mouse-position',
    });

    map.addControl(mousePositionControl);

    // ---------------------------------------------

    const DrawSource = new VectorSource({ wrapX: false });

    const DrawVector = new VectorLayer({
      source: DrawSource,
      style: new Style({
        fill: new Fill({
          color: 'rgba(255, 255, 255, .2)',
        }),
        stroke: new Stroke({
          color: '#000',
          width: 2,
        }),
        image: new CircleStyle({
          radius: 7,
          fill: new Fill({
            color: '#000'
          }),
        }),
      }),
    });

    const modify = new Modify({
      source: DrawSource,
    });

    map.addInteraction(modify);
    map.addLayer(DrawVector);

    return map;
  }

  private async getData() { 
    fetch('/MapDataJSON', { mode: 'cors' })
      .then((response: Response) => response.json())
      .then((data) => {
        if (Object.keys(data).length !== 0) {
          for (const key in data) {
            this.udpJsonData[key] = {
              id: data[key]['id'],
              type: data[key]['type'],
              parentID: data[key]['parentID'],
              lat: data[key]['latitude'],
              lon: data[key]['longitude'],
              yaw: data[key]['yaw'],
              yawOld: !!data[key]['yawOld'] ? data[key]['yawOld'] : 0,
              altitude: data[key]['altitude'],
            };
          }
        }
      })
      .catch((error: Error) => console.log(error.message));
  }

  private async getMapSettings() {
    let settings: mapSettingsType;

    const response = await fetch('/MapSettings', { mode: 'cors' })
    this.mapSettings = await response.json();
  }

  private async mapDataUpdate() {
    await this.getData();
    // this.updateVSFeatures();

    if (Object.keys(this.draw_feature).length !== 0) {
      this.geoJsonObject['features'].push(this.draw_feature);
    }

    const newFeature = new GeoJSON().readFeatures(this.geoJsonObject, {
      dataProjection: 'EPSG:4326',
      featureProjection: 'EPSG:3857',
    });
  }
};

export default MapObject;