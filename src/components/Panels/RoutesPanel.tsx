import { ChangeEvent, FC, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getRoute, pushRouteID, stopSendRoutes } from '../../api';
import { setRouteSettings } from '../../store/sidebarSlice';
import { RootState } from '../../store/store';
import Select from '../Select';
import ColorInput from './ColorInput';

const RoutesPanel: FC = () => {

  const dispatch = useDispatch();

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
    if (object !== 'None') {
      const route = await getRoute(object);
      Map.drawRoutes(route);
      pushRouteID(object, `map${MapID}`);
      Map.setRouteColor(object, color);
    } 
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
    dispatch(setRouteSettings({
      map: MapID,
      settings: {
        object,
        color: c,
      },
    }));
  };

  return (
    <div className='sidebar-panel'>
      <h2>Пройденный путь</h2>
      <div className='selector'>
        <span>Объект</span>
        <Select data={pinObjects} value={object} noneField='-' onChange={onChange} />
      </div>
      <ColorInput colorInput={color} sendColor={handleColor} />
      <div className='buttons'>
        <button className='primary-btn sidebar-btn' disabled={object === 'None'} onClick={drawRoute}>построить</button>
        <button className='primaty-btn sidebar-btn' onClick={clearRoutesLayer}>очистить</button>
      </div>
    </div>
  );
};

export default RoutesPanel;