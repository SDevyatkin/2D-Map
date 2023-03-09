import { Feature, Graticule, Map, MapBrowserEvent, View } from 'ol';
import { Coordinate, createStringXY, rotate} from 'ol/coordinate';
import GeoJSON from 'ol/format/GeoJSON';
import { buffer, containsExtent, createOrUpdateFromCoordinate, equals, extend, Extent, getCenter, getRotatedViewport, getSize, getTopRight } from 'ol/extent';
import { LineString, MultiLineString, Point, Polygon } from 'ol/geom';
import { Type } from 'ol/geom/Geometry';
import Draw from 'ol/interaction/Draw';
import Modify from 'ol/interaction/Modify';
import Snap from 'ol/interaction/Snap';
import TileLayer from 'ol/layer/Tile';
import VectorLayer from 'ol/layer/Vector';
import { fromLonLat, toLonLat, transform } from 'ol/proj';
import { OSM, XYZ } from 'ol/source';
import VectorSource from 'ol/source/Vector';
import CircleStyle from 'ol/style/Circle';
import Fill from 'ol/style/Fill';
import Icon from 'ol/style/Icon';
import Stroke from 'ol/style/Stroke';
import Style, { StyleLike } from 'ol/style/Style';
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
import { MapExtent, setExtents, setUserExtentColorPicker } from '../../store/mapSlice';
import { fromExtent } from 'ol/geom/Polygon';
import { DragAndDrop, DragBox, DragPan, DragRotate, Extent as ExtentInteraction, PinchRotate, PinchZoom, Pointer } from 'ol/interaction';
import { shiftKeyOnly } from 'ol/events/condition';
import { v4 } from 'uuid';
import { DragBoxEvent } from 'ol/interaction/DragBox';
import PointerInteraction from 'ol/interaction/Pointer';
import { BBox, center, centerOfMass, geometry, greatCircle, polygon, squareGrid } from '@turf/turf';
import rectangleGrid from '@turf/rectangle-grid';
import { Pixel } from 'ol/pixel';
import { store } from '../../store/store';
import { WidgetsLayout } from '../../store/widgetSettingsSlice';
import { asString } from 'ol/color';
import { pushError } from '../../store/errorLogSlice';

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

interface IUserExtents {
  [key: string]: Coordinate[];
}

interface IUserExtentsSettings {
  [key: string]: {
    style: Style;
    rotation: number;
  };
}

interface IUserExtentStyles {
  [key: string]: Style;
}

interface IMarkersObject extends IMarkerSettings {}

class MapCanvas {
  private map: Map; 
  private divID: string;
  private dispatch: Dispatch;
  private TileSource = new OSM();
  private ObjectsLayerSource = new VectorSource();
  private ObjectsLayer = new VectorLayer({ zIndex: 10 });
  private InfoLayerSource = new VectorSource();
  private InfoLayer = new VectorLayer({ source: this.InfoLayerSource, zIndex: 9 });
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
  private UserExtentsLayer = new VectorLayer({ zIndex: 4 });
  private UserExtentsLayerSource = new VectorSource({});
  private GridLayer = new VectorLayer({ renderBuffer: Infinity, zIndex: 2 });
  private GridLayerSource = new VectorSource({ features: [new Feature(new Point([0, 1]))] });
  private MetricGridLayerSource = new VectorSource({});
  private MetricGridLayer = new VectorLayer({
    source: this.MetricGridLayerSource,
    zIndex: 2,
  });
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
  private currentUserExtentStart: Coordinate | null = null;
  private currentUserExtentEnd: Coordinate | null = null;
  private currentUserExtentID: string = '';
  private currentTopRightPixel: Pixel | null = null;
  private currentBottomLeftPixel: Pixel | null = null;
  // private dragBox: DragBox;
  private userExtents: IUserExtents = {};
  private userExtentStyles: IUserExtentStyles = {};
  private userExtentSettings: IUserExtentsSettings = {};
  private currentZoom: number = 3;
  private featureFixedInfoID: number = -1;
  private featureBindedInfoIds: number[] = [];
  private featureInfo: mapObjectType | null = null;
  private gridStep: number = 1000;
  private userPoints: Coordinate[] = [];
  private distances: [number, number][] = [];
  private distancesColors: IDistancesColors = {};
  private routesID: number[] = [];
  private routes: IRoutes = {};
  private routesColors: IRoutesColors = {};
  private currentRotation: number = 0;
  private widgetsLayout: WidgetsLayout = store.getState().widgetSettings.widgetsLayout;
  private leftPosition: number = 0;
  private topPosition: number = 0;
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

    this.map.addLayer(this.InfoLayer);

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

    this.map.addLayer(this.UserExtentsLayer);
    this.UserExtentsLayer.setSource(this.UserExtentsLayerSource);

    this.getMarkerSettings();

    // const extentInteraction = new ExtentInteraction({ 
    //   condition: shiftKeyOnly,
    //   boxStyle: new Style({
    //     stroke: new Stroke({
    //       width: 3,
    //       color: 'rgb(139, 0, 255)',
    //     }),
    //     fill: new Fill({
    //       color: 'rgba(139, 0, 255, 0.4)'
    //     }),
    //   }),
    // });

    // extentInteraction.on('extentchanged', (event) => {
    //   event.preventDefault();
    //   // console.log(event);
    // });

    // this.map.addInteraction(extentInteraction);

    this.map.addInteraction(new PinchRotate());
    this.map.addInteraction(new PinchZoom());

    class SelectionPointerInteraction extends Pointer {
      private instance: MapCanvas;

      constructor(instance: MapCanvas) {
        super();
        this.instance = instance;
      }

      public handleDownEvent(event: MapBrowserEvent<any>) {
        if (!event.originalEvent.shiftKey || event.originalEvent.altKey) return false;

        this.instance.currentUserExtentStart = event.coordinate;
        this.instance.currentUserExtentEnd = event.coordinate;
        this.instance.updateSelectionBox();
        return true;
      }

