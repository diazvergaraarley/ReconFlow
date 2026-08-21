import React, { ReactNode, useRef, useState, useCallback } from 'react';

interface GlassCardProps {
  children: ReactNode;
  className?: string;
  /** Determina el renderizado de reflejos y sombras basándose en el tema */
  isDark?: boolean;
}

/**
 * Componente: GlassCard
 * Contenedor estilizado con refracción, efecto cristal y físicas de inclinación 3D (Suavizadas).
 */
const GlassCard: React.FC<GlassCardProps> = ({ 
  children, 
  className = "",
  isDark = true 
}) => {
  const divRef = useRef<HTMLDivElement>(null);
  const [mouseData, setMouseData] = useState({ x: 0, y: 0, rotateX: 0, rotateY: 0 });
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!divRef.current) return;
    const rect = divRef.current.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    
    // 🔥 EL SECRETO ESTABA AQUÍ: Bajamos el multiplicador de 6 a 1.5
    const rotateX = ((mouseY - centerY) / centerY) * -1.5; 
    const rotateY = ((mouseX - centerX) / centerX) * 1.5;
    
    setMouseData({ x: mouseX, y: mouseY, rotateX, rotateY });
  }, []);

  const handleMouseLeave = useCallback(() => {
    setIsHovered(false);
    setMouseData(prev => ({ ...prev, rotateX: 0, rotateY: 0 }));
  }, []);

  const bgColor = isDark ? 'rgba(255, 255, 255, 0.03)' : 'rgba(255, 255, 255, 0.2)';
  const borderColor = isDark ? 'rgba(255, 255, 255, 0.15)' : 'rgba(255, 255, 255, 0.5)';
  const shadowBase = isDark ? 'rgba(0, 0, 0, 0.3)' : 'rgba(0, 0, 0, 0.08)';

  const insetShadows = `
    inset 1px 1px 2px rgba(255, 255, 255, ${isDark ? '0.7' : '0.9'}),
    inset -1px -1px 3px rgba(255, 255, 255, ${isDark ? '0.1' : '0.5'}),
    inset 2px 2px 8px rgba(0, 150, 255, ${isDark ? '0.15' : '0.08'}),
    inset -2px -2px 8px rgba(255, 100, 0, ${isDark ? '0.1' : '0.05'})
  `;

  return (
    <div 
      ref={divRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={handleMouseLeave}
      className={`relative overflow-hidden ${className}`}
      style={{
        // 🔥 TAMBIÉN AQUÍ: Bajamos el scale3d de 1.02 a 1.005 para que no "salte" hacia la pantalla
        transform: `perspective(1000px) rotateX(${mouseData.rotateX}deg) rotateY(${mouseData.rotateY}deg) scale3d(${isHovered ? 1.005 : 1}, ${isHovered ? 1.005 : 1}, 1)`,
        transition: 'transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275), box-shadow 0.4s ease',
        transformStyle: 'preserve-3d',
        backgroundColor: bgColor,
        backdropFilter: 'blur(12px)',                 
        WebkitBackdropFilter: 'blur(12px)',           
        borderRadius: '24px', 
        border: `1px solid ${borderColor}`,
        boxShadow: `0px 8px 25px ${shadowBase}`,
      }}
    >
      {/* Reflejos superiores (Hard Glass) */}
      <div className="pointer-events-none absolute inset-0 z-20 rounded-[23px]" style={{ boxShadow: insetShadows }} />

      {/* Luz reactiva */}
      <div 
        className="pointer-events-none absolute inset-0 z-20 transition-opacity duration-300"
        style={{
          opacity: isHovered ? 1 : 0,
          background: `radial-gradient(250px circle at ${mouseData.x}px ${mouseData.y}px, rgba(255, 255, 255, ${isDark ? '0.1' : '0.3'}), transparent 70%)`
        }}
      />

      <div className="relative z-10 h-full w-full" style={{ transform: 'translateZ(10px)' }}>
        {children}
      </div>
    </div>
  );
};

export default GlassCard;