import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

import './style.scss';

import './services/ipc.service';

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
    <React.StrictMode>
        <App />
    </React.StrictMode>
);

postMessage({ payload: 'removeLoading' }, '*');
