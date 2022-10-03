import { useEffect } from 'react';
import Map2D from './components/Map/Map';
import MapObject from './MapObject';

const App = (): JSX.Element => {
  let Map: MapObject | undefined;

  useEffect(() => {
    Map = new MapObject();
  }, []);

  return (
    <div>
      {
        (!!Map) ? <Map2D map={Map}></Map2D> : null
      }
    </div>
  );
}

export default App;
