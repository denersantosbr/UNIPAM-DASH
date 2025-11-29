import React, { useState } from 'react';
import { Upload, BarChart3 } from 'lucide-react';

interface UploadScreenProps {
  onFileUpload: (file: File) => void;
  onUseSampleData: () => void; // Kept in interface but hidden in UI per request
  isLoading: boolean;
}

const UploadScreen: React.FC<UploadScreenProps> = ({ onFileUpload, isLoading }) => {
  const [isDragging, setIsDragging] = useState(false);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      onFileUpload(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onFileUpload(e.target.files[0]);
    }
  };

  return (
    <div className="min-h-screen relative flex flex-col justify-center items-center p-6 overflow-hidden bg-slate-50">
      
      {/* Background Image Layer */}
      <div className="absolute inset-0 z-0">
        <img 
          // Using a reliable Unsplash image (White/Clean Office) to avoid Google Drive CORS issues
          src="https://images.unsplash.com/photo-1497215728101-856f4ea42174?q=80&w=2070&auto=format&fit=crop" 
          alt="Office Background" 
          className="w-full h-full object-cover"
        />
        {/* Mask/Overlay: Subtle slate tint with blur to mute the image and ensure text readability */}
        <div className="absolute inset-0 bg-white/90 backdrop-blur-[3px]"></div>
        {/* Additional gradient for depth */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-slate-50/50 to-slate-50/90"></div>
      </div>

      {/* Background Animated Blobs - Kept for premium "glow" feel over the muted background */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0 opacity-60">
        <div className="absolute top-[20%] left-[20%] w-96 h-96 bg-blue-400/20 rounded-full blur-[100px] animate-pulse"></div>
        <div className="absolute bottom-[20%] right-[20%] w-96 h-96 bg-indigo-400/20 rounded-full blur-[100px] animate-float"></div>
      </div>

      <div className="max-w-xl w-full text-center space-y-10 relative z-10">
        
        {/* Header with entrance animation */}
        <div className="flex flex-col items-center gap-6 animate-in fade-in slide-in-from-bottom-8 duration-700">
          <div className="relative group">
            <div className="absolute inset-0 bg-blue-600 blur-2xl opacity-20 group-hover:opacity-40 transition-opacity duration-500 rounded-full"></div>
            <div className="relative bg-gradient-to-br from-blue-600 to-indigo-600 p-5 rounded-2xl shadow-xl shadow-blue-500/20 group-hover:scale-105 transition-transform duration-300">
              <BarChart3 className="w-12 h-12 text-white" strokeWidth={1.5} />
            </div>
          </div>
          <div className="space-y-2">
            <h1 className="text-4xl font-bold text-slate-900 tracking-tight">Unipam Analytics</h1>
            <p className="text-slate-500 text-lg font-light tracking-wide">Inteligência Comercial & Performance 2025</p>
          </div>
        </div>

        {/* Upload Card - The Hero Interaction */}
        <div 
          className={`
            relative group bg-white/70 backdrop-blur-xl p-12 rounded-3xl 
            border transition-all duration-500 ease-out cursor-pointer
            ${isDragging 
              ? 'border-blue-500 shadow-[0_0_50px_rgba(59,130,246,0.3)] scale-[1.02]' 
              : 'border-white/60 hover:border-blue-300 shadow-[0_20px_40px_-15px_rgba(0,0,0,0.05)] hover:shadow-[0_20px_40px_-10px_rgba(59,130,246,0.15)]'
            }
          `}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <input 
            type="file" 
            accept=".csv, .xlsx, .xls"
            onChange={handleFileChange}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20"
            disabled={isLoading}
          />
          
          <div className="flex flex-col items-center gap-6 relative z-10">
            <div className={`
              p-5 rounded-2xl transition-all duration-500
              ${isDragging 
                ? 'bg-blue-100 text-blue-600 scale-110 rotate-3' 
                : 'bg-slate-50/80 text-slate-400 group-hover:bg-blue-50 group-hover:text-blue-600 group-hover:-translate-y-2'}
            `}>
              {isLoading ? (
                <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
              ) : (
                <Upload className="w-10 h-10" strokeWidth={1.5} />
              )}
            </div>
            
            <div className="space-y-3">
              <h3 className="text-xl font-semibold text-slate-800 tracking-tight group-hover:text-blue-700 transition-colors">
                {isLoading ? 'Processando dados...' : 'Carregar Base de Vendas'}
              </h3>
              <p className="text-slate-500 font-light group-hover:text-slate-600 transition-colors">
                Arraste seu arquivo <span className="font-medium text-slate-700">.XLSX</span> ou <span className="font-medium text-slate-700">.CSV</span>
              </p>
            </div>

            {/* Simulated Button for visual cue */}
            <div className="mt-4 px-6 py-2.5 bg-white border border-slate-200 rounded-full text-sm font-medium text-slate-600 shadow-sm group-hover:border-blue-200 group-hover:text-blue-600 transition-colors">
              Selecionar Arquivo
            </div>
          </div>
        </div>

      </div>
      
      <div className="fixed bottom-8 flex flex-col items-center gap-2 opacity-60 z-10">
        <p className="text-[10px] uppercase tracking-widest text-slate-500 font-semibold drop-shadow-sm">
          Unipam Dashboard • v2.5 Executive
        </p>
      </div>
    </div>
  );
};

export default UploadScreen;