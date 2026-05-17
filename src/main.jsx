import { createRoot } from 'react-dom/client'
import { HashRouter } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext.jsx';
import { ExamProvider } from './contexts/ExamContext.jsx';

import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <ThemeProvider>
    <ExamProvider>
      <HashRouter>
        <App />
      </HashRouter>
    </ExamProvider>
  </ThemeProvider>
)

