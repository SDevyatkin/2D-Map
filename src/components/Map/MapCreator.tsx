import { FC, memo, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { useDispatch } from 'react-redux';
import { BASE_URL, getSessionSettings, testConnection } from '../../api';
// import { saveSessionSettings } from '../../api';
import FeatureInfoModal from '../../FeatureInfoModal';
import { appendMap } from '../../store/mapSlice';
import { addNewMap } from '../../store/sidebarSlice';
import { store } from '../../store/store';
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
    dispatch(addNewMap(Number(divID.slice(3))));

    // const state = store.getState();
    // saveSessionSettings(state.widgetSettings.widgetsLayout, state.sidebar);

    const observer = new ResizeObserver((entries) => {
      const rect = entries[0].contentRect;
      
      // div.setAttribute('margin-top', `-${rect.height / 2}px`);
      // div.setAttribute('margin-left', `-${rect.width / 2}px`);

      newMap.resize();
    });

    observer.observe(div);

    if (divID === 'map4') {
      testConnection().then(() => {
        getSessionSettings();
      })
    }
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