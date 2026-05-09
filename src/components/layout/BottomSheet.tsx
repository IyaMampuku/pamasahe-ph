import React, { useState, useEffect } from 'react';
import { motion, useAnimation, type PanInfo } from 'framer-motion';

interface BottomSheetProps {
  children:       React.ReactNode;
  isOpen:         boolean;
  onClose?:       () => void;
  /** Content that is ALWAYS visible (never hidden when collapsed), sits below the drag handle */
  stickyHeader?:  React.ReactNode;
  snapPoints?:    number[]; // % of viewport height exposed at each snap, e.g. [14, 55, 90]
  initialSnap?:   number;
  onSnapChange?:  (index: number) => void;
}

export const BottomSheet: React.FC<BottomSheetProps> = ({
  children,
  isOpen,
  onClose,
  stickyHeader,
  snapPoints = [14, 55, 90],
  initialSnap = 0,
  onSnapChange,
}) => {
  const controls = useAnimation();
  const [snap, setSnap] = useState(initialSnap);

  const calcY = (idx: number) => `${100 - (snapPoints[idx] ?? snapPoints[0])}vh`;

  useEffect(() => {
    controls.start({ y: isOpen ? calcY(snap) : '100vh' });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, snap]);

  const onDragEnd = (_e: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    const threshold = 50;
    let next = snap;
    if (info.offset.y >  threshold) next = Math.max(0, snap - 1);
    if (info.offset.y < -threshold) next = Math.min(snapPoints.length - 1, snap + 1);
    if (next === 0 && snap === 0 && onClose) { onClose(); return; }
    if (next !== snap) { setSnap(next); onSnapChange?.(next); }
    controls.start({ y: calcY(next), transition: { type: 'spring', bounce: 0, duration: 0.35 } });
  };

  const isCollapsed = snap === 0;

  return (
    <motion.div
      initial={{ y: '100vh' }}
      animate={controls}
      drag="y"
      dragConstraints={{ top: 0 }}
      dragElastic={0.12}
      onDragEnd={onDragEnd}
      className="fixed inset-x-0 bottom-0 z-50 flex flex-col bg-white rounded-t-3xl shadow-[0_-4px_30px_rgba(0,0,0,0.13)] w-full h-[100vh] touch-none"
    >
      {/* ── Drag handle — always visible ── */}
      <div className="w-full flex justify-center pt-3 pb-2 cursor-grab active:cursor-grabbing shrink-0">
        <div className="w-10 h-1.5 bg-gray-300 rounded-full" />
      </div>

      {/* ── Sticky header — always visible (nav tabs, route title, etc.) ── */}
      {stickyHeader && (
        <div className="shrink-0 px-4 bg-white relative z-10">
          {stickyHeader}
        </div>
      )}

      {/* ── Scrollable content — hidden when collapsed ── */}
      <div
        className="flex-1 overflow-y-auto overscroll-contain px-4 transition-all duration-300"
        style={{
          // When collapsed: hide content entirely so nothing bleeds through
          maxHeight: isCollapsed ? 0 : '100%',
          overflow:  isCollapsed ? 'hidden' : 'auto',
          opacity:   isCollapsed ? 0 : 1,
          visibility: isCollapsed ? 'hidden' : 'visible',
          paddingBottom: 40,
        }}
      >
        {children}
      </div>
    </motion.div>
  );
};
