import { FC } from 'react';

const MapSettingsPanel: FC = () => {

  return (
    <div className='sidebar-panel'>
      <h2>Карта</h2>
      <div className='selector'>
        <span>Центрирование</span>
        <select>
          <option>Свободно</option>
          <option>Не свободно</option>
        </select>
        <button className='primary-btn sidebar-btn update-btn'>{'\u21BA'}</button>
      </div>
      <div className='selector'>
        <span>Масштаб</span>
        <select>
          <option>1</option>
          <option>2</option>
        </select>
      </div>
      <div className='buttons'>
        <button className='primary-btn sidebar-btn'>сохранить настройки</button>
      </div>
    </div>
  );
};

export default MapSettingsPanel;