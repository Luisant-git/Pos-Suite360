import { BrowserRouter } from 'react-router-dom';
import AppRoutes from './routes/AppRoutes';
import { Toaster } from 'react-hot-toast';
import { SettingsProvider } from './contexts/SettingsContext';

function App() {
  return (
    <BrowserRouter>
      <Toaster position="top-right" />
      <SettingsProvider>
        <AppRoutes />
      </SettingsProvider>
    </BrowserRouter>
  );
}

export default App;
