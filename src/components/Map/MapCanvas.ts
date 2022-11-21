import { Feature, Map, View } from 'ol';
import { Coordinate } from 'ol/coordinate';
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
  }

  public setZoomLevel (level: number) {
    this.zoomLevel = level;
    this.map.getView().setZoom(level);
  }

  public changeInteractions(mode: string) {
    this.map.removeInteraction(this.draw);
    this.map.removeInteraction(this.snap);

    this.addInteractions(mode);
  }

  public getPinObjects() {
    return Object.keys(this.FeaturesObject);
  }

  public cleanDrawSource() {
    this.DrawLayerSource.clear();
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
          line.geometries[0].coords[i + 1],
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

    setInterval(this.updateFeaturesData.bind(this), 2000);
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

          if (!this.PolygonsLayerSource.getFeatureById(featureParams.id)) {
            console.log(polygons[this.MarkersObject[featureParams.type].polygonModel]);
            const polygon = new Polygon([polygons[this.MarkersObject[featureParams.type].polygonModel]]);

            const polygonFeature = new Feature({
              name: featureParams.id,
              geometry: polygon,
            });

            polygonFeature.setId(featureParams.id);

            this.PolygonsObject[featureParams.id] = {
              polygon: polygons[this.MarkersObject[featureParams.type].polygonModel],
              feature: polygonFeature,
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

    const geometry = feature.getGeometry() as Point;
    geometry.setCoordinates(fromLonLat([lon, lat]), geometry.getLayout());
  }

  private rotatePolygonLayerFeature(id: number, yaw: number) {
    const feature = this.PolygonsObject[id].feature;

    const geometry = feature.getGeometry();
    geometry?.rotate(yaw / 57.2958, getCenter(geometry.getExtent()));
  }

  private setViewCenter() {
    if (this.centeredObject !== 'None') {
      const coords = [
        this.FeaturesObject[this.centeredObject].featureParams.longitude,
        this.FeaturesObject[this.centeredObject].featureParams.latitude,
      ];

      if (this.lockedView) {
        this.map.getView().setCenter(fromLonLat([...coords]));
        this.map.getView().setZoom(this.zoomLevel);
      }
    } else if (this.centeredObject === 'None' && this.lockedView) {
      this.map.getView().setCenter(this.currentCenter);
      this.map.getView().setZoom(this.zoomLevel);
    }
  }
}

export default MapCanvas;