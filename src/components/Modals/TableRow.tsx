import { FC } from 'react';
import { IMarkerSettings } from '../../store/modelSettingsSlice';

export interface TableRowProps {
  data: [
    string, 
    {
      image: string,
      size: number,
      alpha: number,
      polygonModel: string,
    },
  ];
  index: number;
}

const TableRow: FC<TableRowProps> = ({ data, index }) => {

  return (
    <div className='table-row' style={{backgroundColor: index % 2 === 0 ? '#D9D6D5' : '#818D92' }}>
      <div>{ data[0] }</div>
      <div>{ data[1].image }</div>
      <div>{ data[1].size }</div>
      <div>{ data[1].alpha }</div>
      <div>{ data[1].polygonModel }</div>
    </div>
  );
};

export default TableRow;