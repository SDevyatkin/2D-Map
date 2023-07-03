import { FC, MouseEvent, memo, useState } from 'react';
import logo from '../assets/logo.png';
import menu from '../assets/burger-menu.png';
import win1 from '../assets/1win.svg';
import win4 from '../assets/win4.svg';
import ModelCreation from './Modals/ModelCreation';
import ModelSetting from './Modals/ModelSetting';
import WidgetSettings from './Modals/WidgetSettings';
import CommonTooltip from '../CommonTooltip';
import noWarning from '../assets/no-warning.svg'; 
import warnings from '../assets/warnings.svg';
import { useDispatch, useSelector } from 'react-redux';
import { setOpened } from '../store/errorLogSlice';
import { RootState } from '../store/store';
import ErrorLog from './Modals/ErrorLog';
import { Button } from '@mui/material';
import { StyledButton } from '../StyledButton';

interface PanelProps {
  handleSidebar: (event: MouseEvent) => void;
}

const Panel: FC<PanelProps> = ({ handleSidebar }) => {

  const dispatch = useDispatch();

  // const [iconCreationMode, setIconCreationMode] = useState<boolean>(false);
  // const [typeSettingsMode, setTypeSettingsMode] = useState<boolean>(false);
  // const [widgetSettingsMode, setWidgetSettingsMode] = useState<boolean>(false);
  
  const errorLogOpened = useSelector((state: RootState) => state.errorLog.opened);
  const signaling = useSelector((state: RootState) => state.errorLog.signaling);
  // const { errorLogOpened, signaling } = useSelector((state: RootState) => ({ 
  //   errorLogOpened: state.errorLog.opened,
  //   signaling: state.errorLog.signaling,
  // }))
  // const [freqChangingMode, setFreqChangingMode] = useState<boolean>(false);

  // const handleIconCreationMode = () => {
  //   setTypeSettingsMode(false);
  //   setWidgetSettingsMode(false);
  //   // setFreqChangingMode(false);
  //   setIconCreationMode(true);
  // };

  // const handleTypeSettingsMode = () => {
  //   setIconCreationMode(false);
  //   setWidgetSettingsMode(false);
  //   // setFreqChangingMode(false);
  //   setTypeSettingsMode(true);
  // };

  // const handleWidgetMode = () => {
  //   setIconCreationMode(false);
  //   setTypeSettingsMode(false);
  //   setWidgetSettingsMode(state => !state);
  // };

  const handleErrorLogModal = () => {
    dispatch(setOpened(!errorLogOpened));
  };

  // const handleFreqChangingMode = () => {
  //   setTypeSettingsMode(false);
  //   setIconCreationMode(false);
  //   setFreqChangingMode(true);
  // };

  // const offIconCreationMode = () => { setIconCreationMode(false) };
  // const offTypeSettingsMode = () => { setTypeSettingsMode(false) };
  // const offWidgetSettingsMode = () => { setWidgetSettingsMode(false) };

  console.log("Panel")
  return (
    <>
      <div className='header'>
      <CommonTooltip
        title='Открыть/закрыть боковое меню.'
      >
        {/* <Button
          sx={{
            minWidth:'60px',
            width: '60px',
            height: '50px',
            padding: 0,
            borderRadius: 0,
            // transition: '#46464B 250ms cubic-bezier(0.4, 0, 0.2, 1) 0ms,box-shadow 250ms cubic-bezier(0.4, 0, 0.2, 1) 0ms,border-color 250ms cubic-bezier(0.4, 0, 0.2, 1) 0ms,color 250ms cubic-bezier(0.4, 0, 0.2, 1) 0ms',
            '&:hover': {
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
            },
            '&:active': {
              backgroundColor: '#46464B',
            },
            '&:click': {
              backgroundColor: '#46464B',
            },
          }}
          onClick={handleSidebar}
        >
          <img src={menu} />
        </Button> */}
        <StyledButton 
          height={50}
          imagesize={30}
          onClick={handleSidebar}
        >
          <img src={menu} />
        </StyledButton>
        {/* <button onClick={handleSidebar}>
          <img src={menu} />
        </button> */}
      </CommonTooltip>
        <img className='logo' src={logo} />
        <div className='header-btns'>
          <StyledButton 
            height={50}
            imagesize={34}
            onClick={handleErrorLogModal}
          >
            <img src={signaling ? warnings : noWarning} width={34} height={34} style={{ borderRadius: '3px' }} />
          </StyledButton>
          {/* <button className='primary-btn' onClick={handleFreqChangingMode}>обновлений/сек</button> */}
          {/* <button className='primary-btn' onClick={handleIconCreationMode}>создание иконки</button>
          <button className='primary-btn' onClick={handleTypeSettingsMode}>соотношение типов</button> */}
        </div>
      </div>
      {/* { iconCreationMode && <ModelCreation handleClose={offIconCreationMode} /> }
      { typeSettingsMode && <ModelSetting handleClose={offTypeSettingsMode} /> } */}
      {/* { widgetSettingsMode && <WidgetSettings handleClose={offWidgetSettingsMode} /> } */}
      { errorLogOpened && <ErrorLog handleClose={handleErrorLogModal} /> }
    </>
  );
};

export default memo(Panel);