import { ChangeEvent, FC } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { selectDrawingMode } from '../../store/drawingSettingsSlice';
import { RootState } from '../../store/store';
import Select from '../Select';

const data = [
  ['LineString', 'Непрерывная линия'],
  ['Polygon', 'Зона'],
  ['Circle', 'Окружность'],
  ['Point', 'Точка'],
];

const DrawingPanel: FC = () => {

  const dispatch = useDispatch();

  const { Map, drawingModes, selectedDrawingMode } = useSelector((state: RootState) => ({
    Map: state.mapSlice.map,
    drawingModes: state.drawingSettings.options,
    selectedDrawingMode: state.drawingSettings.selected,
  }));

  const onChange = (event: ChangeEvent<HTMLSelectElement>) => {
    dispatch(selectDrawingMode(event.target.value));
    Map.changeInteractions(event.target.value);
  };

  return (
    <div className='sidebar-panel'>
      <h2>Редактор</h2>
      <div className='selector'>
        <span>Режим</span>
        <Select data={Object.entries(drawingModes)} value={selectedDrawingMode} noneField='Выкл' onChange={onChange} />
      </div>
      <div className='buttons'> 
        <button className='primary-btn sidebar-btn' onClick={() => Map.cleanDrawSource()}>очистить</button>
        <button className='primary-btn sidebar-btn' onClick={() => Map.drawLine()}>построить маршрут</button>
      </div>
    </div>
  );
};

export default DrawingPanel;