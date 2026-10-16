// Ensure fetch has both getter and setter on Window and prototype chain
(function() {
  if (typeof window === 'undefined') return;
  try {
    let currentFetch = window.fetch;
    const defineAccessor = (target: any) => {
      try {
        Object.defineProperty(target, 'fetch', {
          get: () => currentFetch,
          set: (fn: any) => { currentFetch = fn; },
          configurable: true,
          enumerable: true
        });
      } catch {}
    };

    if (typeof Window !== 'undefined' && Window.prototype) {
      defineAccessor(Window.prototype);
    }
    let curr: any = window;
    while (curr) {
      const desc = Object.getOwnPropertyDescriptor(curr, 'fetch');
      if (desc && (!desc.writable || !desc.set)) {
        defineAccessor(curr);
      }
      curr = Object.getPrototypeOf(curr);
    }
    defineAccessor(window);
    if (typeof globalThis !== 'undefined' && globalThis !== window) {
      defineAccessor(globalThis);
    }
  } catch {}
})();

import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
