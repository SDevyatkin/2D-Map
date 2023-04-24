import { ChangeEvent, DetailedHTMLProps, FC, SelectHTMLAttributes } from 'react';

interface SelectProps extends DetailedHTMLProps<SelectHTMLAttributes<HTMLSelectElement>, HTMLSelectElement> {
// interface SelectorProps {
  data: any[];
  noneField: string;
  // value: string | number;
  // onChange: (event: ChangeEvent<{ value: unknown }>) => void;
}

const Select: FC<SelectProps> = ({ data, noneField, value, onChange }) => {

  return (
    <select className='custom-select' value={value} onChange={onChange}>
      {
        noneField && <option value='None'>{ noneField }</option>
      }
      { 
        data.map(item => !Array.isArray(item) ? <option key={item} value={item}>{item}</option> : <option key={item[0]} value={item[0]}>{item[1]}</option>)
      }
    </select>
  );
};

export default Select;