import { IMarkerSettings } from './store/modelSettingsSlice';
import axios from 'axios';

export const BASE_URL = 'http://localhost:3002';

export const getMapURL = async () => {
  
  const response = await fetch(`${BASE_URL}/MapURL`);
  const mapURL = await response.json();

  return mapURL;
};


export const getMapViewSettings = async () => {

  const response = await fetch(`${BASE_URL}/MapViewSettings`, { mode: 'cors' });
  const mapSettings = response.json();

  return mapSettings;
};

export const getImageNames = async () => {

  const response = await fetch(`${BASE_URL}/ImagesNames`, { mode: 'cors' });
  const imageNames = await response.json();

  return imageNames.data;
};

export const getPolygonIcons = async () => {

  const response = await fetch(`${BASE_URL}/PolygonIcons`, { mode: 'cors' });
  const polygonIcons = response.json();

  return polygonIcons;
};

export const getMarkerSettings = async () => {
  const editedMarkerSettings: IMarkerSettings = {};

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
};

export const getDistance = async (first: number, second: number) => {

  const response = await fetch(`${BASE_URL}/Distance${first}/${second}`, { mode: 'cors' });
  const distance = await response.json();

  return distance;
};

export const getRoute = async (object: number) => {

  const response = await fetch(`${BASE_URL}/Route/${object}`, { mode: 'cors' });
  const route = await response.json();

  return route;
};

export const getRoutes = async (ids: number[]) => {
  const response = await fetch(`${BASE_URL}/Routes`, {
    headers: {
      ids: JSON.stringify(ids),
    },
    mode: 'cors'
  });
  const routes = await response.json();
  
  return routes;
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

export const pushRouteID = async (id: number, mapID: string) => {
  try {
    await fetch(`${BASE_URL}/Route/${id}/${mapID}`, {
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