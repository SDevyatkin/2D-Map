import { IMarkerSettings } from './store/modelSettingsSlice';
import axios from 'axios';

export const BASE_URL = 'http://localhost:3002';

export const getMapURL = async () => {
  
  const response = await fetch(`${BASE_URL}/MapURL`);
  const mapURL = await response.json();

  return mapURL;
};

// export const getFeaturesData = async () => {

//   const response = await fetch(`${BASE_URL}/MapData`, { mode: 'cors' });
//   const mapData = await response.json();

//   return mapData;
// };

export const getMapViewSettings = async () => {

  const response = await fetch(`${BASE_URL}/MapViewSettings`, { mode: 'cors' });
  const mapSettings = response.json();

  return mapSettings;
};

export const getImageNames = async () => {

  const response = await fetch(`${BASE_URL}/ImagesNames`, { mode: 'cors' });
  const imageNames = await response.json();
  
  console.log(imageNames.data);

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
  console.log(JSON.stringify(settings));

  try {
    // fetch(`${BASE_URL}/SaveMarkerSettings`, {
    //   method: 'POST',
    //   mode: 'cors',
    //   headers: {
    //     'Content-Type': 'application/json; charset=UTF-8',
    //   },
    //   body: JSON.stringify(settings),
    // });
    await axios.post(
      `${BASE_URL}/MarkerSettings`,
      settings,
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

// export const getFeaturesDataWS = async () => {
//   const socket = new WebSocket('ws://localhost:3002');

//   return socket; 
// };