import { ChangeEvent, FC, memo, useState } from 'react';
import arrow from '../../assets/arrow.png';
import { useDispatch } from 'react-redux';
import { setField } from '../../store/featuresDataSlice';

interface Props {
  fields: any;
  object: number;
}

const FieldsDropdown: FC<Props> = ({ fields, object }) => {
  const [fieldsExpanded, setFieldsExpanded] = useState<boolean>(false);

  const dispatch = useDispatch();

  const handleFieldCheckbox = (event: ChangeEvent<HTMLInputElement>) => {
    dispatch(setField({
      object,
      field: event.target.id,
      checked: event.target.checked,
    }));
  };

  return (
    <>
      <div className='selector'>
        <span>Поля</span>
        <button onClick={() => setFieldsExpanded(prev => !prev)}>
          <img 
            src={arrow} 
            width={13} 
            height={13} 
            style={{ transform: `rotate(${fieldsExpanded ? "90" : "0"}deg)` }} 
          />
        </button>
      </div>
      <div className='fields-checkboxes' style={{ display: fieldsExpanded ? "grid" : "none" }}>
        {
          Object.keys(fields).map(f => (
            <div key={f}>
              <input id={f} type="checkbox" checked={fields[f]} onChange={handleFieldCheckbox} />
              <label htmlFor={f}>{f}</label>
            </div>
          ))
        }
      </div>
    </>
  );
};

export default memo(FieldsDropdown);