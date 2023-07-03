import { IMarkerSettings } from './store/modelSettingsSlice';
import axios from 'axios';
import { InfoModalPlacement, setFeatureInfoID, setSidebarSettings, SidebarState } from './store/sidebarSlice';
import { store } from './store/store';
import { setLayout } from './store/widgetSettingsSlice';
import { sessionSettingsType } from './components/Map/Map.interface';
import { v4 } from 'uuid';
import getCookie from './getCookie';
import { pushError } from './store/errorLogSlice';

const PORT = 7002;
export let BASE_URL = `http://localhost:${PORT}`;
export let USER_ID = '';
// console.log(`http://${process.env.REACT_APP_API_IP}:${PORT}`);

export const setBaseURL = () => {
  BASE_URL = `http://${process.env.REACT_APP_API_IP}:${PORT}`;
};

// const typeErrorCatcher = (error: any) => {
//   if (error instanceof TypeError) {
//     if (BASE_URL.includes('localhost')) {
//       BASE_URL = `http://192.168.0.110:${PORT}`;
//       return true;
//     }
//   }

//   return false;
// };

// function setCookie(name: string, value: string, options: any = {}) {

//   options = {
//     path: '/',
//     // при необходимости добавьте другие значения по умолчанию
//     ...options
//   };

//   if (options.expires instanceof Date) {
//     options.expires = options.expires.toUTCString();
//   }

//   let updatedCookie = encodeURIComponent(name) + "=" + encodeURIComponent(value);

//   for (let optionKey in options) {
//     updatedCookie += "; " + optionKey;
//     let optionValue = options[optionKey];
//     if (optionValue !== true) {
//       updatedCookie += "=" + optionValue;
//     }
//   }

//   document.cookie = updatedCookie;
// }

export const testConnection = async () => {
  try {
    const hasCookie = document.cookie.includes('user=');

    if (!hasCookie) {
      document.cookie = `user=${v4()}; max-age=${3600 * 24 * 365}`;
    }

    USER_ID = document.cookie.split('=')[1];

    const response = await fetch(`${BASE_URL}/`, { mode: 'cors' });
    // console.log(response);
    return response.status;
  } catch (err) {
    setBaseURL();

    const error = err as Error;
    store.dispatch(pushError(error));
  }
};

export const getMapURL = async () => {
  
  try {
    const response = await fetch(`${BASE_URL}/MapURL`);
    const mapURL = await response.json();

    // console.log(mapURL);
    return mapURL;
  } catch (err) {
    const error = err as Error;
    store.dispatch(pushError(error));
    console.log(err);
    // console.log(BASE_URL);
    // try {
    //   const response = await fetch(`${REMOTE_BASE_URL}/MapURL`);
    //   const mapURL = await response.json();

    //   console.log('hi', mapURL);
    //   return mapURL;
    // } catch {
    //   console.log(err);
    // }
  }
};


export const getMapViewSettings = async () => {

  try {
    const response = await fetch(`${BASE_URL}/MapViewSettings`, { mode: 'cors' });
    const mapSettings = await response.json();
    console.log(mapSettings);

    return mapSettings;
  } catch (err) {
    const error = err as Error;
    store.dispatch(pushError(error));
    console.log(err);
  }
};

export const getImageNames = async () => {

  try {
    const response = await fetch(`${BASE_URL}/ImagesNames`, { mode: 'cors' });
    const imageNames = await response.json();

    return imageNames.data;
  } catch (err) {
    const error = err as Error;
    store.dispatch(pushError(error));
    console.log(err);
  }
};

export const getPolygonIcons = async () => {

  try {
    const response = await fetch(`${BASE_URL}/PolygonIcons`, { mode: 'cors' });
    const polygonIcons = await response.json();

    return polygonIcons;
  } catch (err) {
    const error = err as Error;
    store.dispatch(pushError(error));
    console.log(err);
  }

};

export const getMarkerSettings = async () => {
  const editedMarkerSettings: IMarkerSettings = {};

  try {
    const response = await fetch(`${BASE_URL}/MarkerSettings`, { mode: 'cors' });
    const markerSettings = await response.json();

    Object.keys(markerSettings)
      .map(key => {
        editedMarkerSettings[Number(key)] = {
          image: markerSettings[key].image,
          size: Number(markerSettings[key].size),
          alpha: Number(markerSettings[key].alpha),
          polygonModel: markerSettings[key].polygonModel,
          modelStroke: markerSettings[key].modelStroke,
          modelColor: markerSettings[key].modelColor,
        };
      });

      return editedMarkerSettings;
  } catch (err) {
    console.log(err);
    const error = err as Error;
    store.dispatch(pushError(error));
      // try {
      //   const response = await fetch(`http://192.168.0.110:3002/MarkerSettings`, { mode: 'cors' });
      //   const markerSettings = await response.json();

      //   Object.keys(markerSettings)
      //     .map(key => {
      //       editedMarkerSettings[Number(key)] = {
      //         image: markerSettings[key].image,
      //         size: Number(markerSettings[key].size),
      //         alpha: Number(markerSettings[key].alpha),
      //         polygonModel: markerSettings[key].polygonModel,
      //       };
      //     });
        
      //   console.log('success');
      // } catch (err) {
      //   console.log(err)
      // }
    }
    return editedMarkerSettings;
  }

