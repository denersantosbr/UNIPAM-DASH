import { SaleRecord, FilterState, KPI, MonthlyLead } from './types';
import { MONTHLY_LEADS } from './constants';
import readXlsxFile from 'read-excel-file';

export const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
};

// Helper to clean currency string "R$ 1.200,50" -> 1200.50
// Or return number if already a number
export const parseCurrency = (val: string | number): number => {
  if (typeof val === 'number') return val;
  if (!val) return 0;
  let cleaned = String(val).replace('R$', '').trim();
  cleaned = cleaned.replace(/\./g, ''); // Remove thousands separator
  cleaned = cleaned.replace(',', '.'); // Replace decimal separator
  return parseFloat(cleaned) || 0;
};

// Unified file processor
export const processFile = async (file: File): Promise<SaleRecord[]> => {
  const isExcel = file.name.endsWith('.xlsx') || file.name.endsWith('.xls');
  
  if (isExcel) {
    try {
      const rows = await readXlsxFile(file);
      // rows[0] usually contains headers if present
      // We assume data starts from index 1 if headers exist
      // Safety check: if only 1 row or 0, return empty
      if (rows.length < 2) return [];

      const records: SaleRecord[] = [];
      
      // Skip header (index 0) and iterate
      for (let i = 1; i < rows.length; i++) {
        const row = rows[i];
        
        // Helper to safely get value at index
        const getVal = (idx: number) => (row[idx] !== undefined && row[idx] !== null) ? row[idx] : '';
        
        // Data mapping
        const dateRaw = getVal(0);
        let dateObj = new Date();
        
        if (dateRaw instanceof Date) {
          // CRITICAL FIX: Excel dates are often read as UTC 00:00. 
          // In timezones like Brazil (UTC-3), this creates a Date object for the previous day (21:00).
          // We use the UTC components to construct a Local date with the same face value.
          dateObj = new Date(
            dateRaw.getUTCFullYear(),
            dateRaw.getUTCMonth(),
            dateRaw.getUTCDate()
          );
        } else if (typeof dateRaw === 'string') {
           if (dateRaw.includes('/')) {
              const [day, month, year] = dateRaw.split('/').map(Number);
              dateObj = new Date(year, month - 1, day);
           } else {
              // Try standard parsing, but correct for timezone if it looks like ISO
              const d = new Date(dateRaw);
              if (dateRaw.includes('-') && !dateRaw.includes('T')) {
                 // Format YYYY-MM-DD usually parses to UTC, needing correction
                 dateObj = new Date(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate());
              } else {
                 dateObj = d;
              }
           }
        }

        const tipoRaw = String(getVal(6)).trim().toUpperCase();
        
        records.push({
          id: `row-xlsx-${i}`,
          data: dateObj,
          nome: String(getVal(1)),
          fonte: String(getVal(2)),
          consultor: String(getVal(3)),
          operadora: String(getVal(4)),
          genero: String(getVal(5)),
          tipo: tipoRaw === 'PJ' ? 'PJ' : 'PF',
          vidas: parseInt(String(getVal(7))) || 1,
          valor: parseCurrency(getVal(8) as string | number)
        });
      }
      
      return records;

    } catch (e) {
      console.error("Error parsing Excel file", e);
      throw new Error("Falha ao processar arquivo Excel.");
    }
  } else {
    // CSV Handling
    const text = await file.text();
    return parseCSV(text);
  }
};

export const parseCSV = (csvText: string): SaleRecord[] => {
  const lines = csvText.split('\n');
  const records: SaleRecord[] = [];

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    const values = line.split(','); 
    
    try {
      const dateRaw = values[0];
      const nome = values[1];
      const fonte = values[2];
      const consultor = values[3];
      const operadora = values[4];
      const genero = values[5];
      const tipo = values[6] as 'PF' | 'PJ';
      const vidas = parseInt(values[7]) || 1;
      const valor = parseCurrency(values[8]);

      let dateObj = new Date();
      if (dateRaw.includes('/')) {
        const [day, month, year] = dateRaw.split('/').map(Number);
        dateObj = new Date(year, month - 1, day);
      } else {
        dateObj = new Date(dateRaw);
      }

      records.push({
        id: `row-${i}`,
        data: dateObj,
        nome,
        fonte,
        consultor,
        operadora,
        genero,
        tipo: tipo.trim().toUpperCase() === 'PJ' ? 'PJ' : 'PF',
        vidas,
        valor
      });
    } catch (e) {
      console.warn(`Failed to parse line ${i}`, e);
    }
  }
  return records;
};

