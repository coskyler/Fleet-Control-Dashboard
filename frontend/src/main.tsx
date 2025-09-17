import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter} from 'react-router-dom';
import './index.css'
import App from './App.tsx'
import { WebSocketProvider } from './websocket/WebSocketContext.tsx';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <WebSocketProvider>
        <App />
      </WebSocketProvider>
    </BrowserRouter>
  </StrictMode>
)
