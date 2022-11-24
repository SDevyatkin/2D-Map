import { FC, SetStateAction, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { useSelector } from 'react-redux';
import { mapObjectType } from './components/Map/Map.interface';
import { RootState } from './store/store';

const FeatureInfoModal: FC = () => {

  const [info, setInfo] = useState<any | null>(null);

  const Map = useSelector((state: RootState) => state.Map.map);
;

  useEffect(() => {
    setInterval(() => setInfo(Map.getFeatureInfo()), 20)
  });
  
  return createPortal(
    <>
      {
        info !== null &&
          <div className='feature-info-modal'>
            <div>Номер объекта: {info.id}</div>
            <div>Тип объекта: {info.type}</div>
            <div>Широта: {info.latitude.toFixed(3)}</div>
            <div>Долгота: {info.longitude.toFixed(3)}</div>
            <div>Высота: {info.yaw.toFixed(3)}</div>
          </div>
      }
    </>,
    document.getElementById('map') as HTMLElement
  );
};

export default FeatureInfoModal;