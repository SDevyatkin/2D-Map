import { ChangeEvent, FC, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { selectMap } from '../../store/mapSlice';
import { RootState } from '../../store/store';
import Select from '../Select';

const MapSelectPanel: FC = () => {

  const dispatch = useDispatch();

  const { maps, selectedMap } = useSelector((state: RootState) => ({
    maps: Object.keys(state.Map.maps).map(id => id.slice(3)),
    selectedMap: state.Map.selectedMap,
  }));

  const handleMap = (event: ChangeEvent<HTMLSelectElement>) => {
    dispatch(selectMap(event.target.value));
  };

  return (
    <div className='sidebar-panel'>
      <h2>Выбор виджета</h2>
      <div className='selector'>
        <span>Виджет</span>
        <Select data={maps} value={selectedMap} noneField='' onChange={handleMap} />
      </div>
    </div>
  );
};

export default MapSelectPanel;