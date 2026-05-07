import { createRoot } from 'react-dom/client'
import { HashRouter } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext.jsx';

import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <ThemeProvider>
    <HashRouter>
      <App />
    </HashRouter>
  </ThemeProvider>
)

