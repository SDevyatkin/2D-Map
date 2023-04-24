import { ChangeEvent, FC, MouseEvent, useContext, useEffect } from 'react';
import { ModalProps } from './modal.interface';
import ModalOverlay from './ModalOverlay';
import Selector from '../Select';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../store/store';
import { changeImage, changeMarkerSettings, changeModel, changeModelColor, changeModelStroke, changeOpacity, changeSize, changeType, StrokeType } from '../../store/modelSettingsSlice';
import TableRow from './TableRow';
import close from '../../assets/close.png';
import { BASE_URL } from '../../api';
import CommonTooltip from '../../CommonTooltip';
import { InstrumentsButton } from '../../StyledButton';
import { HexAlphaColorPicker, HexColorInput } from 'react-colorful';

const modelStrokes = {
  'Сплошная': 'solid', 
  'Пунктирная': 'dashed',
};
const lines = ['Сплошная', 'Пунктирная', 'Штриховая', 'Штрихпунктирная', 'Волнистая'];

const ModelSetting: FC = () => {

  const { 
    type, image, size,
    opacity, model, modelStroke,
    modelColor, imageNames, 
    polygonModels, markerSettings, 
  } = useSelector((state: RootState) => state.modelSettings);
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

  const handleModelStrokeChange = (event: ChangeEvent<HTMLSelectElement>) => {
    dispatch(changeModelStroke(event.target.value as StrokeType));
  };

  const handleModelColorChange = (color: string) => {
    dispatch(changeModelColor(color));
  };

  const saveModelSettings = () => {
    dispatch(changeMarkerSettings( { type, image, size, opacity, model, modelStroke, modelColor }));
  };

  const stopPropagation = (event: MouseEvent) => event.stopPropagation();

  return (
    // <ModalOverlay handleClose={handleClose}>
    //   <div className='modal' onClick={stopPropagation}>
      <>
        <div className='table'>
          {
            Object.entries(markerSettings).map((data, index) => <TableRow key={data[0]} data={data} index={index}/>)
          }
        </div>
        <div className='settings-item'>
          <span>Тип:</span>
          <CommonTooltip
            title='Каждый объект на карте относится к определённому типу, т.е. установленные стили блудут применены ко всем объектам с этим типом.'
          >
            <div>
              <Selector value={type} data={Array.from({length: 200}, (_, i) => i + 200)} noneField='' onChange={handleTypeChange} /> 
            </div>
          </CommonTooltip>
        </div>
        <div className='settings-item'>
          <span>Изображение:</span>
          <CommonTooltip
            title='Изображение, которым будут обозначаться объекты на карте.'
          >
            <div>
              <Selector value={image} data={imageNames} noneField='' onChange={handleImageChange} />
            </div>
          </CommonTooltip>
        </div>
        <img src={`${BASE_URL}/public/images/${image}`} width={50} height={50} />
        <div className='settings-item'>
          <span>Размер:</span>
          <CommonTooltip
            title='Размер отображаемого на карте изображения.'
          >
            <input type='number' value={size} step={0.05} onChange={handleSizeChange} />
          </CommonTooltip>
        </div>
        <div className='settings-item'>
          <span>Прозрачность:</span>
          <CommonTooltip
            title='Степень прозрачности выбранного изображения (1 - полностью прозрачное, 0 - полностью не прозрачное).'
          >
            <input type='number' value={opacity} step={0.1} onChange={handleOpacityChange} />
          </CommonTooltip>
        </div>
        <div className='settings-item'>
          <span>Модель:</span>
          <CommonTooltip
            title='Пользовательская иконка, отображающаяся с реальными размерами на карте.'
          >
            <div>
              <Selector value={model} data={polygonModelNames} noneField='Нет' onChange={handleModelChange} />
            </div>
          </CommonTooltip>
        </div>
        { (model !== '' && model !== 'None') &&
          <>
            <div className='settings-item'>
              <span>Текстура линии:</span>
              <CommonTooltip
                title='Текстура линии выделения'
              >
                <div>
                  <Selector value={modelStroke} data={['Сплошная', 'Пунктирная']} noneField='' onChange={handleModelStrokeChange} />
                </div>
              </CommonTooltip>
            </div>
            <div className='settings-item'>
              <span>Цвет заливки:</span>
              <CommonTooltip
                title='Цвет заливки пользовательской двухмерной иконки'
              >
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <HexColorInput color={modelColor} onChange={handleModelColorChange} />
                  <HexAlphaColorPicker color={modelColor} onChange={handleModelColorChange} />
                </div>
              </CommonTooltip>
            </div>
            {/* <div className='settings-item'>
              <span>Прозрачность:</span>
              <CommonTooltip
                title='Прозрачность пользовательской двухмерной иконки'
              >
                <input type='number' value={modelOpacity} step={0.1} onChange={handleModelOpacityChange} />
              </CommonTooltip>
            </div> */}
          </>
        }
        <InstrumentsButton onClick={saveModelSettings}>
          Сохранить модель
        </InstrumentsButton>
      </>
    //   </div>
    // </ModalOverlay>
  );
};

export default ModelSetting;