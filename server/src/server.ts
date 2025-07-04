import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { spawn, ChildProcess } from 'child_process';
import path from 'path';
import conversionRoutes from './routes/conversion.routes';
import { ConversionService } from './services/conversion.service';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Global C++ process variable
let cppProcess: ChildProcess | null = null;

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:4200',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api', conversionRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    cppService: cppProcess ? 'running' : 'stopped'
  });
});

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ 
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// MongoDB connection
const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri) {
      throw new Error('MONGODB_URI environment variable is not set');
    }
    
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB Atlas');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
};

// Initialize C++ service
const initializeCppService = () => {
  try {
    const cppExecutable = path.join(__dirname, '../cpp/unit_converter');
    console.log('🔧 Starting C++ service:', cppExecutable);
    
    cppProcess = spawn(cppExecutable, [], {
      stdio: ['pipe', 'pipe', 'pipe']
    });

    // Handle C++ process output
    cppProcess.stdout?.on('data', (data: Buffer) => {
      ConversionService.handleCppOutput(data);
    });

    // Handle C++ process errors
    cppProcess.stderr?.on('data', (data: Buffer) => {
      console.error('❌ C++ service error:', data.toString());
    });

    // Handle C++ process close
    cppProcess.on('close', (code) => {
      console.log(`⚠️ C++ service exited with code ${code}`);
      cppProcess = null;
      
      // Attempt to restart after a delay
      setTimeout(() => {
        console.log('🔄 Attempting to restart C++ service...');
        initializeCppService();
      }, 5000);
    });

    // Handle C++ process errors
    cppProcess.on('error', (error) => {
      console.error('❌ Failed to start C++ service:', error.message);
      cppProcess = null;
    });

    // Set the process in the conversion service
    ConversionService.setCppProcess(cppProcess);
    
    console.log('✅ C++ service initialized');
  } catch (error) {
    console.error('❌ Failed to initialize C++ service:', error);
  }
};

// Graceful shutdown
const gracefulShutdown = () => {
  console.log('🛑 Shutting down gracefully...');
  
  if (cppProcess) {
    console.log('🔧 Terminating C++ service...');
    cppProcess.kill('SIGTERM');
    
    // Force kill after 5 seconds if not terminated
    setTimeout(() => {
      if (cppProcess && !cppProcess.killed) {
        console.log('⚠️ Force killing C++ service...');
        cppProcess.kill('SIGKILL');
      }
    }, 5000);
  }
  
  process.exit(0);
};

// Handle shutdown signals
process.on('SIGINT', gracefulShutdown);
process.on('SIGTERM', gracefulShutdown);

// Start server
const startServer = async () => {
  await connectDB();
  
  // Initialize C++ service
  initializeCppService();
  
  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📊 Health check: http://localhost:${PORT}/health`);
    console.log(`🔄 API endpoint: http://localhost:${PORT}/api`);
  });
};

startServer().catch(console.error);

export default app;