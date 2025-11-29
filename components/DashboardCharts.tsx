import React from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, 
  Line, ComposedChart, PieChart, Pie, Cell, Area 
} from 'recharts';
import { SaleRecord } from '../types';
import { MONTHLY_LEADS, COLORS, MONTH_NAMES } from '../constants';
import { formatCurrency } from '../utils';

interface ChartsProps {
  filteredRecords: SaleRecord[];
}

export const EvolutionChart: React.FC<ChartsProps> = ({ filteredRecords }) => {
  // Aggregate sales by month
  const salesByMonth = new Array(12).fill(0).map(() => ({ count: 0, value: 0 }));
  filteredRecords.forEach(r => {
    const m = r.data.getMonth();
    salesByMonth[m].count += 1;
    salesByMonth[m].value += r.valor;
  });

  const data = MONTHLY_LEADS.map((lead, idx) => ({
    name: MONTH_NAMES[idx].substring(0, 3),
    Leads: lead.leads,
    Vendas: salesByMonth[idx].count,
  })).slice(0, 11); // Show only up to Nov as per hardcoded data

  return (
    <div className="h-full w-full">
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={data} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="colorLeads" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={COLORS.primary} stopOpacity={0.1}/>
              <stop offset="95%" stopColor={COLORS.primary} stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
          <XAxis 
            dataKey="name" 
            axisLine={false} 
            tickLine={false} 
            tick={{ fill: '#64748b', fontSize: 12 }} 
            dy={10}
          />
          <YAxis 
            yAxisId="left" 
            axisLine={false} 
            tickLine={false} 
            tick={{ fill: '#64748b', fontSize: 12 }} 
            label={{ value: 'Leads', angle: -90, position: 'insideLeft', fill: '#94a3b8' }}
          />
          <YAxis 
            yAxisId="right" 
            orientation="right" 
            axisLine={false} 
            tickLine={false}
            tick={{ fill: '#64748b', fontSize: 12 }}
            label={{ value: 'Contratos', angle: 90, position: 'insideRight', fill: '#94a3b8' }}
          />
          <Tooltip 
            contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
          />
          <Legend wrapperStyle={{ paddingTop: '20px' }}/>
          <Area 
            yAxisId="left" 
            type="monotone" 
            dataKey="Leads" 
            fill="url(#colorLeads)" 
            stroke={COLORS.primary} 
            strokeWidth={2}
          />
          <Line 
            yAxisId="right" 
            type="monotone" 
            dataKey="Vendas" 
            stroke={COLORS.success} 
            strokeWidth={3} 
            dot={{ r: 4, fill: COLORS.success, strokeWidth: 2, stroke: '#fff' }}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
};

export const OperatorDonut: React.FC<ChartsProps> = ({ filteredRecords }) => {
  const dataMap = new Map<string, number>();
  filteredRecords.forEach(r => {
    dataMap.set(r.operadora, (dataMap.get(r.operadora) || 0) + r.valor);
  });

  const data = Array.from(dataMap.entries())
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);

  return (
    <div className="h-full w-full relative group">
      {/* Center Text - Placed behind via z-index or rendering order, but positioning absolute helps */}
      <div className="absolute top-[40%] left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none z-0">
        <p className="text-[10px] text-slate-500 uppercase tracking-wide">Contratos</p>
        <p className="text-sm font-bold text-slate-800">{filteredRecords.length}</p>
      </div>
      
      <ResponsiveContainer width="100%" height="100%" className="relative z-10">
        <PieChart>
          <Pie
            data={data}
            innerRadius={65}
            outerRadius={85}
            paddingAngle={2}
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS.chartPalette[index % COLORS.chartPalette.length]} />
            ))}
          </Pie>
          <Tooltip 
             formatter={(value: number) => formatCurrency(value)}
             contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e2e8f0', zIndex: 50 }}
             itemStyle={{ color: '#1e293b' }}
             wrapperStyle={{ zIndex: 100 }}
          />
          <Legend 
            layout="horizontal" 
            verticalAlign="bottom" 
            align="center" 
            wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

