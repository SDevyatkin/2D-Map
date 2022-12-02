import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { BASE_URL, getImageNames, getMapURL, getMarkerSettings, getPolygonIcons } from './api';
import { changeImageNames, setMarkerSettings, changePolygonModels } from './store/modelSettingsSlice';

export const useData = () => {

  const dispatch = useDispatch();
  let mapConfig, imageNames, polygonModels, markerSettings, socket;

  useEffect(() => {
    mapConfig = getMapURL();
    imageNames = getImageNames()
    // imageNames = fetch(`${BASE_URL}/ImagesNames`)
      // .then((response) => response.json())
      .then((data) => {
        dispatch(changeImageNames(data));
      });
    polygonModels = getPolygonIcons()
      .then((data) => {
        dispatch(changePolygonModels(data));
      });
    markerSettings = getMarkerSettings()
      .then((data) => {
        dispatch(setMarkerSettings(data));
      });
  }, []);

  return { mapConfig, imageNames, polygonModels, markerSettings };
};