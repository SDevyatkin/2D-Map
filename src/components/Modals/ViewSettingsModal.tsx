import { ChangeEvent, FC, MouseEvent } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { selectPinObject } from '../../store/pinObjectsSlice';
import { RootState } from '../../store/store';
import { changeZoomLevel } from '../../store/zoomLevelSlice';
import Select from '../Select';
import ModalOverlay from './ModalOverlay';

// const ViewSettingsModal: FC<{ handleClose: () => void }> = ({ handleClose })  => {

//   const dispatch = useDispatch();

//   const { Map, pinObjects, selectedPinObject, zoomLevel } = useSelector((state: RootState) => ({
//     Map: state.Map.map,
//     pinObjects: state.pinObjects.objects,
//     selectedPinObject: state.pinObjects.selected,
//     zoomLevel: state.zoomLevel.level,
//   }));

//   const handlePinObjectChange = (event: ChangeEvent<HTMLSelectElement>) => {
//     const value = event.target.value; 

//     dispatch(selectPinObject(value === null ? value : Number(value)));
//   };

//   const handleZoomLevelChange = (event: ChangeEvent<HTMLSelectElement>) => {
//     dispatch(changeZoomLevel(Number(event.target.value)));
//     Map.setZoomLevel(Number(event.target.value));
//   };

//   return (
//     <ModalOverlay mini={true} handleClose={handleClose}>
//       <div className='modal mini-modal' onClick={(event: MouseEvent) => event.stopPropagation()}>
//         <div className='mini-modal-label'>Центрирование</div>
//         <Select data={pinObjects} value={selectedPinObject} noneField='Свободно' onChange={handlePinObjectChange} /> 
//         <div className='mini-modal-label'>Масштаб</div>
//         <Select data={Array.from({length: 30}, (_, i) => i + 1)} noneField='' onChange={handleZoomLevelChange} />
//         <div className='checkbox'>
//           <input id='lock-view' type='checkbox' defaultChecked={true} />
//           <label htmlFor='lock-view'>Заблокировать вид</label>
//         </div>
//         <button className='primary-btn sidebar-btn'>сохранить настройки</button>
//         <button className='primary-btn close-btn' onClick={handleClose}>+</button>
//       </div>
//     </ModalOverlay>
//   );
// };

const ViewSettingsModal: FC<{ handleClose: () => void }> = ({ handleClose })  => {
  return (
    <></>
  );
};

export default ViewSettingsModal;