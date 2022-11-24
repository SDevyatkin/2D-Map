import { fromLonLat } from 'ol/proj';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RLayerVector, RMap, ROSM } from 'rlayers';
import { RView } from 'rlayers/RMap';
import { RootState } from '../../store/store';
// import MapObject from './MapObject';

// interface Map2DProps {
//   map: MapObject;
// }

const Map2D = () => {

  const pinObjects = useSelector((state: RootState) => state.pinObjects); 

  const [view, setView] = useState<RView>({
    center: fromLonLat([0, 0]),
    zoom: 5,
  });

  return (
    <RMap
      className='widget'
      initial={view}
      width={'100vw'}
      height={'95vh'}
      view={[view, setView]}
    >
      <ROSM />
      <RLayerVector zIndex={2}>

      </RLayerVector>
    </RMap>
  );
};

export default Map2D;