      public handleMoveEvent(event: MapBrowserEvent<any>) {
        if (this.instance.currentUserExtentStart) {
          this.instance.currentUserExtentEnd = event.coordinate;
          this.instance.updateSelectionBox();
        }
      }

      public handleUpEvent(event: MapBrowserEvent<any>) {
        this.instance.updateSelectionBox();

        this.instance.addUserExtent();

        const selectionBox = document.getElementById(this.instance.divID)?.querySelector('.selection-box') as HTMLDivElement;
        selectionBox.style.display = 'none';

        this.instance.currentUserExtentStart = null;
        this.instance.currentUserExtentEnd = null;
        return false;
      }
    }

    // const pointerInteraction = new Pointer({
    //   handleDownEvent: (event) => {
    //     this.currentUserExtentStart = event.coordinate;
    //     this.currentUserExtentEnd = event.coordinate;
    //     this.updateSelectionBox();
    //     return true;
    //   },

    //   handleMoveEvent: (event) => {
    //     console.log(this.currentUserExtentStart);
    //     if (this.currentUserExtentStart) {
    //       this.currentUserExtentEnd = event.coordinate;
    //       this.updateSelectionBox();
    //     }

    //   },

    //   handleUpEvent: () => {
    //     this.currentUserExtentStart = null;
    //     this.currentUserExtentEnd = null;
    //     this.updateSelectionBox();
    //     return false;
    //   },
    // });

    const pointerInteraction = new SelectionPointerInteraction(this);

    this.map.on('pointermove', (event) => {
      if (event.dragging || event.originalEvent.srcElement.localName !== 'canvas') {

        pointerInteraction.handleMoveEvent(event);
      }
    });

    this.map.addInteraction(pointerInteraction);
    // this.dragBox = new DragBox();

    // this.dragBox.on('boxstart', (event) => {

    //   if (event.mapBrowserEvent.originalEvent.altKey || !event.mapBrowserEvent.originalEvent.shiftKey) {
    //     this.currentUserExtentID = '';
    //     return;
    //   }

    //   this.currentUserExtentStart = event.coordinate;
    //   this.currentUserExtentEnd = event.coordinate;

    //   const id = `UserExtent_${v4()}`;
    //   this.currentUserExtentID = id;

    //   const geometry = this.getUserExtentGeometry();

    //   const feature = new Feature();

    //   const style = new Style({
    //     stroke: new Stroke({
    //       width: 3,
    //       color: 'rgb(78, 0, 255)',
    //     }),
    //     fill: new Fill({
    //       color: 'rgba(78, 0, 255, 0.4)'
    //     }),
    //   });

    //   this.userExtentSettings[id] = {
    //     style,
    //     rotation: this.currentRotation,
    //   };

    //   feature.setId(id);
    //   feature.setGeometry(geometry);
    //   feature.setStyle(style);

    //   this.UserExtentsLayerSource.addFeature(feature);
    //   this.userExtents[id] = [
    //     event.coordinate,
    //     event.coordinate,
    //     event.coordinate,
    //     event.coordinate,
    //   ];

    //   // console.log(this.userExtents);
    // });

    // this.dragBox.on('boxdrag', this.updateUserExtentFeature.bind(this));

    // this.dragBox.on('boxend', this.updateUserExtentFeature.bind(this));

    // this.map.addInteraction(this.dragBox);

    // const dragPan = new DragPan();

    // this.map.addInteraction(dragPan);

    const dragRotate = new DragRotate();

    this.map.addInteraction(dragRotate);
    // this.map.on('pointerdrag', (event) => {
    //   console.log(event.originalEvent);
    // });

    const mapElement = document.getElementById(divID) as HTMLElement;
    const mapViewport = mapElement.querySelector('.ol-viewport') as HTMLElement;

    const popupClickOnExtent = document.createElement('div');
    popupClickOnExtent.setAttribute('id', `popupClickOnExtent${this.divID.slice(3)}`);
    popupClickOnExtent.classList.add('popup', 'popup-flex');
    mapViewport.appendChild(popupClickOnExtent);

    const popupFitExtentMapSelection = document.createElement('div');
    popupFitExtentMapSelection.setAttribute('id', `popupFitExtentMapSelection${this.divID.slice(3)}`);
    popupFitExtentMapSelection.classList.add('popup', 'popup-flex');
    mapViewport.appendChild(popupFitExtentMapSelection);

    const popupFitExtentButton = document.createElement('button');
    popupFitExtentButton.innerHTML = 'Перейти';
    popupFitExtentButton.classList.add('popup-btn');
    popupClickOnExtent.appendChild(popupFitExtentButton);

    const popupColorPickerButton = document.createElement('button');
    popupColorPickerButton.innerHTML = 'Цвет';
    popupColorPickerButton.classList.add('popup-btn');
    popupClickOnExtent.appendChild(popupColorPickerButton);

    const popupDeleteButton = document.createElement('button');
    popupDeleteButton.innerHTML = 'Удалить';
    popupDeleteButton.classList.add('popup-btn');
    popupClickOnExtent.appendChild(popupDeleteButton);

    // popupFitExtentButton.addEventListener('click', (event) => {
    //   popupClickOnExtent.style.display = 'none';

    //   const id = (event.currentTarget as HTMLButtonElement).dataset.extentId as string;

    //   const rotation = this.userExtentSettings[id].rotation
    //   this.map.getView().setRotation(rotation);
    //   this.map.getView().fit(new Polygon([this.userExtents[id]]));
    // });
    
