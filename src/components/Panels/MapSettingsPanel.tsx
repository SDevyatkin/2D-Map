import { ChangeEvent, FC, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { selectPinObject } from '../../store/pinObjectsSlice';
import { RootState } from '../../store/store';
import { changeZoomLevel } from '../../store/zoomLevelSlice';
import Select from '../Select';

const MapSettingsPanel: FC = () => {

  const [viewLocked, setViewLocked] = useState<boolean>(false);

  const { Map, pinObjects, selectedPinObject, zoomLevel } = useSelector((state: RootState) => ({
    Map: state.Map.maps[`map${state.Map.selectedMap}`],
    pinObjects: state.pinObjects.objects,
    selectedPinObject: state.pinObjects.selected,
    zoomLevel: state.zoomLevel.level,
  }));

  useEffect(() => {
    if (!Map) return;

    setViewLocked(Map.getViewLocked());
  }, [Map]);

  const dispatch = useDispatch();

  const handlePinObjectChange = (event: ChangeEvent<HTMLSelectElement>) => {
    const value = event.target.value; 

    dispatch(selectPinObject(value === null ? value : Number(value)));
    
    if (viewLocked) {
      Map.setCenteredObject(value === null ? value : Number(value));
    } else {
      Map.translateView(value === null ? value : Number(value));
    }
  };

  const handleZoomLevelChange = (event: ChangeEvent<HTMLSelectElement>) => {
    console.log(Map);
    dispatch(changeZoomLevel(Number(event.target.value)));
    Map.setZoomLevel(Number(event.target.value));
  };

  const handleViewLocked = (event: ChangeEvent<HTMLInputElement>) => {
    setViewLocked(event.target.checked);
    Map.setViewLocked(event.target.checked);
  };

  return (
    <div className='sidebar-panel'>
      <h2>Вид карты</h2>
      <div className='selector'>
        <span>Центрирование</span>
        <Select value={selectedPinObject} data={pinObjects} noneField='Свободно' onChange={handlePinObjectChange} />
      </div>
      <div className='selector'>
        <span>Масштаб</span>
        <Select data={Array.from({length: 30}, (_, i) => i + 1)} value={zoomLevel} noneField='' onChange={handleZoomLevelChange} />
      </div>
      <div className='panel-checkbox '>
        <label htmlFor='lock-view'>Блокировать вид</label>
        <input id='lock-view' type='checkbox' checked={viewLocked} onChange={handleViewLocked} />
      </div>
      <div className='buttons'>
        <button className='primary-btn sidebar-btn'>сохранить</button>
      </div>
    </div>
  );
};

export default MapSettingsPanel;