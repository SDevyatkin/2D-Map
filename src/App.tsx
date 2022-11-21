import { createContext, MouseEvent, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Map2D from './components/Map/Map';
import MapCanvas from './components/Map/MapCanvas';
import MapObject from './components/Map/MapObject';
import Panel from './components/Panel';
import Sidebar from './components/Sidebar';
import { setMap } from './store/mapSlice';
import { changePinObjects } from './store/pinObjectsSlice';
import { RootState } from './store/store';
import { useData } from './useData';

const App = (): JSX.Element => {

  const dispatch = useDispatch();
  const { Map } = useSelector((state: RootState) => ({ Map: state.mapSlice.map }));

  const [sidebarOpened, setSidebarOpened] = useState<boolean>(false);

  const {  } = useData();

  useEffect(() => {
    dispatch(changePinObjects(Map.getPinObjects().map(item => Number(item))));
  }, []);
  
  const handleSidebar = (event: MouseEvent) => {
    setSidebarOpened(state => !state);
  };

  return (
    <div>
      <Panel handleSidebar={handleSidebar} />
      <Sidebar opened={sidebarOpened} handleSidebar={handleSidebar} />
    </div>
  );
}

export default App;
