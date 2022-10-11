import { FC } from 'react';

const DrawingPanel: FC = () => {

  return (
    <div className='sidebar-panel'>
      <h2>Редактор</h2>
      <div className='selector'>
        <span>Режим</span>
        <select>
          <option>Выкл</option>
          <option>Вкл</option>
        </select>
      </div>
      <div className='buttons'> 
        <button className='primary-btn sidebar-btn'>очистить</button>
        <button className='primary-btn sidebar-btn'>построить маршрут</button>
      </div>
    </div>
  );
};

export default DrawingPanel;