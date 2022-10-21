import { FC } from 'react';
import { ModalProps } from './modal.interface';
import ModalOverlay from './ModalOverlay';
import Image from '../../assets/images/helicopter.png';

const ModelSetting: FC< ModalProps> = ({ handleClose }) => {

  return (
    <ModalOverlay handleClose={handleClose}>
      <div className='modal'>
        <div className='table'></div>
        <div className='settings-item'>
          <span>Тип:</span>
          <select>
            <option>200</option>
            <option>300</option>
            <option>400</option>
          </select>
        </div>
        <div className='settings-item'>
          <span>Изображение:</span>
          <select>
            <option>Jet</option>
            <option>Rocket</option>
            <option>Ship</option>
          </select>
        </div>
        <img src={Image} width={50} height={50} />
        <div className='settings-item'>
          <span>Размер:</span>
          <input type='number' defaultValue={0.25} step={0.05} />
        </div>
        <div className='settings-item'>
          <span>Прозрачность:</span>
          <input type='number' defaultValue={1} step={0.1} />
        </div>
        <div className='settings-item'>
          <span>Модель:</span>
          <select>
            <option>Jet</option>
            <option>Rocket</option>
            <option>Ship</option>
          </select>
        </div>
      </div>
    </ModalOverlay>
  );
};

export default ModelSetting;