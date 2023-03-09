import { ChangeEvent, FC, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getRoute, pushRouteID, stopSendRoutes } from '../../api';
import { setRouteSettings } from '../../store/sidebarSlice';
import { RootState } from '../../store/store';
import Select from '../Select';
import ColorInput from './ColorInput';

const RoutesPanel: FC = () => {

  const dispatch = useDispatch();

  const [colorInput, setColorInput] = useState<string>('');
  const { Map, MapID, pinObjects, object, color } = useSelector((state: RootState) => ({
    Map: state.Map.maps[`map${state.Map.selectedMap}`],
    MapID: Number(state.Map.selectedMap),
    pinObjects: state.pinObjects.objects,
    object: state.sidebar[Number(state.Map.selectedMap)].routeSettings.object,
    color: state.sidebar[Number(state.Map.selectedMap)].routeSettings.color,
  }));

  const onChange = (event: ChangeEvent<HTMLSelectElement>) => {
    const value = event.target.value;

    dispatch(setRouteSettings({
      map: MapID,
      settings: {
        object: value === 'None' ? value : Number(value),
        color,
      },
    }));
  };

  const drawRoute = async () => {
    // console.log(object, color, colorInput);
    if (object !== 'None') {
      const currentColor = color ? color : '#000';
      const route = await getRoute(object);
      Map.setRouteColor(object, currentColor);
      Map.drawRoutes({
        [Number(object)]: {
          route: route[Number(object)],
          color: colorInput,
        }
      });
      pushRouteID(object, colorInput, `map${MapID}`);
    } 
    setColorInput('');
    dispatch(setRouteSettings({
      map: MapID,
      settings: {
        object: 'None',
        color: '',
      },
    }));
  };

  const clearRoutesLayer = () => {
    stopSendRoutes(MapID);
    Map.clearRoutesLayer();
  };

  const handleColor = (c: string) => {
    // dispatch(setRouteSettings({
    //   map: MapID,
    //   settings: {
    //     object,
    //     color: c,
    //   },
    // }));
    setColorInput(c);
  };

  const handleColorInput = (c: string) => {
    // setColorInput(c);
  };

  return (
    <div id='routes-panel' className='sidebar-panel' style={{ top: '290px' }}>
      <h2>Пройденный путь</h2>
      <div className='selector'>
        <span>Объект</span>
        <Select data={pinObjects} value={object} noneField='-' onChange={onChange} />
      </div>
      <ColorInput parentId='routes-panel' colorInput={colorInput} sendColorInput={handleColorInput} sendColor={handleColor} />
      <div className='buttons'>
        <button className='primary-btn sidebar-btn' onClick={drawRoute}>построить</button>
        <button className='primaty-btn sidebar-btn' onClick={clearRoutesLayer}>очистить</button>
      </div>
    </div>
  );
};

export default RoutesPanel;