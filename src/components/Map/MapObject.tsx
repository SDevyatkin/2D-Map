import { Feature, Map, View } from 'ol';
import VectorSource from 'ol/source/Vector';
import VectorLayer from 'ol/layer/Vector';
import TileLayer from 'ol/layer/Tile';

import Style from 'ol/style/Style';
import Fill from 'ol/style/Fill';
import Stroke from 'ol/style/Stroke';
import CircleStyle from 'ol/style/Circle';

import Modify from 'ol/interaction/Modify';
import Draw from 'ol/interaction/Draw';
import Snap from 'ol/interaction/Snap';
import { OSM, XYZ } from 'ol/source';
import MousePosition from 'ol/control/MousePosition';
import { createStringXY } from 'ol/coordinate';
import GeoJSON from 'ol/format/GeoJSON';

import { udpJsonDataType, mapSettingsType, geoJsonObjectType, dataSortedAltitudeType, stylesType, drawType } from './Map.interface';
import { fromLonLat, toLonLat } from 'ol/proj';
import Text from 'ol/style/Text';
import Icon from 'ol/style/Icon';
import { Geometry, Polygon } from 'ol/geom';
import { Extent, getCenter } from 'ol/extent';

// import { GreatCircle } from 'arc';

// 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

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
  private interactiveMode: boolean;
  private userCenter: [number, number];
  private styles: stylesType;
  private drawSource: VectorSource;
  private drawVector: VectorLayer<VectorSource>;
  private draw: Draw;
  private snap: Snap;

  constructor() {
    this.interactiveMode = true;
    this.userCenter = [4421604, 5397436];

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
    this.drawSource = new VectorSource({ wrapX: false });
    this.drawVector = new VectorLayer({
      source: this.drawSource,
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
    this.draw = new Draw({ source: this.drawSource, type: 'Point' });
    this.snap = new Snap({});
    this.udpJsonData = {};
    this.styles = {};
    this.geoJsonObject = { 'type': 'FeatureCollection', 'crs': { 'type': 'name' }, 'features': [] };
    this.map = this.createMap();

    this.addInteractions('None');
    // this.getData();
    // this.getMapSettings();
  }

  public changeInteractions(value: drawType) {
    this.map.removeInteraction(this.draw);
    this.map.removeInteraction(this.snap);
    this.addInteractions(value);
  }

  private addInteractions(value: drawType) {
    if (value !== 'None') {
      this.draw = new Draw({
        source: this.drawSource,
        type: value,
        freehand: true,
      });
      this.map.addInteraction(this.draw);
      this.snap = new Snap({ source: this.drawSource });
      this.map.addInteraction(this.snap);
    }
  }

  private createMap(): Map {
    const map = new Map({
      layers: [
        // new TileLayer({
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

    const modify = new Modify({
      source: this.drawSource,
    });

    map.addInteraction(modify);
    map.addLayer(this.drawVector);

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
    const response = await fetch('/MapSettings', { mode: 'cors' });
    this.mapSettings = await response.json();
  }

  private async mapDataUpdate() {
    await this.getData();

    if (Object.keys(this.udpJsonData).length !== 0) {
      this.updateVSFeatures({});
    }

    if (Object.keys(this.draw_feature).length !== 0) {
      this.geoJsonObject['features'].push(this.draw_feature);
    }

    const newFeature = new GeoJSON().readFeatures(this.geoJsonObject, {
      dataProjection: 'EPSG:4326',
      featureProjection: 'EPSG:3857',
    });

    this.vectorSource.clear();
    this.vectorSource.addFeatures(newFeature);
    this.setViewCenter(1, 1);
    this.updatePolygonFeatures({}, {});
  }

  private updateVSFeatures(settings: any) {
    this.geoJsonObject['features'] = [];

    const dataSortedForAltitude: dataSortedAltitudeType = {};

    for (const key in this.udpJsonData) {
      if (dataSortedForAltitude[this.udpJsonData[key].altitude]) {
        dataSortedForAltitude[this.udpJsonData[key].altitude + Math.random()] = this.udpJsonData[key];
      } else {
        dataSortedForAltitude[this.udpJsonData[key].altitude] = this.udpJsonData[key];
      }
    }

    const keys = Object.keys(dataSortedForAltitude).map(key => Number(key));

    keys.sort((a, b) => a - b);

    for (let i = 0; i < keys.length; i++) {
      const key = keys[i];

      if (dataSortedForAltitude[key].parentID === 0) {
        this.geoJsonObject.features.push({
          id: dataSortedForAltitude[key].id,
          type: 'Feature',
          geometry: {
            type: 'Point',
            coordinates: [
              dataSortedForAltitude[key].lon,
              dataSortedForAltitude[key].lat,
            ],
          },
        });

        const textStyle = new Text({
          font: '16px Calibri, sans-serif',
          fill: new Fill({ color: '#f00' }),
          stroke: new Stroke({
            color: '#000',
            width: 2,
          }),
          text: String(dataSortedForAltitude[key].id),
          offsetX: 100 * settings[dataSortedForAltitude[key]['type']]['size'],
          offsetY: 100 * settings[dataSortedForAltitude[key]['type']]['size'], 
        });

        try {

          this.styles[dataSortedForAltitude[key].id] = new Style({
            text: textStyle,
            image: new Icon({
              opacity: settings[dataSortedForAltitude[key]['type']]['alpha'],                                  
              scale: settings[dataSortedForAltitude[key]['type']]['size'],                     
              src: '/public/images/' + settings[dataSortedForAltitude[key]['type']]['image'],
              rotation: dataSortedForAltitude[key]['yaw'] / 57.2958,
            }),
          });

        } catch {
          
          this.styles[dataSortedForAltitude[key].id] = new Style({
            text: textStyle,
            image: new Icon({
              opacity: 1,
              scale: 0.1,
              src: '/public/images/question.png',
              rotation: dataSortedForAltitude[key].yaw / 57.2958,
            }),
          });

        }
      }
    }
  }

  // private drawLine() {
  //   const coordinates = [];
  //   const features = this.drawSource.getFeatures();

  //   for (let i = 0; i < features.length; i++) {

  //     if (features[i].getGeometry()?.getType() === 'Point') {

  //       let geom = features[i].getGeometry();
  //       // geom = toLonLat([geom.flatCoordinates[0], geom.flatCoordinates[1]]);

  //       if (features[i].getId() === 0) {
  //         // features[i].setId(userPoints.length);
  //         // userPoints[features[i].getId()] = geom;
  //       } else {
  //         // UserPoints[features[i].getId()] = geom;
  //       }

  //     }

  //   }

  //   for (let point = 0; point < (userPoints.length - 1); point) {
  //     const arcGenerator = new GreatCi;
  //   }
  // }

  private updatePolygonFeatures(settings: any, models: any) {
    for (const key in this.udpJsonData) {
      const marker = this.udpJsonData[key];

      if (settings[marker.type].polygonModel !== '-' && marker.parentID === 0) {

        if (!this.realVectorSource.getFeatureById(marker.id)) {
          const markerGeometry = new Polygon([models[settings[marker.type].polygonModel]]);
          const extent = markerGeometry.getExtent();
          const featureCenter = getCenter(extent);

          markerGeometry.rotate(180 / 57.3, featureCenter);

          const featureMarker = new Feature({
            name: marker.id,
            geometry: markerGeometry,
          });

          featureMarker.setId(marker.id);
          this.realVectorSource.addFeature(featureMarker);
        } else {
          this.moveAndRotatePolygonFeature(marker.id, marker.lon, marker.lat, marker.yaw);
        }
      } else {
        this.realVectorSource.removeFeature(this.realVectorSource.getFeatureById(marker.id) as Feature<Geometry>);

        this.udpJsonData[marker.id].yawOld = 0;
      }
    }
  }

  private moveAndRotatePolygonFeature(id: number, lat: number, lon: number, angle: number) {
    const geomBox = this.realVectorSource.getFeatures();

    for (let geom = 0; geom < geomBox.length; geom++) {
      if (geomBox[geom].getId() === id) {

        if (this.udpJsonData[id].parentID !== 0) {
          this.realVectorLayer.getSource()?.removeFeature(this.realVectorSource.getFeatureById(id) as Feature<Geometry>);
        } else {
          const geometry = this.realVectorLayer.getSource()?.getFeatureById(id)?.getGeometry();
          
          const extent = geometry?.getExtent();
          const center = getCenter(extent as Extent);

          const rotAngle = -(angle - this.udpJsonData.id.yawOld);
          geometry?.rotate(rotAngle / 57.3, center);
          this.udpJsonData.id.yawOld = angle;

          const tx = fromLonLat([lat, lon])[0] - center[0];
          const ty = fromLonLat([lat, lon])[1] - center[1];
          geometry?.translate(tx, ty);
        }
      }
    }
  }

  public setViewCenter(id: number, zoom: number) {
    if (!this.interactiveMode) {
      if (typeof id === 'number') {
        const coord = [
          this.udpJsonData[id]['lon'],
          this.udpJsonData[id]['lat'],
        ];
        this.map.getView().setCenter(fromLonLat([...coord]));
      } else {
        this.map.getView().setCenter(this.userCenter);
      }
      this.map.getView().setZoom(zoom);
    }
  }
};

export default MapObject;