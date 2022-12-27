import { FC, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { changePinObjects } from '../../store/pinObjectsSlice';
import { RootState } from '../../store/store';
import MapCreator from './MapCreator';
import WebSocketConnection from './WebSocketConnection';

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

const MapsWrapper: FC = () => {

  const [horisontalMove, setHorisontalMove] = useState<boolean>(false);
  const [verticalMove, setVerticalMove] = useState<boolean>(false);
  const [divSizes, setDivSizes] = useState<IDivSize[]>(defaultSizes);

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
      const dx = e.clientX - divSizes[0].width;

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
            left: `${divSizes[0].left}px`,
            width: `${divSizes[0].width}px`,
            height: `${divSizes[0].height}px`,
          }}
          draggable={false}
        ></div>
        <div
          id="map2"
          className="map"
          style={{
            top: `${divSizes[1].top}px`,
            left: `${divSizes[1].left}px`,
            right: 0,
            height: `${divSizes[1].height}px`,
          }}
          draggable={false}
        ></div>
        <div
          id="map3"
          className="map"
          style={{
            top: `${divSizes[2].top}px`,
            left: `${divSizes[2].left}px`,
            width: `${divSizes[2].width}px`,
            height: `auto`,
          }}
          draggable={false}
        ></div>
        <div
          id="map4"
          className="map"
          style={{
            top: `${divSizes[3].top}px`,
            left: `${divSizes[3].left}px`,
            width: `auto`,
            height: `auto`,
          }}
          draggable={false}
        ></div>
        <div
          className="splitter-v"
          onMouseDown={(e) => setVerticalMove(true)}
          style={{
            left: `${divSizes[0].width}px`,
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