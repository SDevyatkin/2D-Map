import { FC } from 'react';
import { ModalProps } from './modal.interface';
import ModalOverlay from './ModalOverlay';

const ModelCreation: FC<ModalProps> = ({ handleClose }) => {

  return (
    <ModalOverlay handleClose={handleClose} >
      <div className='modal'>ModelCreation</div>
    </ModalOverlay>
  );
};

export default ModelCreation;