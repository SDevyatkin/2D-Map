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

interface Props {
  onClose: () => void; 
}

const WidgetsLayoutPanel: FC<Props> = ({ onClose }) => {

  const dispatch = useDispatch();

  const widgetsLayout = useSelector((state: RootState) => state.widgetSettings.widgetsLayout);

  const handleWidgetsLayout = (event: MouseEvent<HTMLButtonElement>) => {
    const layout = event.currentTarget.id as WidgetsLayout;
    
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
      <button
        id='1'
        className={`menu-btn${widgetsLayout === '1' ? ' menu-btn-active' : ''}`} 
        style={{ width: '60px' }}
        onClick={handleWidgetsLayout}
      >
        <img className='widget-layout-icon' src={win1} draggable={false} />
      </button>
      <button
        id='2v'
        className={`menu-btn${widgetsLayout === '2v' ? ' menu-btn-active' : ''}`} 
        style={{ width: '60px' }}
        onClick={handleWidgetsLayout}
      >
        <img className='widget-layout-icon' src={win2v} draggable={false} />
      </button>
      <button
        id='2h'
        className={`menu-btn${widgetsLayout === '2h' ? ' menu-btn-active' : ''}`} 
        style={{ width: '60px' }}
        onClick={handleWidgetsLayout}
      >
        <img className='widget-layout-icon' src={win2h} draggable={false} />
      </button>
      <button
        id='3t'
        className={`menu-btn${widgetsLayout === '3t' ? ' menu-btn-active' : ''}`} 
        style={{ width: '60px' }}
        onClick={handleWidgetsLayout}
      >
        <img className='widget-layout-icon' src={win3t} draggable={false} />
      </button>
      <button
        id='3b'
        className={`menu-btn${widgetsLayout === '3b' ? ' menu-btn-active' : ''}`} 
        style={{ width: '60px' }}
        onClick={handleWidgetsLayout}
      >
        <img className='widget-layout-icon' src={win3b} draggable={false} />
      </button>
      <button
        id='3l'
        className={`menu-btn${widgetsLayout === '3l' ? ' menu-btn-active' : ''}`} 
        style={{ width: '60px' }}
        onClick={handleWidgetsLayout}
      >
        <img className='widget-layout-icon' src={win3l} draggable={false} />
      </button>
      <button
        id='3b'
        className={`menu-btn${widgetsLayout === '3r' ? ' menu-btn-active' : ''}`} 
        style={{ width: '60px' }}
        onClick={handleWidgetsLayout}
      >
        <img className='widget-layout-icon' src={win3r} draggable={false} />
      </button>
      <button
        id='4'
        className={`menu-btn${widgetsLayout === '4' ? ' menu-btn-active' : ''}`} 
        style={{ width: '60px' }}
        onClick={handleWidgetsLayout}
      >
        <img className='widget-layout-icon' src={win4} draggable={false} />
      </button>
    </div>
  );
};

export default WidgetsLayoutPanel;