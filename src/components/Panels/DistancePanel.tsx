import { ChangeEvent, FC, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { clearDistances, saveDistance } from '../../api';
import { setDistanceSettings } from '../../store/sidebarSlice';
import { RootState } from '../../store/store';
import { InstrumentsButton } from '../../StyledButton';
import Select from '../Select';
import ColorInput from './ColorInput';

const DistancePanel: FC = () => {
  const dispatch = useDispatch();

  const [colorInput, setColorInput] = useState<string>('');
  const [buttonDisabled, setButtonDisabled] = useState<boolean>(true);

  const Map = useSelector((state: RootState) => state.Map.maps[`map${state.Map.selectedMap}`]);
  const MapID = useSelector((state: RootState) => Number(state.Map.selectedMap));
  const pinObjects = useSelector((state: RootState) => state.pinObjects.objects);
  const object1 = useSelector((state: RootState) => state.sidebar[Number(state.Map.selectedMap)].distanceSettings.object1);
  const object2 = useSelector((state: RootState) => state.sidebar[Number(state.Map.selectedMap)].distanceSettings.object2);
  const color = useSelector((state: RootState) => state.sidebar[Number(state.Map.selectedMap)].distanceSettings.color);
  // const { Map, MapID, pinObjects, object1, object2, color } = useSelector((state: RootState) => ({
  //   Map: state.Map.maps[`map${state.Map.selectedMap}`],
  //   MapID: Number(state.Map.selectedMap),
  //   pinObjects: state.pinObjects.objects,
  //   object1: state.sidebar[Number(state.Map.selectedMap)].distanceSettings.object1,
  //   object2: state.sidebar[Number(state.Map.selectedMap)].distanceSettings.object2,
  //   color: state.sidebar[Number(state.Map.selectedMap)].distanceSettings.color,
  // }));

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
    let obj1 = Number(object1);
    let obj2 = Number(object2);

    if (obj1 < obj2)  {
      obj1 = obj2;
      obj2 = Number(object1);
    }

    Map.setDistanceColor(obj1, obj2, colorInput);
    Map.pushDistance(obj1 > obj2 ? [obj1, obj2] : [obj2, obj1]);
    saveDistance(`map${MapID}`, obj1, obj2, colorInput);
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
    clearDistances(`map${MapID}`);
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
        <InstrumentsButton disabled={buttonDisabled} onClick={drawDistance}>построить</InstrumentsButton>
        <InstrumentsButton onClick={clearDistanceLayer}>очистить</InstrumentsButton>
      </div>
    </div>
  );
};

export default DistancePanel;