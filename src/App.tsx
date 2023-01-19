import { MouseEvent, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import MapsWrapper from './components/Map/MapsWrapper';
import Panel from './components/Panel';
import Sidebar from './components/Sidebar';
import FeatureInfoModal from './FeatureInfoModal';
import { setFeaturesData } from './store/featuresDataSlice';
import { toggleSidebarOpened } from './store/mapSlice';
import { changePinObjects } from './store/pinObjectsSlice';
import { RootState } from './store/store';
import { useData } from './useData';

const App = (): JSX.Element => {

  // const [sidebarOpened, setSidebarOpened] = useState<boolean>(false);
  const dispatch = useDispatch();
  const sidebarOpened = useSelector((state: RootState) => state.Map.sidebarOpened);

  useData();
  
  const handleSidebar = (event: MouseEvent) => {
    dispatch(toggleSidebarOpened())
  };

  return (
    <>
      <Panel handleSidebar={handleSidebar} />
      <MapsWrapper shift={sidebarOpened} />
      <Sidebar opened={sidebarOpened} handleSidebar={handleSidebar} />
    </>
  );
}

export default App;
