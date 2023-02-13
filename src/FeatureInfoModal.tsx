import { FC, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from './store/store';
import close from './assets/close.png';
import { setFeatureInfoID } from './store/sidebarSlice';

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

  // const [info, setInfo] = useState<IFeatureInfo>();
  const dispatch = useDispatch();

  const { featureInfo } = useSelector((state: RootState) => ({
    // Map: state.Map.maps[divID],
    // featureInfo: state.featuresData.data,
    featureInfo: state.featuresData.data[state.sidebar[Number(divID.slice(3))].featureInfoID]
  }));

  // useEffect(() => {
  //   setInfo(featureInfo[Map.getFeatureInfoID()]);
  // }, [featureInfo]);
  
  const handleClose = () => {
    dispatch(setFeatureInfoID({
      map: Number(divID.slice(3)),
      id: -1,
    }));
    // Map.setFeatureInfoID();
    // setInfo(undefined);
  };

  // console.log(info);
  // console.log(featureInfo);
  return createPortal(
    <>
      {
        featureInfo &&
          <div className='feature-info-modal'>
            <div>Номер объекта: {featureInfo.id}</div>
            <div>Тип объекта: {featureInfo.type}</div>
            <div>Широта: {featureInfo.latitude.toFixed(3)}</div>
            <div>Долгота: {featureInfo.longitude.toFixed(3)}</div>
            <div>Высота: {featureInfo.altitude.toFixed(3)}</div>
            <div>Рыскание: {featureInfo.yaw.toFixed(3)}</div>
            <button className='close-btn' onClick={handleClose}>
              <img src={close} width={15} height={15} />
            </button>
          </div>
      }
    </>,
    document.getElementById(divID)?.querySelector('.ol-viewport') as HTMLDivElement
  );
};

export default FeatureInfoModal;