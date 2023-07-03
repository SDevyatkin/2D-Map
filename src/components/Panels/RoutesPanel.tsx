import { ChangeEvent, FC, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getRoute, pushRouteID, stopSendRoutes } from '../../api';
import { setRouteSettings } from '../../store/sidebarSlice';
import { RootState } from '../../store/store';
import { InstrumentsButton } from '../../StyledButton';
import Select from '../Select';
import ColorInput from './ColorInput';

const RoutesPanel: FC = () => {

  const dispatch = useDispatch();

  const [colorInput, setColorInput] = useState<string>('');

  const Map = useSelector((state: RootState) => state.Map.maps[`map${state.Map.selectedMap}`]);
  const MapID = useSelector((state: RootState) => Number(state.Map.selectedMap));
  const pinObjects = useSelector((state: RootState) => state.pinObjects.objects);
  const object = useSelector((state: RootState) => state.sidebar[Number(state.Map.selectedMap)].routeSettings.object);
  const color = useSelector((state: RootState) => state.sidebar[Number(state.Map.selectedMap)].routeSettings.color);

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
      Map.pushRoute(Number(object));
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
        <InstrumentsButton onClick={drawRoute}>построить</InstrumentsButton>
        <InstrumentsButton onClick={clearRoutesLayer}>очистить</InstrumentsButton>
      </div>
    </div>
  );
};

export default RoutesPanel;