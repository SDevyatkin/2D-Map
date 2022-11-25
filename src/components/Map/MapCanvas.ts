import { Feature, Map, View } from 'ol';
import { Coordinate, createStringXY } from 'ol/coordinate';
import { Extent, getCenter } from 'ol/extent';
import { MultiLineString, Point, Polygon } from 'ol/geom';
import Geometry, { Type } from 'ol/geom/Geometry';
import Draw from 'ol/interaction/Draw';
import Modify from 'ol/interaction/Modify';
import Snap from 'ol/interaction/Snap';
import TileLayer from 'ol/layer/Tile';
import VectorLayer from 'ol/layer/Vector';
import { fromLonLat, toLonLat } from 'ol/proj';
import { OSM } from 'ol/source';
import VectorSource from 'ol/source/Vector';
import CircleStyle from 'ol/style/Circle';
import Fill from 'ol/style/Fill';
import Icon from 'ol/style/Icon';
import Stroke from 'ol/style/Stroke';
import Style from 'ol/style/Style';
import Text from 'ol/style/Text';
import { getFeaturesData, getMarkerSettings, getPolygonModels } from '../../api';
import { IMarkerSettings } from '../../store/modelSettingsSlice';
import { GreatCircle } from 'arc';
import { MousePosition } from 'ol/control';

type mapObjectType = {
  id: number;
  type: number;
  parentID: number;
  latitude: number;
  longitude: number;
  yaw: number;
  altitude: number;
}

interface FeaturesObjectI {
  [key: number]: {
    feature: Feature,
    featureParams: mapObjectType,
  }
}

interface IPolygonsObject {
  [key: string]: {
    polygon: number[][],
    feature: Feature,
    yawOld: number,
  },
}

interface IMarkersObject extends IMarkerSettings {}

class MapCanvas {
  private map: Map; 
  private ObjectsLayerSource = new VectorSource({});
  private ObjectsLayer = new VectorLayer({});
  private PolygonsLayerSource = new VectorSource({});
  private PolygonLayer = new VectorLayer({});
  private DrawLayerSource = new VectorSource({ wrapX: false });
  private DrawLayer = new VectorLayer({});
  private Modifier = new Modify({ source: this.DrawLayerSource });
  private FeaturesObject: FeaturesObjectI = {};
  private PolygonsObject: IPolygonsObject = {};
  private MarkersObject: IMarkersObject = {};
  private idsByAltitude: number[] = [];
  private centeredObject: number | 'None' = 'None';
  private lockedView: boolean = false;
  private zoomLevel: number = 3;
  private currentCenter: [number, number] = [0, 0];
  private featureInfoID: number = -1;
  private featureInfo: mapObjectType | null = null;
  private userPoints: Coordinate[] = [];
  private draw: Draw = new Draw({
    source: this.DrawLayerSource,
    type: 'LineString',
    freehand: true,
  });
  private snap: Snap = new Snap({
    source: this.DrawLayerSource,
  });

  constructor() {
    this.map = this.createMap();

    this.map.addLayer(this.ObjectsLayer);
    this.ObjectsLayer.setSource(this.ObjectsLayerSource);

    this.map.addLayer(this.PolygonLayer);
    this.PolygonLayer.setSource(this.PolygonsLayerSource);
    this.PolygonLayer.setStyle(new Style({
      stroke: new Stroke({
        color: 'red',
        width: 3,
      }),
      fill: new Fill({
        color: 'rgba(255, 0, 0, 0.4)',
      }),
    }));

    this.map.addLayer(this.DrawLayer);
    this.DrawLayer.setSource(this.DrawLayerSource);
    this.DrawLayer.setStyle(new Style({
      fill: new Fill({ 
        color: 'rgba(255, 255, 255, 0.2)' 
      }),
      stroke: new Stroke({
        color: '#000',
        width: 2,
      }),
      image: new CircleStyle({
        radius: 7,
        fill: new Fill({
          color: '#000',
        }),
      }),
    }));
    this.map.addInteraction(this.Modifier);
    // this.ObjectsLayer.setStyle((feature) => this.styles[feature.get('type')]);

    this.getMarkerSettings();

    this.map.on('click', (event) => {
      const feature = this.map.forEachFeatureAtPixel(event.pixel, (f) => f);
      
      if (feature) {
        this.featureInfoID = feature.getId() as number;
      }
    });

    this.map.addControl(new MousePosition({
      coordinateFormat: createStringXY(6),
      projection: 'EPSG:4326',
      className: 'custom-mouse-position',
      target: document.getElementById('mouse-position') as HTMLElement,
    }));
  }

