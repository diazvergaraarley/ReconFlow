import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { UploadCloud } from 'lucide-react';
import GlassCard from './GlassCard';

interface UploadZoneProps {
  isDark?: boolean;
}

/**
 * Componente: UploadZone
 * Integra react-dropzone para manejar la carga de archivos XLSX y CSV.
 */
const UploadZone: React.FC<UploadZoneProps> = ({ isDark = true }) => {
  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      alert(`¡Archivo "${acceptedFiles[0].name}" cargado!`);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ 
    onDrop,
    accept: { 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'], 'text/csv': ['.csv'] } 
  });

  const textColor = isDark ? 'text-white' : 'text-slate-900';
  const textMuted = isDark ? 'text-white/80' : 'text-slate-600';
  const borderIdle = isDark ? 'border-white/50' : 'border-slate-400';

  return (
    <GlassCard isDark={isDark} className={`p-8 text-center flex flex-col items-center justify-center cursor-pointer transition-colors ${isDark ? 'hover:bg-white/10' : 'hover:bg-black/5'}`}>
      <div {...getRootProps()} className={`w-full h-full border-2 border-dashed rounded-xl p-10 transition-all ${isDragActive ? 'border-teal-400 bg-teal-400/10' : borderIdle}`}>
        <input {...getInputProps()} />
        <UploadCloud className={`w-16 h-16 mx-auto mb-4 transition-colors ${isDragActive ? 'text-teal-500' : textMuted}`} />
        
        {isDragActive ? (
          <p className="text-teal-600 font-semibold text-lg animate-pulse">¡Suelta el archivo aquí!</p>
        ) : (
          <div>
            <h3 className={`font-bold text-xl mb-2 ${textColor}`}>Carga de Documentos y Facturas</h3>
            <p className={`text-sm ${textMuted}`}>Arrastre y suelte archivos aquí o haga clic para explorar.</p>
            <p className={`text-xs mt-4 font-mono ${textMuted}`}>Soporta .xlsx y .csv</p>
          </div>
        )}
      </div>
    </GlassCard>
  );
};

export default UploadZone;