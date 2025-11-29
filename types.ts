export interface SaleRecord {
  id: string;
  data: Date;
  nome: string;
  fonte: string;
  consultor: string;
  operadora: string;
  genero: string;
  tipo: 'PF' | 'PJ';
  vidas: number;
  valor: number;
}

export interface MonthlyLead {
  month: number; // 0 for Jan, 1 for Feb, etc.
  leads: number;
}

export interface FilterState {
  months: number[];
  consultants: string[];
  types: string[];
  operators: string[];
  genders: string[];
}

export interface KPI {
  totalSold: number;
  totalLives: number;
  avgTicketContract: number;
  avgTicketLife: number;
  conversionRate: number;
  pfTicketLife: number;
  pjTicketLife: number;
}