import { ChangeEvent, FC, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import CommonTooltip from '../../CommonTooltip';
import { selectPinObject } from '../../store/pinObjectsSlice';
import { setViewSettings } from '../../store/sidebarSlice';
import { RootState } from '../../store/store';
import { changeZoomLevel } from '../../store/zoomLevelSlice';
import Select from '../Select';

const MapSettingsPanel: FC = () => {

  // const [viewLocked, setViewLocked] = useState<boolean>(false);

  const { Map, MapID, pinObjects, pinObject, zoomLevel, rotation, gridStep, lockedView } = useSelector((state: RootState) => ({
    Map: state.Map.maps[`map${state.Map.selectedMap}`],
    MapID: Number(state.Map.selectedMap),
    pinObjects: state.pinObjects.objects,
    pinObject: state.sidebar[Number(state.Map.selectedMap)].viewSettings.object,
    // selectedPinObject: state.pinObjects.selected,
    zoomLevel: state.sidebar[Number(state.Map.selectedMap)].viewSettings.zoom,
    rotation: state.sidebar[Number(state.Map.selectedMap)].viewSettings.rotation,
    gridStep: state.sidebar[Number(state.Map.selectedMap)].viewSettings.gridStep,
    lockedView: state.sidebar[Number(state.Map.selectedMap)].viewSettings.locked,
  }));

  const [prevRotation, setPrevRotation] = useState<number>(0);

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
        rotation,
        gridStep,
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
        rotation,
        gridStep,
      },
    }));
    Map.setZoomLevel(Number(event.target.value));
  };

  const handleRotationChange = (event: ChangeEvent<HTMLInputElement>) => {
    let value = Number(event.target.value);

    if (Math.abs(value) < 6) {
      if (value >= 0 && value > prevRotation) {
        value = 6
      } else if (value >= 0 && value < prevRotation) {
        value = 0;
      } else if (value < 0 && value > prevRotation) {
        value = 0;
      } else if (value < 0 && value < prevRotation) {
        value = -6;
      }
    }

    setPrevRotation(value);
    dispatch(setViewSettings({
      map: MapID,
      settings: {
        object: pinObject,
        zoom: zoomLevel,
        locked: lockedView,
        rotation: value,
        gridStep,
      },
    }));

    Map.setRotation(value);
  };

  const handleGridStep = (event: ChangeEvent<HTMLInputElement>) => {
    const value = Number(event.target.value);

    dispatch(setViewSettings({
      map: MapID,
      settings: {
        object: pinObject,
        zoom: zoomLevel,
        locked: lockedView,
        rotation,
        gridStep: value,
      },
    }));

    Map.setGridStep(value);
  };

  const handleLockedView = (event: ChangeEvent<HTMLInputElement>) => {
    // setViewLocked(event.target.checked);
    dispatch(setViewSettings({
      map: MapID,
      settings: {
        object: pinObject,
        zoom: zoomLevel,
        locked: event.target.checked,
        rotation,
        gridStep,
      },
    }));
    Map.setViewLocked(event.target.checked);
  };

  return (
    <div id='map-settings-panel' className='sidebar-panel' style={{ top: '170px' }}>
      <h2>Вид карты</h2>
      <div className='selector'>
        <span>Центрирование</span>
        <CommonTooltip
            title='Свободное перемещение или выбор объкта, на котором отцентрируется карта.'
        >
          <div>
            <Select value={pinObject} data={pinObjects} noneField='Свободно' onChange={handlePinObjectChange} />
          </div>
        </CommonTooltip> 
      </div>
      <div className='selector'>
        <span>Масштаб</span>
        <CommonTooltip
            title='Уровень приближения карты.'
        >
          <div>
            <Select data={Array.from({length: 30}, (_, i) => i + 1)} value={zoomLevel} noneField='' onChange={handleZoomLevelChange} />
          </div>
        </CommonTooltip> 
      </div>
      <div className='selector'>
        <span>Поворот</span>
        <CommonTooltip
            title='Угол поворота карты в градусах.'
        >
          <input type='number' value={rotation} max={180} min={-180} step={1} onChange={handleRotationChange} />
        </CommonTooltip> 
      </div>
      <div className='selector'>
        <span>Шаг сетки (км)</span>
        <CommonTooltip
            title='Шаг координатной сетки в км.'
        >
          <input type='number' value={gridStep} step={1} min={0} onChange={handleGridStep} />
        </CommonTooltip> 
      </div>
      <div className='panel-checkbox '>
        <label htmlFor='lock-view'>Блокировать вид</label>
        <CommonTooltip
            title='Блокировать вид на выбранном, в поле "Центрирование", объекте, с фиксированным уровнем приближения, заданным в поле "Масштаб".'
        >
          <input id='lock-view' type='checkbox' checked={lockedView} onChange={handleLockedView} />
        </CommonTooltip> 
      </div>
      {/* <div className='buttons'>
        <button className='primary-btn sidebar-btn'>сохранить</button>
      </div> */}
    </div>
  );
};

export default MapSettingsPanel;