import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'
import { Buffer } from 'buffer';

// Polyfill Buffer for browser (required by @react-pdf/renderer's dependencies)
window.Buffer = window.Buffer || Buffer;
if (typeof global === 'undefined') {
  (window as any).global = window;
}
(window as any).globalThis = window;
globalThis.Buffer = Buffer;

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
