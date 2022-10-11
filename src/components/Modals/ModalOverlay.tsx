import { FC, MouseEvent } from 'react';
import { OverlayProps } from './modal.interface';

const ModalOverlay: FC<OverlayProps> = ({ handleClose, children }) => {
  
  return (
    <div className='modal-wrapper' onClick={handleClose}>
      <div className='modal-helper' onClick={(event: MouseEvent) => event.stopPropagation()}>
        { children }
        <button className='primary-btn close-btn' onClick={handleClose}>+</button>
      </div>
    </div>
  );
};

export default ModalOverlay;