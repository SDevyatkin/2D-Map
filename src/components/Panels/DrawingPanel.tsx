import { FC } from 'react';
import Select from '../Select';

const data = [
  ['LineString', 'Непрерывная линия'],
  ['Polygon', 'Зона'],
  ['Circle', 'Окружность'],
  ['Point', 'Точка'],
];

const DrawingPanel: FC = () => {

  return (
    <div className='sidebar-panel'>
      <h2>Редактор</h2>
      <div className='selector'>
        <span>Режим</span>
        <Select data={data} noneField='Выкл' />
      </div>
      <div className='buttons'> 
        <button className='primary-btn sidebar-btn'>очистить</button>
        <button className='primary-btn sidebar-btn'>построить маршрут</button>
      </div>
    </div>
  );
};

export default DrawingPanel;