# 🔄 Full-Stack Unit Converter

A comprehensive unit converter application built with Angular, Node.js, and MongoDB Atlas, featuring multiple computation modes including JavaScript, C++, Python, and Java for performance comparison.

## 🏗️ Architecture

```
unit-converter-fullstack/
├── client/                 # Angular Frontend
│   ├── src/
│   │   ├── app/
│   │   │   ├── components/
│   │   │   ├── services/
│   │   │   └── models/
│   │   └── ...
├── server/                 # Node.js Backend
│   ├── src/
│   │   ├── controllers/
│   │   ├── models/
│   │   ├── routes/
│   │   └── services/
│   ├── cpp/               # C++ Unit Converter
│   ├── python/            # Python Unit Converter
│   └── java/              # Java Unit Converter
└── package.json           # Root package.json
```

## 🚀 Features

### Frontend (Angular 17+)
- ✅ Responsive modern UI with gradient design
- ✅ Real-time form validation
- ✅ Loading states and error handling
- ✅ Conversion history display
- ✅ Mode selection (Node.js, C++, Python, Java)
- ✅ Performance timing display for all computation modes
- ✅ Category-based unit organization (Length, Mass, Temperature)

### Backend (Node.js + Express)
- ✅ RESTful API endpoints
- ✅ MongoDB Atlas integration
- ✅ Performance measurement across all modes
- ✅ Multi-language computation support:
  - **Node.js**: Native JavaScript conversion
  - **C++**: High-performance compiled binary
  - **Python**: Python script execution
  - **Java**: JVM-based computation
- ✅ Persistent service management for external processes
- ✅ Comprehensive error handling and fallbacks
- ✅ CORS and security middleware

### Database (MongoDB Atlas)
- ✅ Conversion history logging
- ✅ Performance metrics storage for all modes
- ✅ Indexed queries for optimization

### Multi-Language Components
- ✅ **C++**: High-performance unit conversion with command-line interface
- ✅ **Python**: Cross-platform conversion with comprehensive unit support
- ✅ **Java**: JVM-based conversion with robust error handling
- ✅ All components support persistent service mode for optimal performance

## 🛠️ Installation & Setup

### Prerequisites
- Node.js 18+ and npm
- MongoDB Atlas account
- C++ compiler (g++)
- Python 3.x
- Java JDK 8+

### 1. Clone and Install Dependencies
```bash
# Install all dependencies (root, client, server)
npm run install:all
```

### 2. Database Setup
1. Create a MongoDB Atlas account at https://cloud.mongodb.com
2. Create a new cluster and database named `unit_converter`
3. Get your connection string
4. Copy `server/.env.example` to `server/.env`
5. Update the `MONGODB_URI` in `server/.env`:

```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/unit_converter?retryWrites=true&w=majority
PORT=3000
NODE_ENV=development
CORS_ORIGIN=http://localhost:4200
```

### 3. Build All Components
```bash
# Build C++, Java, and test Python components
npm run build:all
```

Or build them individually:
```bash
# Build C++ component
npm run cpp:build

# Compile Java component
npm run java:compile

# Test Python component
npm run python:test
```

### 4. Start Development Servers
```bash
# Start both frontend and backend concurrently
npm run dev
```

Or start them separately:
```bash
# Terminal 1 - Backend (http://localhost:3000)
npm run server:dev

# Terminal 2 - Frontend (http://localhost:4200)
npm run client:dev
```

## 📡 API Endpoints

### POST /api/convert
Convert units using specified computation mode.

**Request:**
```json
{
  "value": 100,
  "from": "meter",
  "to": "feet",
  "mode": "node"
}
```

**Supported modes:** `"node"`, `"cpp"`, `"python"`, `"java"`

**Response:**
```json
{
  "result": 328.084,
  "time_taken_ms": 0.15
}
```

### GET /api/history
Retrieve last 20 conversion logs.

**Response:**
```json
[
  {
    "_id": "...",
    "input_value": 100,
    "from_unit": "meter",
    "to_unit": "feet",
    "converted_value": 328.084,
    "mode": "node",
    "time_taken_ms": 0.15,
    "timestamp": "2024-01-15T10:30:00.000Z"
  }
]
```

### GET /health
Check service status and availability of all computation modes.

**Response:**
```json
{
  "status": "OK",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "services": {
    "cpp": { "available": true, "ready": true, "pendingRequests": 0 },
    "python": { "available": true, "ready": true, "pendingRequests": 0 },
    "java": { "available": true, "ready": true, "pendingRequests": 0 }
  }
}
```

## 🎯 Supported Units

