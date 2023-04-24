import { Button } from '@mui/material';
import { styled } from '@mui/material/styles';

interface StyledButtonProps {
  height?: number;
  imagesize?: number;
  isactive?: boolean;
}

export const StyledButton = styled(Button)(({ height = 60, imagesize = 40, isactive = false }: StyledButtonProps) => ({
  // display: 'block',
  color: '#FFF',
  fontSize: '24px',
  // textAlign: 'center',
  minWidth: '60px',
  width: '60px',
  height: `${height}px`,
  padding: 0,
  borderRadius: 0,
  backgroundColor: isactive ? 'rgba(255, 255, 255, 0.2)' : 'none',
  '&:hover': {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  '&& .MuiTouchRipple-child': {
    backgroundColor: '#46464B',
  },
  '& img': {
    width: `${imagesize}px`,
    height: `${imagesize}px`,
    zIndex: 4,
  }
}));


export const InstrumentsButton = styled(Button)(() => ({
  width: 'auto',
  height: '25px',
  color: "#333",
  backgroundColor: "#FFF",
  textTransform: 'uppercase',
  borderRadius: '25px',
  '&:hover': {
    backgroundColor: '#DDD',
  },
  '&& .MuiTouchRipple-child': {
    backgroundColor: '#EEE',
  },
}));