    popupFitExtentButton.addEventListener('click', (event) => {
      popupClickOnExtent.style.display = 'none';
      const mapsCount = Number(this.widgetsLayout.slice(0, 1));
      const extentId = popupFitExtentButton.dataset.extentId as string;

      for (let i = 0; i < mapsCount; i++) {
        popupFitExtentMapSelection.style.display = 'block';

        popupFitExtentMapSelection.style.left = popupClickOnExtent.style.left;
        popupFitExtentMapSelection.style.top = popupClickOnExtent.style.top;

        const fitExtentByNumberButton = this.createPopupButton(popupFitExtentMapSelection, String(i + 1)); 
        // popupFitExtentMapSelection.appendChild();
        fitExtentByNumberButton.addEventListener('click', (event) => {
          popupFitExtentMapSelection.style.display = 'none';
          
          while (popupFitExtentMapSelection.firstChild) {
            popupFitExtentMapSelection.removeChild(popupFitExtentMapSelection.lastChild as ChildNode);
          }

          const mapId = `map${fitExtentByNumberButton.textContent}`;

          const Map = store.getState().Map.maps[mapId];

          Map.setRotation(this.userExtentSettings[extentId].rotation);
          Map.fitExtent(new Polygon([this.userExtents[extentId]]));
        });
      }
    });

    popupColorPickerButton.addEventListener('click', (event) => {
      popupClickOnExtent.style.display = 'none';

      const id = (event.currentTarget as HTMLButtonElement).dataset.extentId as string;

      const feature = this.UserExtentsLayerSource.getFeatureById(id);

      dispatch(setUserExtentColorPicker({
        mapId: this.divID,
        featureId: id,
      }));
    });

    popupDeleteButton.addEventListener('click', (event) => {
      popupClickOnExtent.style.display = 'none';

      const id = (event.currentTarget as HTMLButtonElement).dataset.extentId as string;

      delete this.userExtentStyles[id];
      delete this.userExtents[id];
      this.UserExtentsLayerSource.removeFeature(
        this.UserExtentsLayerSource.getFeatureById(id) as Feature
      );
    });

    const popupClickOnFeature = document.createElement('div');
    popupClickOnFeature.setAttribute('id', `popupClickOnFeature${this.divID.slice(3)}`);
    popupClickOnFeature.classList.add('popup', 'popup-flex');
    mapViewport.appendChild(popupClickOnFeature);

    const popupBindInfoButton = document.createElement('button');
    popupBindInfoButton.innerHTML = 'Привязать';
    popupBindInfoButton.classList.add('popup-btn');
    popupClickOnFeature.appendChild(popupBindInfoButton);

    const popupFixedInfoButton = document.createElement('button');
    popupFixedInfoButton.innerHTML = 'Фиксировать';
    popupFixedInfoButton.classList.add('popup-btn');
    popupClickOnFeature.appendChild(popupFixedInfoButton);

    popupFixedInfoButton.addEventListener('click', (event) => {
      popupClickOnFeature.style.display = 'none';

      const featureID = Number((event.currentTarget as HTMLButtonElement).dataset.featureID);

      dispatch(setFeatureInfoID({
        map: Number(divID.slice(3)), 
        id: Number(featureID),
      }));
    });

    popupBindInfoButton.addEventListener('click', (event) => {
      popupClickOnFeature.style.display = 'none';

      const featureID = Number((event.currentTarget as HTMLButtonElement).dataset.featureID);

      this.featureBindedInfoIds.push(featureID);
    });

    this.map.on('pointerdrag', (event) => {

      if (event.originalEvent.srcElement.localName !== 'canvas' && event.originalEvent.srcElement.className.includes('react-colorful')) {
        // this.stopMoving = true;
        this.map.getInteractions().forEach((interaction) => {
          if (interaction instanceof DragPan) {
            this.map.removeInteraction(interaction);
            setTimeout(() => this.map.addInteraction(new DragPan()), 100);
          }
        });

        // setTimeout(() => dragPan.setActive(true), 100);
      } else {
        // this.stopMoving = false;
        // !dragPan.getActive() && dragPan.setActive(true);
      }
    });
    // this.map.on('movestart', (event) => {
    //   if (this.stopMoving) event.preventDefault();
    // })

    this.map.on('click', (event) => {
      if (event.originalEvent.srcElement.localName !== 'canvas') return;

      const feature = this.map.forEachFeatureAtPixel(event.pixel, (f) => f);

      popupClickOnExtent.style.display = 'none';
      
      if (!feature) return;

      const featureID = feature.getId()?.toString() as string;

      if (featureID.startsWith('UserExtent')) {
        popupFitExtentButton.dataset.extentId = featureID;
        popupDeleteButton.dataset.extentId = featureID;
        popupColorPickerButton.dataset.extentId = featureID;

        popupClickOnExtent.style.left = `${event.pixel[0] - 45}px`;
        popupClickOnExtent.style.top = `${event.pixel[1] + 20}px`;
        popupClickOnExtent.style.display = 'block';
      } else {
        popupBindInfoButton.dataset.featureID = featureID;
        popupFixedInfoButton.dataset.featureID = featureID;

        popupClickOnFeature.style.left = `${event.pixel[0] + 45}px`;
        popupClickOnFeature.style.top = `${event.pixel[1] - 20}px`;
        popupClickOnFeature.style.display = `block`;
      }
        // this.featureInfoID = feature.getId() as number;
    });

    const popupOnHover = document.createElement('div');
    popupOnHover.setAttribute('id', `popupOnHover${this.divID.slice(3)}`);
    popupOnHover.classList.add('popup');
    mapViewport.appendChild(popupOnHover);

