import { ChangeEvent, FC, MouseEvent, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { selectMap } from '../../store/mapSlice';
import { RootState } from '../../store/store';
import Select from '../Select';

interface Props {
  onClose: () => void;
}

const MapSelectPanel: FC<Props> = ({ onClose }) => {

  const dispatch = useDispatch();

  const { maps, selectedMap } = useSelector((state: RootState) => ({
    maps: Object.keys(state.Map.maps).map(id => id.slice(3)),
    selectedMap: state.Map.selectedMap,
  }));

  // const handleMap = (event: ChangeEvent<HTMLSelectElement>) => {
  //   dispatch(selectMap(event.target.value));
  // };

  const handleMap = (event: MouseEvent<HTMLButtonElement>) => {
    dispatch(selectMap(event.currentTarget.textContent as string));
    onClose();
  };

  return (
    <div 
      className='sidebar-panel' 
      style={{ 
        top: '50px',
        backgroundColor: '#46464B',
        height: '60px',
        gap: '0',
        flexDirection: 'row',
        padding: 0,
        borderLeft: '1px solid #000',
      }}
    >
      {/* <h2>Выбор виджета</h2>
      <div className='selector'>
        <span>Виджет</span>
        <Select data={maps} value={selectedMap} noneField='' onChange={handleMap} />
      </div> */}
      {
        maps.map(m => (
          <button 
            key={m}
            className={`menu-btn${m === selectedMap ? ' menu-btn-active' : ''}`} 
            style={{ width: '60px' }}
            onClick={handleMap}
          >
            { m }
          </button>
        ))
      }
    </div>
  );
};

export default MapSelectPanel;