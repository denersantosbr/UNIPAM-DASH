import React, { useState, useMemo } from 'react';
import { 
  Menu, Wallet, Users, Target, Activity, TrendingUp, Building2, User, FileText 
} from 'lucide-react';
import Sidebar from './components/Sidebar';
import UploadScreen from './components/UploadScreen';
import KPICard from './components/KPICard';
import { 
  EvolutionChart, 
  OperatorDonut, 
  ConsultantRanking, 
  SourceAnalysis,
  GenderDonut,
  DayOfWeekChart
} from './components/DashboardCharts';
import { SaleRecord, FilterState } from './types';
import { processFile, filterRecords, calculateKPIs, generateSampleData, formatCurrency } from './utils';

const App: React.FC = () => {
  // State for data
  const [records, setRecords] = useState<SaleRecord[]>([]);
  const [hasData, setHasData] = useState(false); // Controls which screen is shown
  
  // State for UI
  const [filters, setFilters] = useState<FilterState>({
    months: [],
    consultants: [],
    types: [],
    operators: [],
    genders: []
  });
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  // -- Handlers --

  const handleFileUpload = async (file: File) => {
    setLoading(true);
    try {
      const parsed = await processFile(file);
      if (parsed.length === 0) {
        alert("O arquivo parece vazio ou está fora do padrão esperado.");
        setLoading(false);
        return;
      }
      setRecords(parsed);
      setFilters({ months: [], consultants: [], types: [], operators: [], genders: [] }); // Reset filters
      setHasData(true); // Switch to dashboard view
    } catch (error) {
      console.error("Failed to process file:", error);
      alert("Erro ao processar o arquivo. Verifique se o formato está correto (.csv ou .xlsx).");
    } finally {
      setLoading(false);
    }
  };

  const handleUseSampleData = () => {
    setLoading(true);
    setTimeout(() => {
      const data = generateSampleData();
      setRecords(data);
      setFilters({ months: [], consultants: [], types: [], operators: [], genders: [] });
      setHasData(true);
      setLoading(false);
    }, 800);
  };

  // -- Derived State --

  const filteredData = useMemo(() => filterRecords(records, filters), [records, filters]);
  const kpis = useMemo(() => calculateKPIs(filteredData, filters), [filteredData, filters]);

  const uniqueConsultants = useMemo(() => Array.from(new Set(records.map(r => r.consultor))).sort(), [records]);
  const uniqueTypes = useMemo(() => Array.from(new Set(records.map(r => r.tipo))).sort(), [records]);
  const uniqueOperators = useMemo(() => Array.from(new Set(records.map(r => r.operadora))).sort(), [records]);
  const uniqueGenders = useMemo(() => Array.from(new Set(records.map(r => r.genero))).sort(), [records]);

  // -- Render Logic --

  // 1. If no data loaded yet, show Upload Screen
  if (!hasData) {
    return (
      <UploadScreen 
        onFileUpload={handleFileUpload} 
        onUseSampleData={handleUseSampleData}
        isLoading={loading}
      />
    );
  }

  // Helper for Chart Containers with "Glass" and "Glow" effects
  const ChartContainer = ({ title, icon: Icon, colorClass, children }: any) => (
    <div className="bg-white/70 backdrop-blur-xl p-6 rounded-2xl border border-white/50 shadow-[0_4px_20px_-5px_rgba(0,0,0,0.05)] hover:shadow-[0_10px_30px_-10px_rgba(0,0,0,0.1)] transition-all duration-300 hover:scale-[1.01] flex flex-col h-full group">
      <h3 className="text-sm font-bold text-slate-700 mb-6 flex items-center gap-2 tracking-wide uppercase">
        <div className={`p-1.5 rounded-lg ${colorClass} bg-opacity-10`}>
           <Icon className={`w-4 h-4 ${colorClass.replace('bg-', 'text-')}`} strokeWidth={2} />
        </div>
        {title}
      </h3>
      <div className="flex-1 min-h-0 w-full relative">
        {children}
      </div>
    </div>
  );

  // 2. If data exists, show Main Dashboard
  return (
    <div className="flex h-screen bg-[#f8fafc] overflow-hidden relative selection:bg-blue-100 selection:text-blue-900 font-sans">
      
      {/* Background Ambient Effects (Gradient Blobs) - Premium Feel */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute -top-[10%] -left-[10%] w-[50%] h-[50%] bg-blue-300/20 rounded-full blur-[120px] animate-pulse" style={{ animationDuration: '8s' }}></div>
        <div className="absolute top-[30%] right-[0%] w-[40%] h-[40%] bg-indigo-300/15 rounded-full blur-[100px] animate-float"></div>
        <div className="absolute -bottom-[10%] left-[20%] w-[35%] h-[35%] bg-emerald-200/20 rounded-full blur-[120px]" ></div>
      </div>

      {/* Mobile Menu Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm z-40 lg:hidden transition-opacity"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <Sidebar 
        isOpen={sidebarOpen}
        filters={filters}
        setFilters={setFilters}
        uniqueConsultants={uniqueConsultants}
        uniqueTypes={uniqueTypes}
        uniqueOperators={uniqueOperators}
        uniqueGenders={uniqueGenders}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-full overflow-hidden relative z-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
        {/* Header (Mobile) */}
        <header className="bg-white/80 backdrop-blur-md border-b border-slate-100 h-16 flex items-center justify-between px-6 shrink-0 lg:hidden sticky top-0 z-30">
          <button onClick={() => setSidebarOpen(true)} className="p-2 -ml-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">
            <Menu className="w-6 h-6" />
          </button>
          <span className="font-bold text-slate-800 tracking-tight">Unipam Dashboard</span>
          <div className="w-6" /> 
        </header>

        <main className="flex-1 overflow-y-auto p-6 lg:p-10 custom-scrollbar scroll-smooth">
          <div className="max-w-[1600px] mx-auto space-y-8">
            
            {/* Dashboard Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-4">
              <div>
                <h2 className="text-3xl font-extrabold text-slate-800 tracking-tight">Visão Geral de Vendas</h2>
                <p className="text-slate-500 text-sm mt-1 font-medium tracking-wide">Performance Estratégica &bull; 2025</p>
              </div>
              <div className="flex flex-col md:flex-row gap-3">
                 <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-emerald-700 bg-white/60 backdrop-blur-sm px-4 py-2 rounded-full border border-white/50 shadow-sm self-start md:self-center">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                  </span>
                  Tempo Real
                </div>
              </div>
            </div>

            {/* KPI Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
              <KPICard 
                title="Total Vendido" 
                value={formatCurrency(kpis.totalSold)} 
                icon={Wallet} 
                variant="primary"
              />
              <KPICard 
                title="Total Contratos" 
                value={filteredData.length} 
                icon={FileText} 
                subtitle="Vendas realizadas"
              />
              <KPICard 
                title="Total de Vidas" 
                value={kpis.totalLives} 
                icon={Users} 
                subtitle="Beneficiários ativos"
              />
              <KPICard 
                title="Ticket Médio (Contrato)" 
                value={formatCurrency(kpis.avgTicketContract)} 
                icon={Target} 
              />
              <KPICard 
                title="Ticket Médio (Vida)" 
                value={formatCurrency(kpis.avgTicketLife)} 
                icon={Activity} 
              />
              <KPICard 
                title="Taxa de Conversão" 
                value={`${kpis.conversionRate.toFixed(1)}%`} 
                icon={TrendingUp} 
                variant="success"
                subtitle="Leads vs Vendas"
              />
            </div>

            {/* Segmented Analysis Row (Cards with Glow) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               <div className="group bg-white/70 backdrop-blur-xl p-6 rounded-2xl border border-white/50 shadow-sm hover:shadow-[0_10px_30px_-10px_rgba(99,102,241,0.2)] transition-all duration-300 hover:scale-[1.01] flex items-center justify-between cursor-default">
                  <div className="flex items-center gap-6">
                    <div className="p-4 bg-indigo-50 text-indigo-600 rounded-2xl shadow-inner group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">
                      <User className="w-8 h-8" strokeWidth={1.5} />
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mb-1">Ticket Médio (PF)</p>
                      <p className="text-3xl font-bold text-slate-800">{formatCurrency(kpis.pfTicketLife)}</p>
                    </div>
                  </div>
               </div>
               <div className="group bg-white/70 backdrop-blur-xl p-6 rounded-2xl border border-white/50 shadow-sm hover:shadow-[0_10px_30px_-10px_rgba(139,92,246,0.2)] transition-all duration-300 hover:scale-[1.01] flex items-center justify-between cursor-default">
                  <div className="flex items-center gap-6">
                    <div className="p-4 bg-violet-50 text-violet-600 rounded-2xl shadow-inner group-hover:scale-110 group-hover:-rotate-6 transition-all duration-300">
                      <Building2 className="w-8 h-8" strokeWidth={1.5} />
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mb-1">Ticket Médio (PJ)</p>
                      <p className="text-3xl font-bold text-slate-800">{formatCurrency(kpis.pjTicketLife)}</p>
                    </div>
                  </div>
               </div>
            </div>

            {/* Row 1: Evolution and Weekly Analysis */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[440px]">
              <div className="lg:col-span-2 h-full">
                <ChartContainer title="Evolução Mensal (Leads vs Vendas)" icon={TrendingUp} colorClass="bg-blue-600">
                  <EvolutionChart filteredRecords={filteredData} />
                </ChartContainer>
              </div>
              <div className="h-full">
                <ChartContainer title="Performance por Dia da Semana" icon={Activity} colorClass="bg-amber-500">
                   <DayOfWeekChart filteredRecords={filteredData} />
                </ChartContainer>
              </div>
            </div>

            {/* Row 2: Ranking, Gender, and Operator */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[440px]">
              <div className="h-full">
                 <ChartContainer title="Ranking de Consultores" icon={Users} colorClass="bg-indigo-500">
                    <ConsultantRanking filteredRecords={filteredData} />
                 </ChartContainer>
              </div>
              
               <div className="h-full">
                <ChartContainer title="Perfil Demográfico" icon={User} colorClass="bg-pink-500">
                  <GenderDonut filteredRecords={filteredData} />
                </ChartContainer>
              </div>

               <div className="h-full">
                 <ChartContainer title="Market Share por Operadora" icon={Building2} colorClass="bg-cyan-500">
                    <OperatorDonut filteredRecords={filteredData} />
                 </ChartContainer>
              </div>
            </div>

             {/* Row 3: Source Analysis */}
             <div className="grid grid-cols-1 gap-6 h-[360px] mb-8">
               <div className="h-full">
                 <ChartContainer title="Performance por Fonte (Lead)" icon={Target} colorClass="bg-violet-500">
                    <SourceAnalysis filteredRecords={filteredData} />
                 </ChartContainer>
               </div>
            </div>

          </div>
        </main>
      </div>
    </div>
  );
};

export default App;