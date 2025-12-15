
"use client";

import { useCollaborationStore } from "../store";
import { useCurrentUser } from "@/features/user/hooks";
import React, { useEffect, useRef, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { RemoteCursor } from "../types";

interface CursorOverlayProps {
  content: string;
  textareaRef: React.RefObject<HTMLTextAreaElement>;
}

export function CursorOverlay({ content, textareaRef }: CursorOverlayProps) {
  const { cursors, selfId } = useCollaborationStore();
  const { data: currentUser } = useCurrentUser();
  const [coords, setCoords] = useState<Record<string, { x: number, y: number, height: number }>>({});
  
  const mirrorRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const MotionDiv = motion.div as any;

  // Sync scroll from textarea to cursor container to keep cursors aligned
  useEffect(() => {
    const textarea = textareaRef.current;
    const container = containerRef.current;
    if (!textarea || !container) return;

    const handleScroll = () => {
      // Use transform for performant scrolling of the overlay
      container.style.transform = `translateY(-${textarea.scrollTop}px)`;
    };

    textarea.addEventListener("scroll", handleScroll, { passive: true });
    return () => textarea.removeEventListener("scroll", handleScroll);
  }, [textareaRef]);

  // Copy styles from textarea to mirror div to ensure identical layout
  const syncMirrorStyles = useCallback(() => {
    if (!textareaRef.current || !mirrorRef.current) return;
    
    const textarea = textareaRef.current;
    const mirror = mirrorRef.current;
    const computed = window.getComputedStyle(textarea);

    const properties = [
      'direction', 'boxSizing', 'width', 'height', 'overflowX', 'overflowY',
      'borderTopWidth', 'borderRightWidth', 'borderBottomWidth', 'borderLeftWidth', 'borderStyle',
      'paddingTop', 'paddingRight', 'paddingBottom', 'paddingLeft',
      'fontStyle', 'fontVariant', 'fontWeight', 'fontStretch', 'fontSize', 'fontSizeAdjust', 'lineHeight', 'fontFamily',
      'textAlign', 'textTransform', 'textIndent', 'textDecoration',
      'letterSpacing', 'wordSpacing',
      'tabSize', 'MozTabSize',
      'whiteSpace', 'wordWrap', 'overflowWrap'
    ];

    properties.forEach((prop) => {
      // @ts-ignore
      mirror.style[prop] = computed[prop];
    });

    mirror.style.position = 'absolute';
    mirror.style.top = '0';
    mirror.style.left = '0';
    mirror.style.visibility = 'hidden';
    mirror.style.whiteSpace = 'pre-wrap';
    mirror.style.overflowWrap = 'break-word';
  }, [textareaRef]);

  // Trigger sync when window resizes
  useEffect(() => {
     window.addEventListener('resize', syncMirrorStyles);
     return () => window.removeEventListener('resize', syncMirrorStyles);
  }, [syncMirrorStyles]);

  // Calculate coordinates efficiently
  useEffect(() => {
    if (!textareaRef.current || !mirrorRef.current) return;
    
    syncMirrorStyles();

    const mirror = mirrorRef.current;
    
    // 1. Filter and sort cursors
    const activeCursors = (Object.values(cursors) as RemoteCursor[]).filter(c => c.userId !== selfId);
    if (activeCursors.length === 0) {
      setCoords({});
      return;
    }

    // Sort by position to build string sequentially
    activeCursors.sort((a, b) => a.cursorPosition - b.cursorPosition);

    // 2. Build HTML string (Batch DOM writing)
    let html = '';
    let lastPos = 0;

    activeCursors.forEach(cursor => {
      const pos = Math.min(cursor.cursorPosition, content.length);
      // Escape HTML in content to prevent XSS in mirror
      const textChunk = content.substring(lastPos, pos).replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/\n/g, '<br/>');
      html += textChunk;
      // Add marker span
      html += `<span data-userid="${cursor.userId}">|</span>`;
      lastPos = pos;
    });

    // Append remaining text
    html += content.substring(lastPos).replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/\n/g, '<br/>');
    // Ensure mirror has exact same text ending behavior
    if (content.endsWith('\n')) html += '<br/>'; 
    
    // Update DOM once
    mirror.innerHTML = html;

    // 3. Read coordinates (Batch DOM reading)
    const newCoords: Record<string, { x: number, y: number, height: number }> = {};
    const textareaStyle = window.getComputedStyle(textareaRef.current);
    const borderLeft = parseFloat(textareaStyle.borderLeftWidth);
    const borderTop = parseFloat(textareaStyle.borderTopWidth);

    activeCursors.forEach(cursor => {
      const span = mirror.querySelector(`span[data-userid="${cursor.userId}"]`) as HTMLElement;
      if (span) {
        newCoords[cursor.userId] = {
          x: span.offsetLeft + borderLeft,
          y: span.offsetTop + borderTop,
          height: span.offsetHeight || parseFloat(textareaStyle.lineHeight)
        };
      }
    });

    setCoords(newCoords);
  }, [cursors, content, textareaRef, currentUser, syncMirrorStyles]);

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {/* Persistent Mirror for Performance */}
      <div ref={mirrorRef} className="-z-50 opacity-0" aria-hidden="true" />

      {/* Container that moves with scroll */}
      <div ref={containerRef} className="absolute inset-0 will-change-transform">
        <AnimatePresence>
          {(Object.values(cursors) as RemoteCursor[]).map((cursor) => {
            if (cursor.userId === currentUser?.id) return null;
            const pos = coords[cursor.userId];
            if (!pos) return null;

            return (
              <MotionDiv
                key={cursor.userId}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ 
                  opacity: 1, 
                  scale: 1, 
                  x: pos.x,
                  y: pos.y 
                }}
                exit={{ opacity: 0 }}
                transition={{ 
                  type: "tween",
                  duration: 0.1
                }}
                className="absolute top-0 left-0 z-20 flex flex-col items-start"
              >
                {/* Cursor Bar */}
                <div 
                  className="w-[2px] shadow-sm animate-pulse" 
                  style={{ 
                    backgroundColor: cursor.color,
                    height: pos.height || 24 
                  }} 
                />
                
                {/* Name Tag */}
                <div 
                  className="ml-1 mt-0.5 rounded px-1.5 py-0.5 text-[10px] font-bold text-white shadow-md whitespace-nowrap opacity-100 transition-opacity"
                  style={{ backgroundColor: cursor.color }}
                >
                  {cursor.userName}
                </div>
              </MotionDiv>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
}
