import { execFile } from 'child_process';
import { promisify } from 'util';
import path from 'path';

const execFileAsync = promisify(execFile);

export class ConversionService {
  // Conversion factors to meters
  private static readonly CONVERSION_FACTORS = {
    meter: 1,
    feet: 0.3048,
    kilometer: 1000,
    mile: 1609.344
  };

  static async convertWithNode(value: number, from: string, to: string): Promise<number> {
    const fromFactor = this.CONVERSION_FACTORS[from as keyof typeof this.CONVERSION_FACTORS];
    const toFactor = this.CONVERSION_FACTORS[to as keyof typeof this.CONVERSION_FACTORS];
    
    if (!fromFactor || !toFactor) {
      throw new Error(`Unsupported unit conversion: ${from} to ${to}`);
    }
    
    // Convert to meters first, then to target unit
    const meters = value * fromFactor;
    const result = meters / toFactor;
    
    return result;
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
    const validUnits = Object.keys(this.CONVERSION_FACTORS);
    return validUnits.includes(from) && validUnits.includes(to);
  }
}