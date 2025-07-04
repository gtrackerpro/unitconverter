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

// Global process variables
let cppProcess: ChildProcess | null = null;
let pythonProcess: ChildProcess | null = null;
let javaProcess: ChildProcess | null = null;

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
  const serviceStatus = ConversionService.getServiceStatus();
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    services: {
      cpp: serviceStatus.cpp,
      python: serviceStatus.python,
      java: serviceStatus.java
    }
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

// Initialize Python service
const initializePythonService = () => {
  try {
    const pythonScript = path.join(__dirname, '../python/unit_converter.py');
    console.log('🐍 Starting Python service:', pythonScript);
    
    pythonProcess = spawn('python3', [pythonScript], {
      stdio: ['pipe', 'pipe', 'pipe']
    });

    // Handle Python process output
    pythonProcess.stdout?.on('data', (data: Buffer) => {
      ConversionService.handlePythonOutput(data);
    });

    // Handle Python process errors
    pythonProcess.stderr?.on('data', (data: Buffer) => {
      console.error('❌ Python service error:', data.toString());
    });

    // Handle Python process close
    pythonProcess.on('close', (code) => {
      console.log(`⚠️ Python service exited with code ${code}`);
      pythonProcess = null;
      
      // Attempt to restart after a delay
      setTimeout(() => {
        console.log('🔄 Attempting to restart Python service...');
        initializePythonService();
      }, 5000);
    });

    // Handle Python process errors
    pythonProcess.on('error', (error) => {
      console.error('❌ Failed to start Python service:', error.message);
      pythonProcess = null;
    });

    // Set the process in the conversion service
    ConversionService.setPythonProcess(pythonProcess);
    
    console.log('✅ Python service initialized');
  } catch (error) {
    console.error('❌ Failed to initialize Python service:', error);
  }
};

// Initialize Java service
const initializeJavaService = () => {
  try {
    const javaClassPath = path.join(__dirname, '../java/build');
    console.log('☕ Starting Java service with classpath:', javaClassPath);
    
    javaProcess = spawn('java', ['-cp', javaClassPath, 'com.unitconverter.UnitConverterApp'], {
      stdio: ['pipe', 'pipe', 'pipe']
    });

    // Handle Java process output
    javaProcess.stdout?.on('data', (data: Buffer) => {
      ConversionService.handleJavaOutput(data);
    });

    // Handle Java process errors
    javaProcess.stderr?.on('data', (data: Buffer) => {
      console.error('❌ Java service error:', data.toString());
    });

    // Handle Java process close
    javaProcess.on('close', (code) => {
      console.log(`⚠️ Java service exited with code ${code}`);
      javaProcess = null;
      
      // Attempt to restart after a delay
      setTimeout(() => {
        console.log('🔄 Attempting to restart Java service...');
        initializeJavaService();
      }, 5000);
    });

    // Handle Java process errors
    javaProcess.on('error', (error) => {
      console.error('❌ Failed to start Java service:', error.message);
      javaProcess = null;
    });

    // Set the process in the conversion service
    ConversionService.setJavaProcess(javaProcess);
    
    console.log('✅ Java service initialized');
  } catch (error) {
    console.error('❌ Failed to initialize Java service:', error);
  }
};

// Graceful shutdown
const gracefulShutdown = () => {
  console.log('🛑 Shutting down gracefully...');
  
  const processes = [
    { name: 'C++', process: cppProcess },
    { name: 'Python', process: pythonProcess },
    { name: 'Java', process: javaProcess }
  ];
  
  processes.forEach(({ name, process }) => {
    if (process) {
      console.log(`🔧 Terminating ${name} service...`);
      process.kill('SIGTERM');
      
      // Force kill after 5 seconds if not terminated
      setTimeout(() => {
        if (process && !process.killed) {
          console.log(`⚠️ Force killing ${name} service...`);
          process.kill('SIGKILL');
        }
      }, 5000);
    }
  });
  
  process.exit(0);
};

// Handle shutdown signals
process.on('SIGINT', gracefulShutdown);
process.on('SIGTERM', gracefulShutdown);

// Start server
const startServer = async () => {
  await connectDB();
  
  // Initialize all services
  initializeCppService();
  initializePythonService();
  initializeJavaService();
  
  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📊 Health check: http://localhost:${PORT}/health`);
    console.log(`🔄 API endpoint: http://localhost:${PORT}/api`);
  });
};

startServer().catch(console.error);

export default app;