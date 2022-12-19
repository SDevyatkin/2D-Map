import { Feature, Graticule, Map, View } from 'ol';
import { Coordinate, createStringXY } from 'ol/coordinate';
import { Extent, getCenter } from 'ol/extent';
import { LineString, MultiLineString, Point, Polygon } from 'ol/geom';
import { Type } from 'ol/geom/Geometry';
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
import { BASE_URL, getMarkerSettings, getPolygonIcons, getRoutes } from '../../api';
import { IMarkerSettings } from '../../store/modelSettingsSlice';
import { GreatCircle } from 'arc';
import { FullScreen, MousePosition, Rotate, ScaleLine, Zoom, ZoomSlider, ZoomToExtent } from 'ol/control';
import { IFeatures } from '../../wsTypes';
import { getVectorContext } from 'ol/render';

type mapObjectType = {
  id: number;
  type: number;
  parentID: number | string;
  latitude: number;
  longitude: number;
  yaw: number;
  altitude: number;
}

interface FeaturesObjectI {
  [key: number]: {
    feature: Feature,
    featureParams: mapObjectType,
    style: Style,
  }
}

interface IPolygonsObject {
  [key: string]: {
    polygon: number[][],
    feature: Feature,
    yawOld: number,
  },
}

interface IRoutes {
  [key: number]: number[][]
}

interface IRoutesColors {
  [key: number]: string;
}

interface IDistancesColors {
  [key: string]: string;
}

interface IMarkersObject extends IMarkerSettings {}

class MapCanvas {
  private map: Map; 
  private divID: string;
  private TileSource = new OSM();
  private ObjectsLayerSource = new VectorSource();
  private ObjectsLayer = new VectorLayer({ zIndex: 10 });
  private PolygonsLayerSource = new VectorSource({});
  private PolygonLayer = new VectorLayer({});
  private DrawLayerSource = new VectorSource({});
  private DrawLayer = new VectorLayer({});
  private DrawModifier = new Modify({ source: this.DrawLayerSource });
  private DistanceLayerSource = new VectorSource({});
  private DistanceLayer = new VectorLayer({});
  private RoutesLayerSource = new VectorSource({});
  private RoutesLayer = new VectorLayer({});
  private GridLayer = new VectorLayer({ renderBuffer: Infinity });
  private GridLayerSource = new VectorSource({ features: [new Feature(new Point([0, 1]))] });
  // private DistanceModifier = new Modify({ source: this.DistanceLayerSource });
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
  private distances: [number, number][] = [];
  private distancesColors: IDistancesColors = {};
  private routesID: number[] = [];
  private routes: IRoutes = {};
  private routesColors: IRoutesColors = {};
  private currentRotation: number = 0;
  private draw: Draw = new Draw({
    source: this.DrawLayerSource,
    type: 'LineString',
    freehand: true,
  });
  private snap: Snap = new Snap({
    source: this.DrawLayerSource,
  });

