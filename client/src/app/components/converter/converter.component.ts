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

  units = [
    { value: 'meter', label: 'Meter (m)' },
    { value: 'feet', label: 'Feet (ft)' },
    { value: 'kilometer', label: 'Kilometer (km)' },
    { value: 'mile', label: 'Mile (mi)' }
  ];

  modes = [
    { value: 'node', label: 'Node.js' },
    { value: 'cpp', label: 'C++' }
  ];

  constructor(private conversionService: ConversionService) {}

  ngOnInit() {
    this.loadHistory();
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
    const unit = this.units.find(u => u.value === value);
    return unit ? unit.label : value;
  }

  formatDate(date: Date): string {
    return new Date(date).toLocaleString();
  }
}