import { ChildProcess } from 'child_process';

export class ConversionService {
  // Service management
  private static cppProcess: ChildProcess | null = null;
  private static pythonProcess: ChildProcess | null = null;
  private static javaProcess: ChildProcess | null = null;
  
  private static cppPendingRequests = new Map<string, { 
    resolve: (value: number) => void; 
    reject: (reason?: any) => void;
    timeout: NodeJS.Timeout;
  }>();
  
  private static pythonPendingRequests = new Map<string, { 
    resolve: (value: number) => void; 
    reject: (reason?: any) => void;
    timeout: NodeJS.Timeout;
  }>();
  
  private static javaPendingRequests = new Map<string, { 
    resolve: (value: number) => void; 
    reject: (reason?: any) => void;
    timeout: NodeJS.Timeout;
  }>();
  
  private static requestIdCounter = 0;
  private static cppReady = false;
  private static pythonReady = false;
  private static javaReady = false;

  // Length conversion factors to meters
  private static readonly LENGTH_FACTORS = {
    meter: 1,
    feet: 0.3048,
    kilometer: 1000,
    mile: 1609.344,
    centimeter: 0.01,
    inch: 0.0254,
    yard: 0.9144
  };

  // Mass conversion factors to kilograms
  private static readonly MASS_FACTORS = {
    kilogram: 1,
    gram: 0.001,
    pound: 0.453592,
    ounce: 0.0283495,
    ton: 1000,
    stone: 6.35029
  };

  // Temperature conversion functions
  private static readonly TEMPERATURE_UNITS = ['celsius', 'fahrenheit', 'kelvin'];

  // Process setters
  static setCppProcess(process: ChildProcess) {
    this.cppProcess = process;
    this.cppReady = false;
  }

  static setPythonProcess(process: ChildProcess) {
    this.pythonProcess = process;
    this.pythonReady = false;
  }

  static setJavaProcess(process: ChildProcess) {
    this.javaProcess = process;
    this.javaReady = false;
  }

  // Output handlers
  static handleCppOutput(data: Buffer) {
    const output = data.toString().trim();
    const lines = output.split('\n');
    
    for (const line of lines) {
      if (line === 'READY') {
        this.cppReady = true;
        console.log('✅ C++ service is ready');
        continue;
      }
      
      this.processServiceOutput(line, this.cppPendingRequests, 'C++');
    }
  }

  static handlePythonOutput(data: Buffer) {
    const output = data.toString().trim();
    const lines = output.split('\n');
    
    for (const line of lines) {
      if (line === 'READY') {
        this.pythonReady = true;
        console.log('✅ Python service is ready');
        continue;
      }
      
      this.processServiceOutput(line, this.pythonPendingRequests, 'Python');
    }
  }

  static handleJavaOutput(data: Buffer) {
    const output = data.toString().trim();
    const lines = output.split('\n');
    
    for (const line of lines) {
      if (line === 'READY') {
        this.javaReady = true;
        console.log('✅ Java service is ready');
        continue;
      }
      
      this.processServiceOutput(line, this.javaPendingRequests, 'Java');
    }
  }

  private static processServiceOutput(
    line: string, 
    pendingRequests: Map<string, any>, 
    serviceName: string
  ) {
    const parts = line.split(' ');
    if (parts.length < 2) return;
    
    const requestId = parts[0];
    const pending = pendingRequests.get(requestId);
    
    if (!pending) return;
    
    // Clear timeout
    clearTimeout(pending.timeout);
    pendingRequests.delete(requestId);
    
    if (parts[1] === 'ERROR') {
      const errorMessage = parts.slice(2).join(' ');
      pending.reject(new Error(errorMessage));
    } else {
      const result = parseFloat(parts[1]);
      if (isNaN(result)) {
        pending.reject(new Error(`Invalid result from ${serviceName} service`));
      } else {
        pending.resolve(result);
      }
    }
  }

  // Node.js conversion (unchanged)
  static async convertWithNode(value: number, from: string, to: string): Promise<number> {
    const category = this.getUnitCategory(from);
    
    if (!category) {
      throw new Error(`Unsupported unit: ${from}`);
    }

    if (this.getUnitCategory(to) !== category) {
      throw new Error(`Cannot convert between different unit categories: ${from} to ${to}`);
    }

    switch (category) {
      case 'length':
        return this.convertLength(value, from, to);
      case 'mass':
        return this.convertMass(value, from, to);
      case 'temperature':
        return this.convertTemperature(value, from, to);
      default:
        throw new Error(`Unsupported unit category: ${category}`);
    }
  }

