import { Tooltip } from '@mui/material';
import { FC, ReactElement, ReactNode } from 'react';

interface Props {
  title: string;
  children: ReactElement<any, any>;
}

const CommonTooltip: FC<Props> = ({ title, children }) => {

  return (
    <Tooltip title={title}>
      { children && children }
    </Tooltip>
  );
};

export default CommonTooltip;