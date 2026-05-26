/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Student } from './types';

// Visualizer API CSV export is accessible directly over CORS for public spreadsheets
const SPREADSHEET_CSV_URL = 'https://docs.google.com/spreadsheets/d/1HeeFkPZ0Wn4siZzXETJrEa2lVys1Ynmr7xX9w1TFCTk/gviz/tq?tqx=out:csv';

/**
 * Parses double-quoted CSV text into structured Student array.
 * Robust against potential commas within quoted spreadsheet cells.
 */
export function parseCSV(text: string): Student[] {
  const lines = text.split(/\r?\n/);
  const result: Student[] = [];

  for (const line of lines) {
    if (!line.trim()) continue;

    // CSV Split parser respecting double-quotes
    const cols: string[] = [];
    let current = '';
    let inQuotes = false;
    
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        cols.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    cols.push(current.trim());

    // Strip leading/trailing double-quotes from cells
    const cleanedCols = cols.map(c => c.replace(/^"|"$/g, ''));

    // Check if it's the header row and skip it
    if (cleanedCols[0]?.toLowerCase() === 'nisn' || cleanedCols[1]?.toLowerCase() === 'nama') {
      continue;
    }

    if (cleanedCols.length >= 3) {
      result.push({
        nisn: cleanedCols[0] || '',
        nama: cleanedCols[1] || '',
        status: cleanedCols[2] || '',
        pdf: cleanedCols[3] || ''
      });
    }
  }
  return result;
}

/**
 * Fetches sheet data live and returns the parsed list of students.
 */
export async function fetchStudents(): Promise<Student[]> {
  const response = await fetch(SPREADSHEET_CSV_URL);
  if (!response.ok) {
    throw new Error(`Gagal mengunduh data: ${response.statusText}`);
  }
  const text = await response.text();
  return parseCSV(text);
}
