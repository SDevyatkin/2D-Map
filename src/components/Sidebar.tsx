import { FC, MouseEvent, useEffect, useState } from 'react';
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
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../store/store';
import ModalOverlay from './Modals/ModalOverlay';
import CommonModal from './Modals/CommonModal';
import InfoModalPanel from './Panels/InfoModalPanel';
import WidgetsLayoutPanel from './Panels/WidgetsLayoutPanel';
import CommonTooltip from '../CommonTooltip';
import { setOpened } from '../store/errorLogSlice';
import { StyledButton } from '../StyledButton';

interface SidebarProps {
  opened: boolean;
  handleSidebar: (event: MouseEvent) => void;
}

const Sidebar: FC<SidebarProps> = ({ opened, handleSidebar }) => {

  const dispatch = useDispatch();

  const selectedMap = useSelector((state: RootState) => state.Map.selectedMap);
  const errorLogOpened = useSelector((state: RootState) => state.errorLog.opened);

  // const { selectedMap, errorLogOpened } = useSelector((state: RootState) => ({
  //   selectedMap: state.Map.selectedMap,
  //   errorLogOpened: state.errorLog.opened,
  // }));

  useEffect(() => {
    errorLogOpened && setCommonModal(false);
  }, [errorLogOpened]);

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

    dispatch(setOpened(false));
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
            <StyledButton 
              isactive={mapSelectPanel}
              onClick={handleMapSelectPanel}
            >
              { selectedMap }
            </StyledButton>
            {/* <button className={`menu-btn${mapSelectPanel ? ' menu-btn-active' : ''}`} onClick={handleMapSelectPanel}>
              { selectedMap }
            </button> */}
          </CommonTooltip> 
          <CommonTooltip
            title='Инструмент для выбора режима редактирования.'
          >
            <StyledButton 
              isactive={drawingPanel}
              onClick={handleDrawingPanel}
            >
              <img src={drawing} draggable={false} />
            </StyledButton>
          </CommonTooltip>
          <CommonTooltip
            title='Инструмент для настройки вида карты.'
          > 
            <StyledButton 
              isactive={viewSettingsPanel}
              onClick={handleViewSettingsPanel}
            >
              <img src={view} draggable={false} />
            </StyledButton>
          </CommonTooltip>
          <CommonTooltip
            title='Инструмент для оценки расстояния между двумя объектами.'
          >
            <StyledButton 
              isactive={distancePanel}
              onClick={handleDistancePanel}
            >
              <img src={distance} draggable={false} />
            </StyledButton>
          </CommonTooltip>
          <CommonTooltip
            title='Инструмент для отрисовки пройденного объктом пути.'
          >
            <StyledButton 
              isactive={routePanel}
              onClick={handleRoutePanel}
            >
              <img src={routes} draggable={false} />
            </StyledButton>
          </CommonTooltip>
          <CommonTooltip
            title='Инструмент для вывода информации об объекте.'
          >
            <StyledButton 
              isactive={infoModalPanel}
              onClick={handleInfoModal}
            >
              <img src={info} draggable={false} />
            </StyledButton>
          </CommonTooltip>
        </div>
        <div className='sidebar-menu'>
          <CommonTooltip
            title='Инструмент для управления расположением виджетов.'
          >
            <StyledButton 
              isactive={widgetsLayoutPanel}
              onClick={handleWidgetsLayoutPanel}
            >
              <img src={widgets} style={{width: '35px', height: '35px', borderRadius: '3px'}} draggable={false} />
            </StyledButton>
          </CommonTooltip>
          <CommonTooltip
            title='Модальное окно с инструментами для всего приложения: создание пользовательской иконки и задание стилей для объектов на карте.'
          >
            <StyledButton 
              isactive={commonModal}
              onClick={handleCommonModal}
            >
              <img src={settings} draggable={false} /> 
            </StyledButton>
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