import { ChangeEvent, FC } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { selectDrawingMode } from '../../store/drawingSettingsSlice';
import { RootState } from '../../store/store';
import Select from '../Select';
import ModalOverlay from './ModalOverlay';

const DrawingModal: FC<{ handleClose: () => void }> = ({ handleClose }) => {

  const dispatch = useDispatch();

  const { Map, drawingModes, selectedDrawingMode } = useSelector((state: RootState) => ({
    Map: state.Map.map,
    drawingModes: state.drawingSettings.options,
    selectedDrawingMode: state.drawingSettings.selected,
  }));

  const onChange = (event: ChangeEvent<HTMLSelectElement>) => {
    dispatch(selectDrawingMode(event.target.value));
    Map.changeInteractions(event.target.value);
  };

  return (
    <ModalOverlay mini={true} handleClose={handleClose}>
      <div className='modal mini-modal'>
        <div className='mini-modal-label'>Режим</div>
        <Select data={Object.entries(drawingModes)} value={selectedDrawingMode} noneField='Выкл' onChange={onChange} />
        <div className='buttons'> 
          <button className='primary-btn sidebar-btn' onClick={() => Map.cleanDrawSource()}>очистить</button>
          <button className='primary-btn sidebar-btn' onClick={() => Map.drawLine()}>построить маршрут</button>
        </div>
      </div>
    </ModalOverlay>
  );
};

export default DrawingModal;