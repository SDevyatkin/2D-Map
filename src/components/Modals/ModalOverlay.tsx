import { FC, MouseEvent } from 'react';
import { OverlayProps } from './modal.interface';

const ModalOverlay: FC<OverlayProps> = ({ mini, handleClose, children }) => {

  return (
    <div className='modal-wrapper' onClick={handleClose}>
      {/* <div className='modal-helper' style={mini ? styles : {}} onClick={(event: MouseEvent) => event.stopPropagation()}>
        { children }
        <button className='primary-btn close-btn' onClick={handleClose}>+</button>
      </div> */}
      { children }
    </div>
  );
};

export default ModalOverlay;