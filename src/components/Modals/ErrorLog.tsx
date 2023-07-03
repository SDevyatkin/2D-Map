import { FC, MouseEvent, useEffect } from 'react';
import ModalOverlay from './ModalOverlay';
import close from '../../assets/close.png';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../store/store';
import { pushError } from '../../store/errorLogSlice';
import ErrorMessage from './ErrorMessage';

interface Props {
  handleClose: () => void;
}

const ErrorLog: FC<Props> = ({ handleClose }) => {

  const dispatch = useDispatch();

  const errors = useSelector((state: RootState) => state.errorLog.mergedErrors);

  // useEffect(() => {
  //   setInterval(() => {
  //     dispatch(pushError(new RangeError('Out of range ERROR!')));
  //   }, 3000);
  // }, []);

  const stopPropagation = (event: MouseEvent) => event.stopPropagation();

  return (
    <ModalOverlay handleClose={handleClose}>
      <div className='modal error-log' onClick={stopPropagation}>
        <div className='modal-heading'>
          Журнал ошибок
        </div>
        <button className='primary-btn close-btn' onClick={handleClose}>
          <img src={close} width={22} height={22} />
        </button>
        <div className='error-messages'>
          {
            errors.map(error => (
              <ErrorMessage 
                key={error.dateFrom.toString() + error.dateTo.toString()} 
                error={error} 
                // date={error.date} 
              />
            ))
          }
        </div>
      </div>
    </ModalOverlay>
  );
};

export default ErrorLog;