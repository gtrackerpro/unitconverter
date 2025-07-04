#!/usr/bin/env python3
import sys
import json
import math

class UnitConverter:
    def __init__(self):
        # Length conversion factors to meters
        self.length_factors = {
            'meter': 1.0,
            'feet': 0.3048,
            'kilometer': 1000.0,
            'mile': 1609.344,
            'centimeter': 0.01,
            'inch': 0.0254,
            'yard': 0.9144
        }
        
        # Mass conversion factors to kilograms
        self.mass_factors = {
            'kilogram': 1.0,
            'gram': 0.001,
            'pound': 0.453592,
            'ounce': 0.0283495,
            'ton': 1000.0,
            'stone': 6.35029
        }
        
        # Temperature units
        self.temperature_units = ['celsius', 'fahrenheit', 'kelvin']
    
    def get_unit_category(self, unit):
        if unit in self.length_factors:
            return 'length'
        elif unit in self.mass_factors:
            return 'mass'
        elif unit in self.temperature_units:
            return 'temperature'
        else:
            return None
    
    def convert_length(self, value, from_unit, to_unit):
        if from_unit not in self.length_factors or to_unit not in self.length_factors:
            raise ValueError(f"Unsupported length unit conversion: {from_unit} to {to_unit}")
        
        # Convert to meters first, then to target unit
        meters = value * self.length_factors[from_unit]
        return meters / self.length_factors[to_unit]
    
    def convert_mass(self, value, from_unit, to_unit):
        if from_unit not in self.mass_factors or to_unit not in self.mass_factors:
            raise ValueError(f"Unsupported mass unit conversion: {from_unit} to {to_unit}")
        
        # Convert to kilograms first, then to target unit
        kilograms = value * self.mass_factors[from_unit]
        return kilograms / self.mass_factors[to_unit]
    
    def convert_temperature(self, value, from_unit, to_unit):
        if from_unit == to_unit:
            return value
        
        # Convert from source to Celsius first
        if from_unit == 'celsius':
            celsius = value
        elif from_unit == 'fahrenheit':
            celsius = (value - 32.0) * 5.0 / 9.0
        elif from_unit == 'kelvin':
            celsius = value - 273.15
        else:
            raise ValueError(f"Unsupported temperature unit: {from_unit}")
        
        # Convert from Celsius to target unit
        if to_unit == 'celsius':
            return celsius
        elif to_unit == 'fahrenheit':
            return (celsius * 9.0 / 5.0) + 32.0
        elif to_unit == 'kelvin':
            return celsius + 273.15
        else:
            raise ValueError(f"Unsupported temperature unit: {to_unit}")
    
    def convert(self, value, from_unit, to_unit):
        from_category = self.get_unit_category(from_unit)
        to_category = self.get_unit_category(to_unit)
        
        if from_category is None:
            raise ValueError(f"Unsupported unit: {from_unit}")
        
        if to_category is None:
            raise ValueError(f"Unsupported unit: {to_unit}")
        
        if from_category != to_category:
            raise ValueError(f"Cannot convert between different unit categories: {from_unit} to {to_unit}")
        
        if from_category == 'length':
            return self.convert_length(value, from_unit, to_unit)
        elif from_category == 'mass':
            return self.convert_mass(value, from_unit, to_unit)
        elif from_category == 'temperature':
            return self.convert_temperature(value, from_unit, to_unit)
        else:
            raise ValueError(f"Unsupported unit category: {from_category}")

def main():
    converter = UnitConverter()
    
    # Signal that the service is ready
    print("READY", flush=True)
    
    try:
        for line in sys.stdin:
            line = line.strip()
            if not line:
                continue
            
            try:
                parts = line.split()
                if len(parts) != 4:
                    print(f"{parts[0] if parts else 'unknown'} ERROR Invalid input format", flush=True)
                    continue
                
                request_id, value_str, from_unit, to_unit = parts
                value = float(value_str)
                
                result = converter.convert(value, from_unit, to_unit)
                print(f"{request_id} {result:.10f}", flush=True)
                
            except ValueError as e:
                print(f"{request_id} ERROR {str(e)}", flush=True)
            except Exception as e:
                print(f"{request_id} ERROR Conversion failed: {str(e)}", flush=True)
                
    except KeyboardInterrupt:
        pass
    except EOFError:
        pass

if __name__ == "__main__":
    main()