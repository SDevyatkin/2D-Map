import { ChangeEvent, FC, useContext, useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { selectPinObject } from '../../store/pinObjectsSlice';
import { RootState } from '../../store/store';
import { changeZoomLevel } from '../../store/zoomLevelSlice';
import { udpJsonDataType } from '../Map/Map.interface';
import Select from '../Select';

const MapSettingsPanel: FC = () => {

  const { Map, pinObjects, selectedPinObject, _pinObjects } = useSelector((state: RootState) => ({
    Map: state.mapSlice.map,
    pinObjects: state.pinObjects.objects,
    selectedPinObject: state.pinObjects.selected,
    zoomLevel: state.zoomLevel.level,
    _pinObjects: state.mapSlice.map?.getPinObjects(),
  }));


  const dispatch = useDispatch();

  const handlePinObjectChange = (event: ChangeEvent<HTMLSelectElement>) => {
    const value = event.target.value; 

    dispatch(selectPinObject(value === null ? value : Number(value)))
  };

  const handleZoomLevelChange = (event: ChangeEvent<HTMLSelectElement>) => {
    dispatch(changeZoomLevel(Number(event.target.value)));
    Map.setZoomLevel(Number(event.target.value));
  };

  // console.log(_pinObjects);

  return (
    <div className='sidebar-panel'>
      <h2>Карта</h2>
      <div className='selector'>
        <span>Центрирование</span>
        <Select value={selectedPinObject} data={pinObjects} noneField='Свободно' onChange={handlePinObjectChange} />
        <button className='primary-btn sidebar-btn update-btn'>{'\u21BA'}</button>
      </div>
      <div className='selector'>
        <span>Масштаб</span>
        <Select data={Array.from({length: 30}, (_, i) => i + 1)} noneField='' onChange={handleZoomLevelChange} />
      </div>
      <div className='buttons'>
        <button className='primary-btn sidebar-btn'>сохранить настройки</button>
      </div>
    </div>
  );
};

export default MapSettingsPanel;