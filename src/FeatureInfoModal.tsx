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

  const { featureInfo, featureFields, featureInfoID  } = useSelector((state: RootState) => ({
    featureInfo: state.featuresData.data[state.sidebar[Number(divID.slice(3))].featureInfoID],
    featureFields: state.featuresData.fields[state.sidebar[Number(divID.slice(3))].featureInfoID],
    featureInfoID: state.sidebar[Number(divID.slice(3))].featureInfoID,
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

  return createPortal(
    <>
      {
        (featureInfoID !== -1 && featureInfo) &&
          <div className='feature-info-modal'>
            {
              Object.keys(featureInfo).map((f) => (
                featureFields[f] ? <div>{f}: { Number.isInteger(featureInfo[f]) ? featureInfo[f] : featureInfo[f].toFixed(3) }</div> : null
              ))
            }
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