import { ChangeEvent, FC, MouseEvent, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { selectMap } from '../../store/mapSlice';
import { RootState } from '../../store/store';
import { StyledButton } from '../../StyledButton';
import Select from '../Select';

interface Props {
  onClose: () => void;
}

const MapSelectPanel: FC<Props> = ({ onClose }) => {
  const dispatch = useDispatch();

  const maps = useSelector((state: RootState) => state.Map.maps);
  const selectedMap = useSelector((state: RootState) => state.Map.selectedMap);
  const widgetsLayout = useSelector((state: RootState) => state.widgetSettings.widgetsLayout);

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
        Object.keys(maps).map(id => id.slice(3)).filter(m => Number(m) <= Number(widgetsLayout[0])).map(m => (
          <StyledButton 
            key={m}
            isactive={m === selectedMap}
            onClick={handleMap}
          >
            { m }
          </StyledButton>
        ))
      }
    </div>
  );
};

export default MapSelectPanel;