export const getDistance = async (first: number, second: number) => {

  try {
    const response = await fetch(`${BASE_URL}/Distance/${first}/${second}`, { mode: 'cors' });
    const distance = await response.json();

    return distance;
  } catch (err) {
    const error = err as Error;
    store.dispatch(pushError(error));
    console.log(err);
  }
};

export const getRoute = async (object: number) => {

  try {
    const url = `${BASE_URL}/Route/${object}`;
    const response = await fetch(url, { mode: 'cors' });
    // const response = await axios.get(
    //   url,
    //   {
    //     headers: {
    //       'Content-Type': 'application/json',
    //       'Access-Control-Allow-Origin': '*',
    //     },
    //   },
    // );

    const route = await response.json();
    return route;
  } catch (err) {
    const error = err as Error;
    store.dispatch(pushError(error));
    console.log(err);
  }
};

export const getRoutes = async (ids: number[]) => {
  try {
    const response = await fetch(`${BASE_URL}/Routes`, {
      headers: {
        ids: JSON.stringify(ids),
      },
      mode: 'cors'
    });
    const routes = await response.json();
    
    return routes;
  } catch (err) {
    const error = err as Error;
    store.dispatch(pushError(error));
    console.log(err);
  }
};

export const getSessionSettings = async () => {
  try {
    const response = await fetch(`${BASE_URL}/SessionSettings/${USER_ID}`, { mode: 'cors' });

    const sessionSettings: sessionSettingsType = await response.json();

    if (!Object.keys(sessionSettings).length) return;

    if (sessionSettings.widgetsLayout) store.dispatch(setLayout(sessionSettings.widgetsLayout));

    const sidebarSettings= sessionSettings.sidebarSettings;
    // for (let mapID in sessionSettings.sidebarSettings) {
    //   // sidebarSettings[Number(mapID.slice(3))] = sessionSettings.sidebarSettings[mapID];
    // }
    store.dispatch(setSidebarSettings(sidebarSettings));

    for (let id in sidebarSettings) {
      const mapID = `map${id}`;
      const Map = store.getState().Map.maps[mapID];

      const viewLocked = sidebarSettings[id].viewSettings.locked;
      Map.setViewLocked(viewLocked);
      Map.setWidgetsLayout(sessionSettings.widgetsLayout);

      const centeredObject = sidebarSettings[id].viewSettings.object;
      const centeredObjectValue = centeredObject !== 'None' ? Number(sidebarSettings[id].viewSettings.object) : centeredObject
      viewLocked ? 
        Map.setCenteredObject(centeredObjectValue) :
        Map.translateView(centeredObjectValue);

      Map.setZoomLevel(Number(sidebarSettings[id].viewSettings.zoom));
      Map.setRotation(Number(sidebarSettings[id].viewSettings.rotation));
      Map.setGridStep(Number(sidebarSettings[id].viewSettings.gridStep));

      const mapSettings = sessionSettings[id];

      // mapSettings.routes && mapSettings.routes.forEach(async (route) => {
      //   const routes = await getRoute(route.object);

      //   if (Object.keys(routes).length) {
      //     Map.setRouteColor(route.object, route.color);

      //     Map.drawRoutes({
      //       [route.object]: {
      //         route: routes[route.object],
      //         color: route.color,
      //       },
      //     });
      //   }
      // });

      mapSettings.distances && mapSettings.distances.forEach((distance) => {
        const [id1, _, id2] = distance.distance.split('_');
        const object1 = Number(id1);
        const object2 = Number(id2);

        Map.setDistanceColor(object1, object2, distance.color);
        Map.pushDistance(object1 > object2 ? [object1, object2] : [object2, object1]);
        // console.log(distance);
      });

      if (mapSettings.infoModals) {
        store.dispatch(setFeatureInfoID({
          map: Number(id),
          id: mapSettings.infoModals.fixed,
        }));

        mapSettings.infoModals.binded.forEach(id => Map.addInfoModal(id));
      }
    }
    
  } catch (err) {
    const error = err as Error;
    store.dispatch(pushError(error));
    console.log(err);
  }
};

