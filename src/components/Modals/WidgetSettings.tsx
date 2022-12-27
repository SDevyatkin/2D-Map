import { FC } from 'react';
import win1 from '../../assets/win1.svg';
import win2v from '../../assets/win2v.svg';
import win2h from '../../assets/win2h.svg';
import win3t from '../../assets/win3t.svg';
import win3b from '../../assets/win3b.svg';
import win3l from '../../assets/win3l.svg';
import win3r from '../../assets/win3r.svg';
import win4 from '../../assets/win4.svg';

interface Props {
  handleClose: () => void;
}

const WidgetSettings: FC<Props> = ({ handleClose }) => {

  return (
    <div className='mini-modal'>
        <button>
          <img src={win1}  />
        </button>
        <button>
          <img src={win2v}  />
        </button>
        <button>
          <img src={win2h}  />
        </button>
        <button>
          <img src={win3t}  />
        </button>
        <button>
          <img src={win3b} />
        </button>
        <button>
          <img src={win3l}  />
        </button>
        <button>
          <img src={win3r}  />
        </button>
        <button>
          <img src={win4} />
        </button>
      </div>
  );
};

export default WidgetSettings;