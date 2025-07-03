import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ConversionService } from '../../services/conversion.service';
import { ConversionRequest, ConversionResponse, ConversionHistory } from '../../models/conversion.model';

@Component({
  selector: 'app-converter',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './converter.component.html',
  styleUrls: ['./converter.component.css']
})
export class ConverterComponent implements OnInit {
  conversionForm: ConversionRequest = {
    value: 0,
    from: 'meter',
    to: 'feet',
    mode: 'node'
  };

  result: ConversionResponse | null = null;
  history: ConversionHistory[] = [];
  loading = false;
  error: string | null = null;
  selectedCategory = 'length';

  categories = [
    { value: 'length', label: 'Length' },
    { value: 'mass', label: 'Weight/Mass' },
    { value: 'temperature', label: 'Temperature' }
  ];

  unitsByCategory = {
    length: [
      { value: 'meter', label: 'Meter (m)' },
      { value: 'feet', label: 'Feet (ft)' },
      { value: 'kilometer', label: 'Kilometer (km)' },
      { value: 'mile', label: 'Mile (mi)' },
      { value: 'centimeter', label: 'Centimeter (cm)' },
      { value: 'inch', label: 'Inch (in)' },
      { value: 'yard', label: 'Yard (yd)' }
    ],
    mass: [
      { value: 'kilogram', label: 'Kilogram (kg)' },
      { value: 'gram', label: 'Gram (g)' },
      { value: 'pound', label: 'Pound (lb)' },
      { value: 'ounce', label: 'Ounce (oz)' },
      { value: 'ton', label: 'Metric Ton (t)' },
      { value: 'stone', label: 'Stone (st)' }
    ],
    temperature: [
      { value: 'celsius', label: 'Celsius (°C)' },
      { value: 'fahrenheit', label: 'Fahrenheit (°F)' },
      { value: 'kelvin', label: 'Kelvin (K)' }
    ]
  };

  modes = [
    { value: 'node', label: 'Node.js' },
    { value: 'cpp', label: 'C++ (Length only)' }
  ];

  constructor(private conversionService: ConversionService) {}

  ngOnInit() {
    this.loadHistory();
  }

  get currentUnits() {
    return this.unitsByCategory[this.selectedCategory as keyof typeof this.unitsByCategory] || [];
  }

  onCategoryChange() {
    const firstUnit = this.currentUnits[0]?.value;
    const secondUnit = this.currentUnits[1]?.value || firstUnit;
    
    this.conversionForm.from = firstUnit;
    this.conversionForm.to = secondUnit;
    
    // Reset to Node.js mode if C++ is selected and category is not length
    if (this.conversionForm.mode === 'cpp' && this.selectedCategory !== 'length') {
      this.conversionForm.mode = 'node';
    }
    
    this.result = null;
    this.error = null;
  }

  onModeChange() {
    // Prevent C++ mode for non-length categories
    if (this.conversionForm.mode === 'cpp' && this.selectedCategory !== 'length') {
      this.conversionForm.mode = 'node';
      this.error = 'C++ mode is only available for length conversions';
      setTimeout(() => this.error = null, 3000);
    }
  }

  onSubmit() {
    if (this.conversionForm.value <= 0) {
      this.error = 'Please enter a valid positive number';
      return;
    }

    if (this.conversionForm.from === this.conversionForm.to) {
      this.error = 'Please select different units for conversion';
      return;
    }

    // Validate C++ mode usage
    if (this.conversionForm.mode === 'cpp' && this.selectedCategory !== 'length') {
      this.error = 'C++ mode is only available for length conversions';
      return;
    }

    this.loading = true;
    this.error = null;

    this.conversionService.convert(this.conversionForm).subscribe({
      next: (response) => {
        this.result = response;
        this.loading = false;
        this.loadHistory(); // Refresh history after conversion
      },
      error: (error) => {
        this.error = error.error?.message || 'An error occurred during conversion';
        this.loading = false;
      }
    });
  }

  loadHistory() {
    this.conversionService.getHistory().subscribe({
      next: (history) => {
        this.history = history;
      },
      error: (error) => {
        console.error('Error loading history:', error);
      }
    });
  }

  getUnitLabel(value: string): string {
    // Search through all categories
    for (const category of Object.values(this.unitsByCategory)) {
      const unit = category.find(u => u.value === value);
      if (unit) return unit.label;
    }
    return value;
  }

  getCategoryLabel(fromUnit: string, toUnit: string): string {
    for (const [categoryKey, units] of Object.entries(this.unitsByCategory)) {
      if (units.some(u => u.value === fromUnit) && units.some(u => u.value === toUnit)) {
        const category = this.categories.find(c => c.value === categoryKey);
        return category ? category.label : categoryKey;
      }
    }
    return 'Unknown';
  }

  formatDate(date: Date): string {
    return new Date(date).toLocaleString();
  }
}