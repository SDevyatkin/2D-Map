import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { getImageNames, getMapConfig, getMarkerSettings, getPolygonModels } from './api';
import { changeImageNames, setMarkerSettings, changePolygonModels } from './store/modelSettingsSlice';

export const useData = () => {

  const dispatch = useDispatch();
  let mapConfig, imageNames, polygonModels, markerSettings;

  useEffect(() => {
    mapConfig = getMapConfig();
    imageNames = getImageNames()
      .then((data) => {
        dispatch(changeImageNames(data));
      });
    polygonModels = getPolygonModels()
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