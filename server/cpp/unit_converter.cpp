#include <iostream>
#include <string>
#include <map>
#include <iomanip>

class UnitConverter {
private:
    // Conversion factors to meters
    std::map<std::string, double> conversionFactors = {
        {"meter", 1.0},
        {"feet", 0.3048},
        {"kilometer", 1000.0},
        {"mile", 1609.344}
    };

public:
    double convert(double value, const std::string& from, const std::string& to) {
        auto fromIt = conversionFactors.find(from);
        auto toIt = conversionFactors.find(to);
        
        if (fromIt == conversionFactors.end() || toIt == conversionFactors.end()) {
            throw std::invalid_argument("Unsupported unit");
        }
        
        // Convert to meters first, then to target unit
        double meters = value * fromIt->second;
        double result = meters / toIt->second;
        
        return result;
    }
};

int main(int argc, char* argv[]) {
    if (argc != 4) {
        std::cerr << "Usage: " << argv[0] << " <value> <from_unit> <to_unit>" << std::endl;
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