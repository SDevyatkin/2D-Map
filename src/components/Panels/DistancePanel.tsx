import { ChangeEvent, FC, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { saveDistance } from '../../api';
import { setDistanceSettings } from '../../store/sidebarSlice';
import { RootState } from '../../store/store';
import Select from '../Select';
import ColorInput from './ColorInput';

const DistancePanel: FC = () => {

  const dispatch = useDispatch();

  const [colorInput, setColorInput] = useState<string>('');
  const [buttonDisabled, setButtonDisabled] = useState<boolean>(true);

  const { Map, MapID, pinObjects, object1, object2, color } = useSelector((state: RootState) => ({
    Map: state.Map.maps[`map${state.Map.selectedMap}`],
    MapID: Number(state.Map.selectedMap),
    pinObjects: state.pinObjects.objects,
    object1: state.sidebar[Number(state.Map.selectedMap)].distanceSettings.object1,
    object2: state.sidebar[Number(state.Map.selectedMap)].distanceSettings.object2,
    color: state.sidebar[Number(state.Map.selectedMap)].distanceSettings.color,
  }));

  useEffect(() => {
    setButtonDisabled(object1 === 'None' || object2 === 'None');
  }, [object1, object2]);

  const handleFirstObject = (event: ChangeEvent<HTMLSelectElement>) => {
    const value = event.target.value;

    dispatch(setDistanceSettings({
      map: MapID,
      settings: {
        object1: value === 'None' ? value : Number(value),
        object2,
        color
      },
    }));
  };

  const handleSecondObject = (event: ChangeEvent<HTMLSelectElement>) => {
    const value = event.target.value;

    dispatch(setDistanceSettings({
      map: MapID,
      settings: {
        object1,
        object2: value === 'None' ? value : Number(value),
        color
      },
    }));
  };

  const drawDistance = () => {
    saveDistance(`map${MapID}`, object1 as number, object2 as number, color);
    Map.setDistanceColor(object1 as number, object2 as number, color);
    Map.pushDistance([object1 as number, object2 as number]);
    dispatch(setDistanceSettings({
      map: MapID,
      settings: {
        object1: 'None',
        object2: 'None',
        color: '#000',
      },
    }));
    setColorInput('');
    
  };

  const clearDistanceLayer = () => {
    Map.clearDistanceLayer();
  };

  const handleColor = (c: string) => {
    dispatch(setDistanceSettings({
      map: MapID,
      settings: {
        object1,
        object2,
        color: c,
      },
    }));
  };

  const handleColorInput = (c: string) => {
    setColorInput(c);
  };

  return (
    <div id='distance-panel' className='sidebar-panel' style={{ top: '230px' }}>
      <h2>Оценка расстояния</h2>
      <div className='selector'>
        <span>Объект 1</span>
        <Select data={pinObjects.filter(pin => pin !== object2)} value={object1} noneField='-' onChange={handleFirstObject} />
      </div>
      <div className='selector'>
        <span>Объект 2</span>
        <Select data={pinObjects.filter(pin => pin !== object1)} value={object2} noneField='-' onChange={handleSecondObject} />
      </div>
      <ColorInput parentId='distance-panel' colorInput={colorInput} sendColorInput={handleColorInput} sendColor={handleColor} />
      <div className='buttons'>
        <button className='primary-btn sidebar-btn' disabled={buttonDisabled} onClick={drawDistance}>построить</button>
        <button className='primaty-btn sidebar-btn' onClick={clearDistanceLayer}>очистить</button>
      </div>
    </div>
  );
};

export default DistancePanel;