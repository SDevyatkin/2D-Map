import { FC, MouseEvent } from 'react';
import DrawingPanel from './Panels/DrawingPanel';
import MapSettingsPanel from './Panels/MapSettingsPanel';
import ModelsSettingsPanel from './Panels/ModelsSettingsPanel';

interface SidebarProps {
  opened: boolean
  handleSidebar: (event: MouseEvent) => void;
}

const Sidebar: FC<SidebarProps> = ({ opened, handleSidebar }) => {

  return (
    <div className={`sidebar ${opened ? 'sidebar-active' : ''}`}>
      <button className='primary-btn close-btn' onClick={handleSidebar}>+</button>
      <DrawingPanel />
      <MapSettingsPanel />
      <ModelsSettingsPanel />
    </div>
  );
};

export default Sidebar;