import { ChangeEvent, FC, useEffect, useState } from 'react';
import { DetectPolygonManager } from '../../DetectPolygonManager';
import { ModalProps } from './modal.interface';
import ModalOverlay from './ModalOverlay';

const ModelCreation: FC<ModalProps> = ({ handleClose }) => {

  const [polygonManager, setPolygonManager] = useState<DetectPolygonManager | undefined>();
  const [pixelWidth, setPixelWidth] = useState<number>(20);
  const [meterWidth, setMeterWidth] = useState<number>(1);
  const [points, setPoints] = useState<string>('');

  const handleRange = (event: ChangeEvent<HTMLInputElement>) => {
    if (typeof polygonManager === 'undefined') return;
    if (event.target.id === 'gridStep') {
      setPixelWidth(event.target.valueAsNumber);
      polygonManager.setGridStep(event.target.valueAsNumber);
    } else if (event.target.id === 'meterSize') {
      setMeterWidth(event.target.valueAsNumber);
    } 
  };

  useEffect(() => {
    !polygonManager && setPolygonManager(new DetectPolygonManager());
  }, []);

  useEffect(() => {
    setPoints(polygonManager?.getPolygonPoints().join('\n') as string);
  }, [polygonManager]);

  const handlePoints = (event: ChangeEvent<HTMLTextAreaElement>) => {
    setPoints(event.target.value);
  };

  return (
    <ModalOverlay handleClose={handleClose} >
      <div className='modal'>
        <canvas id='polygonManager' width={900} height={700} />
        <div className='canvas-settings'>
          <div className='canvas-slider'>
            <input type='range' id='gridStep' name='volume' min={20} max={80} value={pixelWidth} step={10} onChange={handleRange} />
            <span>Ширина клетки в пикселях {pixelWidth}</span>
          </div>
          <div className='canvas-slider'>
            <input type='range' id='meterSize' name='meterSize' min={0.5} max={20} value={meterWidth} step={0.5} onChange={handleRange} />
            <span>Ширина клетки в метрах {meterWidth.toFixed(1)}</span>
          </div>
          <div className='canvas-create'>
            <span>Имя модели</span>
            <input type='text' />
            <button className='primary-btn sidebar-btn'>Сохранить</button>
          </div>
        </div>
      </div>
      {/* <div className='modal modal-canvas'>
        <div className='modal-column'>
          <canvas id='polygonManager' width={350} height={400} />
          <div className='modal-column-item'>
            <span>Настройки сетки:</span>
            <div>
              <input type='range' id='gridStep' name='volume' min={20} max={80} value={pixelWidth} step={10} onChange={handleRange} />
              <span>Ширина клетки в пикселях {pixelWidth}</span>
            </div>
            <div>
              <input type='range' id='meterSize' name='meterSize' min={0.5} max={20} value={meterWidth} step={0.5} onChange={handleRange} />
              <span>Ширина клетки в метрах {meterWidth.toFixed(1)}</span>
            </div>
          </div>
        </div>
        <div className='modal-column'>
          <div className='modal-column-item'>
            <textarea value={points} onChange={handlePoints} />
            <button className='primary-btn sidebar-btn'>Обновить</button>
          </div>
          <div className='modal-column-item'>
            <span>Имя модели</span>
            <input type='text' />
            <button className='primary-btn sidebar-btn'>Сохранить</button>
          </div>
        </div>
      </div> */}
    </ModalOverlay>
  );
};

export default ModelCreation;