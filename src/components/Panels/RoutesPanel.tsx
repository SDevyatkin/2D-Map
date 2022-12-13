import { ChangeEvent, FC, useState } from 'react';
import { useSelector } from 'react-redux';
import { pushRouteID } from '../../api';
import { RootState } from '../../store/store';
import Select from '../Select';
import ColorInput from './ColorInput';

const RoutesPanel: FC = () => {

  const { Map, pinObjects } = useSelector((state: RootState) => ({
    Map: state.Map.map,
    pinObjects: state.pinObjects.objects,
  }));

  const [selected, setSelected] = useState<number | 'None'>('None');
  const [color, setColor] = useState<string>('#000');

  const onChange = (event: ChangeEvent<HTMLSelectElement>) => {
    const value = event.target.value;

    setSelected(value === 'None' ? value : Number(value));
  };

  const drawRoute = () => {
    if (selected !== 'None') {
      pushRouteID(selected);
      Map.setRouteColor(selected, color);
    } 
    setSelected('None');
  };

  const clearRoutesLayer = () => {
    Map.clearRoutesLayer();
  };

  const handleColor = (color: string) => {
    setColor(color);
  };

  return (
    <div className='sidebar-panel'>
      <h2>Пройденный путь</h2>
      <div className='selector'>
        <span>Объект</span>
        <Select data={pinObjects} value={selected} noneField='-' onChange={onChange} />
      </div>
      <ColorInput sendColor={handleColor} />
      <div className='buttons'>
        <button className='primary-btn sidebar-btn' disabled={selected === 'None'} onClick={drawRoute}>построить</button>
        <button className='primaty-btn sidebar-btn' onClick={clearRoutesLayer}>очистить</button>
      </div>
    </div>
  );
};

export default RoutesPanel;