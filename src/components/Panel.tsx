import { FC, MouseEvent, useState } from 'react';
import logo from '../assets/logo.png';
import menu from '../assets/burger-menu.png';
import ModelCreation from './Modals/ModelCreation';
import ModelSetting from './Modals/ModelSetting';

interface PanelProps {
  handleSidebar: (event: MouseEvent) => void;
}

const Panel: FC<PanelProps> = ({ handleSidebar }) => {

  const [iconCreationMode, setIconCreationMode] = useState<boolean>(false);
  const [typeSettingsMode, setTypeSettingsMode] = useState<boolean>(false);
  const [freqChangingMode, setFreqChangingMode] = useState<boolean>(false);

  const handleIconCreationMode = () => {
    setTypeSettingsMode(false);
    setFreqChangingMode(false);
    setIconCreationMode(true);
  };

  const handleTypeSettingsMode = () => {
    setIconCreationMode(false);
    setFreqChangingMode(false);
    setTypeSettingsMode(true);
  };

  const handleFreqChangingMode = () => {
    setTypeSettingsMode(false);
    setIconCreationMode(false);
    setFreqChangingMode(true);
  };

  const offIconCreationMode = () => { setIconCreationMode(false) };
  const offTypeSettingsMode = () => { setTypeSettingsMode(false) };

  return (
    <>
      <div className='header'>
        <button onClick={handleSidebar}>
          <img src={menu} />
        </button>
        <img className='logo' src={logo} />
        <div className='header-btns'>
          {/* <button className='primary-btn' onClick={handleFreqChangingMode}>обновлений/сек</button> */}
          <button className='primary-btn' onClick={handleIconCreationMode}>создание иконки</button>
          <button className='primary-btn' onClick={handleTypeSettingsMode}>соотношение типов</button>
        </div>
      </div>
      { iconCreationMode && <ModelCreation handleClose={offIconCreationMode} /> }
      { typeSettingsMode && <ModelSetting handleClose={offTypeSettingsMode} /> }
    </>
  );
};

export default Panel;