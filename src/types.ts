/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Student {
  nisn: string;
  nama: string;
  status: string;
  pdf: string;
}

export type QueryState = 'idle' | 'loading' | 'success' | 'not_found' | 'error';
