import mongoose, { Document, Schema } from 'mongoose';

export interface IConversionLog extends Document {
  input_value: number;
  from_unit: string;
  to_unit: string;
  converted_value: number;
  mode: 'node' | 'cpp';
  time_taken_ms: number;
  timestamp: Date;
}

const ConversionLogSchema: Schema = new Schema({
  input_value: {
    type: Number,
    required: true,
    min: 0
  },
  from_unit: {
    type: String,
    required: true,
    enum: [
      // Length units
      'meter', 'feet', 'kilometer', 'mile', 'centimeter', 'inch', 'yard',
      // Mass units
      'kilogram', 'gram', 'pound', 'ounce', 'ton', 'stone',
      // Temperature units
      'celsius', 'fahrenheit', 'kelvin'
    ]
  },
  to_unit: {
    type: String,
    required: true,
    enum: [
      // Length units
      'meter', 'feet', 'kilometer', 'mile', 'centimeter', 'inch', 'yard',
      // Mass units
      'kilogram', 'gram', 'pound', 'ounce', 'ton', 'stone',
      // Temperature units
      'celsius', 'fahrenheit', 'kelvin'
    ]
  },
  converted_value: {
    type: Number,
    required: true
  },
  mode: {
    type: String,
    required: true,
    enum: ['node', 'cpp']
  },
  time_taken_ms: {
    type: Number,
    required: true,
    min: 0
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
});

// Index for better query performance
ConversionLogSchema.index({ timestamp: -1 });
ConversionLogSchema.index({ from_unit: 1, to_unit: 1 });

export default mongoose.model<IConversionLog>('ConversionLog', ConversionLogSchema);