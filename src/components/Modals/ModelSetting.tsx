import { FC } from 'react';
import { ModalProps } from './modal.interface';
import ModalOverlay from './ModalOverlay';

const ModelSetting: FC< ModalProps> = ({ handleClose }) => {

  return (
    <ModalOverlay handleClose={handleClose}>
      <div className='modal'>ModelSetting</div>
    </ModalOverlay>
  );
};

export default ModelSetting;