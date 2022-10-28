import { Feature, Map, View } from 'ol';
import VectorSource from 'ol/source/Vector';
import VectorLayer from 'ol/layer/Vector';
import TileLayer from 'ol/layer/Tile';

import Style, { StyleFunction } from 'ol/style/Style';
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

import { udpJsonDataType, mapSettingsType, geoJsonObjectType, dataSortedAltitudeType, stylesType, drawType, markerSettingsType, drawStylesType, polygonModelsType } from './Map.interface';
import { fromLonLat, toLonLat, useGeographic } from 'ol/proj';
import Text from 'ol/style/Text';
import Icon from 'ol/style/Icon';
import { Geometry, MultiLineString, Polygon } from 'ol/geom';
import { Extent, getCenter } from 'ol/extent';

import { GreatCircle } from 'arc';
import { getMapConfig, getMapData, getMapSettings, getMarkerSettings, getPolygonModels } from '../../api';

// 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

class MapObject {
  private map!: Map;
  private mapSource: XYZ;
  private vectorSource: VectorSource;
  private vectorLayer: VectorLayer<VectorSource>;
  private realVectorSource: VectorSource;
  private realVectorLayer: VectorLayer<VectorSource>;
  private udpJsonData: udpJsonDataType;
  private mapSettings: mapSettingsType = {};
  private markerSettings: markerSettingsType;
  private polygonModels: polygonModelsType;
  private drawFeature = {};
  private geoJsonObject: geoJsonObjectType;
  private interactiveMode: boolean;
  private userCenter: [number, number];
  private styles: stylesType;
  private drawStyles: drawStylesType;
  private drawSource: VectorSource;
  private drawVector: VectorLayer<VectorSource>;
  private draw: Draw;
  private snap: Snap;

