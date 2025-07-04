import { ChildProcess } from 'child_process';
import path from 'path';

export class ConversionService {
  // C++ service management
  private static cppProcess: ChildProcess | null = null;
  private static pendingRequests = new Map<string, { 
    resolve: (value: number) => void; 
    reject: (reason?: any) => void;
    timeout: NodeJS.Timeout;
  }>();
  private static requestIdCounter = 0;
  private static isReady = false;

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

  static setCppProcess(process: ChildProcess) {
    this.cppProcess = process;
    this.isReady = false;
  }

  static handleCppOutput(data: Buffer) {
    const output = data.toString().trim();
    const lines = output.split('\n');
    
    for (const line of lines) {
      if (line === 'READY') {
        this.isReady = true;
        console.log('✅ C++ service is ready');
        continue;
      }
      
      const parts = line.split(' ');
      if (parts.length < 2) continue;
      
      const requestId = parts[0];
      const pending = this.pendingRequests.get(requestId);
      
      if (!pending) continue;
      
      // Clear timeout
      clearTimeout(pending.timeout);
      this.pendingRequests.delete(requestId);
      
      if (parts[1] === 'ERROR') {
        const errorMessage = parts.slice(2).join(' ');
        pending.reject(new Error(errorMessage));
      } else {
        const result = parseFloat(parts[1]);
        if (isNaN(result)) {
          pending.reject(new Error('Invalid result from C++ service'));
        } else {
          pending.resolve(result);
        }
      }
    }
  }

  static async convertWithNode(value: number, from: string, to: string): Promise<number> {
    // Determine unit category
    const category = this.getUnitCategory(from);
    
    if (!category) {
      throw new Error(`Unsupported unit: ${from}`);
    }

    // Validate that both units are in the same category
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
    
    // Convert to meters first, then to target unit
    const meters = value * fromFactor;
    return meters / toFactor;
  }

  private static convertMass(value: number, from: string, to: string): number {
    const fromFactor = this.MASS_FACTORS[from as keyof typeof this.MASS_FACTORS];
    const toFactor = this.MASS_FACTORS[to as keyof typeof this.MASS_FACTORS];
    
    if (!fromFactor || !toFactor) {
      throw new Error(`Unsupported mass unit conversion: ${from} to ${to}`);
    }
    
    // Convert to kilograms first, then to target unit
    const kilograms = value * fromFactor;
    return kilograms / toFactor;
  }

  private static convertTemperature(value: number, from: string, to: string): number {
    if (from === to) return value;

    // Convert from source to Celsius first
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

    // Convert from Celsius to target unit
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

  static async convertWithCpp(value: number, from: string, to: string): Promise<number> {
    if (!this.cppProcess || !this.isReady) {
      throw new Error('C++ service is not available. Using Node.js fallback.');
    }

    return new Promise((resolve, reject) => {
      const requestId = `req_${++this.requestIdCounter}`;
      
      // Set up timeout (5 seconds)
      const timeout = setTimeout(() => {
        this.pendingRequests.delete(requestId);
        reject(new Error('C++ conversion timeout'));
      }, 5000);
      
      // Store the promise handlers
      this.pendingRequests.set(requestId, { resolve, reject, timeout });
      
      // Send request to C++ service
      const request = `${requestId} ${value} ${from} ${to}\n`;
      
      try {
        if (!this.cppProcess?.stdin?.write(request)) {
          // If write fails, clean up and reject
          clearTimeout(timeout);
          this.pendingRequests.delete(requestId);
          reject(new Error('Failed to write to C++ service'));
        }
      } catch (error) {
        clearTimeout(timeout);
        this.pendingRequests.delete(requestId);
        reject(new Error(`C++ service communication error: ${error}`));
      }
    });
  }

  static validateUnits(from: string, to: string): boolean {
    const fromCategory = this.getUnitCategory(from);
    const toCategory = this.getUnitCategory(to);
    
    // Both units must be valid and in the same category
    return fromCategory !== null && toCategory !== null && fromCategory === toCategory;
  }

  static getAllValidUnits(): string[] {
    return [
      ...Object.keys(this.LENGTH_FACTORS),
      ...Object.keys(this.MASS_FACTORS),
      ...this.TEMPERATURE_UNITS
    ];
  }

  // Get C++ service status
  static getCppServiceStatus(): { available: boolean; ready: boolean; pendingRequests: number } {
    return {
      available: this.cppProcess !== null,
      ready: this.isReady,
      pendingRequests: this.pendingRequests.size
    };
  }
}