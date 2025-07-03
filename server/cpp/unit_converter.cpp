#include <iostream>
#include <string>
#include <map>
#include <iomanip>
#include <stdexcept>

class UnitConverter {
private:
    // Length conversion factors to meters
    std::map<std::string, double> lengthFactors = {
        {"meter", 1.0},
        {"feet", 0.3048},
        {"kilometer", 1000.0},
        {"mile", 1609.344},
        {"centimeter", 0.01},
        {"inch", 0.0254},
        {"yard", 0.9144}
    };

    // Mass conversion factors to kilograms
    std::map<std::string, double> massFactors = {
        {"kilogram", 1.0},
        {"gram", 0.001},
        {"pound", 0.453592},
        {"ounce", 0.0283495},
        {"ton", 1000.0},
        {"stone", 6.35029}
    };

    // Temperature units (special handling required)
    std::vector<std::string> temperatureUnits = {
        "celsius", "fahrenheit", "kelvin"
    };

    std::string getUnitCategory(const std::string& unit) {
        if (lengthFactors.find(unit) != lengthFactors.end()) {
            return "length";
        }
        if (massFactors.find(unit) != massFactors.end()) {
            return "mass";
        }
        for (const auto& tempUnit : temperatureUnits) {
            if (unit == tempUnit) {
                return "temperature";
            }
        }
        return "unknown";
    }

    double convertLength(double value, const std::string& from, const std::string& to) {
        auto fromIt = lengthFactors.find(from);
        auto toIt = lengthFactors.find(to);
        
        if (fromIt == lengthFactors.end() || toIt == lengthFactors.end()) {
            throw std::invalid_argument("Unsupported length unit");
        }
        
        // Convert to meters first, then to target unit
        double meters = value * fromIt->second;
        return meters / toIt->second;
    }

    double convertMass(double value, const std::string& from, const std::string& to) {
        auto fromIt = massFactors.find(from);
        auto toIt = massFactors.find(to);
        
        if (fromIt == massFactors.end() || toIt == massFactors.end()) {
            throw std::invalid_argument("Unsupported mass unit");
        }
        
        // Convert to kilograms first, then to target unit
        double kilograms = value * fromIt->second;
        return kilograms / toIt->second;
    }

    double convertTemperature(double value, const std::string& from, const std::string& to) {
        if (from == to) return value;

        // Convert from source to Celsius first
        double celsius;
        if (from == "celsius") {
            celsius = value;
        } else if (from == "fahrenheit") {
            celsius = (value - 32.0) * 5.0 / 9.0;
        } else if (from == "kelvin") {
            celsius = value - 273.15;
        } else {
            throw std::invalid_argument("Unsupported temperature unit: " + from);
        }

        // Convert from Celsius to target unit
        if (to == "celsius") {
            return celsius;
        } else if (to == "fahrenheit") {
            return (celsius * 9.0 / 5.0) + 32.0;
        } else if (to == "kelvin") {
            return celsius + 273.15;
        } else {
            throw std::invalid_argument("Unsupported temperature unit: " + to);
        }
    }

public:
    double convert(double value, const std::string& from, const std::string& to) {
        std::string fromCategory = getUnitCategory(from);
        std::string toCategory = getUnitCategory(to);
        
        if (fromCategory == "unknown") {
            throw std::invalid_argument("Unsupported unit: " + from);
        }
        
        if (toCategory == "unknown") {
            throw std::invalid_argument("Unsupported unit: " + to);
        }
        
        if (fromCategory != toCategory) {
            throw std::invalid_argument("Cannot convert between different unit categories: " + from + " to " + to);
        }
        
        if (fromCategory == "length") {
            return convertLength(value, from, to);
        } else if (fromCategory == "mass") {
            return convertMass(value, from, to);
        } else if (fromCategory == "temperature") {
            return convertTemperature(value, from, to);
        } else {
            throw std::invalid_argument("Unsupported unit category: " + fromCategory);
        }
    }

    void printSupportedUnits() {
        std::cout << "Supported units by category:" << std::endl;
        
        std::cout << "\nLength: ";
        for (const auto& pair : lengthFactors) {
            std::cout << pair.first << " ";
        }
        
        std::cout << "\nMass: ";
        for (const auto& pair : massFactors) {
            std::cout << pair.first << " ";
        }
        
        std::cout << "\nTemperature: ";
        for (const auto& unit : temperatureUnits) {
            std::cout << unit << " ";
        }
        std::cout << std::endl;
    }
};

int main(int argc, char* argv[]) {
    if (argc == 2 && std::string(argv[1]) == "--help") {
        UnitConverter converter;
        std::cout << "Usage: " << argv[0] << " <value> <from_unit> <to_unit>" << std::endl;
        converter.printSupportedUnits();
        return 0;
    }

    if (argc != 4) {
        std::cerr << "Usage: " << argv[0] << " <value> <from_unit> <to_unit>" << std::endl;
        std::cerr << "Use --help to see supported units" << std::endl;
        return 1;
    }
    
    try {
        double value = std::stod(argv[1]);
        std::string from = argv[2];
        std::string to = argv[3];
        
        UnitConverter converter;
        double result = converter.convert(value, from, to);
        
        // Output with high precision
        std::cout << std::fixed << std::setprecision(10) << result << std::endl;
        
    } catch (const std::exception& e) {
        std::cerr << "Error: " << e.what() << std::endl;
        return 1;
    }
    
    return 0;
}