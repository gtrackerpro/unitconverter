import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ConversionRequest, ConversionResponse, ConversionHistory } from '../models/conversion.model';

@Injectable({
  providedIn: 'root'
})
export class ConversionService {
  private apiUrl = 'http://localhost:3000/api';

  constructor(private http: HttpClient) {}

  convert(request: ConversionRequest): Observable<ConversionResponse> {
    return this.http.post<ConversionResponse>(`${this.apiUrl}/convert`, request);
  }

  getHistory(): Observable<ConversionHistory[]> {
    return this.http.get<ConversionHistory[]>(`${this.apiUrl}/history`);
  }
}