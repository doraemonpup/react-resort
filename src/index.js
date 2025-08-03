import { createRoot } from 'react-dom/client';
import { BrowserRouter as Router } from 'react-router-dom';
import { RoomProvider } from './context';
import App from './App';

const container = document.getElementById('root');
const root = createRoot(container);

root.render(
  <RoomProvider>
    <Router>
      <App />
    </Router>
  </RoomProvider>
);
