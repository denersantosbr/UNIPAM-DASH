import { MonthlyLead } from './types';

// Hardcoded leads data for 2025 as requested
// JAN: 363, FEV: 411, MAR: 197, ABR: 382, MAI: 459, JUN: 320,
// JUL: 272, AGO: 330, SET: 288, OUT: 221, NOV: 184.
export const MONTHLY_LEADS: MonthlyLead[] = [
  { month: 0, leads: 363 },
  { month: 1, leads: 411 },
  { month: 2, leads: 197 },
  { month: 3, leads: 382 },
  { month: 4, leads: 459 },
  { month: 5, leads: 320 },
  { month: 6, leads: 272 },
  { month: 7, leads: 330 },
  { month: 8, leads: 288 },
  { month: 9, leads: 221 },
  { month: 10, leads: 184 },
  { month: 11, leads: 0 }, // Dec placeholder
];

export const COLORS = {
  primary: '#0ea5e9', // Sky 500
  secondary: '#3b82f6', // Blue 500
  accent: '#6366f1', // Indigo 500
  success: '#10b981', // Emerald 500
  warning: '#f59e0b', // Amber 500
  danger: '#ef4444', // Red 500
  background: '#f8fafc',
  card: '#ffffff',
  text: '#1e293b',
  chartPalette: ['#0ea5e9', '#3b82f6', '#6366f1', '#8b5cf6', '#d946ef', '#f43f5e', '#f97316', '#10b981']
};

export const MONTH_NAMES = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
];