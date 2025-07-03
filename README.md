# 🔄 Full-Stack Unit Converter

A comprehensive unit converter application built with Angular, Node.js, and MongoDB Atlas, featuring both JavaScript and C++ computation modes.

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
│   └── cpp/               # C++ Unit Converter
└── package.json           # Root package.json
```

## 🚀 Features

### Frontend (Angular 17+)
- ✅ Responsive modern UI with gradient design
- ✅ Real-time form validation
- ✅ Loading states and error handling
- ✅ Conversion history display
- ✅ Mode selection (Node.js vs C++)
- ✅ Performance timing display

### Backend (Node.js + Express)
- ✅ RESTful API endpoints
- ✅ MongoDB Atlas integration
- ✅ Performance measurement
- ✅ C++ binary execution via child_process
- ✅ Comprehensive error handling
- ✅ CORS and security middleware

### Database (MongoDB Atlas)
- ✅ Conversion history logging
- ✅ Performance metrics storage
- ✅ Indexed queries for optimization

### C++ Component
- ✅ High-performance unit conversion
- ✅ Command-line interface
- ✅ Error handling and validation

## 🛠️ Installation & Setup

### Prerequisites
- Node.js 18+ and npm
- MongoDB Atlas account
- C++ compiler (g++)

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

### 3. Build C++ Component
```bash
# Build the C++ unit converter
npm run cpp:build
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

## 🎯 Supported Units

- **meter** - Meter (m)
- **feet** - Feet (ft)
- **kilometer** - Kilometer (km)
- **mile** - Mile (mi)

## ⚡ Performance Comparison

The application measures and displays conversion time for both modes:
- **Node.js Mode**: JavaScript-based conversion (~0.1-1ms)
- **C++ Mode**: Compiled binary execution (~1-5ms including process overhead)

## 🏗️ Production Build

```bash
# Build both client and server
npm run build

# Start production server
npm start
```

## 🧪 Testing the C++ Component

```bash
# Test the C++ converter directly
cd server/cpp
./unit_converter 100 meter feet
# Output: 328.0840000000
```

## 🔧 Development Scripts

```bash
npm run dev              # Start both frontend and backend
npm run client:dev       # Start Angular dev server
npm run server:dev       # Start Node.js dev server
npm run build           # Build both applications
npm run cpp:build       # Compile C++ converter
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
  mode: String,            // "node" or "cpp"
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

### MongoDB Connection Issues
1. Check your connection string format
2. Ensure IP whitelist includes your current IP
3. Verify database user permissions

### Port Conflicts
- Frontend: Change port in `client/angular.json`
- Backend: Update `PORT` in `server/.env`

## 📈 Performance Optimization

- Database queries are indexed by timestamp
- C++ binary is pre-compiled for faster execution
- Frontend uses OnPush change detection
- HTTP requests include proper error handling

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details.