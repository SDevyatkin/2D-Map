import { IMarkerSettings } from './store/modelSettingsSlice';

const BASE_URL = 'http://localhost:8080';

export const getMapConfig = async () => {

  const response = await fetch(`${BASE_URL}/MapConfig`, { mode: 'cors' });
  const mapConfig = await response.json();

  return mapConfig;
};

export const getFeaturesData = async () => {

  const response = await fetch(`${BASE_URL}/MapData`, { mode: 'cors' });
  const mapData = await response.json();

  return mapData;

  // let data;

  // ws.onmessage = (event) => {
  //   data = event.data;
  // };


  // return data;
};

export const getMapSettings = async () => {

  const response = await fetch(`${BASE_URL}/MapSettings`, { mode: 'cors' });
  const mapSettings = response.json();

  return mapSettings;
};

export const getImageNames = async () => {

  const response = await fetch(`${BASE_URL}/ImageNames`, { mode: 'cors' });
  const imageNames = await response.json();
  
  return imageNames.data;
};

export const getPolygonModels = async () => {

  const response = await fetch(`${BASE_URL}/PolygonModels`, { mode: 'cors' });
  const polygonModels = response.json();

  return polygonModels;
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

export const saveNewPolygonModel = async (modelName: string, modelPoints: number[][]) => {
  const response = await fetch(`${BASE_URL}/client/SaveNewModel`, {
    method: 'POST',
    mode: 'cors',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ [modelName]: modelPoints }),
  });

  return response.status;
};

export const saveMarkerSettings = async (settings: IMarkerSettings) => {
  const response = await fetch(`${BASE_URL}/client/SaveMarkerSettings`, {
    method: 'POST',
    mode: 'cors',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(settings),
  });

  return response.status;
};