import { FC, useCallback, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setFeaturesData } from '../../store/featuresDataSlice';
import { changePinObjects } from '../../store/pinObjectsSlice';
import { RootState } from '../../store/store';
import { IRoutes } from '../../wsTypes';

const WebSocketConnection: FC = () => {

  const dispatch = useDispatch();
  const [ws, setWS] = useState<WebSocket>();
  const Maps = useSelector((state: RootState) => Object.values(state.Map.maps));

  useEffect(() => setWS(new WebSocket('ws://localhost:3001')), []);

  useEffect(() => {
    if (!ws) return;

    const wsOnMessage = (event: MessageEvent<any>) => {
      const data = JSON.parse(event.data);
  
      const features = data.features;
      const idsByAltitude = data.idsByAltitude;
      const routes = data.routes;
      const routesByMap = data.routesByMap;
  
      dispatch(changePinObjects(Object.keys(features).map(id => Number(id)).filter(id => features[id].parentID !== 'death')));
      dispatch(setFeaturesData(features));

      for (let Map of Maps) {
        Map.updateFeaturesData(features, idsByAltitude);

        const mapID = Map.getDivID();
        const filteredRoutes: IRoutes = {};
        if (routesByMap.hasOwnProperty(mapID)) {
          routesByMap[mapID].map((id: any) => {
            filteredRoutes[id] = routes[id];
          });
        }
        Map.drawRoutes(filteredRoutes);
      }
    };

    ws.addEventListener('message', wsOnMessage);

    return () => {
      ws.removeEventListener('message', wsOnMessage);
    };
  }, [Maps]);

  return (
    <></>
  );
};

export default WebSocketConnection;