import { MouseEvent, useEffect, useState } from 'react';
import Map2D from './components/Map/Map';
import MapObject from './components/Map/MapObject';
import Panel from './components/Panel';
import Sidebar from './components/Sidebar';
import { useData } from './useData';

const App = (): JSX.Element => {

  const [sidebarOpened, setSidebarOpened] = useState<boolean>(false);

  // const { mapConfig, imageNames, polygonModels, markerSettings } = useData();

  let Map: MapObject | undefined;

  useEffect(() => {
    Map = new MapObject();
  }, []);

  const handleSidebar = (event: MouseEvent) => {
    setSidebarOpened(state => !state);
  };

  return (
    <div>
      <Panel handleSidebar={handleSidebar} />
      <Sidebar opened={sidebarOpened} handleSidebar={handleSidebar} />
      <div 
        id='map' 
        style={{ 
          width: '100vw', 
          height: '95vh',
          bottom: 0,
        }}
      >
      </div>
      
      {/* <Map2D map={Map} /> */}
      {/* {
        (!!Map) ? <Map2D map={Map}></Map2D> : null
      } */}
    </div>
  );
}

export default App;
