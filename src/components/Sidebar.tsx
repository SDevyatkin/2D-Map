import { FC, MouseEvent } from 'react';
import { createPortal } from 'react-dom';
import DistancePanel from './Panels/DistancePanel';
import DrawingPanel from './Panels/DrawingPanel';
import MapSettingsPanel from './Panels/MapSettingsPanel';
import RoutesPanel from './Panels/RoutesPanel';

interface SidebarProps {
  opened: boolean
  handleSidebar: (event: MouseEvent) => void;
}

const Sidebar: FC<SidebarProps> = ({ opened, handleSidebar }) => {

  return createPortal(
    <>
      <div className={`sidebar ${opened ? 'sidebar-active' : ''}`}>
        <button className='primary-btn close-btn' onClick={handleSidebar}>+</button>
        <DrawingPanel />
        <MapSettingsPanel />
        <DistancePanel />
        <RoutesPanel />
      </div>
      <button className={`toggle-sidebar-btn`} onClick={handleSidebar}>
        &#10095;
      </button>
    </>
    ,
  document.getElementById('map') as HTMLElement);
};

export default Sidebar;