import { Request, Response } from 'express';
import { ConversionService } from '../services/conversion.service';
import ConversionLog from '../models/ConversionLog';

export class ConversionController {
  static async convert(req: Request, res: Response) {
    try {
      const { value, from, to, mode } = req.body;

      // Validation
      if (!value || !from || !to || !mode) {
        return res.status(400).json({
          message: 'Missing required fields: value, from, to, mode'
        });
      }

      if (typeof value !== 'number' || value <= 0) {
        return res.status(400).json({
          message: 'Value must be a positive number'
        });
      }

      if (!['node', 'cpp'].includes(mode)) {
        return res.status(400).json({
          message: 'Mode must be either "node" or "cpp"'
        });
      }

      if (!ConversionService.validateUnits(from, to)) {
        return res.status(400).json({
          message: 'Invalid units. Supported units: meter, feet, kilometer, mile'
        });
      }

      if (from === to) {
        return res.status(400).json({
          message: 'From and to units cannot be the same'
        });
      }

      // Perform conversion with timing
      const startTime = performance.now();
      let result: number;

      if (mode === 'node') {
        result = await ConversionService.convertWithNode(value, from, to);
      } else {
        result = await ConversionService.convertWithCpp(value, from, to);
      }

      const endTime = performance.now();
      const timeTaken = Math.round((endTime - startTime) * 100) / 100; // Round to 2 decimal places

      // Log to database
      const conversionLog = new ConversionLog({
        input_value: value,
        from_unit: from,
        to_unit: to,
        converted_value: result,
        mode,
        time_taken_ms: timeTaken
      });

      await conversionLog.save();

      res.json({
        result,
        time_taken_ms: timeTaken
      });

    } catch (error: any) {
      console.error('Conversion error:', error);
      res.status(500).json({
        message: error.message || 'Internal server error during conversion'
      });
    }
  }

  static async getHistory(req: Request, res: Response) {
    try {
      const history = await ConversionLog
        .find()
        .sort({ timestamp: -1 })
        .limit(20)
        .lean();

      res.json(history);
    } catch (error: any) {
      console.error('History retrieval error:', error);
      res.status(500).json({
        message: 'Failed to retrieve conversion history'
      });
    }
  }
}