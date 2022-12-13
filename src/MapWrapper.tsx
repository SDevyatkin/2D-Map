import { height, width } from '@mui/system';
import { FC, useState } from 'react';
import MapsCreator from './MapsCreator';

interface IDivSize {
  top: number;
  left: number;
  width: number;
  height: number;
}

const defaultSizes: IDivSize[] = [
  {
    top: 0,
    left: 0,
    width: 500,
    height: 500
  },
  {
    top: 0,
    left: 510,
    width: 100,
    height: 500
  },
  {
    top: 510,
    left: 0,
    width: 500,
    height: 100
  },
  {
    top: 510,
    left: 510,
    width: 100,
    height: 100
  }
];

const MapsWrapper: FC = () => {
  const [horisontalMove, setHorisontalMove] = useState<boolean>(false);
  const [verticalMove, setVerticalMove] = useState<boolean>(false);
  const [divSizes, setDivSizes] = useState<IDivSize[]>(defaultSizes);

  const mouseMoveHandler = (e: React.MouseEvent) => {
    if (horisontalMove && e.clientY < 900) {
      const dy = e.clientY - divSizes[0].height;

      const newSizes = [...divSizes];
      newSizes[0].height += dy;
      newSizes[1].height += dy;

      newSizes[2].top = newSizes[0].height + 10;
      newSizes[3].top = newSizes[1].height + 10;

      newSizes[2].height -= newSizes[0].height - divSizes[0].height;
      newSizes[3].height -= newSizes[1].height - divSizes[1].height;
      setDivSizes(newSizes);
    } else if (verticalMove && e.clientX < 1200) {
      const dx = e.clientX - divSizes[0].width;

      const newSizes = [...divSizes];
      newSizes[0].width += dx;
      newSizes[2].width += dx;

      newSizes[1].left = newSizes[0].width + 10;
      newSizes[3].left = newSizes[2].width + 10;

      newSizes[1].width -= newSizes[0].width - divSizes[0].width;
      newSizes[3].width -= newSizes[2].width - divSizes[2].width;
      setDivSizes(newSizes);
    }

    // const map1 = document.getElementById('map1') as HTMLDivElement;
    // map1.querySelector('canvas')?.setAttribute('style', `width:100%;height:100%`);
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
      >
        <div
          id="map1"
          className="map"
          style={{
            top: `${divSizes[0].top}px`,
            left: `${divSizes[0].left}px`,
            width: `${divSizes[0].width}px`,
            height: `${divSizes[0].height}px`
          }}
        ></div>
        <div
          id="map2"
          className="map"
          style={{
            top: `${divSizes[1].top}px`,
            left: `${divSizes[1].left}px`,
            right: 0,
            height: `${divSizes[1].height}px`
          }}
        ></div>
        <div
          id="map3"
          className="map"
          style={{
            top: `${divSizes[2].top}px`,
            left: `${divSizes[2].left}px`,
            width: `${divSizes[2].width}px`,
            height: `auto`
          }}
        ></div>
        <div
          id="map4"
          className="map"
          style={{
            top: `${divSizes[3].top}px`,
            left: `${divSizes[3].left}px`,
            width: `auto`,
            height: `auto`
          }}
        ></div>
        <div
          className="splitter-v"
          onMouseDown={(e) => setVerticalMove(true)}
          style={{
            left: `${divSizes[0].width}px`,
            height: '100vh',
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
            width: '100vw',
          }}
        ></div>
      </div>
      <MapsCreator width={divSizes[0].width} height={divSizes[0].height} />
    </>
  );
}


export default MapsWrapper;