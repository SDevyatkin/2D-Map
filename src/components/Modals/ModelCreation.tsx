import { Tooltip } from '@mui/material';
import { ChangeEvent, FC, MouseEvent, useEffect, useState } from 'react';
import { saveNewPolygonIcon } from '../../api';
import { DetectPolygonManager } from '../../DetectPolygonManager';
import { ModalProps } from './modal.interface';
import ModalOverlay from './ModalOverlay';
import close from '../../assets/close.png';
import CommonTooltip from '../../CommonTooltip';

const ModelCreation: FC = () => {

  const [polygonManager, setPolygonManager] = useState<DetectPolygonManager | undefined>();
  const [pixelWidth, setPixelWidth] = useState<number>(20);
  const [meterWidth, setMeterWidth] = useState<number>(100);
  const [modelName, setModelName] = useState<string>('');

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

  const handleModelName = (event: ChangeEvent<HTMLInputElement>) => {
    setModelName(event.target.value);
  };

  const saveModel = () => {
    const points = [];
    const center = polygonManager?.getPolygonCenter() as number[];

    for (let point of polygonManager?.getPolygonPoints() as number[][]) {
      points.push([...point]);
    }

    points.map(point => {
      point[0] = (point[0] - center[0]) * (meterWidth / pixelWidth);
      point[1] = (point[1] - center[1]) * (meterWidth / pixelWidth);
    });

    saveNewPolygonIcon(modelName, points);
  };

  const stopPropagation = (event: MouseEvent) => event.stopPropagation();

  return (
    // <ModalOverlay handleClose={handleClose} >
    //   <div className='modal' onClick={stopPropagation}>
      <>
        <canvas id='polygonManager' width={900} height={700} />
        <div className='canvas-settings'>
          <div className='canvas-slider'>
            <CommonTooltip
              title='Размер клетки поля в пикселях'
            >
              <input type='range' id='gridStep' name='volume' min={10} max={80} value={pixelWidth} step={10} onChange={handleRange} />
            </CommonTooltip>
            <span>Ширина клетки в пикселях {pixelWidth}</span>
          </div>
          <div className='canvas-slider'>
            <CommonTooltip
              title='Количество метров содержащихся в одной клетке поля.'
            >
              <input type='range' id='meterSize' name='meterSize' min={1} max={1000} value={meterWidth} step={1} onChange={handleRange} />
            </CommonTooltip>
            <span>Ширина клетки в метрах {meterWidth}</span>
          </div>
          <div className='canvas-create'>
            <span>Имя модели</span>
            <CommonTooltip
              title='Поле для ввода имени создаваемой иконки.'
            >
              <input type='text' value={modelName} onChange={handleModelName} />
            </CommonTooltip>
            <CommonTooltip
              title='Сохранить иконку.'
            >
              <button className='primary-btn sidebar-btn' onClick={saveModel} disabled={!modelName}>Сохранить</button>
            </CommonTooltip>
          </div>
        </div>
      </>
    //  </div>
    //</ModalOverlay>
  );
};

export default ModelCreation;