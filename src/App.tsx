import { MouseEvent, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Panel from './components/Panel';
import Sidebar from './components/Sidebar';
import FeatureInfoModal from './FeatureInfoModal';
import MapsWrapper from './MapWrapper';
import { setFeaturesData } from './store/featuresDataSlice';
import { changePinObjects } from './store/pinObjectsSlice';
import { RootState } from './store/store';
import { useData } from './useData';

const App = (): JSX.Element => {
  const dispatch = useDispatch();
  const { Map } = useSelector((state: RootState) => ({ Map: state.Map.map }));

  const [sidebarOpened, setSidebarOpened] = useState<boolean>(false);

  useData();

  useEffect(() => {
    const ws = new WebSocket('ws://localhost:3001');

    ws.addEventListener('message', (event) => {
      const data = JSON.parse(event.data);
      const features = data.features;
      const idsByAltitude = data.idsByAltitude;
      const routes = data.routes;

      dispatch(changePinObjects(Object.keys(features).map(id => Number(id)).filter(id => features[id].parentID !== 'death')));
      Map.updateFeaturesData(features, idsByAltitude);
      dispatch(setFeaturesData(features));

      Map.drawRoutes(routes);
    });
  }, []);
  
  const handleSidebar = (event: MouseEvent) => {
    setSidebarOpened(state => !state);
  };

  return (
    <div>
      <Panel handleSidebar={handleSidebar} />
      
      <Sidebar opened={sidebarOpened} handleSidebar={handleSidebar} />
      <FeatureInfoModal />
    </div>
  );
}

export default App;
