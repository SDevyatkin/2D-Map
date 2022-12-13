import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { StrictMode } from 'react';
import { Provider } from 'react-redux';
import { store } from './store/store';
import MapsWrapper from './MapWrapper';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(
  <StrictMode>
    {/* <MapsWrapper /> */}
    <Provider store={store} >
      <App />
    </Provider>
  </StrictMode>
);
