import { DetailedHTMLProps, FC, SelectHTMLAttributes } from 'react';

interface SelectProps extends DetailedHTMLProps<SelectHTMLAttributes<HTMLSelectElement>, HTMLSelectElement> {
  data: any[],
  noneField: string,
};

const Select: FC<SelectProps> = ({ data, noneField, value, onChange }) => {

  return (
    <select style={{ marginBottom: '20px' }} value={value} onChange={onChange}>
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