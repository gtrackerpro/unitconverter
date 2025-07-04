package com.unitconverter;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.util.HashMap;
import java.util.Map;
import java.util.Arrays;
import java.util.List;

public class UnitConverterApp {
    private final Map<String, Double> lengthFactors;
    private final Map<String, Double> massFactors;
    private final List<String> temperatureUnits;
    
    public UnitConverterApp() {
        // Length conversion factors to meters
        lengthFactors = new HashMap<>();
        lengthFactors.put("meter", 1.0);
        lengthFactors.put("feet", 0.3048);
        lengthFactors.put("kilometer", 1000.0);
        lengthFactors.put("mile", 1609.344);
        lengthFactors.put("centimeter", 0.01);
        lengthFactors.put("inch", 0.0254);
        lengthFactors.put("yard", 0.9144);
        
        // Mass conversion factors to kilograms
        massFactors = new HashMap<>();
        massFactors.put("kilogram", 1.0);
        massFactors.put("gram", 0.001);
        massFactors.put("pound", 0.453592);
        massFactors.put("ounce", 0.0283495);
        massFactors.put("ton", 1000.0);
        massFactors.put("stone", 6.35029);
        
        // Temperature units
        temperatureUnits = Arrays.asList("celsius", "fahrenheit", "kelvin");
    }
    
    private String getUnitCategory(String unit) {
        if (lengthFactors.containsKey(unit)) {
            return "length";
        } else if (massFactors.containsKey(unit)) {
            return "mass";
        } else if (temperatureUnits.contains(unit)) {
            return "temperature";
        } else {
            return null;
        }
    }
    
    private double convertLength(double value, String fromUnit, String toUnit) throws Exception {
        Double fromFactor = lengthFactors.get(fromUnit);
        Double toFactor = lengthFactors.get(toUnit);
        
        if (fromFactor == null || toFactor == null) {
            throw new Exception("Unsupported length unit conversion: " + fromUnit + " to " + toUnit);
        }
        
        // Convert to meters first, then to target unit
        double meters = value * fromFactor;
        return meters / toFactor;
    }
    
    private double convertMass(double value, String fromUnit, String toUnit) throws Exception {
        Double fromFactor = massFactors.get(fromUnit);
        Double toFactor = massFactors.get(toUnit);
        
        if (fromFactor == null || toFactor == null) {
            throw new Exception("Unsupported mass unit conversion: " + fromUnit + " to " + toUnit);
        }
        
        // Convert to kilograms first, then to target unit
        double kilograms = value * fromFactor;
        return kilograms / toFactor;
    }
    
    private double convertTemperature(double value, String fromUnit, String toUnit) throws Exception {
        if (fromUnit.equals(toUnit)) {
            return value;
        }
        
        // Convert from source to Celsius first
        double celsius;
        switch (fromUnit) {
            case "celsius":
                celsius = value;
                break;
            case "fahrenheit":
                celsius = (value - 32.0) * 5.0 / 9.0;
                break;
            case "kelvin":
                celsius = value - 273.15;
                break;
            default:
                throw new Exception("Unsupported temperature unit: " + fromUnit);
        }
        
        // Convert from Celsius to target unit
        switch (toUnit) {
            case "celsius":
                return celsius;
            case "fahrenheit":
                return (celsius * 9.0 / 5.0) + 32.0;
            case "kelvin":
                return celsius + 273.15;
            default:
                throw new Exception("Unsupported temperature unit: " + toUnit);
        }
    }
    
    public double convert(double value, String fromUnit, String toUnit) throws Exception {
        String fromCategory = getUnitCategory(fromUnit);
        String toCategory = getUnitCategory(toUnit);
        
        if (fromCategory == null) {
            throw new Exception("Unsupported unit: " + fromUnit);
        }
        
        if (toCategory == null) {
            throw new Exception("Unsupported unit: " + toUnit);
        }
        
        if (!fromCategory.equals(toCategory)) {
            throw new Exception("Cannot convert between different unit categories: " + fromUnit + " to " + toUnit);
        }
        
        switch (fromCategory) {
            case "length":
                return convertLength(value, fromUnit, toUnit);
            case "mass":
                return convertMass(value, fromUnit, toUnit);
            case "temperature":
                return convertTemperature(value, fromUnit, toUnit);
            default:
                throw new Exception("Unsupported unit category: " + fromCategory);
        }
    }
    
    public static void main(String[] args) {
        UnitConverterApp converter = new UnitConverterApp();
        BufferedReader reader = new BufferedReader(new InputStreamReader(System.in));
        
        // Signal that the service is ready
        System.out.println("READY");
        System.out.flush();
        
        try {
            String line;
            while ((line = reader.readLine()) != null) {
                line = line.trim();
                if (line.isEmpty()) {
                    continue;
                }
                
                String[] parts = line.split("\\s+");
                if (parts.length != 4) {
                    String requestId = parts.length > 0 ? parts[0] : "unknown";
                    System.out.println(requestId + " ERROR Invalid input format");
                    System.out.flush();
                    continue;
                }
                
                String requestId = parts[0];
                try {
                    double value = Double.parseDouble(parts[1]);
                    String fromUnit = parts[2];
                    String toUnit = parts[3];
                    
                    double result = converter.convert(value, fromUnit, toUnit);
                    System.out.printf("%s %.10f%n", requestId, result);
                    System.out.flush();
                    
                } catch (NumberFormatException e) {
                    System.out.println(requestId + " ERROR Invalid number format");
                    System.out.flush();
                } catch (Exception e) {
                    System.out.println(requestId + " ERROR " + e.getMessage());
                    System.out.flush();
                }
            }
        } catch (IOException e) {
            System.err.println("Error reading input: " + e.getMessage());
        }
    }
}