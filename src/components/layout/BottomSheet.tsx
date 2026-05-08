import React, { useRef, useState, useEffect } from 'react';
import { motion, useAnimation, type PanInfo } from 'framer-motion';

interface BottomSheetProps {
  children: React.ReactNode;
  isOpen: boolean;
  onClose?: () => void;
  snapPoints?: number[]; // Percentage of screen height, e.g. [30, 70]
  initialSnap?: number;
}

export const BottomSheet: React.FC<BottomSheetProps> = ({ 
  children, 
  isOpen, 
  onClose,
  snapPoints = [30, 70],
  initialSnap = 0
}) => {
  const controls = useAnimation();
  const [currentSnap, setCurrentSnap] = useState(initialSnap);
  const containerRef = useRef<HTMLDivElement>(null);

  const calculateY = (snapIndex: number) => {
    const snapPercent = snapPoints[snapIndex] || snapPoints[0];
    return `${100 - snapPercent}vh`;
  };

  useEffect(() => {
    if (isOpen) {
      // eslint-disable-next-line react-hooks/exhaustive-deps
      controls.start({ y: calculateY(currentSnap) });
    } else {
      controls.start({ y: '100vh' });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, currentSnap, controls, snapPoints]);

  const onDragEnd = (_event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    const isDraggingDown = info.offset.y > 0;
    const isDraggingUp = info.offset.y < 0;
    const threshold = 50;

    let newSnap = currentSnap;

    if (isDraggingDown && info.offset.y > threshold) {
      newSnap = Math.max(0, currentSnap - 1);
      if (newSnap === 0 && currentSnap === 0 && onClose) {
        onClose();
        return;
      }
    } else if (isDraggingUp && info.offset.y < -threshold) {
      newSnap = Math.min(snapPoints.length - 1, currentSnap + 1);
    }

    setCurrentSnap(newSnap);
    controls.start({ y: calculateY(newSnap), transition: { type: 'spring', bounce: 0, duration: 0.4 } });
  };

  return (
    <motion.div
      ref={containerRef}
      initial={{ y: '100vh' }}
      animate={controls}
      drag="y"
      dragConstraints={{ top: 0 }}
      dragElastic={0.2}
      onDragEnd={onDragEnd}
      className="fixed inset-x-0 bottom-0 z-50 flex flex-col bg-white rounded-t-3xl shadow-[0_-4px_25px_rgba(0,0,0,0.1)] w-full h-[100vh] touch-none"
    >
      <div className="w-full flex justify-center p-4 cursor-grab active:cursor-grabbing">
        <div className="w-12 h-1.5 bg-gray-300 rounded-full" />
      </div>
      <div className="flex-1 overflow-y-auto px-4 pb-6">
        {children}
      </div>
    </motion.div>
  );
};
