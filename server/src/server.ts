import 'dotenv/config';
import http from 'http';
import app from './app';
import { initSocketIO } from './socket';

const PORT = process.env.PORT || 8000;

const startServer = async () => {
  try {
    const server = http.createServer(app);
    initSocketIO(server);

    server.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

// trigger reload