  constructor(divID: string) {
    this.map = this.createMap(divID);
    this.divID = divID;

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
        color: 'rgba(255, 255, 255, 0.4)' 
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
    this.map.addInteraction(this.DrawModifier);
    // this.ObjectsLayer.setStyle((feature) => this.styles[feature.get('type')]);

    this.map.addLayer(this.DistanceLayer);
    this.DistanceLayer.setSource(this.DistanceLayerSource);
    this.DistanceLayer.setStyle(new Style({
      stroke: new Stroke({
        width: 2,
      }),
    }));
    // this.map.addInteraction(this.DistanceModifier);

    this.map.addLayer(this.RoutesLayer);
    this.RoutesLayer.setSource(this.RoutesLayerSource);
    this.RoutesLayer.setStyle(new Style({
      stroke: new Stroke({
        width: 3,
        color: '#F00',
      }),
    }));

    this.getMarkerSettings();

    this.map.on('click', (event) => {
      const feature = this.map.forEachFeatureAtPixel(event.pixel, (f) => f);
      
      if (feature) {
        this.featureInfoID = feature.getId() as number;
      }
    });

    this.map.on('pointermove', (event) => {
      const feature = this.map.forEachFeatureAtPixel(event.pixel, (f) => f);

      const popup = document.getElementById('popup') as HTMLElement;

      if (feature && feature.getId()?.toString().includes('distance')) {
        const id = feature.getId()?.toString().split('_') as string[];
        const [first, second] = [id[0], id[2]].map(i => this.FeaturesObject[Number(i)].featureParams);

        const coords1 = [first.latitude, first.longitude, first.altitude] as [number, number, number];
        const coords2 = [second.latitude, second.longitude, second.altitude] as [number, number, number];

        const distance = this.calculateDistance(coords1, coords2);

        popup.innerHTML = `${(distance / 1000).toFixed(3)} км`;

        popup.style.left = `${event.pixel[0] - 45}px`;
        popup.style.top = `${event.pixel[1] + 10}px`;
        popup.style.display = 'block';

      } else {
        popup.style.display = 'none';
      }
    });

    this.map.getView().on('change:rotation', (event) => {
      this.currentRotation = event.target.values_.rotation;
    });

    const mapElement = document.getElementById(divID) as HTMLElement;

    const mapID = document.createElement('div');
    mapID.setAttribute('id', 'mapID');
    mapID.innerHTML = this.divID.slice(3);
    mapElement.appendChild(mapID);

    const mousePositionElement = document.createElement('div');
    mousePositionElement.setAttribute('id', 'mouse-position');
    mapElement.appendChild(mousePositionElement);

    const scaleLineElement = document.createElement('div');
    scaleLineElement.setAttribute('id', 'scale-line');
    mapElement.appendChild(scaleLineElement);

    this.map.addControl(new MousePosition({
      coordinateFormat: createStringXY(6),
      projection: 'EPSG:4326',
      className: 'custom-mouse-position',
      target: mousePositionElement,
    }));

    this.map.addControl(new ScaleLine());

    this.map.addControl(new Zoom());

    this.map.addControl(new Rotate({
      className: 'custom-compass',
      label: '',
    }));

    this.map.addControl(new FullScreen());

    this.map.addControl(new ZoomToExtent());

    this.map.addControl(new ZoomSlider());

    this.map.addLayer(this.GridLayer);
    this.GridLayer.setSource(this.GridLayerSource);

    this.GridLayer.on('prerender', (event) => {

      let unitSplit = 0.1; // every 0.1 m
      let pxToUnit = this.map.getView().getResolution() as number;
      let pxSplit = unitSplit / pxToUnit;

      let [xmin, ymin, xmax, ymax] = event.frameState?.extent as Extent;

      while (pxSplit * 2 < 100) {
        unitSplit *= 2;
        pxSplit = unitSplit / pxToUnit; // distance between two lines
      }

      let startX = Math.round(xmin / unitSplit) * unitSplit; // first line
      let endX = Math.round(xmax / unitSplit) * unitSplit; // last line

      let startY = Math.round(ymin / unitSplit) * unitSplit;
      let endY = Math.round(ymax / unitSplit) * unitSplit;

      let ctx = getVectorContext(event);

      let lineStyle = new Style({
        stroke: new Stroke({
          width: 1,
          color: 'rgba(255, 0, 0, 0.2)',
        }),
      });

      ctx.setStyle(lineStyle);

      // drawing lines
      for (let i = startX; i <= endX; i += unitSplit) {
        ctx.drawLineString(new LineString([[i, ymin], [i, ymax]]));
      }

      for (let i = startY; i <= endY; i += unitSplit) {
        ctx.drawLineString(new LineString([[xmin, i], [xmax, i]]));
      }

      let text = new Text({
        fill: new Fill({
          color: '#000',
        }),
        font: '12px arial',
        textAlign: 'left',
      });

      // drawing labels
      // for (let i = startY; i <= endY; i += unitSplit) {
      //   text.setText(`${(i / 1000).toFixed(2)} км`);
      //   lineStyle.setText(text);

      //   const extent = event.frameState?.extent as Extent;

      //   ctx.setStyle(lineStyle);
      //   ctx.drawPoint(new Point([extent[0] + 10 * pxToUnit, i + pxToUnit]));
      // }

      // text.setRotation(Math.PI / 2);

      // for (let i = startX; i <= endX; i += unitSplit) {
      //   text.setText(`${(i / 1000).toFixed(2)} км`);
      //   lineStyle.setText(text);

      //   const extent = event.frameState?.extent as Extent;

      //   ctx.setStyle(lineStyle);
      //   ctx.drawPoint(new Point([i + pxToUnit, extent[3] - 10 * pxToUnit]))
      // }
    });

    // const testFeatute = new Feature();
    // testFeatute.setGeometry(
    //   new LineString([[8781000,5662310],[8781000,5668860], [8808040,5668860]])
    // )
    // testFeatute.setStyle(new Style({
    //   stroke: new Stroke({
    //     width: 2,
    //     color: 'red',
    //   }),
    // }));
    // this.DrawLayerSource.addFeature(testFeatute)
  }

