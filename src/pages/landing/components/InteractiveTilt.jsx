import { useRef, useState, useEffect } from 'react';
import { motion, useSpring, useTransform } from 'framer-motion';

export default function InteractiveTilt({ children, className = '' }) {
  const ref = useRef(null);
  const [isHovered, setIsHovered] = useState(false);

  const x = useSpring(0, { stiffness: 150, damping: 20 });
  const y = useSpring(0, { stiffness: 150, damping: 20 });

  useEffect(() => {
    if (!isHovered) {
      x.set(0);
      y.set(0);
    }
  }, [isHovered, x, y]);

  const handleMouseMove = (e) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    
    const xPct = (mouseX / width - 0.5) * 2;
    const yPct = (mouseY / height - 0.5) * 2;
    
    x.set(xPct);
    y.set(yPct);
  };

  const rotateX = useTransform(y, [-1, 1], [8, -8]);
  const rotateY = useTransform(x, [-1, 1], [-8, 8]);

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        perspective: 1200,
        transformStyle: "preserve-3d",
        rotateX,
        rotateY,
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
