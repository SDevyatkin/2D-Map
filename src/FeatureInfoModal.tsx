import { FC, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { useSelector } from 'react-redux';
import { RootState } from './store/store';
import close from './assets/close.png';

interface IFeatureInfo {
  id: number;
  type: number;
  state?: 0 | 1 | 2;
  longitude: number;
  latitude: number;
  yaw: number;
  altitude: number;
  parentID: number;
}

interface Props {
  divID: string;
}

const FeatureInfoModal: FC<Props> = ({ divID }) => {

  const [info, setInfo] = useState<IFeatureInfo>();

  const { Map, featureInfo } = useSelector((state: RootState) => ({
    Map: state.Map.maps[divID],
    featureInfo: state.featuresData.data,
  }));

  useEffect(() => {
    setInfo(featureInfo[Map.getFeatureInfoID()]);
  }, [featureInfo]);
  
  const handleClose = () => {
    Map.setFeatureInfoID();
  };

  return createPortal(
    <>
      {
        info &&
          <div className='feature-info-modal'>
            <div>Номер объекта: {info.id}</div>
            <div>Тип объекта: {info.type}</div>
            <div>Широта: {info.latitude.toFixed(3)}</div>
            <div>Долгота: {info.longitude.toFixed(3)}</div>
            <div>Высота: {info.yaw.toFixed(3)}</div>
            <button className='close-btn' onClick={handleClose}>
              <img src={close} width={15} height={15} />
            </button>
          </div>
      }
    </>,
    document.getElementById(divID) as HTMLDivElement
  );
};

export default FeatureInfoModal;