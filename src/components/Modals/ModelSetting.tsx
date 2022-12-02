import { ChangeEvent, FC, MouseEvent, useContext, useEffect } from 'react';
import { ModalProps } from './modal.interface';
import ModalOverlay from './ModalOverlay';
import Select from '../Select';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../store/store';
import { changeImage, changeMarkerSettings, changeModel, changeOpacity, changeSize, changeType } from '../../store/modelSettingsSlice';
import { getImageNames, saveMarkerSettings } from '../../api';
import TableRow from './TableRow';
import KOK from '../../assets/images/Jet.png';

const ModelSetting: FC<ModalProps> = ({ handleClose }) => {

  console.log(KOK);

  const { type, image, size, opacity, model, imageNames, polygonModels, markerSettings } = useSelector((state: RootState) => state.modelSettings);
  const dispatch = useDispatch();

  const polygonModelNames = Object.keys(polygonModels);

  const handleTypeChange = (event: ChangeEvent<HTMLSelectElement>) => {
    dispatch(changeType(Number(event.target.value)));
  };

  const handleImageChange = (event: ChangeEvent<HTMLSelectElement>) => {
    dispatch(changeImage(event.target.value));
  };

  const handleSizeChange = (event: ChangeEvent<HTMLInputElement>) => {
    dispatch(changeSize(Number(event.target.value)));
  };

  const handleOpacityChange = (event: ChangeEvent<HTMLInputElement>) => {
    dispatch(changeOpacity(Number(event.target.value)));
  };

  const handleModelChange = (event: ChangeEvent<HTMLSelectElement>) => {
    dispatch(changeModel(event.target.value));
  };

  const saveModelSettings = () => {
    dispatch(changeMarkerSettings( { type, image, size, opacity, model }));
  };

  return (
    <ModalOverlay handleClose={handleClose}>
      <div className='modal' onClick={(event: MouseEvent) => event.stopPropagation()}>
        <div className='table'>
          {
            Object.entries(markerSettings).map((data, index) => <TableRow key={data[0]} data={data} index={index}/>)
          }
        </div>
        <div className='settings-item'>
          <span>Тип:</span>
          <Select value={type} data={Array.from({length: 200}, (_, i) => i + 200)} noneField='' onChange={handleTypeChange} /> 
        </div>
        <div className='settings-item'>
          <span>Изображение:</span>
          <Select value={image} data={imageNames} noneField='' onChange={handleImageChange} />
        </div>
        <img src={KOK} width={50} height={50} />
        {/* <img src={`/public/images/${image}`} width={50} height={50} /> */}
        <div className='settings-item'>
          <span>Размер:</span>
          <input type='number' value={size} step={0.05} onChange={handleSizeChange} />
        </div>
        <div className='settings-item'>
          <span>Прозрачность:</span>
          <input type='number' value={opacity} step={0.1} onChange={handleOpacityChange} />
        </div>
        <div className='settings-item'>
          <span>Модель:</span>
          <Select value={model} data={polygonModelNames} noneField='Нет' onChange={handleModelChange} />
        </div>
        <button className='primary-btn sidebar-btn' onClick={saveModelSettings}>Сохранить модель</button>
        <button className='primary-btn close-btn' onClick={handleClose}>+</button>
      </div>
    </ModalOverlay>
  );
};

export default ModelSetting;