  public setZoomLevel(level: number) {
    this.zoomLevel = level;
    this.map.getView().setZoom(level);
  }

  public setCenteredObject(id: number | 'None') {
    this.centeredObject = id;
  }

  public changeInteractions(mode: string) {
    this.map.removeInteraction(this.draw);
    this.map.removeInteraction(this.snap);

    this.addInteractions(mode);
  }

  public getPinObjects() {
    return Object.keys(this.FeaturesObject).map(id => Number(id));
  }

  public cleanDrawSource() {
    this.DrawLayerSource.clear();
  }

  public setFeatureInfoID() {
    this.featureInfoID = -1;
  }

  public getViewLocked() {
    return this.lockedView;
  }

  public setViewLocked(locked: boolean) {
    this.lockedView = locked;
  }

  public getFeatureInfo() {
    if (this.featureInfoID !== -1) {
      this.featureInfo = this.FeaturesObject[this.featureInfoID].featureParams;
    } else {
      this.featureInfo = null;
    }
    return this.featureInfo;
  }

  public translateView(id: number | 'None') {
    if (id === 'None') return;

    const coords = [this.FeaturesObject[id].featureParams.longitude, this.FeaturesObject[id].featureParams.latitude];

    this.map.getView().setCenter(fromLonLat(coords));
  }

  public drawLine() {
    const coordinates = [];

    const features = this.DrawLayerSource.getFeatures();

    for (let feature of features) {

      if (feature.getGeometry()?.getType() === 'Point') {
        const extent = feature.getGeometry()?.getExtent() as Extent;
        const coordinate = toLonLat(getCenter(extent));

        if (!feature.getId()) feature.setId(this.userPoints.length);
        
        this.userPoints[Number(feature.getId())] = coordinate;
      }
    }

    for (let i = 0; i < this.userPoints.length - 1; i++) {
      const arcGenerator = new GreatCircle(
        { x: this.userPoints[i][0], y: this.userPoints[i][1] },
        { x: this.userPoints[i + 1][0], y: this.userPoints[i + 1][1] }
      );

      const line = arcGenerator.Arc(100, { offset: 10 });

      for (let j = 0; j < line.geometries[0].coords.length - 1; j++) {
        coordinates.push([
          line.geometries[0].coords[j],
          line.geometries[0].coords[j + 1],
        ]);
      }
    }

    for (let i = 0; i < coordinates.length; i++) {
      coordinates[i][0] = fromLonLat(coordinates[i][0]);
      coordinates[i][1] = fromLonLat(coordinates[i][1]);
    }

    const marker = new MultiLineString(coordinates);

    const markerFeature = new Feature({
      name: 'markerFeature',
      geometry: marker,
    });

    this.DrawLayerSource.addFeature(markerFeature);

    this.userPoints = [];
  }

  private addInteractions(mode: string) {
    if (mode !== 'None') {
      this.draw = new Draw({
        source: this.DrawLayerSource,
        type: mode as Type,
        freehand: true,
      });

      this.snap = new Snap({
        source: this.DrawLayerSource,
      });

      this.map.addInteraction(this.draw);
      this.map.addInteraction(this.snap);
    }
  }

  private createMap() {

    return new Map({
      layers: [
        new TileLayer({
          source: new OSM(),
        }),
      ],
      target: 'map'
      ,
      view: new View({
          center: [-1, -1],
          zoom: 3,
      }),
    });
  }

  private async getMarkerSettings() {
    this.MarkersObject = await getMarkerSettings();

    setInterval(this.updateFeaturesData.bind(this), 20);
  }

