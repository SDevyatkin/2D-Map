import { IMarkerSettings } from './store/modelSettingsSlice';
import axios from 'axios';
import { setTimeout } from 'timers/promises';

const PORT = 3002;
export let BASE_URL = `http://localhost:${PORT}`;

export const setBaseURL = () => {
  BASE_URL = `http://192.168.0.110:${PORT}`;
  console.log(BASE_URL);
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

export const testConnection = async () => {

  try {
    const response = await fetch(`${BASE_URL}/`);
    // console.log(response);
    return response.status;
  } catch (err) {
    console.log(err);
  }
};

export const getMapURL = async () => {
  
  try {
    const response = await fetch(`${BASE_URL}/MapURL`);
    const mapURL = await response.json();

    // console.log(mapURL);
    return mapURL;
  } catch (err) {
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
    const mapSettings = response.json();

    return mapSettings;
  } catch (err) {
    
    console.log(err);
  }
};

export const getImageNames = async () => {

  try {
    const response = await fetch(`${BASE_URL}/ImagesNames`, { mode: 'cors' });
    const imageNames = await response.json();

    return imageNames.data;
  } catch (err) {
    
    console.log(err);
  }
};

export const getPolygonIcons = async () => {

  try {
    const response = await fetch(`${BASE_URL}/PolygonIcons`, { mode: 'cors' });
    const polygonIcons = response.json();

    return polygonIcons;
  } catch (err) {
    
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
        };
      });

      return editedMarkerSettings;
  } catch (err) {
    console.log(err);

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
    const response = await fetch(`${BASE_URL}/Distance${first}/${second}`, { mode: 'cors' });
    const distance = await response.json();

    return distance;
  } catch (err) {
    
    console.log(err);
  }
};

export const getRoute = async (object: number) => {

  try {
    const response = await fetch(`${BASE_URL}/Route/${object}`, { mode: 'cors' });
    const route = await response.json();

    return route;
  } catch (err) {
    
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

    console.log(err);
  }
};

export const saveDistance = async (mapID: string, first: number, second: number, color: string) => {

  try {
    await fetch(`${BASE_URL}/Distance`, {
      method: 'POST',
      mode: 'cors',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ mapID, first, second, color }),
    });
  } catch (error) {
    console.log(error);
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
    });
  } catch (error) {
    console.log(error);
  }
};

export const pushRouteID = async (id: number, color: string, mapID: string) => {
  console.log(color);
  try {
    await fetch(`${BASE_URL}/Route`, {
      method: 'POST',
      mode: 'cors',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ id, color, mapID }),
    });
  } catch (error) {
    console.log(error);
  }
};

export const saveNewPolygonIcon = async (modelName: string, modelPoints: number[][]) => {
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
  } catch (error) {
    console.log(error);
  }

  
};