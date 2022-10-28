const BASE_URL = 'http://localhost:8080';

export const getMapConfig = async () => {

  const response = await fetch(`${BASE_URL}/MapConfig`, { mode: 'cors' });
  const mapConfig = await response.json();

  return mapConfig;
};

export const getMapData = async () => {

  const response = await fetch(`${BASE_URL}/MapData`, { mode: 'cors' });
  const mapData = await response.json();

  return mapData;
};

export const getMapSettings = async () => {

  const response = await fetch(`${BASE_URL}/MapSettings`, { mode: 'cors' });
  const mapSettings = response.json();

  return mapSettings;
};

export const getImageNames = async () => {

  const response = await fetch(`${BASE_URL}/ImageNames`, { mode: 'cors' });
  const imageNames = response.json();
  
  return imageNames;
};

export const getPolygonModels = async () => {

  const response = await fetch(`${BASE_URL}/PolygonModels`, { mode: 'cors' });
  const polygonModels = response.json();

  return polygonModels;
};

export const getMarkerSettings = async () => {

  const response = await fetch(`${BASE_URL}/MarkerSettings`, { mode: 'cors' });
  const markerSettings = await response.json();

  return markerSettings.data;
};