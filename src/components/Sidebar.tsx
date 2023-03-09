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
import widgets from '../assets/win4.svg';
import { useSelector } from 'react-redux';
import { RootState } from '../store/store';
import ModalOverlay from './Modals/ModalOverlay';
import CommonModal from './Modals/CommonModal';
import InfoModalPanel from './Panels/InfoModalPanel';
import WidgetsLayoutPanel from './Panels/WidgetsLayoutPanel';
import CommonTooltip from '../CommonTooltip';

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
  const [widgetsLayoutPanel, setWidgetsLayoutPanel] = useState<boolean>(false);
  const [commonModal, setCommonModal] = useState<boolean>(false);

  const handleMapSelectPanel = () => {
    setViewSettingsPanel(false);
    setDistancePanel(false);
    setRoutePanel(false);
    setInfoModalPanel(false);
    setCommonModal(false);
    setDrawingPanel(false);
    setWidgetsLayoutPanel(false);
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
    setWidgetsLayoutPanel(false);
    setDrawingPanel(state => !state);
  };

  const handleViewSettingsPanel = () => {
    setMapSelectPanel(false);
    setDrawingPanel(false);
    setDistancePanel(false);
    setRoutePanel(false);
    setInfoModalPanel(false);
    setCommonModal(false);
    setWidgetsLayoutPanel(false);
    setViewSettingsPanel(state => !state);
  };

  const handleDistancePanel = () => {
    setMapSelectPanel(false);
    setDrawingPanel(false);
    setViewSettingsPanel(false);
    setRoutePanel(false);
    setInfoModalPanel(false);
    setCommonModal(false);
    setWidgetsLayoutPanel(false);
    setDistancePanel(state => !state);
  };

  const handleRoutePanel = () => {
    setMapSelectPanel(false);
    setDrawingPanel(false);
    setViewSettingsPanel(false);
    setDistancePanel(false);
    setInfoModalPanel(false);
    setCommonModal(false);
    setWidgetsLayoutPanel(false);
    setRoutePanel(state => !state);
  };

  const handleInfoModal = () => {
    setMapSelectPanel(false);
    setDrawingPanel(false);
    setViewSettingsPanel(false);
    setDistancePanel(false);
    setCommonModal(false);
    setRoutePanel(false);
    setWidgetsLayoutPanel(false);
    setInfoModalPanel(state => !state);
  };

  const handleWidgetsLayoutPanel = () => {
    setMapSelectPanel(false);
    setDrawingPanel(false);
    setViewSettingsPanel(false);
    setDistancePanel(false);
    setRoutePanel(false);
    setInfoModalPanel(false);
    setCommonModal(false);
    setWidgetsLayoutPanel(state => !state);
  };

  const handleCommonModal = () => {
    setMapSelectPanel(false);
    setDrawingPanel(false);
    setViewSettingsPanel(false);
    setDistancePanel(false);
    setRoutePanel(false);
    setInfoModalPanel(false);
    setWidgetsLayoutPanel(false);
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
          <CommonTooltip
            title='Инструмент для выбора настраиваемого виджета.'
          >
            <button className={`menu-btn${mapSelectPanel ? ' menu-btn-active' : ''}`} onClick={handleMapSelectPanel}>
              { selectedMap }
            </button>
          </CommonTooltip> 
          <CommonTooltip
            title='Инструмент для выбора режима редактирования.'
          >
            <button className={`menu-btn${drawingPanel ? ' menu-btn-active' : ''}`} onClick={handleDrawingPanel}>
              <img src={drawing} draggable={false} />
            </button>
          </CommonTooltip>
          <CommonTooltip
            title='Инструмент для настройки вида карты.'
          > 
            <button className={`menu-btn${viewSettingsPanel ? ' menu-btn-active' : ''}`} onClick={handleViewSettingsPanel}>
              <img src={view} draggable={false} />
            </button>
          </CommonTooltip>
          <CommonTooltip
            title='Инструмент для оценки расстояния между двумя объектами.'
          >
            <button className={`menu-btn${distancePanel ? ' menu-btn-active' : ''}`} onClick={handleDistancePanel}>
              <img src={distance} draggable={false} />
            </button>
          </CommonTooltip>
          <CommonTooltip
            title='Инструмент для отрисовки пройденного объктом пути.'
          >
            <button className={`menu-btn${routePanel ? ' menu-btn-active' : ''}`} onClick={handleRoutePanel}>
              <img src={routes} draggable={false} />
            </button>
          </CommonTooltip>
          <CommonTooltip
            title='Инструмент для вывода информации об объекте.'
          >
            <button className={`menu-btn${infoModalPanel ? ' menu-btn-active' : ''}`} onClick={handleInfoModal}>
              <img src={info} draggable={false} />
            </button>
          </CommonTooltip>
        </div>
        <div className='sidebar-menu'>
          <CommonTooltip
            title='Инструмент для управления расположением виджетов.'
          >
            <button className={`menu-btn${widgetsLayoutPanel ? ' menu-btn-active' : ''}`} onClick={handleWidgetsLayoutPanel}>
              <img src={widgets} style={{width: '35px', height: '35px', borderRadius: '3px'}} draggable={false} />
            </button>
          </CommonTooltip>
          <CommonTooltip
            title='Модальное окно с инструментами для всего приложения: создание пользовательской иконки и задание стилей для объектов на карте.'
          >
            <button className={`menu-btn${commonModal ? ' menu-btn-active' : ''}`} onClick={handleCommonModal}>
              <img src={settings} draggable={false} /> 
            </button>
          </CommonTooltip>
        </div>
      </div>
  
      { (mapSelectPanel && opened) && <MapSelectPanel onClose={closeMapSelectPanel} /> }
      { (drawingPanel && opened) && <DrawingPanel /> }
      { (viewSettingsPanel && opened) && <MapSettingsPanel /> }
      { (distancePanel && opened) && <DistancePanel /> }
      { (routePanel && opened) && <RoutesPanel /> }
      { (infoModalPanel && opened) && <InfoModalPanel /> }
      { (widgetsLayoutPanel && opened) && <WidgetsLayoutPanel onClose={handleWidgetsLayoutPanel} /> }
      { (commonModal && opened) && <CommonModal handleClose={handleCommonModal} /> }
    </>
    , document.getElementById('root') as HTMLDivElement
  );
};

export default Sidebar;