import { FC, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { changePinObjects } from '../../store/pinObjectsSlice';
import { RootState } from '../../store/store';
import MapCreator from './MapCreator';
import WebSocketConnection from './WebSocketConnection';
import CSS from 'csstype';
import { createPortal } from 'react-dom';
// import MapIdPortals from './MapIdPortals';

interface Props {
  shift: boolean;
}

interface IDivSize {
  top: number;
  left: number;
  width: number;
  height: number;
}

const clientWidth = document.documentElement.clientWidth / 2;
const clientHeight = (document.documentElement.clientHeight - 50) / 2;

const defaultSizes: IDivSize[] = [
  {
    top: 0,
    left: 0,
    // width: clientHeight,
    width: clientWidth,
    height: clientHeight,
  },
  {
    top: 0,
    // left: clientHeight,
    left: clientWidth + 5,
    width: 100,
    height: clientHeight,
  },
  {
    top: clientHeight + 5,
    left: 0,
    // width: clientHeight,
    width: clientWidth,
    height: 100,
  },
  {
    top: clientHeight + 5,
    // left: clientHeight,
    left: clientWidth + 5,
    width: 100,
    height: 100
  }
];

const MapsWrapper: FC<Props> = ({ shift }) => {
  
  const selectedMap = useSelector((state: RootState) => state.Map.selectedMap);
  const widgetsLayout = useSelector((state: RootState) => state.widgetSettings.widgetsLayout);

  // const { selectedMap, widgetsLayout } = useSelector((state: RootState) => ({
  //   selectedMap: state.Map.selectedMap,
  //   widgetsLayout: state.widgetSettings.widgetsLayout,
  // }));

  const [mapWidth, setMapWidth] = useState<number>(clientWidth - 2.5);
  const [mapHeight, setMapHeight] = useState<number>(clientHeight - 2.5);
  // const [vSplitterTop, setVSplitterTop] = useState<number>(0);
  // const [vSplitterLeft, setVSplitterLeft] = useState<number>(0);
  // const [vSplitterWidth, setVSplitterWidth] = useState<number>(0);
  const [vSplitterHeight, setVSplitterHeight] = useState<string>('0%');

  // const [hSplitterTop, setHSplitterTop] = useState<number>(0);
  // const [hSplitterLeft, setHSplitterLeft] = useState<number>(0);
  const [hSplitterWidth, setHSplitterWidth] = useState<string>('0%');
  // const [hSplitterHeight, setHSplitterHeight] = useState<number>(0);

  const [horisontalMove, setHorisontalMove] = useState<boolean>(false);
  const [verticalMove, setVerticalMove] = useState<boolean>(false);
  const [divSizes, setDivSizes] = useState<IDivSize[]>(defaultSizes);


  useEffect(() => {
    switch (widgetsLayout) {
      case '1':
        setVSplitterHeight('0%');
        setHSplitterWidth('0%');
        break;
      case '2v':
        setVSplitterHeight(`100%`);
        setHSplitterWidth('0%');
        break;
      case '2h':
        setVSplitterHeight('0%');
        setHSplitterWidth(`100%`);
        break;
      case '3t':
        setVSplitterHeight('0');
        setHSplitterWidth(`100%`);
        break;
      case '3b':
        setVSplitterHeight('2');
        setHSplitterWidth(`100%`);
        break;
      case '3l':
        setVSplitterHeight(`100%`);
        setHSplitterWidth('0');
        // console.log(hSplitterWidth, divSizes[0]);
        break;
      case '3r':
        setVSplitterHeight(`100%`);
        setHSplitterWidth('1');
        break;
      case '4':
        setVSplitterHeight(`100%`);
        setHSplitterWidth(`100%`);
        // setVSplitterHeight(clientHeight * 2);
        // setHSplitterWidth(clientWidth * 2);
        break;
    }
  }, [widgetsLayout]);
  // useEffect(() => {
  //   switch (widgetsLayout) {
  //     case '1':
  //       setVSplitterTop(0);
  //       setVSplitterLeft(0);
  //       setHSplitterTop(0);
  //       setHSplitterLeft(0);
  //       break;
  //     case '2v':
  //       setVSplitterTop(0);
  //       setVSplitterLeft(shift ? divSizes[0].width + 60 : divSizes[0].width);
  //       setHSplitterTop(0);
  //       setHSplitterLeft(0);
  //       break;
  //     case '2h':
  //       setVSplitterTop(0);
  //       setVSplitterLeft(0);
  //       setHSplitterTop(divSizes[0].height);
  //       setHSplitterLeft(0);
  //       break;
  //     case '3t':
  //       setVSplitterTop(0);
  //       setVSplitterLeft(shift ? divSizes[0].width + 60 : divSizes[0].width);
  //       setHSplitterTop(divSizes[0].height);
  //       setHSplitterLeft(0);
  //       break;
  //     case '3b':
  //       setVSplitterTop(divSizes[0].height);
  //       setVSplitterLeft(shift ? divSizes[0].width + 60 : divSizes[0].width);
  //       setHSplitterTop(divSizes[0].height);
  //       setHSplitterLeft(0);
  //       break;
  //     case '3l':
  //       setVSplitterTop(0);
  //       setVSplitterLeft(shift ? divSizes[0].width + 60 : divSizes[0].width);
  //       setHSplitterTop(0);
  //       setHSplitterLeft(0);
  //       break;
  //     case '3r':
  //       setVSplitterTop(0);
  //       setVSplitterLeft(shift ? divSizes[0].width + 60 : divSizes[0].width);
  //       setHSplitterTop(0);
  //       setHSplitterLeft(shift ? divSizes[0].width + 60 : divSizes[0].width);
  //       break;
  //     case '4':
  //       setVSplitterTop(0);
  //       setVSplitterLeft(shift ? divSizes[0].width + 60 : divSizes[0].width);
  //       setVSplitterHeight(clientHeight * 2);

  //       setHSplitterTop(divSizes[0].height);
  //       setHSplitterLeft(0);
  //       setHSplitterWidth(shift ? clientWidth * 2 - 60 : clientWidth * 2);
  //       break;
  //   }
  // }, [widgetsLayout]);

  const mouseMoveHandler = (e: React.MouseEvent) => {
    if (horisontalMove && e.clientY < (clientHeight * 2) - 380 && e.clientY > 380) {
      // console.log(e.clientY);
      // console.log(clientHeight);
      const dy = e.clientY - divSizes[0].height;

      const newSizes = [...divSizes];
      newSizes[0].height += dy;
      newSizes[1].height += dy;
      setMapHeight(h => h + dy);

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
      setMapWidth(w => w + dx);

      newSizes[1].left = newSizes[0].width + 5;
      newSizes[3].left = newSizes[2].width + 5;

      newSizes[1].width -= newSizes[0].width - divSizes[0].width;
      newSizes[3].width -= newSizes[2].width - divSizes[2].width;
      setDivSizes(newSizes);
    };
  };

  const getWrapperStyles = () => {
    let templateAreas;
    // let templateColumns = `${mapWidth}px ${clientWidth * 2 - mapWidth}px`;
    // let templateRows;

    switch (widgetsLayout) {
      case '1':
        templateAreas = `
          'map1 map1'
          'map1 map1'
        `;
        break;
      case '2v':
        templateAreas = `
          'map1 map2'
          'map1 map2'
        `;
        break;
      case '2h':
        templateAreas = `
          'map1 map1'
          'map2 map2'
        `;
        break;
      case '3t':
        templateAreas = `
          'map1 map2'
          'map3 map3'
        `;
        break;
      case '3b':
        templateAreas = `
          'map1 map1'
          'map2 map3'
        `;
        break;
      case '3l':
        templateAreas = `
          'map1 map2'
          'map3 map2'
        `;
        break;
      case '3r':
        templateAreas = `
          'map1 map2'
          'map1 map3'
        `;
        break;
      case '4':
        templateAreas = `
          'map1 map2'
          'map3 map4'
        `;
        break;
    }

    const styles: CSS.Properties = {
      // width: shift ? 'calc(100vw - 60px)' : '100vw'
      gridTemplateAreas: templateAreas,
      // gridTemplateColumns: templateColumns,
      paddingLeft: shift ? '60px' : 0,
    };
  
    return styles;
  };

  const getVSplitterHeight = () => {
    switch (widgetsLayout) {
      case '3b':
        return `${clientHeight * 2 - divSizes[0].height}px`;
      case '3t':
        return `${divSizes[0].height}px`;
      default:
        return vSplitterHeight;
    }
  };

  const getHSplitterWidth = () => {
    switch (widgetsLayout) {
      case '3l':
        return `${divSizes[0].width}px`;
      case '3r':
        const width = clientWidth * 2 - divSizes[0].width;
        return `${shift ? width - 60 : width}px`;
      default:
        return shift ? `calc(${hSplitterWidth} - 60px)` : hSplitterWidth;
    }
  };

  const getVSplitterTop = () => {
    switch (widgetsLayout) {
      case '3b':
        return `${divSizes[0].height}px`;
      default:
        return 0;
    }
  };

  const getHSplitterLeft = () => {
    switch (widgetsLayout) {
      case '3r':
        return shift ? `${divSizes[0].width + 60}px` : `${divSizes[0].width}px`;
      default:
        return shift ? '60px' : 0;
    }
  };
  // console.log(mapHeight, clientHeight, document.documentElement.clientHeight);
  // console.log((widgetsLayout === '3t' || widgetsLayout === '3b') ? `calc(${divSizes[Number(vSplitterHeight)].height}px)` : vSplitterHeight);
  
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
        style={{
          ...getWrapperStyles(),
          gridTemplateColumns: `${mapWidth}px 1fr`,
          gridTemplateRows: `${mapHeight}px 1fr`,
        }}
      >
        {/* <div
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
        </div> */}
        <div
          className="splitter-v"
          onMouseDown={(e) => setVerticalMove(true)}
          style={{
            // top: `${vSplitterTop}px`,
            // left: `${vSplitterLeft}px`,
            // top: 0,
            top: getVSplitterTop(),
            left: `${shift ? mapWidth + 60 : mapWidth}px`,
            height: getVSplitterHeight(),
            // height: (widgetsLayout === '3t' || widgetsLayout === '3b') ? `calc(${divSizes[Number(vSplitterHeight)].height}px)` : vSplitterHeight,
          }}
        ></div>
        <div 
          id='map1'  
          style={{ 
            gridArea: 'map1',
            border: (selectedMap === '1' && shift) ? '3px solid rgba(1, 151, 246)' : 'none',
          }}
        ></div>
        <div 
          id='map2'
          className='map'
          style={{ 
            gridArea: 'map2',
            display: widgetsLayout !== '1' ? 'block' : 'none',
            border: (selectedMap === '2' && shift) ? '3px solid rgba(1, 151, 246)' : 'none',
          }}
        ></div>
        <div 
          id='map3' 
          style={{ 
            gridArea: 'map3',
            display: Number(widgetsLayout[0]) >= 3 ? 'block' : 'none',
            border: (selectedMap === '3' && shift) ? '3px solid rgba(1, 151, 246)' : 'none',
          }}
        ></div>
        <div 
          id='map4' 
          style={{ 
            gridArea: 'map4',
            display: widgetsLayout === '4' ? 'block' : 'none',
            border: (selectedMap === '4' && shift) ? '3px solid rgba(1, 151, 246)' : 'none',
          }}
        ></div>

        <div
          className="splitter-h"
          onMouseDown={() => setHorisontalMove(true)}
          // onMouseLeave={() => setHorisontalMove(false)}
          // onMouseUp={() => setHorisontalMove(false)}
          // onMouseMove={horisontalSpliterMoveHandler}
          style={{
            // top: `${hSplitterTop}px`,
            top: `${mapHeight}px`,
            left: getHSplitterLeft(),
            // left: shift ? '60px' : 0,
            // left: `${shift ? 60 : 0}px`,
            // left: `${hSplitterLeft}px`,
            width: getHSplitterWidth(),
            // width: (widgetsLayout === '3l' || widgetsLayout === '3r') ? `calc(${divSizes[Number(hSplitterWidth)].width}px)` : `calc(${hSplitterWidth} - ${shift ? '60px' : '0px'})`,
          }}
        ></div>
      </div>
      <WebSocketConnection />
      {/* <MapIdPortals selectedMap={selectedMap} sidebarOpened={shift} /> */}
      <MapCreator divID='map1' />
      <MapCreator divID='map2' />
      <MapCreator divID='map3' />
      <MapCreator divID='map4' />
      {/* { widgetsLayout !== '1' && <MapCreator divID='map2' /> }
      { Number(widgetsLayout[0]) > 2 && <MapCreator divID='map3' /> }
      { widgetsLayout === '4' && <MapCreator divID='map4' />} */}
    </>
  );
}


export default MapsWrapper;