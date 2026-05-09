import React, { useRef, useState, useEffect } from 'react';
import { motion, useAnimation, type PanInfo } from 'framer-motion';

interface BottomSheetProps {
  children:       React.ReactNode;
  isOpen:         boolean;
  onClose?:       () => void;
  snapPoints?:    number[]; // % of screen height exposed, e.g. [12, 55, 90]
  initialSnap?:   number;   // index into snapPoints
  onSnapChange?:  (index: number) => void;
}

export const BottomSheet: React.FC<BottomSheetProps> = ({
  children,
  isOpen,
  onClose,
  snapPoints = [12, 55, 90],
  initialSnap = 0,
  onSnapChange,
}) => {
  const controls    = useAnimation();
  const [snap, setSnap] = useState(initialSnap);
  const containerRef    = useRef<HTMLDivElement>(null);

  // Height of the drag-handle bar (px) — content starts below this
  const HANDLE_BAR_H = 28;

  // How many vh of the sheet is visible at a given snap index
  const visibleVh = (idx: number) => snapPoints[idx] ?? snapPoints[0];

  // translateY so that `visibleVh` percent of screen is above the bottom edge
  const calcY = (idx: number) => `${100 - visibleVh(idx)}vh`;

  useEffect(() => {
    controls.start({ y: isOpen ? calcY(snap) : '100vh' });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, snap]);

  const onDragEnd = (_e: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    const threshold = 50;
    let next = snap;

    if (info.offset.y > threshold)  next = Math.max(0, snap - 1);
    if (info.offset.y < -threshold) next = Math.min(snapPoints.length - 1, snap + 1);

    if (next === 0 && snap === 0 && onClose) { onClose(); return; }

    if (next !== snap) {
      setSnap(next);
      onSnapChange?.(next);
    }
    controls.start({ y: calcY(next), transition: { type: 'spring', bounce: 0, duration: 0.35 } });
  };

  const isCollapsed = snap === 0;

  return (
    <motion.div
      ref={containerRef}
      initial={{ y: '100vh' }}
      animate={controls}
      drag="y"
      dragConstraints={{ top: 0 }}
      dragElastic={0.15}
      onDragEnd={onDragEnd}
      className="fixed inset-x-0 bottom-0 z-50 flex flex-col bg-white rounded-t-3xl shadow-[0_-4px_30px_rgba(0,0,0,0.12)] w-full h-[100vh] touch-none"
    >
      {/* ── Drag handle ── */}
      <div className="w-full flex justify-center pt-3 pb-2 cursor-grab active:cursor-grabbing shrink-0">
        <div className="w-10 h-1.5 bg-gray-300 rounded-full" />
      </div>

      {/* ── Content: hidden when collapsed so text doesn't peek through ── */}
      <div
        className="flex-1 overflow-y-auto overscroll-contain transition-opacity duration-200"
        style={{
          opacity:         isCollapsed ? 0 : 1,
          pointerEvents:   isCollapsed ? 'none' : 'auto',
          paddingLeft:     16,
          paddingRight:    16,
          paddingBottom:   HANDLE_BAR_H,
        }}
      >
        {children}
      </div>
    </motion.div>
  );
};