export const GenderDonut: React.FC<ChartsProps> = ({ filteredRecords }) => {
  // Aggregate both count and money
  const dataMap = { 
    'F': { count: 0, money: 0 }, 
    'M': { count: 0, money: 0 } 
  };
  
  filteredRecords.forEach(r => {
    // Normalize gender input. Default to M (Homem) if not clearly F.
    const g = r.genero ? r.genero.toUpperCase().trim().charAt(0) : 'M';
    const key = g === 'F' ? 'F' : 'M';
    dataMap[key].count++;
    dataMap[key].money += r.valor;
  });

  const data = [
    { name: 'Mulher', short: 'F', value: dataMap['F'].count, money: dataMap['F'].money, color: '#ec4899' }, // Pink
    { name: 'Homem', short: 'H', value: dataMap['M'].count, money: dataMap['M'].money, color: '#3b82f6' }, // Blue
  ].filter(d => d.value > 0);

  const totalCount = data.reduce((acc, curr) => acc + curr.value, 0);
  const totalMoney = data.reduce((acc, curr) => acc + curr.money, 0);

  const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, index }: any) => {
    // Hide label if percentage is very small to avoid overlap
    if (percent < 0.05) return null;

    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);
  
    return (
      <text 
        x={x} 
        y={y} 
        fill="white" 
        textAnchor="middle" 
        dominantBaseline="central" 
        fontSize="12" 
        fontWeight="bold"
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const { name, value, money } = payload[0].payload;
      return (
        <div className="bg-white p-3 border border-slate-200 shadow-lg rounded-lg" style={{ zIndex: 100 }}>
          <p className="font-bold text-slate-800 text-sm mb-1">{name}</p>
          <div className="space-y-1">
            <p className="text-xs text-slate-600">
              Contratos: <span className="font-semibold text-slate-800">{value}</span>
            </p>
            <p className="text-xs text-slate-600">
              Total: <span className="font-semibold text-emerald-600">{formatCurrency(money)}</span>
            </p>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="h-full w-full relative">
      <div className="absolute top-[50%] left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none z-0">
        <p className="text-[10px] text-slate-400 font-medium uppercase">Contratos</p>
        <p className="text-xl font-bold text-slate-800 leading-none">{totalCount}</p>
        <p className="text-[10px] text-emerald-600 font-semibold mt-1">{formatCurrency(totalMoney)}</p>
      </div>

      <ResponsiveContainer width="100%" height="100%" className="relative z-10">
        <PieChart>
          <Pie
            data={data}
            innerRadius={55}
            outerRadius={85}
            paddingAngle={2}
            dataKey="value"
            startAngle={90}
            endAngle={-270}
            label={renderCustomizedLabel}
            labelLine={false}
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} wrapperStyle={{ zIndex: 100 }} />
          <Legend 
            verticalAlign="bottom" 
            height={36}
            formatter={(value, entry: any) => <span className="text-xs font-medium text-slate-600 ml-1">{value} ({entry.payload.value})</span>}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

export const ConsultantRanking: React.FC<ChartsProps> = ({ filteredRecords }) => {
  const dataMap = new Map<string, { value: number, lives: number }>();
  
  filteredRecords.forEach(r => {
    const current = dataMap.get(r.consultor) || { value: 0, lives: 0 };
    dataMap.set(r.consultor, {
      value: current.value + r.valor,
      lives: current.lives + r.vidas
    });
  });

  const data = Array.from(dataMap.entries())
    .map(([name, stats]) => ({ name, value: stats.value, lives: stats.lives }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 7); // Top 7

  // Custom Tooltip to show Lives
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-slate-200 shadow-lg rounded-lg">
          <p className="font-bold text-slate-800 text-sm mb-1">{label}</p>
          <div className="space-y-1">
            <p className="text-xs text-slate-600">
              Vendido: <span className="font-semibold text-blue-600">{formatCurrency(payload[0].value)}</span>
            </p>
            <p className="text-xs text-slate-600">
              Vidas: <span className="font-semibold text-emerald-600">{payload[0].payload.lives}</span>
            </p>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="h-full w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
          <XAxis 
            dataKey="name" 
            axisLine={false} 
            tickLine={false} 
            tick={{ fill: '#64748b', fontSize: 10 }}
            interval={0}
            tickFormatter={(val) => val.split(' ')[0]} // Show first name only to fit
          />
          <YAxis 
            axisLine={false} 
            tickLine={false} 
            tick={{ fill: '#64748b', fontSize: 11 }}
            tickFormatter={(val) => `R$${(val/1000).toFixed(0)}k`}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: '#f1f5f9' }} />
          <Bar dataKey="value" fill={COLORS.secondary} radius={[4, 4, 0, 0]} barSize={30} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export const SourceAnalysis: React.FC<ChartsProps> = ({ filteredRecords }) => {
  const dataMap = new Map<string, { value: number, lives: number }>();
  filteredRecords.forEach(r => {
    const current = dataMap.get(r.fonte) || { value: 0, lives: 0 };
    dataMap.set(r.fonte, {
      value: current.value + r.valor,
      lives: current.lives + r.vidas
    });
  });

  const data = Array.from(dataMap.entries())
    .map(([name, stats]) => ({ name, value: stats.value, lives: stats.lives }))
    .sort((a, b) => b.value - a.value);

  // Custom Tooltip to show Lives (Same structure as ConsultantRanking)
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-slate-200 shadow-lg rounded-lg">
          <p className="font-bold text-slate-800 text-sm mb-1">{label}</p>
          <div className="space-y-1">
            <p className="text-xs text-slate-600">
              Vendido: <span className="font-semibold text-blue-600">{formatCurrency(payload[0].value)}</span>
            </p>
            <p className="text-xs text-slate-600">
              Vidas: <span className="font-semibold text-emerald-600">{payload[0].payload.lives}</span>
            </p>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="h-full w-full">
       <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
          <XAxis 
            dataKey="name" 
            axisLine={false} 
            tickLine={false} 
            tick={{ fill: '#64748b', fontSize: 11 }}
          />
          <YAxis 
            axisLine={false} 
            tickLine={false} 
            tick={{ fill: '#64748b', fontSize: 11 }}
            tickFormatter={(val) => `R$${(val/1000).toFixed(0)}k`}
          />
          <Tooltip 
            content={<CustomTooltip />}
            cursor={{ fill: '#f1f5f9' }}
          />
          <Bar dataKey="value" fill={COLORS.accent} radius={[4, 4, 0, 0]} barSize={40} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export const DayOfWeekChart: React.FC<ChartsProps> = ({ filteredRecords }) => {
  const days = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
  const values = new Array(7).fill(0);
  
  filteredRecords.forEach(r => {
    // getDay returns 0 for Sunday, 6 for Saturday
    if (r.data instanceof Date && !isNaN(r.data.getTime())) {
      const dayIndex = r.data.getDay();
      // Changed from summing lives to summing value as requested
      values[dayIndex] += r.valor;
    }
  });

  const data = days.map((day, index) => ({
    name: day,
    valor: values[index]
  }));

  return (
    <div className="h-full w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
          <XAxis 
            dataKey="name" 
            axisLine={false} 
            tickLine={false} 
            tick={{ fill: '#64748b', fontSize: 12 }} 
          />
          <YAxis 
            axisLine={false} 
            tickLine={false} 
            tick={{ fill: '#64748b', fontSize: 11 }}
            tickFormatter={(val) => `R$${(val/1000).toFixed(0)}k`}
          />
          <Tooltip 
            cursor={{ fill: '#f1f5f9' }}
            contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e2e8f0' }}
            formatter={(value: number) => [formatCurrency(value), 'Valor Vendido']}
          />
          <Bar dataKey="valor" fill={COLORS.warning} radius={[4, 4, 0, 0]} barSize={24} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};