  constructor() {
    this.interactiveMode = true;
    this.userCenter = [4421604, 5397436];
    this.styles = {};

    this.mapSource = new XYZ({});
    this.vectorSource = new VectorSource({});
    this.vectorLayer = new VectorLayer({
      source: this.vectorSource,
      style: this.setStyle.bind(this) as StyleFunction,
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
    this.drawStyles = {
      LineString: new Style({
          stroke: new Stroke({
              color: 'green',
              width: 1,
          }),
      }),
      MultiLineString: new Style({
          stroke: new Stroke({
              color: 'green',
              width: 1,
          }),
      }),
  
      MultiPolygon: new Style({
          stroke: new Stroke({
              color: 'yellow',
              width: 1,
          }),
          fill: new Fill({
              color: 'rgba(255, 255, 0, 0.1)',
          }),
      }),
      Polygon: new Style({
          stroke: new Stroke({
              color: 'blue',
              lineDash: [4],
              width: 3,
          }),
          fill: new Fill({
              color: 'rgba(0, 0, 255, 0.1)',
          }),
      }),
      GeometryCollection: new Style({
          stroke: new Stroke({
              color: 'magenta',
              width: 2,
          }),
          fill: new Fill({
              color: 'magenta',
          }),
          image: new CircleStyle({
              radius: 10,
              stroke: new Stroke({
                  color: 'magenta',
              }),
          }),
      }),
      Circle: new Style({
          stroke: new Stroke({
              color: 'red',
              width: 2,
          }),
          fill: new Fill({
              color: 'rgba(255,0,0,0.2)',
          }),
      })
    };
    this.draw = new Draw({ source: this.drawSource, type: 'Point' });
    this.snap = new Snap({});
    this.udpJsonData = {};
    this.geoJsonObject = { 'type': 'FeatureCollection', 'crs': { 'type': 'name' }, 'features': [] };
    this.mapSettings = {};
    this.markerSettings = {};
    this.polygonModels = {};

    this.createMap();
  }

  public changeInteractions(value: drawType) {
    this.map.removeInteraction(this.draw);
    this.map.removeInteraction(this.snap);
    this.addInteractions(value);
  }

  public getUdpJsonData() {
    return this.udpJsonData;
  }

  private setStyle(feature: Feature) {
    return this.styles[feature.getId() as number];
  }

  private async setMapUrl() {
    const mapConfig = await getMapConfig();
    this.mapSource.setUrl(mapConfig.MapURL);
  }

  private async getMarkerSettings() {
    this.markerSettings = await getMarkerSettings();
  }

  private async getPolygonModels() {
    this.polygonModels = await getPolygonModels();
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

  private async createMap() {

    await this.setMapUrl();
    await this.getMapData();
    await this.getMarkerSettings();
    await this.getPolygonModels();
    await this.getMapSettings();

    const map = new Map({
      layers: [
        new TileLayer({
            source: this.mapSource,
        }),
        // new TileLayer({
        //   source: new OSM(),
        // }),
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

    this.map = map;
    this.addInteractions('None');
    await this.mapDataUpdate();

    return this.map;
  }

  private async getMapData() {
    const data = await getMapData();

    if (Object.keys(data).length !== 0) {
      for (const key in data) {
        this.udpJsonData[(key)] = {
          id: data[key]['id'],
          type: data[key]['type'],
          parentID: data[key]['parentID'],
          lat: data[key]['latitude'],
          lon: data[key]['longitude'],
          yaw: data[key]['yaw'],
          yawOld: key in this.udpJsonData ? this.udpJsonData[key]['yawOld'] : 0,
          altitude: data[key]['altitude'],
        };
      }
    }
  }

  private async getMapSettings() {
    this.mapSettings = await getMapSettings();
  }

  private async mapDataUpdate() {

    await this.getMapData();

    if (Object.keys(this.udpJsonData).length !== 0) {
      this.updateVSFeatures();
    }

    if (Object.keys(this.drawFeature).length !== 0) {
      this.geoJsonObject['features'].push(this.drawFeature);
    }

    const newFeature = new GeoJSON().readFeatures(this.geoJsonObject, {
      dataProjection: 'EPSG:4326',
      featureProjection: 'EPSG:3857',
    });

    this.vectorSource.clear();
    this.vectorSource.addFeatures(newFeature);
    this.setViewCenter(1, 1);
    this.updatePolygonFeatures();

    setTimeout(this.mapDataUpdate.bind(this), 10);
  }

  private updateVSFeatures() {
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

        const textStyle = {
          font: '16px Calibri, sans-serif',
          fill: new Fill({ color: '#f00' }),
          stroke: new Stroke({
            color: '#000',
            width: 2,
          }),
          text: String(dataSortedForAltitude[key].id),
        };

        try {

          this.styles[dataSortedForAltitude[key].id] = new Style({
            text: new Text({
              ...textStyle,
              offsetX: 100 * this.markerSettings[dataSortedForAltitude[key]['type']]['size'],
              offsetY: 100 * this.markerSettings[dataSortedForAltitude[key]['type']]['size'], 
            }),
            image: new Icon({
              opacity: this.markerSettings[dataSortedForAltitude[key]['type']]['alpha'],                                  
              scale: this.markerSettings[dataSortedForAltitude[key]['type']]['size'],                     
              src: '/public/images/' + this.markerSettings[dataSortedForAltitude[key]['type']]['image'],
              rotation: dataSortedForAltitude[key]['yaw'] / 57.2958,
            }),
          });

        } catch {
          
          this.styles[dataSortedForAltitude[key].id] = new Style({
            text: new Text({
              ...textStyle,
              offsetX: 25,
              offsetY: 25,
            }),
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

  private drawLine(userPoints: any) {
    const coordinates = [];
    const features = this.drawSource.getFeatures();

    for (let i = 0; i < features.length; i++) {

      if (features[i].getGeometry()?.getType() === 'Point') {

        const feature = features[i] as Feature;

        const geom = feature.getGeometry() as Geometry;
        const geomExtent = geom.getExtent();
        const coords = toLonLat(getCenter(geomExtent));

        if (feature.getId() === 0) {
          feature.setId(userPoints.length);
          userPoints[feature.getId() as number] = coords;
        } else {
          userPoints[feature.getId() as number] = coords;
        }

      }

    }

    for (let point = 0; point < (userPoints.length - 1); point++) {
      const arcGenerator = new GreatCircle(
        { x: userPoints[point][0], y: userPoints[point][1] },
        { x: userPoints[point + 1][0], y: userPoints[point + 1][1] },
      );

      const line = arcGenerator.Arc(100, { offset: 10 });

      for (let i = 0; i < line.geometries[0].coords.length - 1; i++) {
        coordinates.push([
          line.geometries[0].coords[i],
          line.geometries[0].coords[i + 1],
        ]);
      }
    }

    for (let i = 0; i < coordinates.length; i++) {
      coordinates[i][0] = fromLonLat(coordinates[i][0]);
      coordinates[i][1] = fromLonLat(coordinates[i][1]);
    }

    const marker = new MultiLineString(coordinates);

    const featureMarker = new Feature({
      name: 'userFeature',
      geometry: marker,
    });
  }

  private updatePolygonFeatures() {
    for (const key in this.udpJsonData) {
  
      const marker = this.udpJsonData[key];

      const id = String(marker.id);

      if (this.markerSettings[marker.type].polygonModel !== '-' && marker.parentID === 0) {

        if (!this.realVectorSource.getFeatureById(id)) {
          const markerGeometry = new Polygon([this.polygonModels[this.markerSettings[marker.type].polygonModel]]);
          const extent = markerGeometry.getExtent();
          const featureCenter = getCenter(extent);

          markerGeometry.rotate(180 / 57.3, featureCenter);

          const featureMarker = new Feature({
            name: id,
            geometry: markerGeometry,
          });

          featureMarker.setId(id);
          this.realVectorSource.addFeature(featureMarker);
        } else {
          this.moveAndRotatePolygonFeature(id, marker.lon, marker.lat, marker.yaw);
        }
      } else {
        this.realVectorSource.removeFeature(this.realVectorSource.getFeatureById(id) as Feature<Geometry>);

        this.udpJsonData[marker.id].yawOld = 0;
      }
    }
  }

  private moveAndRotatePolygonFeature(id: string, lat: number, lon: number, angle: number) {
    const geomBox = this.realVectorSource.getFeatures();

    for (let geom = 0; geom < geomBox.length; geom++) {
      if (geomBox[geom].getId() === id) {

        if (this.udpJsonData[id].parentID !== 0) {
          this.realVectorLayer.getSource()?.removeFeature(this.realVectorSource.getFeatureById(id) as Feature<Geometry>);
        } else {
          const geometry = this.realVectorLayer.getSource()?.getFeatureById(id)?.getGeometry();
          
          const extent = geometry?.getExtent();
          const center = getCenter(extent as Extent);

          const rotAngle = -(angle - this.udpJsonData[id].yawOld);
          geometry?.rotate(rotAngle / 57.3, center);
          this.udpJsonData[id].yawOld = angle;

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