### Length Units
- **meter** - Meter (m)
- **feet** - Feet (ft)
- **kilometer** - Kilometer (km)
- **mile** - Mile (mi)
- **centimeter** - Centimeter (cm)
- **inch** - Inch (in)
- **yard** - Yard (yd)

### Mass Units
- **kilogram** - Kilogram (kg)
- **gram** - Gram (g)
- **pound** - Pound (lb)
- **ounce** - Ounce (oz)
- **ton** - Metric Ton (t)
- **stone** - Stone (st)

### Temperature Units
- **celsius** - Celsius (°C)
- **fahrenheit** - Fahrenheit (°F)
- **kelvin** - Kelvin (K)

## ⚡ Performance Comparison

The application measures and displays conversion time for all computation modes:

- **Node.js Mode**: JavaScript-based conversion (~0.1-1ms)
  - Fastest for simple operations
  - No process overhead
  - Direct in-memory computation

- **C++ Mode**: Compiled binary execution (~1-5ms including process overhead)
  - High-performance compiled code
  - Persistent service mode reduces overhead
  - Best for complex mathematical operations

- **Python Mode**: Python script execution (~2-8ms including process overhead)
  - Cross-platform compatibility
  - Readable and maintainable code
  - Good balance of performance and flexibility

- **Java Mode**: JVM-based computation (~3-10ms including process overhead)
  - Platform-independent bytecode
  - Strong type safety and error handling
  - Excellent for enterprise-grade applications

*Note: Performance varies based on system specifications and current load.*

## 🏗️ Production Build

```bash
# Build both client and server
npm run build

# Start production server
npm start
```

## 🧪 Testing Components

### Test C++ Component
```bash
cd server/cpp
./unit_converter 100 meter feet
# Output: 328.0840000000
```

### Test Python Component
```bash
cd server/python
python3 unit_converter.py
# Interactive mode - type: req_1 100 meter feet
```

### Test Java Component
```bash
cd server/java/build
java com.unitconverter.UnitConverterApp
# Interactive mode - type: req_1 100 meter feet
```

## 🔧 Development Scripts

```bash
npm run dev              # Start both frontend and backend
npm run client:dev       # Start Angular dev server
npm run server:dev       # Start Node.js dev server
npm run build           # Build both applications
npm run build:all       # Build all components (C++, Java, Python test)
npm run cpp:build       # Compile C++ converter
npm run java:compile    # Compile Java converter
npm run python:test     # Test Python converter
npm run install:all     # Install all dependencies
```

## 🌐 Environment Variables

### Server (.env)
```env
MONGODB_URI=your_mongodb_atlas_connection_string
PORT=3000
NODE_ENV=development
CORS_ORIGIN=http://localhost:4200
```

## 📊 Database Schema

### ConversionLog Collection
```javascript
{
  input_value: Number,      // Original value
  from_unit: String,        // Source unit
  to_unit: String,          // Target unit
  converted_value: Number,  // Result value
  mode: String,            // "node", "cpp", "python", or "java"
  time_taken_ms: Number,   // Execution time
  timestamp: Date          // Conversion timestamp
}
```

## 🚨 Troubleshooting

### C++ Compiler Issues
```bash
# Ubuntu/Debian
sudo apt-get install build-essential

# macOS
xcode-select --install

# Windows
# Install Visual Studio Build Tools or MinGW
```

### Python Issues
```bash
# Ensure Python 3 is installed
python3 --version

# Ubuntu/Debian
sudo apt-get install python3

# macOS (with Homebrew)
brew install python3
```

### Java Issues
```bash
# Check Java installation
java -version
javac -version

# Ubuntu/Debian
sudo apt-get install default-jdk

# macOS (with Homebrew)
brew install openjdk
```

### MongoDB Connection Issues
1. Check your connection string format
2. Ensure IP whitelist includes your current IP
3. Verify database user permissions

### Port Conflicts
- Frontend: Change port in `client/angular.json`
- Backend: Update `PORT` in `server/.env`

### Service Availability
- Check `/health` endpoint to verify all services are running
- Services automatically restart on failure
- Fallback to Node.js mode if external services are unavailable

## 📈 Performance Optimization

- Database queries are indexed by timestamp
- All external binaries use persistent service mode
- Frontend uses OnPush change detection
- HTTP requests include proper error handling
- Services automatically restart on failure

## 🔄 Service Architecture

Each computation mode runs as a persistent service:

1. **Startup**: All services initialize when the server starts
2. **Communication**: Services communicate via stdin/stdout
3. **Request Handling**: Each request gets a unique ID for tracking
4. **Error Recovery**: Services automatically restart on failure
5. **Fallback**: Node.js mode serves as fallback for unavailable services

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test all computation modes
5. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details.