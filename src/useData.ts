import { useEffect } from 'react';

export const useData = () => {

  let mapConfig, imageNames, polygonModels, markerSettings;

  useEffect(() => {
    mapConfig = getMapConfig();
    imageNames = getImageNames();
    polygonModels = getPolygonModels();
    markerSettings = getMarkerSettings();
  }, []);
  
  return { mapConfig, imageNames, polygonModels, markerSettings };
};

const getMapConfig = async () => {
  let mapConfig;

  await fetch('/MapConfig', { mode: 'cors' })
    .then((response: Response) => response.json())
    .then((data) => {
      mapConfig = data;
    });

  return mapConfig;
};

const getImageNames = () => {
  let imageNames;

  fetch('/ImageNames', { mode: 'cors' })
    .then((response: Response) => response.json())
    .then((data) => {
      imageNames = data;
    });
  
  return imageNames;
};

const getPolygonModels = () => {
  let polygonModels;

  fetch('/PolygonModels', { mode: 'cors' })
    .then((response: Response) => response.json())
    .then((data) => {
      polygonModels = data;
    });

  return polygonModels;
};

const getMarkerSettings = () => {
  let markerSettings;

  fetch('/MarkerSettings', { mode: 'cors' })
    .then((response: Response) => response.json())
    .then((data) => {
      markerSettings = data;
    });

  return markerSettings;
};