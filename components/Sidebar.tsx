import React from 'react';
import { Filter, User, Calendar, Briefcase, BarChart3, Building2, Users } from 'lucide-react';
import { FilterState } from '../types';
import { MONTH_NAMES } from '../constants';

interface SidebarProps {
  filters: FilterState;
  setFilters: React.Dispatch<React.SetStateAction<FilterState>>;
  uniqueConsultants: string[];
  uniqueTypes: string[];
  uniqueOperators: string[];
  uniqueGenders: string[];
  isOpen: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({ 
  filters, 
  setFilters, 
  uniqueConsultants, 
  uniqueTypes,
  uniqueOperators,
  uniqueGenders,
  isOpen
}) => {
  
  const toggleMonth = (index: number) => {
    setFilters(prev => {
      const exists = prev.months.includes(index);
      return {
        ...prev,
        months: exists ? prev.months.filter(m => m !== index) : [...prev.months, index]
      };
    });
  };

  const toggleConsultant = (name: string) => {
    setFilters(prev => {
      const exists = prev.consultants.includes(name);
      return {
        ...prev,
        consultants: exists ? prev.consultants.filter(c => c !== name) : [...prev.consultants, name]
      };
    });
  };

  const toggleType = (type: string) => {
    setFilters(prev => {
      const exists = prev.types.includes(type);
      return {
        ...prev,
        types: exists ? prev.types.filter(t => t !== type) : [...prev.types, type]
      };
    });
  };

  const toggleOperator = (op: string) => {
    setFilters(prev => {
      const exists = prev.operators.includes(op);
      return {
        ...prev,
        operators: exists ? prev.operators.filter(o => o !== op) : [...prev.operators, op]
      };
    });
  };

  const toggleGender = (gender: string) => {
    setFilters(prev => {
      const exists = prev.genders.includes(gender);
      return {
        ...prev,
        genders: exists ? prev.genders.filter(g => g !== gender) : [...prev.genders, gender]
      };
    });
  };

  const sidebarClasses = `
    fixed inset-y-0 left-0 z-50 w-72 bg-white/80 backdrop-blur-xl border-r border-slate-200/60 transform transition-transform duration-300 ease-in-out
    ${isOpen ? 'translate-x-0' : '-translate-x-full'}
    lg:relative lg:translate-x-0 overflow-y-auto custom-scrollbar shadow-[20px_0_40px_-10px_rgba(0,0,0,0.03)]
  `;

  return (
    <aside className={sidebarClasses}>
      <div className="p-8">
        <div className="flex items-center gap-3 mb-10 group cursor-default">
          <div className="bg-gradient-to-br from-blue-600 to-indigo-600 p-2.5 rounded-xl shadow-lg shadow-blue-500/30 group-hover:scale-105 transition-transform duration-300">
            <BarChart3 className="w-6 h-6 text-white" strokeWidth={2} />
          </div>
          <h1 className="text-xl font-bold text-slate-800 tracking-tight">Unipam<span className="text-blue-600">Analytics</span></h1>
        </div>

        {/* Filters */}
        <div className="space-y-8">
          <div className="flex items-center gap-2 text-slate-800 font-bold text-lg pb-3 border-b border-slate-100/80">
            <Filter className="w-5 h-5 text-blue-600" />
            <h2>Filtros</h2>
          </div>

          {/* Month Filter */}
          <div>
            <label className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">
              <Calendar className="w-3.5 h-3.5" /> Mês de Referência
            </label>
            <div className="grid grid-cols-3 gap-2">
              {MONTH_NAMES.map((month, idx) => {
                 const isSelected = filters.months.includes(idx);
                 return (
                  <button
                    key={month}
                    onClick={() => toggleMonth(idx)}
                    className={`
                      px-2 py-1.5 text-xs font-medium rounded-lg transition-all duration-200
                      ${isSelected 
                        ? 'bg-blue-600 text-white shadow-[0_4px_12px_-2px_rgba(37,99,235,0.4)] scale-105' 
                        : 'bg-slate-50 text-slate-500 hover:bg-slate-100 hover:text-slate-700'}
                    `}
                  >
                    {month.substring(0, 3)}
                  </button>
                 );
              })}
            </div>
          </div>

          {/* Type Filter */}
          <div>
            <label className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">
              <Briefcase className="w-3.5 h-3.5" /> Tipo (PF/PJ)
            </label>
            <div className="flex flex-wrap gap-2">
              {uniqueTypes.map(type => {
                const isSelected = filters.types.includes(type);
                return (
                  <button
                    key={type}
                    onClick={() => toggleType(type)}
                    className={`
                      px-4 py-1.5 text-xs font-bold rounded-full border transition-all duration-200
                      ${isSelected
                        ? 'bg-indigo-50 border-indigo-200 text-indigo-700 shadow-[0_0_10px_rgba(99,102,241,0.3)]'
                        : 'bg-white border-slate-200 text-slate-500 hover:border-slate-300 hover:text-slate-700'}
                    `}
                  >
                    {type}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Gender Filter (Perfil Demográfico) */}
          <div>
             <label className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">
              <Users className="w-3.5 h-3.5" /> Perfil Demográfico
            </label>
            <div className="flex flex-wrap gap-2">
              {uniqueGenders.map(gender => {
                const isSelected = filters.genders.includes(gender);
                // Simple normalization for display if needed, but keeping original data key
                return (
                  <button
                    key={gender}
                    onClick={() => toggleGender(gender)}
                    className={`
                      px-4 py-1.5 text-xs font-bold rounded-lg border transition-all duration-200
                      ${isSelected
                        ? 'bg-pink-50 border-pink-200 text-pink-700 shadow-[0_0_10px_rgba(236,72,153,0.3)]'
                        : 'bg-white border-slate-200 text-slate-500 hover:border-slate-300 hover:text-slate-700'}
                    `}
                  >
                    {gender}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Operator Filter */}
          <div>
            <label className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">
              <Building2 className="w-3.5 h-3.5" /> Operadoras
            </label>
            <div className="space-y-1 max-h-40 overflow-y-auto pr-2 custom-scrollbar">
              {uniqueOperators.map(op => (
                <label key={op} className="flex items-center space-x-3 cursor-pointer group p-2 rounded-lg hover:bg-slate-50 transition-colors">
                  <div className="relative flex items-center">
                    <input
                      type="checkbox"
                      checked={filters.operators.includes(op)}
                      onChange={() => toggleOperator(op)}
                      className="peer h-4 w-4 cursor-pointer appearance-none rounded border border-slate-300 bg-white checked:border-cyan-600 checked:bg-cyan-600 focus:outline-none transition-all"
                    />
                     <svg
                        className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-white opacity-0 peer-checked:opacity-100 transition-opacity"
                        width="10"
                        height="10"
                        viewBox="0 0 12 12"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M10 3L4.5 8.5L2 6"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                  </div>
                  <span className="text-sm text-slate-600 font-medium group-hover:text-slate-900 transition-colors">{op}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Consultant Filter */}
          <div>
            <label className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">
              <User className="w-3.5 h-3.5" /> Consultores
            </label>
            <div className="space-y-1 max-h-56 overflow-y-auto pr-2 custom-scrollbar">
              {uniqueConsultants.map(consultant => (
                <label key={consultant} className="flex items-center space-x-3 cursor-pointer group p-2 rounded-lg hover:bg-slate-50 transition-colors">
                  <div className="relative flex items-center">
                    <input
                      type="checkbox"
                      checked={filters.consultants.includes(consultant)}
                      onChange={() => toggleConsultant(consultant)}
                      className="peer h-4 w-4 cursor-pointer appearance-none rounded border border-slate-300 bg-white checked:border-blue-600 checked:bg-blue-600 focus:outline-none transition-all"
                    />
                     <svg
                        className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-white opacity-0 peer-checked:opacity-100 transition-opacity"
                        width="10"
                        height="10"
                        viewBox="0 0 12 12"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M10 3L4.5 8.5L2 6"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                  </div>
                  <span className="text-sm text-slate-600 font-medium group-hover:text-slate-900 transition-colors">{consultant}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;