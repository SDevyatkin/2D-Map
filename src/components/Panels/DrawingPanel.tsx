import { ChangeEvent, FC, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { selectDrawingMode } from '../../store/drawingSettingsSlice';
import { DrawingMode, setDrawingMode } from '../../store/sidebarSlice';
import { RootState } from '../../store/store';
import Select from '../Select';

const DrawingPanel: FC = () => {

  const dispatch = useDispatch();

  const { Map, MapID, drawingModes, drawingMode } = useSelector((state: RootState) => ({
    Map: state.Map.maps[`map${state.Map.selectedMap}`],
    MapID: Number(state.Map.selectedMap),
    drawingModes: state.drawingSettings.options,
    drawingMode: state.sidebar[Number(state.Map.selectedMap)].drawingMode,
    // selectedDrawingMode: state.drawingSettings.selected,
  }));

  const onChange = (event: ChangeEvent<HTMLSelectElement>) => {
    // dispatch(selectDrawingMode(event.target.value));
    dispatch(setDrawingMode({
      map: MapID,
      mode: event.target.value as DrawingMode,
    }));
    Map.changeInteractions(event.target.value);
  };

  const drawLine = () => Map.drawLine();
  const cleanDrawSource = () => Map.cleanDrawSource();

  return (
    <div id='drawing-panel' className='sidebar-panel' style={{ top: '110px' }}>
      <h2>Редактирования</h2>
      <div className='selector'>
        <span>Режим</span>
        <Select data={Object.entries(drawingModes)} value={drawingMode} noneField='Выкл' onChange={onChange} />
      </div>
      <div className='buttons'> 
        <button className='primary-btn sidebar-btn' onClick={cleanDrawSource}>очистить</button>
        <button className='primary-btn sidebar-btn' onClick={drawLine}>построить маршрут</button>
      </div>
    </div>
  );
};

export default DrawingPanel;