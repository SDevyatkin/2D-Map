import { ChangeEvent, FC, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
// import { saveSessionSettings } from '../../api';
import { selectDrawingMode } from '../../store/drawingSettingsSlice';
import { DrawingMode, setDrawingMode } from '../../store/sidebarSlice';
import { RootState, store } from '../../store/store';
import { InstrumentsButton } from '../../StyledButton';
import Select from '../Select';

const DrawingPanel: FC = () => {
  const dispatch = useDispatch();

  const Map = useSelector((state: RootState) => state.Map.maps[`map${state.Map.selectedMap}`]);
  const MapID = useSelector((state: RootState) => Number(state.Map.selectedMap));
  const drawingModes = useSelector((state: RootState) => state.drawingSettings.options);
  const drawingMode = useSelector((state: RootState) => state.sidebar[Number(state.Map.selectedMap)].drawingMode);

  const onChange = (event: ChangeEvent<HTMLSelectElement>) => {
    // dispatch(selectDrawingMode(event.target.value));
    dispatch(setDrawingMode({
      map: MapID,
      mode: event.target.value as DrawingMode,
    }));
    Map.changeInteractions(event.target.value);

    // const state = store.getState();
    // saveSessionSettings(state.widgetSettings.widgetsLayout, state.sidebar);
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
        <InstrumentsButton onClick={cleanDrawSource}>очистить</InstrumentsButton>
        <InstrumentsButton onClick={drawLine}>построить маршрут</InstrumentsButton>
      </div>
    </div>
  );
};

export default DrawingPanel;