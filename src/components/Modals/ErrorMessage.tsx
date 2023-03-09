import { FC } from 'react';
import { ErrorType, MergedErrorType } from '../../store/errorLogSlice';

interface Props {
  error: MergedErrorType;
}

const ErrorMessage: FC<Props> = ({ error }) => {

  const isSingle = error.count === 1;

  return (
    <div className='error-message'>
      <div className='error-message-heading'>
        <h4>{error.error.name}</h4>
        <span>
          {`${error.dateFrom.getHours()}:${error.dateFrom.getMinutes()}:${error.dateFrom.getSeconds()} ${error.dateFrom.getDate()}.${error.dateFrom.getMonth()}.${error.dateFrom.getFullYear()}`}
          {!isSingle && ` - ${error.dateTo.getHours()}:${error.dateTo.getMinutes()}:${error.dateTo.getSeconds()} ${error.dateTo.getDate()}.${error.dateTo.getMonth()}.${error.dateTo.getFullYear()}` }
        </span>
      </div>
      <div className='error-message-heading'>
        <p>{error.error.message}</p>
        {!isSingle && <span>{`x${error.count}`}</span>}
      </div>
    </div>
  );
};

export default ErrorMessage;