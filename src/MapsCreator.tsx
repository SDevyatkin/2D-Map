import { Map, View } from 'ol';
import { buffer } from 'ol/extent';
import TileLayer from 'ol/layer/Tile';
import OSM from 'ol/source/OSM';
import { FC, useEffect, useState } from 'react';

interface Props {
  width: number;
  height: number;
}

const MapsCreator: FC<Props> = ({ width, height }) => {

  const [MapInstance, setMapInstance] = useState<Map>();

  useEffect(() => {
    const TileSource = new OSM();

    const map1 = new Map({
      layers: [ new TileLayer({ source: TileSource }) ],
      target: 'map1',
      view: new View({
        center: [0, 0],
        zoom: 3,
        extent: buffer(new View().getProjection().getExtent(), 2),
        projection: 'EPSG:3857',
      }),
    });

    

    setMapInstance(map1);

    const map2 = new Map({
      layers: [ new TileLayer({ source: TileSource }) ],
      target: 'map2',
      view: new View({
          center: [0, 0],
          zoom: 3,
          extent: new View().getProjection().getExtent(),
          projection: 'EPSG:3857',
      }),
    });

    const map3 = new Map({
      layers: [ new TileLayer({ source: TileSource }) ],
      target: 'map3',
      view: new View({
          center: [0, 0],
          zoom: 3,
          extent: new View().getProjection().getExtent(),
          projection: 'EPSG:3857',
      }),
    });

    const map4 = new Map({
      layers: [ new TileLayer({ source: TileSource }) ],
      target: 'map4',
      view: new View({
          center: [0, 0],
          zoom: 3,
          extent: new View().getProjection().getExtent(),
          projection: 'EPSG:3857',
      }),
    });

    const mapDiv = document.getElementById('map1') as HTMLDivElement;

    const resizeObserver = new ResizeObserver(() => {
      map1.updateSize();
      map2.updateSize();
      map3.updateSize();
      map4.updateSize();
    });

    resizeObserver.observe(mapDiv);
  }, []);

  // console.log(MapInstance);

  MapInstance?.updateSize();
  MapInstance?.setSize(MapInstance.getSize());
  MapInstance?.updateSize();

  return (
    <></>
  );
};

export default MapsCreator;