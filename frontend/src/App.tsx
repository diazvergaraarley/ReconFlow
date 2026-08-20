import React, { useState, useRef, useCallback } from 'react';
import { BrowserRouter, Routes, Route, Link, useLocation } from 'react-router-dom';
import DashboardView from './views/DashboardView';
import HistoryView from './views/HistoryView';

/** Tipos de la aplicación */
interface Theme {
  id: string;
  val: string;
  name: string;
  isDarkTheme: boolean;
}

const THEMES: Theme[] = [
  { id: 'light', val: '#F4F1EC', name: 'Claro', isDarkTheme: false },
  { id: 'dark', val: '#121212', name: 'Oscuro', isDarkTheme: true },
];

/** Propiedades compartidas para los selectores */
interface SelectorProps {
  isDark: boolean;
}

interface ThemeSelectorProps extends SelectorProps {
  activeThemeIndex: number;
  setActiveThemeIndex: (index: number) => void;
}

/**
 * Componente: ThemeSelector
 * Renderiza el selector de temas con efecto de lupa líquida.
 */
const ThemeSelector: React.FC<ThemeSelectorProps> = React.memo(({ activeThemeIndex, setActiveThemeIndex, isDark }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isHovering, setIsHovering] = useState(false);
  const [hoverX, setHoverX] = useState<number | null>(null);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    setIsHovering(true);
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const x = Math.max(0, Math.min(e.clientX - rect.left, rect.width)); 
      setHoverX(x);
    }
  }, []);

  const handleMouseLeave = useCallback(() => {
    setIsHovering(false);
    setHoverX(null);
  }, []);

  const dropSize = 36;
  const dropX = hoverX !== null ? hoverX - (dropSize / 2) : (activeThemeIndex * 40 - (dropSize - 24) / 2);
  
  let lensIndex = activeThemeIndex;
  if (isHovering && hoverX !== null) {
    lensIndex = Math.max(0, Math.min(Math.round((hoverX - 12) / 40), THEMES.length - 1));
  }

  const hardGlassClass = `shadow-lg border border-white/30 backdrop-blur-sm bg-white/${isDark ? '10' : '30'}`;
  const glassShadows = `inset 1px 1px 2px rgba(255,255,255,${isDark ? '0.8' : '0.9'}), inset -1px -1px 3px rgba(0,0,0,0.3), 0 4px 10px rgba(0,0,0,0.2)`;

  return (
    <div className={`flex items-center px-4 py-2 rounded-full border shadow-sm transition-colors ${
      isDark ? 'bg-white/10 border-white/20' : 'bg-black/5 border-black/10' 
    }`}>
      <span className="text-sm font-bold mr-4 opacity-80">Tema</span>
      <div 
        className="relative flex items-center space-x-4 cursor-pointer py-2"
        ref={containerRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      >
        <div 
          className={`absolute top-1/2 pointer-events-none z-20 ${isHovering ? 'liquid-drop' : 'rounded-full'} ${hardGlassClass}`}
          style={{
            width: `${dropSize}px`, height: `${dropSize}px`,
            transform: `translate3d(${dropX}px, -50%, 0)`, 
            left: 0,
            boxShadow: glassShadows,
            transition: isHovering ? 'transform 0.15s ease-out' : 'transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275), border-radius 0.3s'
          }}
        />
        {THEMES.map((t, i) => (
          <div 
            key={t.id} 
            onClick={() => setActiveThemeIndex(i)} 
            className="w-6 h-6 rounded-full border border-black/20 z-10 shadow-inner" 
            style={{ 
              backgroundColor: t.val, 
              transform: lensIndex === i ? 'scale(1.15)' : 'scale(0.75)',
              transition: 'transform 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
            }} 
          />
        ))}
      </div>
    </div>
  );
});

/**
 * Componente: NavSelector
 * Selector de vistas con pastilla deslizante viscosa.
 */
