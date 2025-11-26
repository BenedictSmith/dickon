import React from 'react';
import { createRoot } from 'react-dom/client';
import { ApolloProvider } from './providers/ApolloProvider';
import { App } from './App';
import './index.css';

const root = document.getElementById('root');

if (!root) {
  throw new Error('Root element not found');
}

createRoot(root).render(
  <React.StrictMode>
    <ApolloProvider>
      <App />
    </ApolloProvider>
  </React.StrictMode>
);
