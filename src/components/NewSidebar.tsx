import { FC, useState } from 'react';
import { createPortal } from 'react-dom';
import DrawingModal from './Modals/DrawingModal';
import ViewSettingsModal from './Modals/ViewSettingsModal';

const NewSidebar: FC = () => {

  const [openedDrawingModal, setOpenedDrawingModal] = useState<boolean>(false);
  const [openedViewSettingsModal, setOpenedViewSettingsModal] = useState<boolean>(false);

  const openDrawingModal = () => {
    setOpenedViewSettingsModal(false);
    setOpenedDrawingModal(true);
  };

  const openViewSettingsModal = () => {
    setOpenedDrawingModal(false);
    setOpenedViewSettingsModal(true);
  };

  return createPortal(
    <>
      <div className='new-sidebar'>
        <button className='new-sidebar-btn' onClick={openDrawingModal}>
          <img src='http://localhost:8080/public/images/logo/logo_no_background.png' />
        </button>
        <button className='new-sidebar-btn' onClick={openViewSettingsModal}>
          <img src='http://localhost:8080/public/images/logo/logo_no_background.png' />
        </button>
      </div>
      {
        openedDrawingModal && <DrawingModal handleClose={() => setOpenedDrawingModal(false)} />
      }
      {
        openedViewSettingsModal && <ViewSettingsModal handleClose={() => setOpenedViewSettingsModal(false)} />
      }
    </>,
    document.getElementById('map') as HTMLElement
  );
};

export default NewSidebar;