export const saveDistance = async (mapID: string, first: number, second: number, color: string) => {

  try {
    const response = await fetch(`${BASE_URL}/Distance`, {
      method: 'POST',
      mode: 'cors',
      cache: 'no-cache',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ mapID, first, second, color, userId: USER_ID }),
    });

    console.log(response);
  } catch (err) {
    const error = err as Error;
    store.dispatch(pushError(error));
    console.log(err);
  }
};

export const clearDistances = async (mapID: string) => {
  try {
    // console.log(mapID, USER_ID);
    const response = await fetch(`${BASE_URL}/clearDistance/${mapID}`, {
      method: 'POST',
      mode: 'cors',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ userId: USER_ID }),
    });
  } catch (err) {
    const error = err as Error;
    store.dispatch(pushError(error));
    console.log(err);
  }
};

export const stopSendRoutes = async (mapID: number) => {

  try {
    await fetch(`${BASE_URL}/clearRoutes/${mapID}`, {
      method: 'POST',
      mode: 'cors',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ userId: USER_ID }),
    });
  } catch (err) {
    const error = err as Error;
    store.dispatch(pushError(error));
    console.log(err);
  }
};

export const pushRouteID = async (object: number, color: string, mapID: string) => {
  try {
    const response = await fetch(`${BASE_URL}/RouteID`, {
      method: 'POST',
      mode: 'cors',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ object, color, mapID, userId: USER_ID }),
    });

    console.log(response);
  } catch (err) {
    const error = err as Error;
    store.dispatch(pushError(error));
    console.log(err);
  }
};

export const saveInfoModal = async (mapID: string, object: number, placement: InfoModalPlacement) => {
  try {
    await fetch(`${BASE_URL}/InfoModal`, {
      method: 'POST',
      mode: 'cors',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ mapID, object, placement, userId: USER_ID }),
    });
  } catch (err) {
    const error = err as Error;
    store.dispatch(pushError(error));
    console.log(err);
  }
};

export const deleteInfoModals = async (mapID: string) => {
  try {
    await fetch(`${BASE_URL}/ClearInfoModals`, {
      method: 'POST',
      mode: 'cors',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ mapID, userId: USER_ID }),
    });
  } catch (err) {
    const error = err as Error;
    store.dispatch(pushError(error));
    console.log(err);
  }
};

export const saveNewPolygonIcon = async (modelName: string, modelPoints: number[][]) => {
  try {
    const response = await fetch(`${BASE_URL}/PolygonIcons`, {
      method: 'POST',
      mode: 'cors',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        name: modelName,
        points: modelPoints 
      }),
    });

    return response.status;
  } catch (err) {
    const error = err as Error;
    store.dispatch(pushError(error));
    console.log(err);
  }
};

// export const saveSessionSettings = async (widgetsLayout: string, sidebarSettings: SidebarState) => {
export const saveSessionSidebarSettings = async (sidebarSettings: SidebarState) => {
  // const widgetsLayout = store.getState().widgetSettings.widgetsLayout;
  // const sidebarSettings = store.getState().sidebar;

  try {

    // for (let key of Object.keys(sidebarSettings)) {
    //   console.log(sidebarSettings[Number(key)]);
    // } 

    const response = await fetch(`${BASE_URL}/SidebarSettings/${USER_ID}`, {
      method: 'POST',
      mode: 'cors',
      cache: 'no-cache',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ...sidebarSettings,
      }),
    });

    console.log(response);
  } catch (err) {
    const error = err as Error;
    store.dispatch(pushError(error));
    console.log(err);
  }
};

export const saveWidgetsLayout = async (widgetsLayout: string) => {
  // const widgetsLayout = store.getState().widgetSettings.widgetsLayout;
  // const sidebarSettings = store.getState().sidebar;

  try {
    const response = await fetch(`${BASE_URL}/WidgetsLayout/${USER_ID}`, {
      method: 'POST',
      mode: 'cors',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        widgetsLayout,
      }),
    });
  } catch (err) {
    const error = err as Error;
    store.dispatch(pushError(error));
    console.log(err);
  }
};

export const saveMarkerSettings = async (settings: IMarkerSettings) => {
  try {
    await axios.post(
      `${BASE_URL}/MarkerSettings`,
      JSON.stringify(settings),
      {
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*' 
        },
      }
    );
  } catch (err) {
    const error = err as Error;
    store.dispatch(pushError(error));
    console.log(err);
  }

  
};