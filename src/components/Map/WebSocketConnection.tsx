import { FC, useCallback, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { testConnection } from '../../api';
import { setFeaturesData } from '../../store/featuresDataSlice';
import { changePinObjects } from '../../store/pinObjectsSlice';
import { RootState, store } from '../../store/store';
import { IRoutes } from '../../wsTypes';

const WebSocketConnection: FC = () => {

  const dispatch = useDispatch();
  const [ws, setWS] = useState<WebSocket>();
  const Maps = useSelector((state: RootState) => Object.values(state.Map.maps));

  useEffect(() => {
    testConnection().then((status) => {
      // console.log(status);
      if (status === 200) {
        setWS(new WebSocket('ws://localhost:3001'));
      } else {
        setWS(new WebSocket('ws://192.168.0.110:3001'))
      }
    });
    // try { 
    //   const response = testConnection();
    //   let socket = new WebSocket('ws://localhost:3001');

    //   console.log(socket.readyState);
    //   if (socket.readyState === 1) {
    //     setWS(socket);
    //   } else {
    //     setWS(new WebSocket('ws://192.168.0.110:3001'));
    //   }
      
    // } catch (err) {
    //   console.log(err); 
    // }
    
  }, []);

  useEffect(() => {
    if (!ws) return;

    const wsOnMessage = (event: MessageEvent<any>) => {
      const data = JSON.parse(event.data);
  
      const features = data.features;
      const idsByAltitude = data.idsByAltitude;
      const routes = data.routes;

      const cookie = document.cookie.split('=')[1];
      const routesByMap = data.routesByMap[cookie] ? data.routesByMap[cookie] : {};
      const distancesByMap = data.distancesByMap[cookie] ? data.distancesByMap[cookie] : {};
  
      dispatch(changePinObjects(Object.keys(features).map(id => Number(id)).filter(id => features[id].parentID !== 'death')));
      dispatch(setFeaturesData(features));

      for (let Map of Maps) {
        Map.updateFeaturesData(features, idsByAltitude);

        const mapID = Map.getDivID();
        const filteredRoutes: IRoutes = {};
        // console.log(routesByMap);
        if (routesByMap.hasOwnProperty(mapID)) {
          // console.log(routesByMap[mapID]);
          routesByMap[mapID].map((route: any) => {
            filteredRoutes[route.object] = {
              route: routes[route.object],
              color: route.color,
            };
          });
        }
        // console.log(filteredRoutes);
        Map.drawRoutes(filteredRoutes);

        if (distancesByMap.hasOwnProperty(mapID)) {
          distancesByMap[mapID].map((dist: any) => {
            const [first, second] = dist.distance.split('_distance_').map((obj: any) => Number(obj));
            Map.setDistanceColor(first, second, dist.color);
            Map.pushDistance([first, second]);
          });
        }
      }
    };

    ws.addEventListener('message', wsOnMessage);

    const wsOnClose = (event: CloseEvent) => {
      // const state = store.getState();

      // saveSessionSettings(state.sidebar);
      // ws.send(JSON.stringify({
      //   widgetsLayout: store.getState().widgetSettings.widgetsLayout,
      //   ...store.getState().sidebar,
      // }));
    };

    ws.addEventListener('close', wsOnClose);

    return () => {
      ws.removeEventListener('message', wsOnMessage);
      ws.removeEventListener('close', wsOnClose);
    };
  }, [Maps]);

  return (
    <></>
  );
};

export default WebSocketConnection;