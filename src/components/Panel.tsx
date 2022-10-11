import { FC, MouseEvent, useState } from 'react';
import logo from '../assets/logo.png';
import Sidebar from './Sidebar';

interface PanelProps {
  handleSidebar: (event: MouseEvent) => void;
}

const Panel: FC<PanelProps> = ({ handleSidebar }) => {

  return (
    <div className='header'>
      <img className='logo' src={logo} />
      <button className='primary-btn header-btn' onClick={handleSidebar}>Меню</button>
      
    </div>
  );
};

export default Panel;