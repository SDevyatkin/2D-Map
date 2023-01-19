import { Feature, Graticule, Map, View } from 'ol';
import { Coordinate, createStringXY } from 'ol/coordinate';
import { buffer, containsExtent, equals, Extent, getCenter, getRotatedViewport, getSize, getTopRight } from 'ol/extent';
import { LineString, MultiLineString, Point, Polygon } from 'ol/geom';
import { Type } from 'ol/geom/Geometry';
import Draw from 'ol/interaction/Draw';
import Modify from 'ol/interaction/Modify';
import Snap from 'ol/interaction/Snap';
import TileLayer from 'ol/layer/Tile';
import VectorLayer from 'ol/layer/Vector';
import { fromLonLat, toLonLat } from 'ol/proj';
import { OSM, XYZ } from 'ol/source';
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
import { Size, toSize } from 'ol/size';
import { Dispatch } from '@reduxjs/toolkit';
import { setFeatureInfoID } from '../../store/sidebarSlice';
import { MapExtent, setExtents } from '../../store/mapSlice';
import { fromExtent } from 'ol/geom/Polygon';

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
  [key: number]: {
    route: number[][],
    color: string,
  }
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
  private dispatch: Dispatch;
  private TileSource = new OSM();
  private ObjectsLayerSource = new VectorSource();
  private ObjectsLayer = new VectorLayer({ zIndex: 10 });
  private PolygonsLayerSource = new VectorSource({});
  private PolygonLayer = new VectorLayer({ zIndex: 8 });
  private DrawLayerSource = new VectorSource({});
  private DrawLayer = new VectorLayer({ zIndex: 7 });
  private DrawModifier = new Modify({ source: this.DrawLayerSource });
  private DistanceLayerSource = new VectorSource({});
  private DistanceLayer = new VectorLayer({ zIndex: 6 });
  private RoutesLayerSource = new VectorSource({});
  private RoutesLayer = new VectorLayer({ zIndex: 5 });
  private ExtentsLayer = new VectorLayer({ zIndex: 4 });
  private ExtentsLayerSource = new VectorSource({});
  private GridLayer = new VectorLayer({ renderBuffer: Infinity, zIndex: 2 });
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
  private currentExtent: Coordinate[];
  private currentZoom: number = 3;
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

  constructor(divID: string, dispatch: Dispatch) {
    this.map = this.createMap(divID);
    this.divID = divID;
    this.dispatch = dispatch;
    const tempExtent = this.getCurrentExtent();
    this.currentExtent = tempExtent.map(point => [point[0] * 0.99, point[1] * 0.99] as Coordinate);
    this.dispatch(setExtents({
      [this.divID]: {
        extent: tempExtent,
        rotation: this.currentRotation,
        zoom: this.currentZoom
      },
    }));

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

    this.map.addLayer(this.ExtentsLayer);
    this.ExtentsLayer.setSource(this.ExtentsLayerSource);
    this.ExtentsLayer.setStyle(new Style({
      stroke: new Stroke({
        width: 3,
        color: '#FFF',
      }),
      fill: new Fill({
        color: 'rgba(255, 255, 255, 0.4)'
      }),
    }));

    this.getMarkerSettings();

    this.map.on('click', (event) => {
      const feature = this.map.forEachFeatureAtPixel(event.pixel, (f) => f);
      
      if (feature) {
        const id = feature.getId() as number;
        dispatch(setFeatureInfoID({
          map: Number(divID.slice(3)), 
          id,
        }));
        // this.featureInfoID = feature.getId() as number;
      }
    });

    this.map.on('pointermove', (event) => {
      const feature = this.map.forEachFeatureAtPixel(event.pixel, (f) => f);

      const popup = document.getElementById(`popup${this.divID.slice(3)}`) as HTMLElement;

      if (feature && feature.getId()?.toString().includes('distance')) {
        const id = feature.getId()?.toString().split('_') as string[];
        const [first, second] = [id[0], id[2]].map(i => this.FeaturesObject[Number(i)].featureParams);

        const coords1 = [first.latitude, first.longitude, first.altitude] as [number, number, number];
        const coords2 = [second.latitude, second.longitude, second.altitude] as [number, number, number];

        const distance = this.calculateDistance(coords1, coords2);

        popup.innerHTML = `${(distance / 1000).toFixed(3)} км`;

        popup.style.left = `${event.pixel[0] - 45}px`;
        popup.style.top = `${event.pixel[1] + 20}px`;
        popup.style.display = 'block';

      } else if (feature && feature.getId()?.toString().includes('extent')) {
        const mapID = feature.getId()?.toString().split('_')[0].slice(3);
        
        popup.innerHTML = `Вид карты ${mapID}`;

        popup.style.left = `${event.pixel[0] - 45}px`;
        popup.style.top = `${event.pixel[1] + 20}px`;
        popup.style.display = 'block';
      } else {
        popup.style.display = 'none';
      }
    });

    this.map.getView().on('propertychange', () => {
      // this.currentExtent = this.map.getView().calculateExtent(this.map.getSize());
      this.currentZoom = this.map.getView().getZoom() as number;
      const tempExtent = this.getCurrentExtent();
      this.currentExtent = tempExtent.map(point => [point[0] * 0.99, point[1] * 0.99] as Coordinate);

      // console.log(this.map.getView().calculateExtent(this.map.getSize()));
      // console.log(this.map.getView().calculateExtentInternal(this.map.getSize()));
      // console.log(this.map.getView().rotatedExtentForGeometry(this.map));

      dispatch(setExtents({
        [this.divID]: {
          extent: tempExtent,
          rotation: this.currentRotation,
          zoom: this.currentZoom,
        },
      }));
    });

    this.map.getView().on('change:rotation', (event) => {
      this.currentRotation = event.target.values_.rotation;
      rotationValueElement.innerHTML = `${Math.abs(event.target.values_.rotation * 57.2958).toFixed(2)}&#176`;
    });

    const sizeObserver = new ResizeObserver(() => {

      this.currentZoom = this.map.getView().getZoom() as number;
      const tempExtent = this.getCurrentExtent();
      this.currentExtent = tempExtent.map(point => [point[0] * 0.99, point[1] * 0.99] as Coordinate);

      // console.log(tempExtent);

      dispatch(setExtents({
        [this.divID]: {
          extent: tempExtent,
          rotation: this.currentRotation,
          zoom: this.currentZoom,
        },
      }));
    });

    const mapElement = document.getElementById(divID) as HTMLElement;
    const mapViewport = mapElement.querySelector('.ol-viewport') as HTMLElement;

    sizeObserver.observe(mapViewport);
    // console.log(mapViewport);

    // const mapID = document.createElement('div');
    // mapID.setAttribute('id', 'mapID');
    // mapID.innerHTML = this.divID.slice(3);
    // mapElement.appendChild(mapID);

    const mapIdElement = document.createElement('div');
    mapIdElement.classList.add('mapID');
    mapIdElement.innerHTML = this.divID.slice(3);
    mapViewport.appendChild(mapIdElement);

    const mousePositionElement = document.createElement('div');
    mousePositionElement.setAttribute('id', 'mouse-position');
    mapViewport.appendChild(mousePositionElement);

    const scaleLineElement = document.createElement('div');
    scaleLineElement.setAttribute('id', 'scale-line');
    mapViewport.appendChild(scaleLineElement);

    const rotationValueElement = document.createElement('div');
    rotationValueElement.setAttribute('id', 'rotation-value');
    rotationValueElement.innerHTML = '0.00&#176';
    mapViewport.appendChild(rotationValueElement);

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
      // event.frameState?.nextExtent
      // this.currentExtent = event.frameState?.extent as Extent;

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
      // console.log(this.currentExtent);
      // console.log(xmin, ymin, xmax, ymax);
    });
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

  public getCurrentExtent() {
    const extent = getRotatedViewport(
      this.map.getView().getCenterInternal() as Coordinate,
      this.map.getView().getResolution() as number,
      this.map.getView().getRotation(),
      [this.map.getViewport().offsetWidth, this.map.getViewport().offsetHeight],
    );

    const extentByCoords: Coordinate[] = [];
    
    for (let i = 0; i < extent.length; i += 2) {
      extentByCoords.push([extent[i], extent[i + 1]] as Coordinate);
    }

    return extentByCoords;
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

    this.DistanceLayerSource.clear();
    for (let distance of this.distances) {
      if (
        this.FeaturesObject[distance[0]].featureParams.parentID !== 'death' && 
        this.FeaturesObject[distance[1]].featureParams.parentID !== 'death'
      ) {
        this.drawDistance(distance);
      }
    }
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
      console.log(routes[Number(key)]);
      this.setRouteColor(Number(key), routes[Number(key)].color);
      const coordinates = routes[Number(key)].route.map(point => fromLonLat(point.slice().reverse()));

      if (!this.RoutesLayerSource.getFeatureById(key)) {
        const geometry = new LineString(coordinates);
        const feature = new Feature({});

        feature.setGeometry(geometry);
        feature.setId(key);
        // console.log(this.routesColors);
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

  private extentContains(extent: Coordinate[]) {
    // let containsPoints = 0;
    // for (let coord of extent) {
    //   let acc: number[] = []; 
    //   for (let i = 0; i < this.currentExtent.length - 1; i++) {
    //     const Ax = this.currentExtent[i][0];
    //     const Ay = this.currentExtent[i][1];

    //     const Bx = this.currentExtent[i + 1][0];
    //     const By = this.currentExtent[i + 1][1];

    //     const Px = coord[0];
    //     const Py = coord[1];

    //     acc.push((Bx - Ax) * (Py - Ay) - (By - Ay) * (Px - Ax));
    //     // const dx = this.currentExtent[i + 1][0] - this.currentExtent[i][0];
    //     // const dy = this.currentExtent[i + 1][1] - this.currentExtent[i][1];
    //     // const d = ((this.currentExtent[i][1] - coord[1]) * dx + (coord[0] - this.currentExtent[i][0]) * dy) / (dy ** 2 + dx ** 2);
    //     // acc.push(d <= 0);
    //   }

    //   if (!acc.every(n => n < 0) && !acc.every(n => n > 0)) {
    //     // containsPoints++;
    //     return false;
    //   } else {
    //     containsPoints++;
        
    //     if (containsPoints === 2) {
    //       return true;
    //     }
    //   }

    //   // if (containsPoints == 1) {
    //   //   return true;
    //   // }
    //   // console.log(this.divID, acc);
    //   // acc.every(item => item) && containsPoints++;
    // }

    // // console.log(this.divID, containsPoints);
    // return true;
    // console.log(this.currentExtent, extent);
    if (
      (this.currentExtent[0][0] < extent[0][0] || this.currentExtent[0][1] < extent[0][1]) &&
      (this.currentExtent[1][0] < extent[1][0] || this.currentExtent[1][1] > extent[1][1]) &&
      (this.currentExtent[2][0] > extent[2][0] || this.currentExtent[2][1] > extent[2][1]) &&
      (this.currentExtent[3][0] > extent[3][0] || this.currentExtent[3][1] < extent[3][1])
    ) {
      return true;
    } else {
      return false;
    }
  }

  public drawExtents(extents: MapExtent) {
    for (let id in extents) {
      if (id !== this.divID) {
        const extent = extents[id].extent;
        // console.log(
        //   `${id}: ${extent}
        //   ${this.divID}: ${this.currentExtent}
        //   ${containsExtent(extent, this.currentExtent.map(coord => coord * 0.98))}`
        // );
        let contains: boolean = false;
        // console.log(extents[id].zoom - this.currentZoom);
        if (extents[id].zoom - this.currentZoom > 0.25) {
          contains = this.extentContains(extent);
        }
        // const extremePoints = this.getExtremePoints(extent, getSize(extent), extents[id].rotation);
        // console.log(extremePoints);
        // const contains = containsExtent(extent, this.currentExtent.map(coord => coord * 0.98));
        // const equal = equals(extent, this.currentExtent.map(coord => coord * 0.98));
        const featureID = `${id}_extent`;

        if (!this.ExtentsLayerSource.getFeatureById(featureID) && contains) {
          // console.log(extremePoints[3][1] === extent[1]);
          // const geometry = fromExtent(extent);
          const geometry = new Polygon([extent]);
          // console.log(geometry);
          // const rotation = extents[id].rotation < 45 ? extents[id].rotation : extents[id].rotation * 2; 
          // geometry.rotate(rotation, getCenter(extent));
          const feature = new Feature({});

          feature.setGeometry(geometry);
          feature.setId(featureID);

          this.ExtentsLayerSource.addFeature(feature);
        } else if (contains) {
          const feature = this.ExtentsLayerSource.getFeatureById(featureID) as Feature;
          // const geometry = fromExtent(extent);
          const geometry = new Polygon([extent]);
          // console.log(geometry);
          // const rotation = Math.abs(extents[id].rotation) < Math.PI / 4 ? extents[id].rotation : extents[id].rotation * 2; 
          // geometry.rotate(rotation, getCenter(extent));
          feature.setGeometry(geometry);

          // console.log(getTopRight(extent));
        } else {
          const feature = this.ExtentsLayerSource.getFeatureById(featureID) as Feature;
          this.ExtentsLayerSource.removeFeature(feature);
        }
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
        new TileLayer({ 
          source: this.TileSource,
          // source: new XYZ({ url: 'http://127.0.0.1/tile/{z}/{x}/{y}.png' }),
          preload: 6,
        }),
      ],
      target: divID,
      view: new View({
          center: [0, 0],
          zoom: 3,
          extent: new View().getProjection().getExtent(),
          projection: 'EPSG:3857',
      }),
      controls: [],
      maxTilesLoading: 64,
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

          const newFeatureStyle = new Style({ zIndex: 2 });

          newFeatureStyle.setText(
            new Text({
              textAlign: 'center',
              justify: 'center',
              font: 'lighter 22px Arial, sans-serif',
              fill: new Fill({ color: '#000' }),
              stroke: new Stroke({
                color: '#000',
                width: 1,
              }),
              text: String(key),
              backgroundFill: new Fill({ color: 'rgba(255, 255, 255, 0.8)' }),
              backgroundStroke: new Stroke({
                width: 1,
                color: '#000',
              }),
              padding: [0, 2, 0, 4],
              offsetX: 30,
              offsetY: 30,
            })
          );

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

  private getExtremePoints(extent: Extent, size: Size, rotation: number) {
    const width = Math.sqrt((extent[0] - extent[3]) ** 2 + (extent[1] - extent[1]) ** 2);
    const height = Math.sqrt((extent[0] - extent[0]) ** 2 + (extent[1] - extent[3]) ** 2);
    // let [width, height] = size;
    const phi = Math.tan(rotation);

    const x2 = (phi * height - width) / (-1 + phi ** 2);
    const x1 = width - x2;

    // const y2 = Math.tan(rotation) * x1;
    const y2 = rotation ? x1 * (Math.sin(Math.PI / 2 - rotation) / Math.sin(rotation)) : height;
    const y1 = height - y2;
    // console.log(x1, x2, width, height, phi);
    // console.log(Math.sin(rotation));
    let extremePoints: Coordinate[];

    if (phi >= 0) {
      // console.log(x1, x2, y1, y2, width, height, phi);
      extremePoints = [
        [extent[0] + x1, extent[1]] as Coordinate,
        [extent[0], extent[1] + y2] as Coordinate,
        [extent[2] - x1, extent[3]] as Coordinate,
        [extent[2], extent[1] + y1] as Coordinate,
      ];
      console.log(extent[0], x1, extent[0] + x1);
      // extremePoints = [
      //   [extent[0], extent[1] + y1] as Coordinate, // x+
      //   [extent[0] + x1, extent[3]] as Coordinate, // y+
      //   [extent[2], extent[3] - y1] as Coordinate, // x+
      //   [extent[2] - x1, extent[1]] as Coordinate, // y+
      // ];
    } else {
      // console.log(x1, x2, y1, y2);
      extremePoints = [
        [extent[0], extent[1] - y1] as Coordinate,
        [extent[0] - x1, extent[3]] as Coordinate,
        [extent[2], extent[3] + y1] as Coordinate,
        [extent[2] + x1, extent[1]] as Coordinate,
      ];
    }

    return extremePoints;
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