    this.map.on('pointermove', (event) => {
      const feature = this.map.forEachFeatureAtPixel(event.pixel, (f) => f);

      if (feature && feature.getId()?.toString().includes('distance')) {
        const id = feature.getId()?.toString().split('_') as string[];
        const [first, second] = [id[0], id[2]].map(i => this.FeaturesObject[Number(i)].featureParams);

        const coords1 = [first.latitude, first.longitude, first.altitude] as [number, number, number];
        const coords2 = [second.latitude, second.longitude, second.altitude] as [number, number, number];

        const distance = this.calculateDistance(coords1, coords2);

        popupOnHover.innerHTML = `${(distance / 1000).toFixed(3)} км`;

        popupOnHover.style.left = `${event.pixel[0] - 45}px`;
        popupOnHover.style.top = `${event.pixel[1] + 20}px`;
        popupOnHover.style.display = 'block';

      } else if (feature && feature.getId()?.toString().includes('extent')) {
        const mapID = feature.getId()?.toString().split('_')[0].slice(3);
        
        popupOnHover.innerHTML = `Вид карты ${mapID}`;

        popupOnHover.style.left = `${event.pixel[0] - 45}px`;
        popupOnHover.style.top = `${event.pixel[1] + 20}px`;
        popupOnHover.style.display = 'block';
      } else {
        popupOnHover.style.display = 'none';
      }
    });

    // const step = 1000000;
    // const extent = [-20026376.39, -20048966.10, 20026376.39, 20048966.10];

    // const graticuleSource = new VectorSource({});

    // const graticule = new VectorLayer({
    //   source: graticuleSource,
    //   style: new Style({
    //     stroke: new Stroke({
    //       color: 'black',
    //       width: 2,
    //     }),
    //   }),
    // });

    // const graticule = new Graticule({
    //   step
    // })

    // for (let x = extent[0]; x < extent[2]; x += step) {
    //   const feature = new Feature({});
    //   const geometry = new LineString([
    //     [x, extent[1]],
    //     [x, extent[3]],
    //   ]);
    //   feature.setGeometry(geometry);
    //   graticuleSource.addFeature(feature);
    // }

    // for (let y = extent[1]; y < extent[3]; y += step) {
    //   const feature = new Feature({});
    //   const geometry = new LineString([
    //     [extent[0], y],
    //     [extent[2], y],
    //   ]);
    //   feature.setGeometry(geometry);
    //   graticuleSource.addFeature(feature);
    // }

    // this.map.addLayer(graticule);
    // const graticule = new Graticule({
    //   strokeStyle: new Stroke({
    //     color: 'black',
    //     width: 4,
    //   }),
    //   intervals: [12, 12],
    // });
    // console.log(graticule.getSource()?.getFeatures());
    // this.map.addLayer(graticule);

    this.map.addLayer(this.MetricGridLayer);
    this.MetricGridLayer.setSource(this.MetricGridLayerSource);
    this.MetricGridLayer.setStyle(new Style({
      stroke: new Stroke({
        width: 1,
        color: '#00FF00',
      }),
      fill: new Fill({
        color: 'rgba(0, 255, 0, 0.6)'
      }),
    }));

    // const DUMMY_EXTENT = [-179, -86, 179, 86] as BBox;
    // const DUMMY_EXTENT = [-180, -84.83, -170, -75] as BBox;
    // const cellSide = 100;
    // const grid = squareGrid(DUMMY_EXTENT, cellSide, { units: 'kilometers' });
    // console.log(grid);

    // const gridFeatureCollection = squareGrid(DUMMY_EXTENT, cellSide, {});
    // console.log(gridFeatureCollection);
    // const gridFeatures: Feature[] = [];

    // gridFeatureCollection.features.forEach(f => {
    //   // @ts-ignore
    //   const coords = [f.geometry.coordinates[0].map(coord => fromLonLat([coord[0], coord[1]]) as Coordinate)];
    //   const geometry = new Polygon(coords);
    //   const feature = new Feature({});

    //   feature.setGeometry(geometry);
    //   feature.setStyle(new Style({
    //     stroke: new Stroke({
    //       width: 3,
    //       color: '#00FF00',
          
    //     }),
    //     fill: new Fill({
    //       color: 'rgba(255, 0, 0, 0.6)'
    //     }),
    //   }));
    //   gridFeatures.push(feature);
    // });

    // gridFeatures.forEach(f => this.MetricGridLayerSource.addFeature(f));

    // console.log(this.MetricGridLayerSource.getFeatures());
    // console.log(gridFeature);
    // this.GridLayerSource.addFeatures(gridFeatures);