const NavSelector: React.FC<SelectorProps> = React.memo(({ isDark }) => {
  const location = useLocation();
  const containerRef = useRef<HTMLDivElement>(null);
  const [isHovering, setIsHovering] = useState(false);
  const [hoverX, setHoverX] = useState<number | null>(null);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    setIsHovering(true);
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const x = Math.max(0, Math.min(e.clientX - rect.left, rect.width)); 
      setHoverX(x);
    }
  }, []);

  const handleMouseLeave = useCallback(() => {
    setIsHovering(false);
    setHoverX(null);
  }, []);

  const activeIndex = location.pathname === '/historial' ? 1 : 0;
  const itemWidth = 120; 
  
  const rawDropX = hoverX !== null ? hoverX - (itemWidth / 2) : (activeIndex * itemWidth);
  const dropX = Math.max(0, Math.min(rawDropX, itemWidth)); 

  const hardGlassClass = `shadow-lg border border-white/30 backdrop-blur-md bg-white/${isDark ? '10' : '40'}`;
  const glassShadows = `inset 1px 1px 2px rgba(255,255,255,${isDark ? '0.6' : '0.9'}), inset -1px -1px 3px rgba(0,0,0,0.2), 0 4px 10px rgba(0,0,0,0.15)`;

  return (
    <div className={`flex items-center p-1 rounded-full border ${isDark ? 'bg-white/10 border-white/20' : 'bg-black/5 border-black/10'}`}>
      <div 
        className="relative flex items-center cursor-pointer"
        ref={containerRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      >
        <div 
          className={`absolute top-0 bottom-0 pointer-events-none z-0 ${isHovering ? 'liquid-pill' : 'rounded-full'} ${hardGlassClass}`}
          style={{
            width: `${itemWidth}px`,
            transform: `translate3d(${dropX}px, 0, 0)`,
            left: 0,
            boxShadow: glassShadows,
            transition: isHovering ? 'transform 0.15s ease-out' : 'transform 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275), border-radius 0.3s'
          }}
        />
        <Link to="/" className="w-[120px] text-center py-2 z-10 rounded-full">
          <span className={`text-sm font-semibold transition-colors ${location.pathname === '/' ? (isDark ? 'text-white' : 'text-slate-900') : 'text-current opacity-60 hover:opacity-100'}`}>
            Dashboard
          </span>
        </Link>
        <Link to="/historial" className="w-[120px] text-center py-2 z-10 rounded-full">
          <span className={`text-sm font-semibold transition-colors ${location.pathname === '/historial' ? (isDark ? 'text-white' : 'text-slate-900') : 'text-current opacity-60 hover:opacity-100'}`}>
            Auditoría
          </span>
        </Link>
      </div>
    </div>
  );
});

/**
 * Componente: MainApp
 * Contenedor principal que maneja el estado global y las rutas.
 */
function MainApp() {
  const [activeThemeIndex, setActiveThemeIndex] = useState(0); 
  const [showMockData, setShowMockData] = useState(true);

  const currentTheme = THEMES[activeThemeIndex];
  const isDark = currentTheme.isDarkTheme;

  return (
    <div 
      className={`min-h-screen p-6 font-sans transition-colors duration-700 flex flex-col items-center ${isDark ? 'text-white' : 'text-slate-900'}`}
      style={{ backgroundColor: currentTheme.val }}
    >
      <style>{`
        @keyframes liquidMorph {
          0% { border-radius: 45% 55% 48% 52% / 52% 45% 55% 48%; }
          33% { border-radius: 52% 48% 55% 45% / 48% 55% 45% 52%; }
          66% { border-radius: 48% 52% 45% 55% / 55% 48% 52% 45%; }
          100% { border-radius: 45% 55% 48% 52% / 52% 45% 55% 48%; }
        }
        @keyframes liquidPill {
          0% { border-radius: 30px; }
          33% { border-radius: 30px 24px 28px 26px / 26px 30px 24px 28px; }
          66% { border-radius: 26px 28px 24px 30px / 30px 26px 28px 24px; }
          100% { border-radius: 30px; }
        }
        .liquid-drop { animation: liquidMorph 3s ease-in-out infinite; }
        .liquid-pill { animation: liquidPill 3s ease-in-out infinite; }
      `}</style>

      <nav className="w-full max-w-5xl mb-8 flex flex-col sm:flex-row justify-between items-center gap-6">
        <ThemeSelector activeThemeIndex={activeThemeIndex} setActiveThemeIndex={setActiveThemeIndex} isDark={isDark} />
        <NavSelector isDark={isDark} />
      </nav>

      <div className="w-full max-w-6xl">
        <Routes>
          <Route path="/" element={<DashboardView isDark={isDark} showMockData={showMockData} />} />
          <Route path="/historial" element={<HistoryView isDark={isDark} showMockData={showMockData} setShowMockData={setShowMockData} />} />
        </Routes>
      </div>
    </div>
  );
}

export default function App() {
  return <BrowserRouter><MainApp /></BrowserRouter>;
}