import { FC, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { useDispatch } from 'react-redux';
import FeatureInfoModal from '../../FeatureInfoModal';
import { appendMap } from '../../store/mapSlice';
import MapCanvas from './MapCanvas';

interface Props {
  divID: string;
}

const MapCreator: FC<Props> = ({ divID }: Props) => {

  const [Map, setMap] = useState<MapCanvas>();
  const [container, setContainer] = useState<HTMLDivElement>();

  const dispatch = useDispatch();

  useEffect(() => {
    if (Map) return;

    const div = document.getElementById(divID) as HTMLDivElement;
    setContainer(div);

    const newMap = new MapCanvas(divID);

    setMap(newMap);
    dispatch(appendMap({
      id: divID,
      Map: newMap,
    }));

    const observer = new ResizeObserver(() => newMap.resize());

    observer.observe(div);
  }, []);

  return (
    <>
      {
        container && createPortal(<FeatureInfoModal divID={divID} />, container)
      }
    </>
  );
};

export default MapCreator;