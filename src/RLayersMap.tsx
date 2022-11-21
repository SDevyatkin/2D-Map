import 'ol/ol.css';
import './rlayersMap.css';
import 'rlayers/control/layers.css';
import { fromLonLat, toLonLat } from 'ol/proj';
import { FC, useCallback, useMemo, useState } from 'react';
import { MapBrowserEvent, RControl, RFeature, RLayerVector, RMap, ROSM, ROverlay, RStyle } from 'rlayers';
import { RView } from 'rlayers/RMap';
import { Coordinate } from 'ol/coordinate';
import { Point } from 'ol/geom';
import { Extent } from 'ol/extent';
import { toSize } from 'ol/size';
import { isPrivateIdentifier } from 'typescript';

const iconPath = 'https://cdn.jsdelivr.net/npm/rlayers/examples/./svg/location.svg';

const coords: Record<string, Coordinate> = {
  origin: [2.364, 48.82],
  ArcDeTriomphe: [2.295, 48.8737],
};

const initial: RView = {
  center: fromLonLat(coords.origin),
  zoom: 11,
};

const RLayersMap: FC = () => {

  const [location, setLocation] = useState<number[]>(coords.origin);
  const [view, setView] = useState<RView>(initial);

  const handleMapClick = useCallback((event: MapBrowserEvent<UIEvent>) => {
    const coords = event.map.getCoordinateFromPixel(event.pixel);
    const lonlat = toLonLat(coords);
    setLocation(lonlat);
  }, []);

  const centerMapByLastClick = () => {
    setView({
      ...view,
      center: fromLonLat(location),
    });
  };

  return (
    <>
      <RMap 
        className='map'
        initial={initial}
        width={'100vw'}
        height={'100vh'}
        view={[view, setView]}
        noDefaultControls={true}
        onClick={handleMapClick}
      >
        <ROSM />

        <RControl.RScaleLine />
        <RControl.RAttribution />
        <RControl.RZoom />
        <RControl.RZoomSlider />
        <RControl.RFullScreen
          className='fullscreenControl'
          source='fullscreen'
          label={'\u6269'}
          labelActive={'\u564f'}
        />
        <RControl.RCustom className='customControl'>
          <button onClick={centerMapByLastClick}>o</button>
        </RControl.RCustom>
        
        <RLayerVector zIndex={10}>
          <RStyle.RStyle>
            <RStyle.RIcon src={iconPath} anchor={[0.5, 0.8]} />
          </RStyle.RStyle>

          <RFeature 
            geometry={new Point(fromLonLat(coords.ArcDeTriomphe))}
            onClick={(event) => {
              event.map.getView().fit(event.target.getGeometry()?.getExtent() as Extent, {
                duration: 250,
                maxZoom: 15,
              });
            }}
          >
            <ROverlay className='overlay'>
              Arc de Triomphe
              <br />
              <em>&#11017; click to zoom</em>
            </ROverlay>
          </RFeature>
        </RLayerVector>
      </RMap>
    </>
  );
};

export default RLayersMap;