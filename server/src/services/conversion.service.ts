import { execFile } from 'child_process';
import { promisify } from 'util';
import path from 'path';

const execFileAsync = promisify(execFile);

export class ConversionService {
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
    try {
      const cppExecutable = path.join(__dirname, '../../cpp/unit_converter');
      const { stdout } = await execFileAsync(cppExecutable, [
        value.toString(),
        from,
        to
      ]);
      
      const result = parseFloat(stdout.trim());
      
      if (isNaN(result)) {
        throw new Error('Invalid output from C++ converter');
      }
      
      return result;
    } catch (error: any) {
      if (error.code === 'ENOENT') {
        throw new Error('C++ converter not found. Please build the C++ executable first.');
      }
      throw new Error(`C++ conversion failed: ${error.message}`);
    }
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
}