  private async updateFeaturesData() {
    const { features, idsByAltitude } = await getFeaturesData();
    // TODO: set styles
    if (Object.keys(features).length !== 0) {
      for (const key in features) {
        if (!this.FeaturesObject.hasOwnProperty(key)) {

          const newFeature = new Feature({
            geometry: new Point(fromLonLat([features[key].longitude, features[key].latitude])),
          });

          newFeature.setId(features[key].id);

          const settings = this.MarkersObject[features[key].type];

          if (features[key].type in this.MarkersObject) {
            newFeature.setStyle(new Style({
              text: new Text({
                font: '16px Calibri, sans-serif',
                fill: new Fill({ color: '#f00' }),
                stroke: new Stroke({
                  color: '#000',
                  width: 2,
                }),
                text: String(key),
                offsetX: 30,
                offsetY: 30,
              }),
              image: new Icon({
                opacity: settings.alpha,
                scale: settings.size,
                src: `http://localhost:8080/public/images/${settings.image}`,
                rotation: features[key].yaw / 57.2958,
              }),
            }));
          } else {
            newFeature.setStyle(new Style({
              text: new Text({
                font: '16px Calibri, sans-serif',
                fill: new Fill({ color: '#f00' }),
                stroke: new Stroke({
                  color: '#000',
                  width: 2,
                }),
                text: String(key),
                offsetX: 30,
                offsetY: 30,
              }),
              image: new Icon({
                opacity: 1,
                scale: 0.15,
                src: `http://localhost:8080/public/images/question.png`,
                rotation: features[key].yaw / 57.2958,
              }),
            }));
          }

          this.ObjectsLayerSource.addFeature(newFeature);

          this.FeaturesObject[features[key].id] = {
            feature: newFeature,
            featureParams: features[key],
          }

        } else {
          this.FeaturesObject[features[key].id].featureParams = features[key];

          this.moveObjectLayerFeature(features[key].id, features[key].longitude, features[key].latitude);
          this.rotateObjectLayerFeature(features[key].id, features[key].yaw);
        }

      }

      if (this.idsByAltitude.length === idsByAltitude.length) {
        for (let i = 0; i < this.idsByAltitude.length; i++) {
          if (this.idsByAltitude[i] !== idsByAltitude[i]) {
            this.idsByAltitude = idsByAltitude;
            this.ObjectsLayerSource.clear();

            for (let i = 0; i < this.idsByAltitude.length; i++) {
              this.ObjectsLayerSource.addFeature(this.FeaturesObject[this.idsByAltitude[i]].feature);
            }
          }
        }
      } else {
        this.idsByAltitude = idsByAltitude;
        this.ObjectsLayerSource.clear();

        for (let i = 0; i < this.idsByAltitude.length; i++) {
          this.ObjectsLayerSource.addFeature(this.FeaturesObject[this.idsByAltitude[i]].feature);
        }
      }
    }

    this.updatePolygonsData();
    this.setViewCenter();
  }

  private moveObjectLayerFeature(id: number, lon: number, lat: number) {
    const feature = this.FeaturesObject[id].feature;

    const geometry = feature.getGeometry() as Point; 
    geometry.setCoordinates(fromLonLat([lon, lat]));
  }

  private rotateObjectLayerFeature(id: number, yaw: number) {
    const feature = this.FeaturesObject[id].feature;
    const settings = this.MarkersObject[this.FeaturesObject[id].featureParams.type];

    feature.setStyle(new Style({
      text: new Text({
        font: '16px Calibri, sans-serif',
        fill: new Fill({ color: '#f00' }),
        stroke: new Stroke({
          color: '#000',
          width: 2,
        }),
        text: String(id),
        offsetX: 30,
        offsetY: 30,
      }),
      image: new Icon({
        opacity: settings.alpha,
        scale: settings.size,
        src: `http://localhost:8080/public/images/${settings.image}`,
        rotation: yaw / 57.2958,
      }),
    }));
  }

