import MapObject from '../../MapObject';

interface Map2DProps {
  map: MapObject;
}

const Map2D = ({map}: Map2DProps) => {
  return (
    <div id='map' style={{ width: '100vh', height: '100vh' }}>
    </div>
  );
};

export default Map2D;