  public getDivID() {
    return this.divID;
  }

  public resize() {
    this.map.updateSize();
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

  public getFeatureInfoID() {
    return this.featureInfoID;
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

  public clearRoutesLayer() {
    this.RoutesLayerSource.clear();
  }

  public clearDistanceLayer() {
    this.DistanceLayerSource.clear();
  }

  public setDistanceColor(first: number, second: number, color: string) {
    this.distancesColors[`${first}_distance_${second}`] = color;
  }

  public setRouteColor(id: number, color: string) {
    this.routesColors[id] = color;
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

    this.centeredObject = id;
    this.map.getView().setCenter(fromLonLat(coords));
  }

  public pushDistance(distance: [number, number]) {
    this.distances.push(distance);
  }

  public pushRoute(id: number) {
    this.routesID.push(id);
  }

  public drawLine() {
    const coordinates = [];

    const features = this.DrawLayerSource.getFeatures();

    for (let feature of features) {

      if (feature.getGeometry()?.getType() === 'Point') {
        const extent = feature.getGeometry()?.getExtent() as Extent;
        const coordinate = toLonLat(getCenter(extent));

        if (!feature.getId() !== undefined) {
          feature.setId(this.userPoints.length)
        }

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
      name: 'DrawFeature',
      geometry: marker,
    });

    this.DrawLayerSource.addFeature(markerFeature);

    this.userPoints = [];
  }

  private drawDistance(distance: [number, number]) {
    const coordinates = [];

    const arcGenerator = new GreatCircle(
      {
        x: this.FeaturesObject[distance[0]].featureParams.longitude, 
        y: this.FeaturesObject[distance[0]].featureParams.latitude,
      },
      {
        x: this.FeaturesObject[distance[1]].featureParams.longitude, 
        y: this.FeaturesObject[distance[1]].featureParams.latitude,
      }
    );

    const line = arcGenerator.Arc(100, { offset: 10 });

    for (let i = 0; i < line.geometries[0].coords.length - 1; i++) {
      coordinates.push([
        line.geometries[0].coords[i],
        line.geometries[0].coords[i + 1],
      ]);
    }

    for (let i = 0; i < coordinates.length; i++) {
      coordinates[i][0] = fromLonLat(coordinates[i][0]);
      coordinates[i][1] = fromLonLat(coordinates[i][1]);
    }

    const marker = new MultiLineString(coordinates);

    const markerFeature = new Feature({
      name: 'DistanceFeature',
      geometry: marker,
    });

    markerFeature.setId(`${distance[0]}_distance_${distance[1]}`);

    markerFeature.setStyle(new Style({
      stroke: new Stroke({
        width: 2,
        color: this.distancesColors[markerFeature.getId() as string],
      }),
    }));

    this.DistanceLayerSource.addFeature(markerFeature);
  }

  public drawRoutes(routes: IRoutes) {

    for (let key of Object.keys(routes)) {
      const coordinates = routes[Number(key)].map(point => fromLonLat(point.slice().reverse()));
      

      if (!this.RoutesLayerSource.getFeatureById(key)) {
        const geometry = new LineString(coordinates);
        const feature = new Feature({});

        feature.setGeometry(geometry);
        feature.setId(key);
        feature.setStyle(new Style({
          stroke: new Stroke({
            width: 2,
            color: this.routesColors[Number(key)],
          }),
        }));

        this.RoutesLayerSource.addFeature(feature);
      } else {
        (this.RoutesLayerSource.getFeatureById(key)?.getGeometry() as LineString)
          .appendCoordinate(coordinates[coordinates.length - 1]);
      }
    } 
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

  private createMap(divID: string) {

    return new Map({
      layers: [
        new TileLayer({ source: this.TileSource }),
      ],
      target: divID,
      view: new View({
          center: [0, 0],
          zoom: 3,
          extent: new View().getProjection().getExtent(),
          projection: 'EPSG:3857',
      }),
      controls: [],
    });
  }

  private async getMarkerSettings() {
    this.MarkersObject = await getMarkerSettings();
  }

  public async updateFeaturesData(features: IFeatures, idsByAltitude: number[]) {

    if (Object.keys(features).length !== 0) {
      for (const key in features) {
        if (!this.FeaturesObject.hasOwnProperty(key)) {

          const newFeature = new Feature({
            geometry: new Point(fromLonLat([features[key].longitude, features[key].latitude])),
          });

          newFeature.setId(features[key].id);

          const settings = this.MarkersObject[features[key].type];

          const newFeatureStyle = new Style();

          newFeatureStyle.setText(
            new Text({
              font: '16px Calibri, sans-serif',
              fill: new Fill({ color: '#f00' }),
              stroke: new Stroke({
                color: '#000',
                width: 2,
              }),
              text: String(key),
              offsetX: 30,
              offsetY: 30,
            })
          )

          if (features[key].type in this.MarkersObject) {

            newFeatureStyle.setImage(
              new Icon({
              opacity: settings.alpha,
              scale: settings.size,
              src: `${BASE_URL}/public/images/${settings.image}`,
              rotation: features[key].yaw / 57.2958 + this.currentRotation,
            }));
          } else {
            newFeatureStyle.setImage(
              new Icon({
              opacity: 1,
              scale: 0.15,
              src: `${BASE_URL}/public/images/question.png`,
              rotation: features[key].yaw / 57.2958 + this.currentRotation,
            }));
          }

          newFeature.setStyle(newFeatureStyle)

          this.ObjectsLayerSource.addFeature(newFeature);

          this.FeaturesObject[features[key].id] = {
            feature: newFeature,
            featureParams: features[key],
            style: newFeatureStyle
          }

        } else {
          this.FeaturesObject[features[key].id].featureParams = features[key];
          this.moveObjectLayerFeature(features[key].id, features[key].longitude, features[key].latitude);
          this.FeaturesObject[features[key].id].style.getImage().setRotation((features[key].yaw / 57.2958) + this.currentRotation)
        }

      }

      this.idsByAltitude = idsByAltitude;
        this.ObjectsLayerSource.clear();
        for (let i = 0; i < this.idsByAltitude.length; i++) {
          if (this.FeaturesObject[this.idsByAltitude[i]].featureParams.parentID !== 'death') {
            this.ObjectsLayerSource.addFeature(this.FeaturesObject[this.idsByAltitude[i]].feature);
          }
        }
    }

    this.DistanceLayerSource.clear();
    for (let distance of this.distances) {
      if (
        this.FeaturesObject[distance[0]].featureParams.parentID !== 'death' && 
        this.FeaturesObject[distance[1]].featureParams.parentID !== 'death'
      ) {
        this.drawDistance(distance);
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

    try {
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
          src: `${BASE_URL}/public/images/${settings.image}`,
          rotation: yaw / 57.2958 - this.currentRotation,
        }),
      }));
    } catch {
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
          opacity: 1,
          scale: 0.2,
          src: `${BASE_URL}/public/images/question.png`,
          rotation: yaw / 57.2958 - this.currentRotation,
        }),
      }));
    }
  }

  private async updatePolygonsData() {

    const polygons = await getPolygonIcons();

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
    geometry?.rotate(angle / 57.2958, [0, 0]);
    this.PolygonsObject[id].yawOld = yaw;
  }

  private setViewCenter() {
    if (this.centeredObject !== 'None') {
      const coords = [
        this.FeaturesObject[this.centeredObject].featureParams.longitude,
        this.FeaturesObject[this.centeredObject].featureParams.latitude,
      ];

      if (this.lockedView) {
        // console.log(this.centeredObject, this.lockedView)
        this.map.getView().setCenter(fromLonLat([...coords]));
        this.map.getView().setZoom(this.zoomLevel);
      }
    } else if (this.centeredObject === 'None' && this.lockedView) {
      this.map.getView().setCenter(this.currentCenter);
      this.map.getView().setZoom(this.zoomLevel);
    }
  }

  public calculateDistance(coords1: [number, number, number], coords2: [number, number, number]) {

    const R = 6371000;
    const curve = Math.PI / 180;

    const phi1 = coords1[0] * curve;      //долгота 1
    const phi2 = coords2[0] * curve;      //долгота 2

    const alpha1 = coords1[1] * curve;    //широта 1
    const alpha2 = coords2[1] * curve;    //широта 2
    
    const deltaPhi = phi2  - phi1;
    const deltaAlpha = alpha2 - alpha1;

    const a = Math.sin(deltaPhi / 2) ** 2 +
              Math.cos(phi1) * Math.cos(phi2) *
              Math.sin(deltaAlpha / 2) ** 2;
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    const d = R * c;

    const deltaAlt = Math.abs(coords1[2] - coords2[2]);

    return Math.sqrt(d ** 2 + deltaAlt ** 2);
  }   
}

export default MapCanvas;