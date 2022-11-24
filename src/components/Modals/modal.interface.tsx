import { ReactNode } from 'react';

export interface ModalProps {
  handleClose: () => void;
}

export interface OverlayProps {
  mini?: boolean;
  handleClose: () => void;
  children: ReactNode;
}