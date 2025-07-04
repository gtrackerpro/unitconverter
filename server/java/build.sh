#!/bin/bash

# Create the build directory
mkdir -p build

# Compile the Java application
javac -d build src/main/java/com/unitconverter/UnitConverterApp.java

# Check if compilation was successful
if [ $? -eq 0 ]; then
    echo "✅ Java compilation successful"
    
    # Run the application
    cd build
    java com.unitconverter.UnitConverterApp
else
    echo "❌ Java compilation failed"
    exit 1
fi