import { createContext, MouseEvent, useEffect, useState } from 'react';
import { Context } from 'vm';
import Map2D from './components/Map/Map';
import MapObject from './components/Map/MapObject';
import Panel from './components/Panel';
import Sidebar from './components/Sidebar';
import { useData } from './useData';

export const MapContext = createContext<MapObject>(new MapObject());

const App = (): JSX.Element => {

  let CanvasMap: MapObject | undefined = undefined

  const [Map, setMap] = useState<MapObject | undefined>();
  const [sidebarOpened, setSidebarOpened] = useState<boolean>(false);

  const { } = useData();

  useEffect(() => {
    if (CanvasMap == undefined) return;
    CanvasMap = new MapObject()    
    setMap(CanvasMap);
  }, [])
  
  const handleSidebar = (event: MouseEvent) => {
    setSidebarOpened(state => !state);
  };

  return (
    <>
      <div>
        <Panel handleSidebar={handleSidebar} />
        <Sidebar opened={sidebarOpened} handleSidebar={handleSidebar} />
      </div>
    </>
  );
}

export default App;
