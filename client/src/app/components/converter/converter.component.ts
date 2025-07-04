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
    value: 1, // Changed from 0 to 1 to prevent validation error
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
    { value: 'cpp', label: 'C++' },
    { value: 'python', label: 'Python' },
    { value: 'java', label: 'Java' }
  ];

  constructor(private conversionService: ConversionService) {}

  ngOnInit() {
    this.loadHistory();
  }

  get currentUnits() {
    return this.unitsByCategory[this.selectedCategory as keyof typeof this.unitsByCategory] || [];
  }

  // Get filtered units for "To" dropdown (excluding the selected "From" unit)
  get availableToUnits() {
    return this.currentUnits.filter(unit => unit.value !== this.conversionForm.from);
  }

  onCategoryChange() {
    const firstUnit = this.currentUnits[0]?.value;
    const secondUnit = this.currentUnits[1]?.value || firstUnit;
    
    this.conversionForm.from = firstUnit;
    this.conversionForm.to = secondUnit;
    
    this.result = null;
    this.error = null;
  }

  // Handle "From" unit change and update "To" unit if needed
  onFromUnitChange() {
    // If the "To" unit is the same as the newly selected "From" unit,
    // automatically select a different "To" unit
    if (this.conversionForm.to === this.conversionForm.from) {
      const availableUnits = this.availableToUnits;
      if (availableUnits.length > 0) {
        this.conversionForm.to = availableUnits[0].value;
      }
    }
    
    this.result = null;
    this.error = null;
  }

  onSubmit() {
    if (this.conversionForm.value <= 0) {
      this.error = 'Please enter a valid positive number';
      return;
    }

    // This check is now redundant due to UI filtering, but kept as safety
    if (this.conversionForm.from === this.conversionForm.to) {
      this.error = 'Please select different units for conversion';
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

  getModeDisplayName(mode: string): string {
    const modeObj = this.modes.find(m => m.value === mode);
    return modeObj ? modeObj.label : mode.toUpperCase();
  }
}