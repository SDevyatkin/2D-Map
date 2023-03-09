import { ChangeEvent, FC, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { deleteInfoModals, saveInfoModal } from '../../api';
import { InfoModalPlacement, setFeatureInfoID, setInfoModalSettings } from '../../store/sidebarSlice';
import { RootState } from '../../store/store';
import Select from '../Select';

const placementValues: { [key: string]: InfoModalPlacement } = {
  'Фиксировать': 'fixed',
  'Привязать': 'binded',
};

const InfoModalPanel: FC = () => {

  const dispatch = useDispatch();

  const { Map, MapID, pinObjects, object, placement } = useSelector((state: RootState) => ({
    Map: state.Map.maps[`map${state.Map.selectedMap}`],
    MapID: Number(state.Map.selectedMap),
    pinObjects: state.pinObjects.objects,
    object: state.sidebar[Number(state.Map.selectedMap)].infoModalSettings.object,
    placement: state.sidebar[Number(state.Map.selectedMap)].infoModalSettings.placement,
  }));

  const [placementValue, setPlacementValue] = useState<string>('Фиксировать');
  const [buttonDisabled, setButtonDisabled] = useState<boolean>(object === 'None');

  useEffect(() => setButtonDisabled(object === 'None'), [object]);

  const handleObject = (event: ChangeEvent<HTMLSelectElement>) => {
    const value = Number(event.target.value);

    dispatch(setInfoModalSettings({
      map: MapID,
      settings: {
        object: value,
        placement,
      },
    }));
  };

  const handlePlacement = (event: ChangeEvent<HTMLSelectElement>) => {
    const value = placementValues[event.target.value];

    setPlacementValue(event.target.value);
    dispatch(setInfoModalSettings({
      map: MapID,
      settings: {
        object,
        placement: value,
      },
    }));
  };

  const addInfoModal = () => {
    if (object === 'None') return;
    
    console.log(placement);
    if (placement === 'fixed') {
      dispatch(setFeatureInfoID({
        map: MapID,
        id: object,
      }));
    } else if (placement === 'binded') {
      Map.addInfoModal(object);
    }

    saveInfoModal(`map${MapID}`, object, placement);
  };

  const clearInfoModals = () => {
    if (placement === 'fixed') {
      dispatch(setFeatureInfoID({
        map: MapID,
        id: -1,
      }));
    } else if (placement === 'binded') {
      Map.clearInfoModals();
    }
    deleteInfoModals(`map${MapID}`);
  };
;
  return (
    <div id='info-modal-panel' className='sidebar-panel' style={{ top: '350px' }}>
      <h2>Вывод информации</h2>
      <div className='selector'>
        <span>Объект</span>
        <Select data={pinObjects} value={object} noneField='-' onChange={handleObject} />
      </div>
      <div className='selector'>
        <span>Расположение</span>
        <Select data={Object.keys(placementValues)} value={placementValue} noneField={''} onChange={handlePlacement} />
      </div>
      <div className='buttons'>
        <button className='primary-btn sidebar-btn' disabled={buttonDisabled} onClick={addInfoModal}>построить</button>
        <button className='primaty-btn sidebar-btn' onClick={clearInfoModals}>очистить</button>
      </div>
    </div>
  );
};

export default InfoModalPanel;