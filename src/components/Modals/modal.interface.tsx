import { ReactNode } from 'react';

export interface ModalProps {
  handleClose: () => void;
}

export interface OverlayProps {
  handleClose: () => void;
  children: ReactNode;
}