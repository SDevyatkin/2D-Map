import { FC, useState } from 'react';
import { createPortal } from 'react-dom';
import ModelCreation from '../Modals/ModelCreation';
import ModelSetting from '../Modals/ModelSetting';

const ModelsSettingsPanel: FC = () => {

  const [modelCreationMode, setModelCreationMode] = useState<boolean>(false);
  const [modelSettingMode, setModelSettingMode] = useState<boolean>(false);

  const modalRoot = document.getElementById('modal') as HTMLElement;

  const handleModelCreation = () => {
    setModelSettingMode(false);
    setModelCreationMode(state => !state);
  };

  const handleModelSetting = () => {
    setModelCreationMode(false);
    setModelSettingMode(state => !state);
  };

  return (
    <>
      <div className='sidebar-panel'>
        <h2>Модели</h2>
        <div className='buttons'>
          <button className='primary-btn sidebar-btn' onClick={handleModelCreation}>создать модель</button>
          <button className='primary-btn sidebar-btn' onClick={handleModelSetting}>настройки моделей</button>
        </div>
      </div>
      { modelCreationMode && createPortal(<ModelCreation handleClose={handleModelCreation} />, modalRoot) }
      { modelSettingMode && createPortal(<ModelSetting handleClose={handleModelSetting} />, modalRoot) }
    </>
    
  );
};

export default ModelsSettingsPanel;