  private static convertLength(value: number, from: string, to: string): number {
    const fromFactor = this.LENGTH_FACTORS[from as keyof typeof this.LENGTH_FACTORS];
    const toFactor = this.LENGTH_FACTORS[to as keyof typeof this.LENGTH_FACTORS];
    
    if (!fromFactor || !toFactor) {
      throw new Error(`Unsupported length unit conversion: ${from} to ${to}`);
    }
    
    const meters = value * fromFactor;
    return meters / toFactor;
  }

  private static convertMass(value: number, from: string, to: string): number {
    const fromFactor = this.MASS_FACTORS[from as keyof typeof this.MASS_FACTORS];
    const toFactor = this.MASS_FACTORS[to as keyof typeof this.MASS_FACTORS];
    
    if (!fromFactor || !toFactor) {
      throw new Error(`Unsupported mass unit conversion: ${from} to ${to}`);
    }
    
    const kilograms = value * fromFactor;
    return kilograms / toFactor;
  }

  private static convertTemperature(value: number, from: string, to: string): number {
    if (from === to) return value;

    let celsius: number;
    switch (from) {
      case 'celsius':
        celsius = value;
        break;
      case 'fahrenheit':
        celsius = (value - 32) * 5/9;
        break;
      case 'kelvin':
        celsius = value - 273.15;
        break;
      default:
        throw new Error(`Unsupported temperature unit: ${from}`);
    }

    switch (to) {
      case 'celsius':
        return celsius;
      case 'fahrenheit':
        return (celsius * 9/5) + 32;
      case 'kelvin':
        return celsius + 273.15;
      default:
        throw new Error(`Unsupported temperature unit: ${to}`);
    }
  }

  private static getUnitCategory(unit: string): string | null {
    if (unit in this.LENGTH_FACTORS) return 'length';
    if (unit in this.MASS_FACTORS) return 'mass';
    if (this.TEMPERATURE_UNITS.includes(unit)) return 'temperature';
    return null;
  }

  // External service conversions
  static async convertWithCpp(value: number, from: string, to: string): Promise<number> {
    return this.convertWithExternalService(
      value, from, to, 
      this.cppProcess, this.cppReady, this.cppPendingRequests, 'C++'
    );
  }

  static async convertWithPython(value: number, from: string, to: string): Promise<number> {
    return this.convertWithExternalService(
      value, from, to, 
      this.pythonProcess, this.pythonReady, this.pythonPendingRequests, 'Python'
    );
  }

  static async convertWithJava(value: number, from: string, to: string): Promise<number> {
    return this.convertWithExternalService(
      value, from, to, 
      this.javaProcess, this.javaReady, this.javaPendingRequests, 'Java'
    );
  }

  private static async convertWithExternalService(
    value: number, 
    from: string, 
    to: string,
    process: ChildProcess | null,
    isReady: boolean,
    pendingRequests: Map<string, any>,
    serviceName: string
  ): Promise<number> {
    if (!process || !isReady) {
      throw new Error(`${serviceName} service is not available. Using Node.js fallback.`);
    }

    return new Promise((resolve, reject) => {
      const requestId = `req_${++this.requestIdCounter}`;
      
      const timeout = setTimeout(() => {
        pendingRequests.delete(requestId);
        reject(new Error(`${serviceName} conversion timeout`));
      }, 5000);
      
      pendingRequests.set(requestId, { resolve, reject, timeout });
      
      const request = `${requestId} ${value} ${from} ${to}\n`;
      
      try {
        if (!process?.stdin?.write(request)) {
          clearTimeout(timeout);
          pendingRequests.delete(requestId);
          reject(new Error(`Failed to write to ${serviceName} service`));
        }
      } catch (error) {
        clearTimeout(timeout);
        pendingRequests.delete(requestId);
        reject(new Error(`${serviceName} service communication error: ${error}`));
      }
    });
  }

  // Utility methods
  static validateUnits(from: string, to: string): boolean {
    const fromCategory = this.getUnitCategory(from);
    const toCategory = this.getUnitCategory(to);
    
    return fromCategory !== null && toCategory !== null && fromCategory === toCategory;
  }

  static getAllValidUnits(): string[] {
    return [
      ...Object.keys(this.LENGTH_FACTORS),
      ...Object.keys(this.MASS_FACTORS),
      ...this.TEMPERATURE_UNITS
    ];
  }

  static getServiceStatus() {
    return {
      cpp: {
        available: this.cppProcess !== null,
        ready: this.cppReady,
        pendingRequests: this.cppPendingRequests.size
      },
      python: {
        available: this.pythonProcess !== null,
        ready: this.pythonReady,
        pendingRequests: this.pythonPendingRequests.size
      },
      java: {
        available: this.javaProcess !== null,
        ready: this.javaReady,
        pendingRequests: this.javaPendingRequests.size
      }
    };
  }
}