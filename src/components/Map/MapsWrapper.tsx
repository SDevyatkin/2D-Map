import { FC, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { changePinObjects } from '../../store/pinObjectsSlice';
import { RootState } from '../../store/store';
import MapCreator from './MapCreator';
import WebSocketConnection from './WebSocketConnection';

interface Props {
  shift: boolean;
}

interface IDivSize {
  top: number;
  left: number;
  width: number;
  height: number;
}

const clientWidth = Math.ceil(document.documentElement.clientWidth / 2);
const clientHeight = Math.ceil((document.documentElement.clientHeight - 50) / 2);

const defaultSizes: IDivSize[] = [
  {
    top: 0,
    left: 0,
    width: clientWidth,
    height: clientHeight,
  },
  {
    top: 0,
    left: clientWidth + 5,
    width: 100,
    height: clientHeight,
  },
  {
    top: clientHeight + 5,
    left: 0,
    width: clientWidth,
    height: 100,
  },
  {
    top: clientHeight + 5,
    left: clientWidth + 5,
    width: 100,
    height: 100
  }
];

const MapsWrapper: FC<Props> = ({ shift }) => {

  const { selectedMap, widgetsLayout } = useSelector((state: RootState) => ({
    selectedMap: state.Map.selectedMap,
    widgetsLayout: state.widgetSettings.widgetsLayout,
  }));

  const [vSplitterTop, setVSplitterTop] = useState<number>(0);
  const [vSplitterLeft, setVSplitterLeft] = useState<number>(0);
  const [hSplitterTop, setHSplitterTop] = useState<number>(0);
  const [hSplitterLeft, setHSplitterLeft] = useState<number>(0);

  const [horisontalMove, setHorisontalMove] = useState<boolean>(false);
  const [verticalMove, setVerticalMove] = useState<boolean>(false);
  const [divSizes, setDivSizes] = useState<IDivSize[]>(defaultSizes);

  useEffect(() => {
    switch (widgetsLayout) {
      case '1':
        setVSplitterTop(0);
        setVSplitterLeft(0);
        setHSplitterTop(0);
        setHSplitterLeft(0);
        break;
      case '2v':
        break;
      case '2h':
        break;
      case '3t':
        break;
      case '3b':
        break;
      case '3l':
        break;
      case '3r':
        break;
      case '4':
        setVSplitterTop(0);
        setVSplitterLeft(shift ? divSizes[0].width + 60 : divSizes[0].width);
        setHSplitterTop(divSizes[0].height);
        setHSplitterLeft(0);
        break;
    }
  }, [widgetsLayout]);

  const mouseMoveHandler = (e: React.MouseEvent) => {
    if (horisontalMove && e.clientY < (clientHeight * 2) - 380 && e.clientY > 380) {
      // console.log(e.clientY);
      // console.log(clientHeight);
      const dy = e.clientY - divSizes[0].height;

      const newSizes = [...divSizes];
      newSizes[0].height += dy;
      newSizes[1].height += dy;

      newSizes[2].top = newSizes[0].height + 5;
      newSizes[3].top = newSizes[1].height + 5;

      newSizes[2].height -= newSizes[0].height - divSizes[0].height;
      newSizes[3].height -= newSizes[1].height - divSizes[1].height;
      setDivSizes(newSizes);
    } else if (verticalMove && e.clientX < (clientWidth * 2) - 650 && e.clientX > 650) {
      // console.log(e.clientX);
      // console.log(clientWidth * 2);
      const dx = shift ? e.clientX - divSizes[0].width - 60 : e.clientX - divSizes[0].width;

      const newSizes = [...divSizes];
      newSizes[0].width += dx;
      newSizes[2].width += dx;

      newSizes[1].left = newSizes[0].width + 5;
      newSizes[3].left = newSizes[2].width + 5;

      newSizes[1].width -= newSizes[0].width - divSizes[0].width;
      newSizes[3].width -= newSizes[2].width - divSizes[2].width;
      setDivSizes(newSizes);
    };
  };

  return (
    <>
      <div
        className="maps-wrapper"
        onMouseUp={() => {
          setHorisontalMove(false);
          setVerticalMove(false);
        }}
        onMouseMove={mouseMoveHandler}
        draggable={false}
      >
        <div
          id="map1"
          className="map"
          style={{
            top: `${divSizes[0].top}px`,
            left: `${shift ? divSizes[0].left + 60 : divSizes[0].left}px`,
            width: `${divSizes[0].width}px`,
            height: `${divSizes[0].height}px`,
            border: (selectedMap === '1' && shift) ? '4px solid #0197F6' : 'none',
          }}
          draggable={false}
        >
          <div 
            className='mapID' 
            style={{ backgroundColor: (selectedMap === '1' && shift) ? 'rgba(1, 151, 246, 0.6)' : '' }}
          >
            1
          </div>
        </div>
        <div
          id="map2"
          className="map"
          style={{
            top: `${divSizes[1].top}px`,
            left: `${shift ? divSizes[1].left + 60 : divSizes[1].left}px`,
            right: 0,
            height: `${divSizes[1].height}px`,
            border: (selectedMap === '2' && shift) ? '4px solid #0197F6' : 'none',
          }}
          draggable={false}
        >
          <div 
            className='mapID' 
            style={{ backgroundColor: (selectedMap === '2' && shift) ? 'rgba(1, 151, 246, 0.6)' : '' }}
          >
            2
          </div>
        </div>
        <div
          id="map3"
          className="map"
          style={{
            top: `${divSizes[2].top}px`,
            left: `${shift ? divSizes[2].left + 60 : divSizes[2].left}px`,
            width: `${divSizes[2].width}px`,
            height: `auto`,
            border: (selectedMap === '3' && shift) ? '4px solid #0197F6' : 'none',
          }}
          draggable={false}
        >
          <div 
            className='mapID' 
            style={{ backgroundColor: (selectedMap === '3' && shift) ? 'rgba(1, 151, 246, 0.6)' : '' }}
          >
            3
          </div>
        </div>
        <div
          id="map4"
          className="map"
          style={{
            top: `${divSizes[3].top}px`,
            left: `${shift ? divSizes[3].left + 60 : divSizes[3].left}px`,
            width: `auto`,
            height: `auto`,
            border: (selectedMap === '4' && shift) ? '4px solid #0197F6' : 'none',
          }}
          draggable={false}
        >
          <div 
            className='mapID' 
            style={{ backgroundColor: (selectedMap === '4' && shift) ? 'rgba(1, 151, 246, 0.6)' : '' }}
          >
            4
          </div>
        </div>
        <div
          className="splitter-v"
          onMouseDown={(e) => setVerticalMove(true)}
          style={{
            top: 0,
            left: `${shift ? divSizes[0].width + 60 : divSizes[0].width}px`,
            height: '100%',
          }}
        ></div>
        <div
          className="splitter-h"
          onMouseDown={() => setHorisontalMove(true)}
          // onMouseLeave={() => setHorisontalMove(false)}
          // onMouseUp={() => setHorisontalMove(false)}
          // onMouseMove={horisontalSpliterMoveHandler}
          style={{
            top: `${divSizes[0].height}px`,
            left: 0,
            width: '100%',
          }}
        ></div>
      </div>
      <WebSocketConnection />
      <MapCreator divID='map1' />
      <MapCreator divID='map2' />
      <MapCreator divID='map3' />
      <MapCreator divID='map4' />
    </>
  );
}


export default MapsWrapper;