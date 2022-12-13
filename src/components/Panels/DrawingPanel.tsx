import { ChangeEvent, FC, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { selectDrawingMode } from '../../store/drawingSettingsSlice';
import { RootState } from '../../store/store';
import Select from '../Select';

const DrawingPanel: FC = () => {

  const dispatch = useDispatch();

  const { Map, drawingModes, selectedDrawingMode } = useSelector((state: RootState) => ({
    Map: state.Map.map,
    drawingModes: state.drawingSettings.options,
    selectedDrawingMode: state.drawingSettings.selected,
  }));

  const onChange = (event: ChangeEvent<HTMLSelectElement>) => {
    dispatch(selectDrawingMode(event.target.value));
    Map.changeInteractions(event.target.value);
  };

  const drawLine = () => Map.drawLine();
  const cleanDrawSource = () => Map.cleanDrawSource();

  return (
    <div className='sidebar-panel'>
      <h2>Редактирования</h2>
      <div className='selector'>
        <span>Режим</span>
        <Select data={Object.entries(drawingModes)} value={selectedDrawingMode} noneField='Выкл' onChange={onChange} />
      </div>
      <div className='buttons'> 
        <button className='primary-btn sidebar-btn' onClick={cleanDrawSource}>очистить</button>
        <button className='primary-btn sidebar-btn' onClick={drawLine}>построить маршрут</button>
      </div>
    </div>
  );
};

export default DrawingPanel;