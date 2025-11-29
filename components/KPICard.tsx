import React from 'react';
import { LucideIcon } from 'lucide-react';

interface KPICardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  variant?: 'default' | 'primary' | 'success';
}

const KPICard: React.FC<KPICardProps> = ({ title, value, subtitle, icon: Icon, variant = 'default' }) => {
  
  const getStyles = () => {
    switch (variant) {
      case 'primary':
        return {
          // Blue neon glow on hover
          wrapper: 'bg-gradient-to-br from-blue-600 to-blue-700 text-white shadow-[0_10px_40px_-10px_rgba(37,99,235,0.3)] hover:shadow-[0_20px_50px_-10px_rgba(37,99,235,0.5)] border-none',
          iconBg: 'bg-white/20 backdrop-blur-md',
          text: 'text-blue-50',
          val: 'text-white'
        };
      case 'success':
        return {
          // Green neon glow on hover
          wrapper: 'bg-white border border-emerald-100 hover:border-emerald-200 shadow-sm hover:shadow-[0_10px_40px_-10px_rgba(16,185,129,0.2)]',
          iconBg: 'bg-emerald-50 text-emerald-600',
          text: 'text-slate-500',
          val: 'text-slate-800'
        };
      default:
        return {
          // Subtle slate glow
          wrapper: 'bg-white border border-slate-100 hover:border-blue-100 shadow-sm hover:shadow-[0_10px_40px_-10px_rgba(148,163,184,0.15)]',
          iconBg: 'bg-blue-50 text-blue-600',
          text: 'text-slate-500',
          val: 'text-slate-800'
        };
    }
  };

  const styles = getStyles();

  return (
    <div className={`
      relative group rounded-2xl p-6 ${styles.wrapper} 
      transition-all duration-300 ease-out 
      hover:-translate-y-1 transform
    `}>
      <div className="flex items-center justify-between mb-4">
        <div className={`
          p-3 rounded-xl ${styles.iconBg} 
          transition-transform duration-500 ease-out 
          group-hover:rotate-12 group-hover:scale-110
        `}>
          <Icon className="w-6 h-6" strokeWidth={1.5} />
        </div>
      </div>
      <h3 className={`text-sm font-medium ${styles.text} mb-1 tracking-wide`}>{title}</h3>
      <div className={`text-3xl font-bold ${styles.val} tracking-tight`}>{value}</div>
      {subtitle && <p className={`text-xs mt-2 opacity-80 ${styles.text} font-medium`}>{subtitle}</p>}
      
      {/* Decorative sheen/shine effect */}
      {variant === 'primary' && (
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none group-hover:bg-white/20 transition-colors duration-500"></div>
      )}
    </div>
  );
};

export default KPICard;