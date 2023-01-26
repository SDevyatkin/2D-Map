import { ChangeEvent, FC, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../store/store';
import { HexColorPicker, HexColorInput } from 'react-colorful';
import { relative } from 'path';

interface Props {
  parentId: string;
  colorInput: string;
  sendColorInput?: (color: string) => void;
  sendColor: (color: string) => void;
}

const ColorInput: FC<Props> = ({ parentId, colorInput, sendColorInput, sendColor }) => {

  const [pickerOpened, setPickerOpened] = useState<boolean>(false);
  const [colorExample, setColorExample] = useState<string>('#000');

  const topPosition = document.getElementById(parentId)?.style.top;

  const handleColor = (event: ChangeEvent<HTMLInputElement>) => {
    const color = event.target.value.toUpperCase();

    sendColorInput && sendColorInput(color);

    if (color.length && color[0] !== '#') {
      setColorExample('#000');
      return;
    }

    if (color.length !== 4 && color.length !== 7) {
      setColorExample('#000');
      return;
    }

    for (let char of color.slice(1)) {
      const code = char.charCodeAt(0);

      if (!((code >= 48 && code <= 57) || (code >= 65 && code <= 70))) {
        setColorExample('#000');
        return;
      }
    }

    sendColor(color);
    setColorExample(color);
  };

  const handlePicker = (color: string) => {
    const upColor = color.toUpperCase();

    sendColor(upColor);
    sendColorInput && sendColorInput(upColor);
    setColorExample(upColor);
  };

  const handlePickerOpened = () => setPickerOpened(state => !state);

  return (
    <>
      <div className='color-input'>
        <span>Цвет (RGB)</span>
        <HexColorInput color={colorInput} onChange={handlePicker} placeholder='3-6 сиволов 0-F' />
        {/* <input type='text' value={colorInput} onChange={handleColor} maxLength={7} placeholder={'#цвет'} /> */}
        <div className='color-example' style={{ backgroundColor: colorExample }} onClick={handlePickerOpened}></div>
      </div>
      { 
        pickerOpened && 
        <HexColorPicker 
          style={{
            alignSelf: 'center',
          }}
          color={colorExample} 
          onChange={handlePicker} 
        /> 
      }
    </>
  );
};

export default ColorInput;