export const filterRecords = (records: SaleRecord[], filters: FilterState): SaleRecord[] => {
  return records.filter(record => {
    // Safety check for invalid dates
    if (!(record.data instanceof Date) || isNaN(record.data.getTime())) return false;

    const month = record.data.getMonth();
    
    const matchesMonth = filters.months.length === 0 || filters.months.includes(month);
    const matchesConsultant = filters.consultants.length === 0 || filters.consultants.includes(record.consultor);
    const matchesType = filters.types.length === 0 || filters.types.includes(record.tipo);
    const matchesOperator = filters.operators.length === 0 || filters.operators.includes(record.operadora);
    const matchesGender = filters.genders.length === 0 || filters.genders.includes(record.genero);

    return matchesMonth && matchesConsultant && matchesType && matchesOperator && matchesGender;
  });
};

export const calculateKPIs = (records: SaleRecord[], filters: FilterState): KPI => {
  if (records.length === 0) {
    return {
      totalSold: 0,
      totalLives: 0,
      avgTicketContract: 0,
      avgTicketLife: 0,
      conversionRate: 0,
      pfTicketLife: 0,
      pjTicketLife: 0,
    };
  }

  const totalSold = records.reduce((acc, r) => acc + r.valor, 0);
  const totalLives = records.reduce((acc, r) => acc + r.vidas, 0);
  const avgTicketContract = totalSold / records.length;
  const avgTicketLife = totalLives > 0 ? totalSold / totalLives : 0;

  // Segmented Tickets
  const pfRecords = records.filter(r => r.tipo === 'PF');
  const pjRecords = records.filter(r => r.tipo === 'PJ');
  
  const pfTotal = pfRecords.reduce((acc, r) => acc + r.valor, 0);
  const pfLives = pfRecords.reduce((acc, r) => acc + r.vidas, 0);
  const pfTicketLife = pfLives > 0 ? pfTotal / pfLives : 0;

  const pjTotal = pjRecords.reduce((acc, r) => acc + r.valor, 0);
  const pjLives = pjRecords.reduce((acc, r) => acc + r.vidas, 0);
  const pjTicketLife = pjLives > 0 ? pjTotal / pjLives : 0;

  // Conversion Rate Calculation
  let relevantMonths: number[] = [];
  if (filters.months.length > 0) {
    relevantMonths = filters.months;
  } else {
    // If no filter, use all months present in the data
    relevantMonths = Array.from(new Set(records.map(r => r.data.getMonth())));
  }

  const totalLeads = relevantMonths.reduce((acc, monthIndex) => {
    const leadData = MONTHLY_LEADS.find(l => l.month === monthIndex);
    return acc + (leadData ? leadData.leads : 0);
  }, 0);

  const conversionRate = totalLeads > 0 ? (records.length / totalLeads) * 100 : 0;

  return {
    totalSold,
    totalLives,
    avgTicketContract,
    avgTicketLife,
    conversionRate,
    pfTicketLife,
    pjTicketLife
  };
};

// Generate Sample Data for Demo purposes
export const generateSampleData = (): SaleRecord[] => {
  const consultants = ['Ana Silva', 'Carlos Souza', 'Beatriz Lima', 'João Mendes'];
  const operators = ['Unimed', 'Bradesco', 'Amil', 'SulAmérica', 'Porto Seguro'];
  const sources = ['Google', 'Meta (Facebook/Instagram)', 'Indicação', 'Site'];
  const data: SaleRecord[] = [];

  for (let i = 0; i < 150; i++) {
    const month = Math.floor(Math.random() * 11); // Jan - Nov
    const day = Math.floor(Math.random() * 28) + 1;
    const type = Math.random() > 0.6 ? 'PJ' : 'PF';
    const lives = type === 'PJ' ? Math.floor(Math.random() * 20) + 2 : Math.floor(Math.random() * 3) + 1;
    const baseValue = type === 'PJ' ? 400 : 600;
    
    data.push({
      id: `sample-${i}`,
      data: new Date(2025, month, day),
      nome: `Cliente ${i}`,
      fonte: sources[Math.floor(Math.random() * sources.length)],
      consultor: consultants[Math.floor(Math.random() * consultants.length)],
      operadora: operators[Math.floor(Math.random() * operators.length)],
      genero: Math.random() > 0.5 ? 'M' : 'F',
      tipo: type,
      vidas: lives,
      valor: (lives * baseValue) + (Math.random() * 200)
    });
  }
  return data.sort((a, b) => a.data.getTime() - b.data.getTime());
};