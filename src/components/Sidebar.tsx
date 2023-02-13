import { FC, MouseEvent, useState } from 'react';
import { createPortal } from 'react-dom';
import DistancePanel from './Panels/DistancePanel';
import DrawingPanel from './Panels/DrawingPanel';
import MapSettingsPanel from './Panels/MapSettingsPanel';
import RoutesPanel from './Panels/RoutesPanel';
import close from '../assets/close.png';
import MapSelectPanel from './Panels/MapSelectPanel';
import drawing from '../assets/sidebar/drawing.png';
import distance from '../assets/sidebar/distance.png';
import routes from '../assets/sidebar/routes.png';
import view from '../assets/sidebar/view.png';
import info from '../assets/sidebar/info.png';
import settings from '../assets/sidebar/settings.png';
import { useSelector } from 'react-redux';
import { RootState } from '../store/store';
import ModalOverlay from './Modals/ModalOverlay';
import CommonModal from './Modals/CommonModal';
import InfoModalPanel from './Panels/InfoModalPanel';

interface SidebarProps {
  opened: boolean;
  handleSidebar: (event: MouseEvent) => void;
}

const Sidebar: FC<SidebarProps> = ({ opened, handleSidebar }) => {

  const selectedMap = useSelector((state: RootState) => state.Map.selectedMap);

  const [mapSelectPanel, setMapSelectPanel] = useState<boolean>(false);
  const [drawingPanel, setDrawingPanel] = useState<boolean>(false);
  const [viewSettingsPanel, setViewSettingsPanel] = useState<boolean>(false);
  const [distancePanel, setDistancePanel] = useState<boolean>(false);
  const [routePanel, setRoutePanel] = useState<boolean>(false);
  const [infoModalPanel, setInfoModalPanel] = useState<boolean>(false);
  const [commonModal, setCommonModal] = useState<boolean>(false);

  const handleMapSelectPanel = () => {
    setViewSettingsPanel(false);
    setDistancePanel(false);
    setRoutePanel(false);
    setInfoModalPanel(false);
    setCommonModal(false);
    setDrawingPanel(false);
    setMapSelectPanel(state => !state);
  };

  const closeMapSelectPanel = () => {
    setMapSelectPanel(false);
  };

  const handleDrawingPanel = () => {
    setMapSelectPanel(false);
    setViewSettingsPanel(false);
    setDistancePanel(false);
    setRoutePanel(false);
    setInfoModalPanel(false);
    setCommonModal(false);
    setDrawingPanel(state => !state);
  };

  const handleViewSettingsPanel = () => {
    setMapSelectPanel(false);
    setDrawingPanel(false);
    setDistancePanel(false);
    setRoutePanel(false);
    setInfoModalPanel(false);
    setCommonModal(false);
    setViewSettingsPanel(state => !state);
  };

  const handleDistancePanel = () => {
    setMapSelectPanel(false);
    setDrawingPanel(false);
    setViewSettingsPanel(false);
    setRoutePanel(false);
    setInfoModalPanel(false);
    setCommonModal(false);
    setDistancePanel(state => !state);
  };

  const handleRoutePanel = () => {
    setMapSelectPanel(false);
    setDrawingPanel(false);
    setViewSettingsPanel(false);
    setDistancePanel(false);
    setInfoModalPanel(false);
    setCommonModal(false);
    setRoutePanel(state => !state);
  };

  const handleInfoModal = () => {
    setMapSelectPanel(false);
    setDrawingPanel(false);
    setViewSettingsPanel(false);
    setDistancePanel(false);
    setCommonModal(false);
    setRoutePanel(false);
    setInfoModalPanel(state => !state);
  };

  const handleCommonModal = () => {
    setMapSelectPanel(false);
    setDrawingPanel(false);
    setViewSettingsPanel(false);
    setDistancePanel(false);
    setRoutePanel(false);
    setInfoModalPanel(false);
    setCommonModal(state => !state);
  };

  return createPortal(
    <>
      <div className={`sidebar ${opened ? 'sidebar-active' : ''}`}>
        {/* <button className='primary-btn close-btn' onClick={handleSidebar}>
          <img src={close} width={20} height={20} />
        </button>
        <MapSelectPanel />
        <DrawingPanel />
        <MapSettingsPanel />
        <DistancePanel />
        <RoutesPanel /> */}
        <div className='sidebar-menu'>
          <button className={`menu-btn${mapSelectPanel ? ' menu-btn-active' : ''}`} onClick={handleMapSelectPanel}>
            { selectedMap }
          </button>
          <button className={`menu-btn${drawingPanel ? ' menu-btn-active' : ''}`} onClick={handleDrawingPanel}>
            <img src={drawing} draggable={false} />
          </button>
          <button className={`menu-btn${viewSettingsPanel ? ' menu-btn-active' : ''}`} onClick={handleViewSettingsPanel}>
            <img src={view} draggable={false} />
          </button>
          <button className={`menu-btn${distancePanel ? ' menu-btn-active' : ''}`} onClick={handleDistancePanel}>
            <img src={distance} draggable={false} />
          </button>
          <button className={`menu-btn${routePanel ? ' menu-btn-active' : ''}`} onClick={handleRoutePanel}>
            <img src={routes} draggable={false} />
          </button>
          <button className={`menu-btn${infoModalPanel ? ' menu-btn-active' : ''}`} onClick={handleInfoModal}>
            <img src={info} draggable={false} />
          </button>
        </div>
        <div className='sidebar-menu'>
          <button className={`menu-btn${commonModal ? ' menu-btn-active' : ''}`} onClick={handleCommonModal}>
            <img src={settings} draggable={false} /> 
          </button>
        </div>
      </div>
  
      { (mapSelectPanel && opened) && <MapSelectPanel onClose={closeMapSelectPanel} /> }
      { (drawingPanel && opened) && <DrawingPanel /> }
      { (viewSettingsPanel && opened) && <MapSettingsPanel /> }
      { (distancePanel && opened) && <DistancePanel /> }
      { (routePanel && opened) && <RoutesPanel /> }
      { (infoModalPanel && opened) && <InfoModalPanel /> }
      { (commonModal && opened) && <CommonModal handleClose={handleCommonModal} /> }
    </>
    , document.getElementById('root') as HTMLDivElement
  );
};

export default Sidebar;