export interface ConversionRequest {
  value: number;
  from: string;
  to: string;
  mode: 'node' | 'cpp' | 'python' | 'java';
}

export interface ConversionResponse {
  result: number;
  time_taken_ms: number;
}

export interface ConversionHistory {
  _id?: string;
  input_value: number;
  from_unit: string;
  to_unit: string;
  converted_value: number;
  mode: 'node' | 'cpp' | 'python' | 'java';
  time_taken_ms: number;
  timestamp: Date;
}