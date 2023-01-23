import { ChangeEvent, FC, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { selectPinObject } from '../../store/pinObjectsSlice';
import { setViewSettings } from '../../store/sidebarSlice';
import { RootState } from '../../store/store';
import { changeZoomLevel } from '../../store/zoomLevelSlice';
import Select from '../Select';

const MapSettingsPanel: FC = () => {

  // const [viewLocked, setViewLocked] = useState<boolean>(false);

  const { Map, MapID, pinObjects, pinObject, zoomLevel, lockedView } = useSelector((state: RootState) => ({
    Map: state.Map.maps[`map${state.Map.selectedMap}`],
    MapID: Number(state.Map.selectedMap),
    pinObjects: state.pinObjects.objects,
    pinObject: state.sidebar[Number(state.Map.selectedMap)].viewSettings.object,
    // selectedPinObject: state.pinObjects.selected,
    zoomLevel: state.sidebar[Number(state.Map.selectedMap)].viewSettings.zoom,
    lockedView: state.sidebar[Number(state.Map.selectedMap)].viewSettings.locked,
  }));

  // useEffect(() => {
  //   if (!Map) return;

  //   setViewLocked(Map.getViewLocked());
  // }, [Map]);

  const dispatch = useDispatch();

  const handlePinObjectChange = (event: ChangeEvent<HTMLSelectElement>) => {
    const value = event.target.value; 

    // dispatch(selectPinObject(value === null ? value : Number(value)));
    dispatch(setViewSettings({
      map: MapID,
      settings: {
        object: value === null ? value : Number(value),
        zoom: zoomLevel,
        locked: lockedView,
      },
    }));

    if (lockedView) {
      Map.setCenteredObject(value === null ? value : Number(value));
    } else {
      Map.translateView(value === null ? value : Number(value));
    }
  };

  const handleZoomLevelChange = (event: ChangeEvent<HTMLSelectElement>) => {
    // dispatch(changeZoomLevel(Number(event.target.value)));
    dispatch(setViewSettings({
      map: MapID,
      settings: {
        object: pinObject,
        zoom: Number(event.target.value),
        locked: lockedView,
      },
    }));
    Map.setZoomLevel(Number(event.target.value));
  };

  const handleLockedView = (event: ChangeEvent<HTMLInputElement>) => {
    // setViewLocked(event.target.checked);
    dispatch(setViewSettings({
      map: MapID,
      settings: {
        object: pinObject,
        zoom: zoomLevel,
        locked: event.target.checked,
      },
    }));
    Map.setViewLocked(event.target.checked);
  };

  return (
    <div className='sidebar-panel' style={{ top: '170px' }}>
      <h2>Вид карты</h2>
      <div className='selector'>
        <span>Центрирование</span>
        <Select value={pinObject} data={pinObjects} noneField='Свободно' onChange={handlePinObjectChange} />
      </div>
      <div className='selector'>
        <span>Масштаб</span>
        <Select data={Array.from({length: 30}, (_, i) => i + 1)} value={zoomLevel} noneField='' onChange={handleZoomLevelChange} />
      </div>
      <div className='panel-checkbox '>
        <label htmlFor='lock-view'>Блокировать вид</label>
        <input id='lock-view' type='checkbox' checked={lockedView} onChange={handleLockedView} />
      </div>
      {/* <div className='buttons'>
        <button className='primary-btn sidebar-btn'>сохранить</button>
      </div> */}
    </div>
  );
};

export default MapSettingsPanel;