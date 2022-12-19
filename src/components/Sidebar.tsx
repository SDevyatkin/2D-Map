import { FC, MouseEvent } from 'react';
import { createPortal } from 'react-dom';
import DistancePanel from './Panels/DistancePanel';
import DrawingPanel from './Panels/DrawingPanel';
import MapSettingsPanel from './Panels/MapSettingsPanel';
import RoutesPanel from './Panels/RoutesPanel';
import close from '../assets/close.png';
import MapSelectPanel from './Panels/MapSelectPanel';

interface SidebarProps {
  opened: boolean
  handleSidebar: (event: MouseEvent) => void;
}

const Sidebar: FC<SidebarProps> = ({ opened, handleSidebar }) => {

  return createPortal(
    <div className={`sidebar ${opened ? 'sidebar-active' : ''}`}>
      <button className='primary-btn close-btn' onClick={handleSidebar}>
        <img src={close} width={20} height={20} />
      </button>
      <MapSelectPanel />
      <DrawingPanel />
      <MapSettingsPanel />
      <DistancePanel />
      <RoutesPanel />
    </div>,
    document.getElementById('root') as HTMLDivElement
  );
};

export default Sidebar;