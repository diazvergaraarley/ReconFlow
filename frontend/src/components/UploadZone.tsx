import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { UploadCloud, Loader2, AlertTriangle, CheckCircle, X, Database } from 'lucide-react';
import GlassCard from './GlassCard';

interface UploadZoneProps { isDark?: boolean; }

interface FacturaAPI {
  numero_factura: string;
  fecha_emision: string;
  entidad_razon_social: string;
  total_factura_cop: number;
  estado_reconciliacion: string;
}

const getBadgeStyle = (estado: string, isDark: boolean): string => {
  const st = estado.toLowerCase();
  if (st.includes('conciliado') || st.includes('procesado')) return isDark ? 'bg-teal-500/20 text-teal-300' : 'bg-teal-50 text-teal-600 border border-teal-100';
  if (st.includes('discrepancia')) return isDark ? 'bg-red-500/20 text-red-300' : 'bg-red-50 text-red-600 border border-red-100';
  return isDark ? 'bg-yellow-500/20 text-yellow-300' : 'bg-yellow-50 text-yellow-600 border border-yellow-100';
};

const UploadZone: React.FC<UploadZoneProps> = ({ isDark = true }) => {
  const [isUploading, setIsUploading] = useState(false);
  const [processedFileNames, setProcessedFileNames] = useState<string[]>([]);
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [lastResult, setLastResult] = useState<FacturaAPI | null>(null);
  const [batchMessage, setBatchMessage] = useState<string | null>(null); // Mensaje para Excels

  const processFile = async (file: File) => {
    setIsUploading(true);
    setLastResult(null);
    setBatchMessage(null);

    // 🔥 LA VÍA EXPRESS: Determinamos a qué ruta mandarlo
    const isExcel = file.name.toLowerCase().endsWith('.xlsx');
    const endpoint = isExcel 
      ? 'http://127.0.0.1:8000/api/facturas/lote' 
      : 'http://127.0.0.1:8000/api/facturas/procesar';

    const formData = new FormData();
    formData.append('archivo', file);

    try {
      const response = await fetch(endpoint, { method: 'POST', body: formData });
      if (!response.ok) throw new Error('Error en el servidor al procesar el archivo');

      const data = await response.json();
      setProcessedFileNames(prev => [...prev, file.name]);
      
      if (isExcel) {
        setBatchMessage(data.mensaje); // Resultado de carga masiva
      } else {
        setLastResult(data); // Resultado de un solo PDF por IA
      }
      
    } catch (error) {
      console.error('Error:', error);
      alert('❌ Ocurrió un error al procesar el documento.');
    } finally {
      setIsUploading(false);
      setPendingFile(null);
    }
  };

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return;
    const file = acceptedFiles[0];
    if (processedFileNames.includes(file.name)) {
      setPendingFile(file);
    } else {
      processFile(file);
    }
  }, [processedFileNames]);

  // 🔥 NUEVO FORMATO ACEPTADO: Excel (.xlsx)
  const { getRootProps, getInputProps, isDragActive } = useDropzone({ 
    onDrop,
    accept: { 
      'application/pdf': ['.pdf'], 
      'image/png': ['.png'], 
      'image/jpeg': ['.jpg', '.jpeg'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'] 
    },
    disabled: isUploading || pendingFile !== null
  });

  const textColor = isDark ? 'text-white' : 'text-slate-900';
  const textMuted = isDark ? 'text-white/80' : 'text-slate-600';
  const borderIdle = isDark ? 'border-white/50' : 'border-slate-400';
  const formatCurrency = (val: number) => new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(val);

  return (
    <div className="w-full flex flex-col items-center max-w-3xl mx-auto space-y-6">
      
      <GlassCard isDark={isDark} className={`w-full p-8 text-center flex flex-col items-center justify-center cursor-pointer transition-colors ${isDark ? 'hover:bg-white/10' : 'hover:bg-black/5'}`}>
        <div {...getRootProps()} className={`w-full h-full border-2 border-dashed rounded-xl p-10 transition-all ${isDragActive ? 'border-teal-400 bg-teal-400/10' : borderIdle} ${isUploading ? 'opacity-50 cursor-not-allowed' : ''}`}>
          <input {...getInputProps()} />
          
          {isUploading ? (
            <div className="flex flex-col items-center justify-center">
              <Loader2 className={`w-16 h-16 mx-auto mb-4 animate-spin ${textMuted}`} />
              <p className="text-teal-500 font-semibold text-lg">Procesando Documento...</p>
              <p className={`text-xs mt-2 ${textMuted}`}>Por favor espera un momento.</p>
            </div>
          ) : (
            <>
              <UploadCloud className={`w-16 h-16 mx-auto mb-4 transition-colors ${isDragActive ? 'text-teal-500' : textMuted}`} />
              {isDragActive ? (
                <p className="text-teal-600 font-semibold text-lg animate-pulse">¡Suelta el archivo aquí!</p>
              ) : (
                <div>
                  <h3 className={`font-bold text-xl mb-2 ${textColor}`}>Carga de Documentos y Facturas</h3>
                  <p className={`text-sm ${textMuted}`}>Arrastre y suelte archivos aquí o haga clic para explorar.</p>
                  {/* TEXTO ACTUALIZADO */}
                  <p className={`text-xs mt-4 font-mono font-bold text-teal-500`}>Soporta .pdf, .png, .jpg y cargas masivas en .xlsx</p>
                </div>
              )}
            </>
          )}
        </div>
      </GlassCard>

      {/* TARJETA: RESULTADO DE PDF/IMAGEN */}
      {lastResult && !isUploading && (
        <div className="w-full animate-in fade-in slide-in-from-bottom-4 duration-500">
          <GlassCard isDark={isDark} className="p-6 w-full relative">
            <button onClick={() => setLastResult(null)} className="absolute top-4 right-4 opacity-50 hover:opacity-100 transition-opacity">
              <X className={`w-5 h-5 ${textColor}`} />
            </button>
            <div className="flex items-center gap-4 mb-4 border-b pb-4 border-gray-500/20">
              <div className={`p-3 rounded-full ${isDark ? 'bg-teal-500/20' : 'bg-teal-100'}`}>
                <CheckCircle className={`w-6 h-6 ${isDark ? 'text-teal-300' : 'text-teal-600'}`} />
              </div>
              <div>
                <h4 className={`text-lg font-bold ${textColor}`}>Factura Procesada con Éxito</h4>
                <p className={`text-sm ${textMuted}`}>La IA ha extraído y reconciliado los siguientes datos:</p>
              </div>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="flex flex-col">
                <span className={`text-[10px] uppercase font-bold opacity-60 ${textColor}`}>ID Factura</span>
                <span className={`font-medium ${textColor}`}>{lastResult.numero_factura}</span>
              </div>
              <div className="flex flex-col">
                <span className={`text-[10px] uppercase font-bold opacity-60 ${textColor}`}>Proveedor</span>
                <span className={`font-medium truncate ${textColor}`} title={lastResult.entidad_razon_social}>{lastResult.entidad_razon_social}</span>
              </div>
              <div className="flex flex-col">
                <span className={`text-[10px] uppercase font-bold opacity-60 ${textColor}`}>Total</span>
                <span className={`font-mono font-bold ${textColor}`}>{formatCurrency(lastResult.total_factura_cop)}</span>
              </div>
              <div className="flex flex-col items-start">
                <span className={`text-[10px] uppercase font-bold opacity-60 mb-1 ${textColor}`}>Estado</span>
                <span className={`px-2 py-1 rounded text-xs font-bold w-full text-center truncate ${getBadgeStyle(lastResult.estado_reconciliacion, isDark)}`}>
                  {lastResult.estado_reconciliacion}
                </span>
              </div>
            </div>
          </GlassCard>
        </div>
      )}

      {/* TARJETA: RESULTADO MASIVO EXCEL */}
      {batchMessage && !isUploading && (
        <div className="w-full animate-in fade-in slide-in-from-bottom-4 duration-500">
          <GlassCard isDark={isDark} className="p-6 w-full relative text-center">
            <button onClick={() => setBatchMessage(null)} className="absolute top-4 right-4 opacity-50 hover:opacity-100 transition-opacity">
              <X className={`w-5 h-5 ${textColor}`} />
            </button>
            <Database className="w-12 h-12 mx-auto mb-4 text-teal-500" />
            <h4 className={`text-xl font-bold mb-2 ${textColor}`}>Base de Datos Actualizada</h4>
            <p className={`font-medium ${textMuted}`}>{batchMessage}</p>
          </GlassCard>
        </div>
      )}

      {/* MODAL DE ADVERTENCIA */}
      {pendingFile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setPendingFile(null)} />
          <div className="relative w-full max-w-md animate-in zoom-in-95 duration-200">
            <GlassCard isDark={isDark} className={`p-8 text-center flex flex-col items-center ${!isDark ? '!bg-white/95 shadow-2xl' : ''}`}>
              <div className="w-16 h-16 bg-yellow-500/20 text-yellow-500 rounded-full flex items-center justify-center mb-4">
                <AlertTriangle className="w-8 h-8" />
              </div>
              <h3 className={`text-xl font-bold mb-2 ${textColor}`}>Archivo Duplicado</h3>
              <p className={`text-sm mb-6 ${textMuted}`}>
                Ya procesaste un archivo llamado <span className="font-bold text-yellow-500">"{pendingFile.name}"</span>. 
                Volver a escanearlo podría sobrescribir datos. ¿Estás seguro de que deseas continuar?
              </p>
              <div className="flex gap-4 w-full">
                <button onClick={() => setPendingFile(null)} className={`flex-1 py-2.5 rounded-lg font-semibold transition-colors border ${isDark ? 'bg-white/10 hover:bg-white/20 border-white/20 text-white' : 'bg-slate-100 hover:bg-slate-200 border-slate-300 text-slate-800'}`}>
                  Cancelar
                </button>
                <button onClick={() => processFile(pendingFile)} className="flex-1 py-2.5 rounded-lg font-semibold bg-yellow-500 hover:bg-yellow-600 text-white shadow-lg transition-colors">
                  Procesar igual
                </button>
              </div>
            </GlassCard>
          </div>
        </div>
      )}

    </div>
  );
};

export default UploadZone;