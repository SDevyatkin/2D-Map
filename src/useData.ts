import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { BASE_URL, getImageNames, getMapURL, getMarkerSettings, getPolygonIcons, setBaseURL, testConnection } from './api';
import { changeImageNames, setMarkerSettings, changePolygonModels } from './store/modelSettingsSlice';

export const useData = () => {

  const dispatch = useDispatch();
  let mapConfig, imageNames, polygonModels, markerSettings;

  useEffect(() => {

    testConnection().then((res) => {
      if (res !== 200) {
        return
      }

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
    });
    // testConnection().then((status) => {
    //   if (status !== 200) {
    //     console.log('CHANGE URL');
    //     setBaseURL();
    //   } else {
    //     console.log('DONT CHANGE URL');
    //   }
    // });

  }, []);

  return { mapConfig, imageNames, polygonModels, markerSettings };
};