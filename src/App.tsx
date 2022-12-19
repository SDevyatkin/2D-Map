import { MouseEvent, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import MapsWrapper from './components/Map/MapsWrapper';
import Panel from './components/Panel';
import Sidebar from './components/Sidebar';
import FeatureInfoModal from './FeatureInfoModal';
import { setFeaturesData } from './store/featuresDataSlice';
import { changePinObjects } from './store/pinObjectsSlice';
import { RootState } from './store/store';
import { useData } from './useData';

const App = (): JSX.Element => {

  const [sidebarOpened, setSidebarOpened] = useState<boolean>(false);

  useData();
  
  const handleSidebar = (event: MouseEvent) => {
    setSidebarOpened(state => !state);
  };

  return (
    <>
      <Panel handleSidebar={handleSidebar} />
      <MapsWrapper />
      <Sidebar opened={sidebarOpened} handleSidebar={handleSidebar} />
    </>
  );
}

export default App;
