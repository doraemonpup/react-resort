import { createRoot } from 'react-dom/client';
import { BrowserRouter as Router } from 'react-router';
import { RoomProvider } from './context.jsx';
import App from './App.jsx';

const container = document.getElementById('root');
const root = createRoot(container);

root.render(
  <RoomProvider>
    <Router>
      <App />
    </Router>
  </RoomProvider>
);
