import { FC, MouseEvent } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import win1 from '../../assets/win1.svg';
import win2v from '../../assets/win2v.svg';
import win2h from '../../assets/win2h.svg';
import win3t from '../../assets/win3t.svg';
import win3b from '../../assets/win3b.svg';
import win3l from '../../assets/win3l.svg';
import win3r from '../../assets/win3r.svg';
import win4 from '../../assets/win4.svg';
import { RootState } from '../../store/store';
import { setLayout, WidgetsLayout } from '../../store/widgetSettingsSlice';
import { StyledButton } from '../../StyledButton';

interface Props {
  onClose: () => void; 
}

const WidgetsLayoutPanel: FC<Props> = ({ onClose }) => {

  const dispatch = useDispatch();

  const { widgetsLayout, maps } = useSelector((state: RootState) => ({
    widgetsLayout: state.widgetSettings.widgetsLayout,
    maps: state.Map.maps,
  }));

  const handleWidgetsLayout = (event: MouseEvent<HTMLButtonElement>) => {
    const layout = event.currentTarget.id as WidgetsLayout;
    
    Object.values(maps).forEach((m) => m.setWidgetsLayout(layout));
    dispatch(setLayout(layout));
    onClose();
  };

  return (
    <div 
      className='sidebar-panel'
      style={{ 
        position: 'absolute',
        top: '887px',
        height: '60px',
        gap: '0',
        flexDirection: 'row',
        padding: 0,
        borderLeft: '1px solid #000',
      }}
    >
      <StyledButton
        id='1'
        isactive={widgetsLayout === '1' ? true : false }
        onClick={handleWidgetsLayout}
      >
        <img className='widget-layout-icon' src={win1} draggable={false} />
      </StyledButton>
      <StyledButton
        id='2v'
        isactive={widgetsLayout === '2v' ? true : false }
        onClick={handleWidgetsLayout}
      >
        <img className='widget-layout-icon' src={win2v} draggable={false} />
      </StyledButton>
      <StyledButton
        id='2h'
        isactive={widgetsLayout === '2h' ? true : false }
        onClick={handleWidgetsLayout}
      >
        <img className='widget-layout-icon' src={win2h} draggable={false} />
      </StyledButton>
      <StyledButton
        id='3t'
        isactive={widgetsLayout === '3t' ? true : false }
        onClick={handleWidgetsLayout}
      >
        <img className='widget-layout-icon' src={win3t} draggable={false} />
      </StyledButton>
      <StyledButton
        id='3b'
        isactive={widgetsLayout === '3b' ? true : false }
        onClick={handleWidgetsLayout}
      >
        <img className='widget-layout-icon' src={win3b} draggable={false} />
      </StyledButton>
      <StyledButton
        id='3l'
        isactive={widgetsLayout === '3l' ? true : false }
        onClick={handleWidgetsLayout}
      >
        <img className='widget-layout-icon' src={win3l} draggable={false} />
      </StyledButton>
      <StyledButton
        id='3r'
        isactive={widgetsLayout === '3r' ? true : false }
        onClick={handleWidgetsLayout}
      >
        <img className='widget-layout-icon' src={win3r} draggable={false} />
      </StyledButton>
      <StyledButton
        id='4'
        isactive={widgetsLayout === '4' ? true : false }
        onClick={handleWidgetsLayout}
      >
        <img className='widget-layout-icon' src={win4} draggable={false} />
      </StyledButton>
    </div>
  );
};

export default WidgetsLayoutPanel;