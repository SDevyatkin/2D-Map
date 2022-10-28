import { ChangeEvent, FC, useContext, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { MapContext } from '../../App';
import { selectPinObject } from '../../store/pinObjectsSlice';
import { RootState } from '../../store/store';
import { changeZoomLevel } from '../../store/zoomLevelSlice';
import { udpJsonDataType } from '../Map/Map.interface';
import Select from '../Select';

const MapSettingsPanel: FC = () => {

  const map = useContext(MapContext);

  const { pinObjects: _pinObjects, selectedPinObject } = useSelector((state: RootState) => ({
    pinObjects: state.pinObjects.data,
    selectedPinObject: state.pinObjects.selected,
    zoomLevel: state.zoomLevel.level,
  }));
  const dispatch = useDispatch();

  const [pinObjects, setPinObjects] = useState<udpJsonDataType>(map.getUdpJsonData());

  const handlePinObjectChange = (event: ChangeEvent<HTMLSelectElement>) => {
    dispatch(selectPinObject(Number(event.target.value)))
  };

  const handleZoomLevelChange = (event: ChangeEvent<HTMLSelectElement>) => {
    dispatch(changeZoomLevel(Number(event.target.value)));
  };

  return (
    <div className='sidebar-panel'>
      <h2>Карта</h2>
      <div className='selector'>
        <span>Центрирование</span>
        <Select data={Object.keys(pinObjects)} noneField='Свободно' onChange={handlePinObjectChange} />
        <button className='primary-btn sidebar-btn update-btn'>{'\u21BA'}</button>
      </div>
      <div className='selector'>
        <span>Масштаб</span>
        <Select data={Array.from({length: 30}, (_, i) => i + 1)} noneField='' onChange={handleZoomLevelChange} />
      </div>
      <div className='buttons'>
        <button className='primary-btn sidebar-btn'>сохранить настройки</button>
      </div>
    </div>
  );
};

export default MapSettingsPanel;