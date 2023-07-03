import { MouseEvent, useCallback, useEffect, useState } from 'react';
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
// import * as flexbuffers from "flatbuffers/js/flexbuffers";

const App = (): JSX.Element => {

  // const [sidebarOpened, setSidebarOpened] = useState<boolean>(false);
  const dispatch = useDispatch();
  const sidebarOpened = useSelector((state: RootState) => state.Map.sidebarOpened);

  useData();
  
  const handleSidebar = useCallback((event: MouseEvent) => {
    dispatch(toggleSidebarOpened())
  }, []);

  // const values = new Uint8Array([2, 0, 0, 0, 0, 0, 0, 0, 15, 0, 0, 0, 0, 0, 0, 0, 69, 109, 191, 175, 30, 181, 87, 191, 11, 15, 18, 43, 1]).buffer
  // debugger;
  // const data = flexbuffers.toObject(values);

  return (
    <>
      <Panel handleSidebar={handleSidebar} />
      <MapsWrapper shift={sidebarOpened} />
      <Sidebar opened={sidebarOpened} handleSidebar={handleSidebar} />
    </>
  );
}

export default App;
