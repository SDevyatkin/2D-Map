import { FC, MouseEvent } from 'react';
import { createPortal } from 'react-dom';
import { OverlayProps } from './modal.interface';

const ModalOverlay: FC<OverlayProps> = ({ mini, handleClose, children }) => {

  return (
    createPortal(<div className='modal-wrapper' onClick={handleClose}>
      {/* <div className='modal-helper' style={mini ? styles : {}} onClick={(event: MouseEvent) => event.stopPropagation()}>
        { children }
        <button className='primary-btn close-btn' onClick={handleClose}>+</button>
      </div> */}
      { children }
    </div>, document.querySelector('.maps-wrapper') as HTMLElement)
  );
};

export default ModalOverlay;