  private async updatePolygonsData() {

    const polygons = await getPolygonModels();

    for (let key of Object.keys(this.FeaturesObject)) {

      const featureParams = this.FeaturesObject[Number(key)].featureParams;

      try {

        if (this.MarkersObject[featureParams.type].polygonModel !== '-' && featureParams.parentID === 0) {

          if (!this.PolygonsLayerSource.getFeatureById(featureParams.id)) {;
            const polygon = new Polygon([polygons[this.MarkersObject[featureParams.type].polygonModel]]);

            const polygonFeature = new Feature({
              name: featureParams.id,
              geometry: polygon,
            });

            polygonFeature.setId(featureParams.id);

            polygonFeature.setStyle(new Style({
              stroke: new Stroke({
                color: 'black',
                width: 3,
              }),
              fill: new Fill({
                color: 'rgba(0, 0, 0, 0.1)',
              }),
            }));

            this.PolygonsObject[featureParams.id] = {
              polygon: polygons[this.MarkersObject[featureParams.type].polygonModel],
              feature: polygonFeature,
              yawOld: 0,
            };

            this.PolygonsLayerSource.addFeature(polygonFeature);
          } else {
            this.movePolygonLayerFeature(featureParams.id, featureParams.longitude, featureParams.latitude);
            this.rotatePolygonLayerFeature(featureParams.id, featureParams.yaw);
          }

        } else {
          this.PolygonsLayerSource.removeFeature(this.PolygonsLayerSource.getFeatureById(featureParams.id) as Feature);
        }
      } catch (error) {
        console.log(error);
      }
    }
  }

  private movePolygonLayerFeature(id: number, lon: number, lat: number) {
    const feature = this.PolygonsObject[id].feature;

    const geometry = feature.getGeometry() as Polygon;
    const center = [geometry.getFlatCoordinates()[0], geometry.getFlatCoordinates()[1]];
    
    const tx = fromLonLat([lon, lat])[0] - center[0];
    const ty = fromLonLat([lon, lat])[1] - center[1];

    geometry.translate(tx, ty);
  }

  private rotatePolygonLayerFeature(id: number, yaw: number) {
    const feature = this.PolygonsObject[id].feature;

    const geometry = feature.getGeometry();

    const angle = - (yaw - this.PolygonsObject[id].yawOld);
    geometry?.rotate(angle / 57.2958, getCenter(geometry.getExtent()));
    this.PolygonsObject[id].yawOld = yaw;
  }

  private setViewCenter() {
    if (this.centeredObject !== 'None') {
      const coords = [
        this.FeaturesObject[this.centeredObject].featureParams.longitude,
        this.FeaturesObject[this.centeredObject].featureParams.latitude,
      ];

      // console.log(coords, this.lockedView);

      if (this.lockedView) {
        this.map.getView().setCenter(fromLonLat([...coords]));
        this.map.getView().setZoom(this.zoomLevel);
      }
    } else if (this.centeredObject === 'None' && this.lockedView) {
      this.map.getView().setCenter(this.currentCenter);
      this.map.getView().setZoom(this.zoomLevel);
    }
  }

  private getXYZ(coords: [number, number, number]) {

    const [lat, lon, alt] = coords;
    const [a, b] = [6378137, 6356752.314245];

    const e = 1 - (b ** 2 / a ** 2);
    const N = a / Math.sqrt(1 - e * Math.pow(Math.sin(lat), 2));

    const X = (N + alt) * Math.cos(lat) * Math.cos(lon);
    const Y = (N + alt) * Math.cos(lat) * Math.sin(lon);
    const Z = ((b ** 2 / a ** 2) * N + alt) * Math.sin(lat);

    return [X, Y, Z];
  }

  // [LAT, LON, ALT]
  public calculateDistance(coords1: [number, number, number], coords2: [number, number, number]) {

    const [X1, Y1, Z1] = this.getXYZ(coords1);
    const [X2, Y2, Z2] = this.getXYZ(coords2);

    // const [X1, Y1, Z1] = [1 * 111134.861111 , 1 * 111321.377778, 1];
    // const [X2, Y2, Z2] = [2 * 111134.861111 , 20 * 111321.377778, 1];

    const distance = Math.pow((X2 - X1) ** 3 + (Y2 - Y1) ** 3 + (Z2 - Z1) ** 3, (1 / 3));

    return distance;    
  }
}

export default MapCanvas;