    this.map.getView().on('propertychange', () => {
      // this.currentExtent = this.map.getView().calculateExtent(this.map.getSize());
      this.currentZoom = this.map.getView().getZoom() as number;
      const tempExtent = this.getCurrentExtent();
      this.currentExtent = tempExtent.map(point => [point[0] * 0.95, point[1] * 0.95] as Coordinate);

      // console.log(this.map.getView().calculateExtent(this.map.getSize()));
      // console.log(this.map.getView().calculateExtentInternal(this.map.getSize()));
      // console.log(this.map.getView().rotatedExtentForGeometry(this.map));
      // this.redrawUserExtents();

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
      if (Math.abs(event.target.values_.rotation * 57.2958) >= 360) {
        this.map.getView().setRotation(0);
      }
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

      let unitSplit = this.gridStep * 1000; // every 0.1 m
      let pxToUnit = this.map.getView().getResolution() as number;
      let pxSplit = unitSplit / pxToUnit;

      let [xmin, ymin, xmax, ymax] = event.frameState?.extent as Extent;
      // event.frameState?.nextExtent
      // this.currentExtent = event.frameState?.extent as Extent;

      // while (pxSplit * 2 < 100) {
      //   unitSplit *= 2;
      //   pxSplit = unitSplit / pxToUnit; // distance between two lines
      // }

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

  public setGridStep(step: number) {
    this.gridStep = step;
    this.map.getView().setZoom(this.currentZoom + 0.000000000000001);
    this.map.getView().setZoom(this.currentZoom);
  }

  public changeInteractions(mode: string) {
    this.map.removeInteraction(this.draw);
    this.map.removeInteraction(this.snap);

    this.addInteractions(mode);
  }

  public fitExtent(extent: Polygon) {
    this.map.getView().fit(extent);
  }

  private createPopupButton(parent: HTMLElement, text: string, dataset?: { [key: string]: string }) {
    const popupButton = document.createElement('button');
    popupButton.innerHTML = text;
    popupButton.classList.add('popup-btn');

    for (let field in dataset) {
      popupButton.dataset[field] = dataset[field];
    }

    parent.appendChild(popupButton);

    // popupButton.addEventListener('click', (event) => {
    //   parent.style.display = 'none';

    //   const extentId = popupButton.dataset.extentId;
    // });

    return popupButton;
  }

  private updateSelectionBox() {
    const selectionBox = document.getElementById(this.divID)?.querySelector('.selection-box') as HTMLDivElement;

    if (!this.currentUserExtentStart || !this.currentUserExtentEnd) {
      selectionBox.style.display = 'none';
      return;
    }

    selectionBox.style.display = 'block';

    // selectionBox.style.transform = `rotate(${this.currentRotation}rad)`;

    const topLeft = this.map.getPixelFromCoordinate(this.currentUserExtentStart);
    const bottomRight = this.map.getPixelFromCoordinate(this.currentUserExtentEnd);

    let left = Math.min(topLeft[0], bottomRight[0]);
    let top = Math.min(topLeft[1], bottomRight[1]);
    const width = Math.abs(topLeft[0] - bottomRight[0]);
    const height = Math.abs(topLeft[1] - bottomRight[1]);

    this.currentTopRightPixel = [topLeft[0] > bottomRight[0] ? topLeft[0] - width : topLeft[0] + width, topLeft[1]];
    this.currentBottomLeftPixel = [topLeft[0], topLeft[1] > bottomRight[1] ? topLeft[1] - height : topLeft[1] + height];

    const shifted = store.getState().Map.sidebarOpened;

    // const widgetsLayout = store.getState().widgetSettings.widgetsLayout;

    if (
      (this.divID.includes('2') && (this.widgetsLayout === '2v' || this.widgetsLayout === '4' || (this.widgetsLayout.includes('3') && this.widgetsLayout !== '3b'))) ||
      (this.divID.includes('3') && (this.widgetsLayout === '3b' || this.widgetsLayout === '3r')) || 
      (this.divID.includes('4') && this.widgetsLayout === '4')
    ) {
      if (!this.leftPosition) {
        this.leftPosition = (document.getElementById('map1') as HTMLDivElement).offsetWidth + 5;
      }
    }

    if (
      (this.divID.includes('2') && (this.widgetsLayout === '2h' || this.widgetsLayout === '3b')) ||
      (this.divID.includes('3') && (this.widgetsLayout.includes('3') || this.widgetsLayout === '4')) ||
      (this.divID.includes('4') && this.widgetsLayout === '4')
    ) {
      if (!this.topPosition) {
        this.topPosition = (document.getElementById('map1') as HTMLDivElement).offsetHeight + 5;
      }
    }

    left += this.leftPosition;
    top += this.topPosition;

    selectionBox.style.left = `${shifted ? left + 62 : left}px`;
    selectionBox.style.top = `${shifted ? top + 2 : top}px`;
    selectionBox.style.width = `${width}px`;
    selectionBox.style.height = `${height}px`;
  }

  private addUserExtent() {
    const viewProjection = this.map.getView().getProjection();

    if (!this.currentUserExtentStart || !this.currentUserExtentEnd) return;

    const topLeft = this.currentUserExtentStart;
    const bottomRight = this.currentUserExtentEnd;
    // const topLeft = toLonLat(this.currentUserExtentStart, viewProjection);
    // const bottomRight = toLonLat(this.currentUserExtentEnd, viewProjection);

    const left = Math.min(topLeft[0], bottomRight[0]);
    const right = Math.max(topLeft[0], bottomRight[0]);
    const bottom = Math.min(topLeft[1], bottomRight[1]);
    const top = Math.max(topLeft[1], bottomRight[1]);

    const extent = [
      this.map.getCoordinateFromPixel(this.currentBottomLeftPixel as Pixel),
      this.currentUserExtentStart,
      this.map.getCoordinateFromPixel(this.currentTopRightPixel as Pixel),
      this.currentUserExtentEnd,
    ];

    const geometry = new Polygon([extent]);

    const style = new Style({
      stroke: new Stroke({
        width: 2,
        color: 'rgb(78, 0, 255)',
      }),
      fill: new Fill({
        color: 'rgba(78, 0, 255, 0.4)'
      }),
    });

    const feature = new Feature({});

    const id = `UserExtent_${v4()}`;
    feature.setId(id);
    feature.setGeometry(geometry);
    feature.setStyle(style);

    this.userExtentStyles[id] = style;
    this.userExtentSettings[id] = {
      style,
      rotation: this.currentRotation,
    };

    this.UserExtentsLayerSource.addFeature(feature);

    this.leftPosition = 0;
    this.topPosition = 0;
    this.userExtents[id] = extent;
  }

  // private getUserExtentGeometry(id?: string, userExtent?: Coordinate[]) {
  //   // const extent = [
  //   //   Math.min(this.currentUserExtentStart[0], this.currentUserExtentEnd[0]),
  //   //   Math.min(this.currentUserExtentStart[1], this.currentUserExtentEnd[1]),
  //   //   Math.max(this.currentUserExtentStart[0], this.currentUserExtentEnd[0]),
  //   //   Math.max(this.currentUserExtentStart[1], this.currentUserExtentEnd[1]),
  //   // ] as Extent;

  //   const extent = userExtent ? userExtent : [
  //     // [Math.min(this.currentUserExtentStart[0], this.currentUserExtentEnd[0]), Math.min(this.currentUserExtentStart[1], this.currentUserExtentEnd[1])] as Coordinate,
  //     // [Math.min(this.currentUserExtentStart[0], this.currentUserExtentEnd[0]), Math.max(this.currentUserExtentStart[1], this.currentUserExtentEnd[1])] as Coordinate,
  //     // [Math.max(this.currentUserExtentStart[0], this.currentUserExtentEnd[0]), Math.max(this.currentUserExtentStart[1], this.currentUserExtentEnd[1])] as Coordinate,
  //     // [Math.max(this.currentUserExtentStart[0], this.currentUserExtentEnd[0]), Math.min(this.currentUserExtentStart[1], this.currentUserExtentEnd[1])] as Coordinate,
  //   ];

  //   // console.log(extent);

  //   const updatedExtent = [...extent];

  //   this.userExtents[id ? id : this.currentUserExtentID] = extent;

  //   const geometry = new Polygon([extent]);

  //   const rotation = id ? this.userExtentSettings[id].rotation : this.currentRotation;

  //   // console.log(rotation);
  //   if (rotation < 0 ) {
  //     // geometry.rotate(-rotation * 2, [
  //     //   (extent[2][0] - extent[0][0]) / 2 + extent[0][0],
  //     //   (extent[1][1] - extent[0][1]) / 2 + extent[0][1]
  //     // ]);

  //     // updatedExtent[0] = geometry.getCoordinates()[0][1];
  //     // updatedExtent[2] = geometry.getCoordinates()[0][3];


  //     // updatedExtent[0] = geometry.getCoordinates()[0][1];
  //     // updatedExtent[2] = geometry.getCoordinates()[0][3];
  //     // geometry.rotate(-rotation, this.currentUserExtentStart);
  //     // updatedExtent[2] = geometry.getCoordinates()[0][2];
  //     // const point2y = geometry.getCoordinates()[0][2][1];
  //     // console.log(geometry.getCoordinates()[0][2]);

  //     // geometry.rotate(-rotation / 2, this.currentUserExtentEnd);
  //     // updatedExtent[0] = geometry.getCoordinates()[0][1];
  //     // geometry.rotate(rotation / 2, this.currentUserExtentEnd);
  //     // geometry.rotate(rotation, this.currentUserExtentEnd);
  //     // const point2x = geometry.getCoordinates()[0][2][0];
  //     // console.log(geometry.getCoordinates()[0][2]);

  //     // geometry.rotate(-rotation, this.currentUserExtentEnd);
  //     let updatedCoords = geometry.getCoordinates();
  //     // updatedCoords[0][2][1] += 10000000;
  //     // console.log(updatedCoords[0]);
      
  //     // const point2 = [
  //     //   extent[3][0] + (updatedCoords[0][2][0] - extent[3][0]),
  //     //   extent[3][1] + (updatedCoords[0][0][1] - extent[3][1])
  //     // ] as Coordinate;

  //     // const point0 = [
  //     //   extent[3][0] - (point2[0] - extent[1][0]),
  //     //   // updatedCoords[0][0][0] + (updatedCoords[0][0][0] - extent[1][0]),
  //     //   extent[1][1] - (point2[1] - extent[3][1])
  //     // ] as Coordinate;

  //     updatedExtent[0] = updatedCoords[0][0];
  //     updatedExtent[1] = updatedCoords[0][1];
  //     updatedExtent[2] = updatedCoords[0][2];
  //     updatedExtent[3] = updatedCoords[0][3];

  //     // console.log([point2x, point2y]);
  //     // updatedExtent[0] = [this.currentUserExtentStart[0], this.currentUserExtentEnd[1]];
  //     // updatedExtent[2] = [point2x, point2y];
  //     // updatedExtent[1] = this.currentUserExtentStart;
  //     // updatedExtent[3] = this.currentUserExtentEnd;

  //   } 
  //   // else {
  //   //   geometry.rotate(rotation, [
  //   //     (extent[2][0] - extent[0][0]) / 2 + extent[0][0],
  //   //     (extent[1][1] - extent[0][1]) / 2 + extent[0][1]
  //   //   ]);

  //   //   let updatedCoords = geometry.getCoordinates();
  //   //   updatedExtent[1] = updatedCoords[0][1] as Coordinate;
  //   //   updatedExtent[3] = updatedCoords[0][3] as Coordinate;
  //   // }
    
  //   const updatedGeometry = new Polygon([updatedExtent]);
  //   // console.log(geometry.getCoordinates());
  //   // geometry.rotate(-this.currentRotation, [
  //   //   (extent[2][0] - extent[0][0]) / 2 + extent[0][0],
  //   //   (extent[1][1] - extent[0][1]) / 2 + extent[0][1]
  //   // ]);
  //   // const geometry = fromExtent(extent);
  //   // extent[4] = extent[0];
  //   // const turfPolygon = polygon([extent]);
  //   // console.log(extent, centerOfMass(turfPolygon).geometry.coordinates);
  //   // console.log(centerOfMass([extent.map(coord => [coord[0] as number, coord[1] as number])]));
  //   // geometry.rotate(this.currentRotation, centerOfMass(turfPolygon).geometry.coordinates);

  //   return updatedGeometry;
  // }

  // private updateUserExtentFeature(event: DragBoxEvent) {

  //   if (event.mapBrowserEvent.originalEvent.altKey || !event.mapBrowserEvent.originalEvent.shiftKey) {
  //     this.currentUserExtentID = '';
  //     return;
  //   }

  //   const feature = this.UserExtentsLayerSource.getFeatureById(this.currentUserExtentID);

  //   if (!feature) return;

  //   this.currentUserExtentEnd = event.coordinate;

  //   // this.userExtents[this.currentUserExtentID] = [
  //   //   [Math.min(this.currentUserExtentStart[0], this.currentUserExtentEnd[0]), Math.min(this.currentUserExtentStart[1], this.currentUserExtentEnd[1])],
  //   //   [Math.min(this.currentUserExtentStart[0], this.currentUserExtentEnd[0]), Math.max(this.currentUserExtentStart[1], this.currentUserExtentEnd[1])],
  //   //   [Math.max(this.currentUserExtentStart[0], this.currentUserExtentEnd[0]), Math.max(this.currentUserExtentStart[1], this.currentUserExtentEnd[1])],
  //   //   [Math.max(this.currentUserExtentStart[0], this.currentUserExtentEnd[0]), Math.min(this.currentUserExtentStart[1], this.currentUserExtentEnd[1])],
  //   // ];

  //   // const geometry = this.getUserExtentGeometry();

  //   // feature?.setGeometry(geometry);
    
  //   const view = this.map.getView();
  //   const extent = this.dragBox.getGeometry().getExtent();

  //   const center = getCenter(extent);

  //   let coord1 = [extent[0], extent[1]];
  //   let coord2 = [extent[0], extent[3]];
  //   let coord3 = [extent[2], extent[3]];
  //   let coord4 = [extent[2], extent[1]];

  //   coord1 = transform(coord1, view.getProjection(), 'EPSG:4326');
  //   coord2 = transform(coord2, view.getProjection(), 'EPSG:4326');
  //   coord3 = transform(coord3, view.getProjection(), 'EPSG:4326');
  //   coord4 = transform(coord4, view.getProjection(), 'EPSG:4326');

  //   coord1 = rotate(coord1, -this.currentRotation);
  //   coord2 = rotate(coord2, -this.currentRotation);
  //   coord3 = rotate(coord3, -this.currentRotation);
  //   coord4 = rotate(coord4, -this.currentRotation);

  //   coord1 = transform(coord1, 'EPSG:4326', view.getProjection()) as Coordinate;
  //   coord2 = transform(coord2, 'EPSG:4326', view.getProjection()) as Coordinate;
  //   coord3 = transform(coord3, 'EPSG:4326', view.getProjection()) as Coordinate;
  //   coord4 = transform(coord4, 'EPSG:4326', view.getProjection()) as Coordinate;

  //   const geometry = new Polygon([[coord2, this.currentUserExtentStart, coord4, this.currentUserExtentEnd]]);

  //   feature.setGeometry(geometry);

  //   if (event.type === 'boxend') {
  //     this.currentUserExtentID = ''; 
  //   }
  // }

  private hexToRgb(hex: string, alpha: number = 0.4) {
    const rgb = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex) as RegExpExecArray;

    console.log(hex);
    return `rgba(${parseInt(rgb[1], 16)}, ${parseInt(rgb[2], 16)}, ${parseInt(rgb[3], 16)}, ${alpha})`;
  }

  public changeUserExtentColor(featureId: string, color: string) {
    const feature = this.UserExtentsLayerSource.getFeatureById(featureId) as Feature;

    const rgbColor = this.hexToRgb(color);

    const style = new Style({
      stroke: new Stroke({
        width: 3,
        color,
      }),
      fill: new Fill({
        color: rgbColor,
      }),
    });

    this.userExtentStyles[featureId] = style;
    
    feature.setStyle(style);
  }

  // private redrawUserExtents() {
  //   this.UserExtentsLayerSource.clear();
  //   for (let [id, extent] of Object.entries(this.userExtents)) {

  //     if (this.extentContains(extent)) {
  //       const geometry = this.getUserExtentGeometry(id, extent);

  //       const feature = new Feature({});
  //       feature.setGeometry(geometry);
  //       feature.setId(id);
  //       feature.setStyle(this.userExtentSettings[id].style);

  //       this.UserExtentsLayerSource.addFeature(feature);
  //     } 
  //   }
  // }

  public getCurrentExtent() {
    const extent = getRotatedViewport(
      this.map.getView().getCenterInternal() as Coordinate,
      this.map.getView().getResolution() as number,
      this.map.getView().getRotation(),
      [this.map.getViewport().offsetWidth, this.map.getViewport().offsetHeight],
    );

    const extentByCoords: Coordinate[] = [
      [Math.min(extent[0], extent[2], extent[4], extent[6]), Math.min(extent[1], extent[3], extent[5], extent[7])] as Coordinate,
      [Math.min(extent[0], extent[2], extent[4], extent[6]), Math.max(extent[1], extent[3], extent[5], extent[7])] as Coordinate,
      [Math.max(extent[0], extent[2], extent[4], extent[6]), Math.max(extent[1], extent[3], extent[5], extent[7])] as Coordinate,
      [Math.max(extent[0], extent[2], extent[4], extent[6]), Math.min(extent[1], extent[3], extent[5], extent[7])] as Coordinate,
    ];
    
    

    // for (let i = 0; i < extent.length; i += 2) {
    //   extentByCoords.push([extent[i], extent[i + 1]] as Coordinate);
    // }

    return extentByCoords;
  }

  public getPinObjects() {
    return Object.keys(this.FeaturesObject).map(id => Number(id));
  }

  public cleanDrawSource() {
    this.DrawLayerSource.clear();
  }

  public getFeatureInfoID() {
    return this.featureFixedInfoID;
  }

  public setFeatureInfoID() {
    this.featureFixedInfoID = -1;
  }

  public addInfoModal(object: number) {
    this.featureBindedInfoIds.push(object);
  }

  public clearInfoModals() {
    this.featureBindedInfoIds = [];
  }

  public setRotation(rotation: number) {
    const radians = rotation * (Math.PI / 180);
    this.currentRotation = radians;
    this.map.getView().setRotation(radians);
    // console.log(this.map.getView().getRotation());
    // rotationValueElement.innerHTML = `${Math.abs(event.target.values_.rotation * 57.2958).toFixed(2)}&#176`;
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

  public setWidgetsLayout(layout: WidgetsLayout) {
    this.widgetsLayout = layout;
  };

  public getFeatureInfo() {
    if (this.featureFixedInfoID !== -1) {
      this.featureInfo = this.FeaturesObject[this.featureFixedInfoID].featureParams;
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
    if (!this.distances.some(d => d[0] === distance[0] && d[1] === distance[1])) {
      this.distances.push(distance);

      this.DistanceLayerSource.clear();
      for (let distance of this.distances) {
        if (
          (this.FeaturesObject[distance[0]] && this.FeaturesObject[distance[1]]) &&
          this.FeaturesObject[distance[0]].featureParams.parentID !== 'death' && 
          this.FeaturesObject[distance[1]].featureParams.parentID !== 'death'
        ) {
          this.drawDistance(distance);
        }
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

    const distanceLine = greatCircle(
      [
        this.FeaturesObject[distance[0]].featureParams.longitude,
        this.FeaturesObject[distance[0]].featureParams.latitude,
      ],
      [
        this.FeaturesObject[distance[1]].featureParams.longitude, 
        this.FeaturesObject[distance[1]].featureParams.latitude,
      ],
      {
        npoints: 10,
      }
    );

    // @ts-ignore
    // const  distanceLineGeoJSON = new GeoJSON().writeFeatureObject(distanceLine);

    const featureId = `${distance[0]}_distance_${distance[1]}`;

    const distanceFeature = new Feature({
      geometry: new LineString(distanceLine.geometry.coordinates.map((c) => fromLonLat(c as Coordinate))),
    });
    // const distanceFeature = new Feature({
    //   geometry: new GeoJSON().readGeometry(distanceLine.geometry),
    // });


    distanceFeature.setId(featureId);

    distanceFeature.setStyle(new Style({
      stroke: new Stroke({
        width: 2,
        color: this.distancesColors[featureId],
      }),
    }));

    const feature = this.DistanceLayerSource.getFeatureById(featureId);

    if (feature) {
      this.DistanceLayerSource.removeFeature(feature);
    }

    this.DistanceLayerSource.addFeature(distanceFeature);
    // this.DistanceLayerSource.addFeatures(new GeoJSON().readFeatures({
    //   'type': 'FeatureCollection',
    //   'crs': {
    //     'type': 'name',
    //     'properties': {
    //       'name': 'EPSG:3857',
    //     },
    //   },
    //   'features': [
    //     {
    //       'type': distanceLine.type,
    //       'geometry': {
    //         'type': distanceLine.geometry.type,
    //         'coordinates': distanceLine.geometry.coordinates,
    //       }
    //     }
    //   ],
    // }));
    // const coordinates = [];

    // const arcGenerator = new GreatCircle(
    //   {
    //     x: this.FeaturesObject[distance[0]].featureParams.longitude, 
    //     y: this.FeaturesObject[distance[0]].featureParams.latitude,
    //   },
    //   {
    //     x: this.FeaturesObject[distance[1]].featureParams.longitude, 
    //     y: this.FeaturesObject[distance[1]].featureParams.latitude,
    //   }
    // );

    // const line = arcGenerator.Arc(100, { offset: 10 });

    // for (let i = 0; i < line.geometries[0].coords.length - 1; i++) {
    //   coordinates.push([
    //     line.geometries[0].coords[i],
    //     line.geometries[0].coords[i + 1],
    //   ]);
    // }

    // for (let i = 0; i < coordinates.length; i++) {
    //   coordinates[i][0] = fromLonLat(coordinates[i][0]);
    //   coordinates[i][1] = fromLonLat(coordinates[i][1]);
    // }

    // const marker = new MultiLineString(coordinates);

    // const markerFeature = new Feature({
    //   name: 'DistanceFeature',
    //   geometry: marker,
    // });

    // markerFeature.setId(`${distance[0]}_distance_${distance[1]}`);

    // markerFeature.setStyle(new Style({
    //   stroke: new Stroke({
    //     width: 2,
    //     color: this.distancesColors[markerFeature.getId() as string],
    //   }),
    // }));

    // this.DistanceLayerSource.addFeature(markerFeature);
  }

  public drawRoutes(routes: IRoutes) {

    for (let key of Object.keys(routes)) {
      this.setRouteColor(Number(key), routes[Number(key)].color);
      const coordinates = routes[Number(key)].route.map(point => fromLonLat(point.slice().reverse()));

      if (!this.RoutesLayerSource.getFeatureById(key)) {
        const geometry = new LineString(coordinates);
        const feature = new Feature({});

        feature.setGeometry(geometry);
        feature.setId(key);
        feature.setStyle(new Style({
          stroke: new Stroke({
            width: 2,
            color: this.routesColors[Number(key)],
            // color: this.hexToRgb(this.routesColors[Number(key)], 1),
          }),
        }));

        console.log(feature.getStyle());
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
    // console.log(this.currentExtent);
    // console.log(extent);
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
          useInterimTilesOnError: true,
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
      this.InfoLayerSource.clear();
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

        if (features[key].parentID !== 'death' && this.featureBindedInfoIds.includes(Number(key))) {
          // console.log(key);
          const infoFeature = new Feature({});

          const infoFeatureGeometry = new Point(fromLonLat([features[key].longitude, features[key].latitude]));
          infoFeature.setGeometry(infoFeatureGeometry);

          infoFeature.setStyle(new Style({
            text: new Text({
              font:'lighter 16px Arial, sans-serif',
              fill: new Fill({ color: '#000' }),
              stroke: new Stroke({
                color: '#000',
                width: 1,
              }),
              backgroundFill: new Fill({ color: 'rgba(255, 255, 255, 0.8)' }),
              backgroundStroke: new Stroke({
                width: 1,
                color: '#000',
              }),
              text: `
Номер объекта: ${key}
Тип объекта: ${features[key].type}
Широта: ${features[key].latitude.toFixed(3)}
Долгота: ${features[key].longitude.toFixed(3)}
Высота: ${features[key].altitude.toFixed(3)}
Рыскание: ${features[key].yaw.toFixed(3)}
              `,
              textAlign: 'start',
              justify: 'left',
              padding: [0, 5, 0, 5],
              offsetX: 30,
              offsetY: -100,
            }),
          }));

          this.InfoLayerSource.addFeature(infoFeature);
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
        (this.FeaturesObject[distance[0]] && this.FeaturesObject[distance[1]]) &&
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

    const polygons = store.getState().modelSettings.polygonModels;
    // const polygons = await getPolygonIcons();

    // console.log(this.FeaturesObject);
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
        const err = error as Error;
        store.dispatch(pushError(err));
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