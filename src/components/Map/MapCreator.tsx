import { FC, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { useDispatch } from 'react-redux';
import FeatureInfoModal from '../../FeatureInfoModal';
import { appendMap } from '../../store/mapSlice';
import { addNewMap } from '../../store/sidebarSlice';
import ColorPickerModal from '../Modals/ColorPickerModal';
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

    const newMap = new MapCanvas(divID, dispatch);

    setMap(newMap);
    dispatch(appendMap({
      id: divID,
      Map: newMap,
    }));
    dispatch(addNewMap(Number(divID.slice(3))))

    const observer = new ResizeObserver((entries) => {
      const rect = entries[0].contentRect;
      
      // div.setAttribute('margin-top', `-${rect.height / 2}px`);
      // div.setAttribute('margin-left', `-${rect.width / 2}px`);

      newMap.resize();
    });

    observer.observe(div);
  }, []);

  return (
    <>
      {
        container && createPortal(<FeatureInfoModal divID={divID} />, container)
      }
      {
        container && createPortal(<div className='selection-box'></div>, container)
      }
      { 
        container && <ColorPickerModal divID={divID} /> 
      }
      {/* {
        container && createPortal(<div id={`popup${divID.slice(3)}`} className='popup'></div>, container)
      } */}
    </>
  );
};

export default MapCreator;