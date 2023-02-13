import { FC, MouseEvent, useState } from 'react';
import logo from '../assets/logo.png';
import menu from '../assets/burger-menu.png';
import win1 from '../assets/1win.svg';
import win4 from '../assets/win4.svg';
import ModelCreation from './Modals/ModelCreation';
import ModelSetting from './Modals/ModelSetting';
import WidgetSettings from './Modals/WidgetSettings';

interface PanelProps {
  handleSidebar: (event: MouseEvent) => void;
}

const Panel: FC<PanelProps> = ({ handleSidebar }) => {

  const [iconCreationMode, setIconCreationMode] = useState<boolean>(false);
  const [typeSettingsMode, setTypeSettingsMode] = useState<boolean>(false);
  const [widgetSettingsMode, setWidgetSettingsMode] = useState<boolean>(false);
  // const [freqChangingMode, setFreqChangingMode] = useState<boolean>(false);

  const handleIconCreationMode = () => {
    setTypeSettingsMode(false);
    setWidgetSettingsMode(false);
    // setFreqChangingMode(false);
    setIconCreationMode(true);
  };

  const handleTypeSettingsMode = () => {
    setIconCreationMode(false);
    setWidgetSettingsMode(false);
    // setFreqChangingMode(false);
    setTypeSettingsMode(true);
  };

  const handleWidgetMode = () => {
    setIconCreationMode(false);
    setTypeSettingsMode(false);
    setWidgetSettingsMode(state => !state);
  };

  // const handleFreqChangingMode = () => {
  //   setTypeSettingsMode(false);
  //   setIconCreationMode(false);
  //   setFreqChangingMode(true);
  // };

  const offIconCreationMode = () => { setIconCreationMode(false) };
  const offTypeSettingsMode = () => { setTypeSettingsMode(false) };
  const offWidgetSettingsMode = () => { setWidgetSettingsMode(false) };

  return (
    <>
      <div className='header'>
        <button onClick={handleSidebar}>
          <img src={menu} />
        </button>
        <img className='logo' src={logo} />
        <div className='header-btns'>
          <button onClick={handleWidgetMode}>
            <img src={win4} width={27} height={24} style={{ borderRadius: '3px' }} />
          </button>
          {/* <button className='primary-btn' onClick={handleFreqChangingMode}>обновлений/сек</button> */}
          {/* <button className='primary-btn' onClick={handleIconCreationMode}>создание иконки</button>
          <button className='primary-btn' onClick={handleTypeSettingsMode}>соотношение типов</button> */}
        </div>
      </div>
      {/* { iconCreationMode && <ModelCreation handleClose={offIconCreationMode} /> }
      { typeSettingsMode && <ModelSetting handleClose={offTypeSettingsMode} /> } */}
      { widgetSettingsMode && <WidgetSettings handleClose={offWidgetSettingsMode} /> }
    </>
  );
};

export default Panel;