import { useState, useCallback, useRef, useEffect } from 'react';

interface Position {
    x: number;
    y: number;
}

interface DraggableOptions {
    initialPosition?: Position;
    onDragStart?: () => void;
    onDragEnd?: (position: Position) => void;
    onSmartMinimize?: (isMinimizedByDrag: boolean) => void;
    clickThreshold?: number;
    elementWidth?: number;
    elementHeight?: number;
}

export const useDraggable = (options: DraggableOptions = {}) => {
    const {
        initialPosition = { x: 0, y: 0 },
        onDragStart,
        onDragEnd,
        onSmartMinimize,
        clickThreshold = 3,
        elementWidth = 0,
        elementHeight = 0,
    } = options;

    const [position, setPosition] = useState<Position>(initialPosition);
    const [isDragging, setIsDragging] = useState(false);
    const [isMinimizedByDrag, setIsMinimizedByDrag] = useState(false);
    const dragOffset = useRef<Position>({ x: 0, y: 0 });
    const initialMousePos = useRef<Position | null>(null);
    const hasMovedPastThreshold = useRef(false);
    const isMinimizedRef = useRef(false);

    // Clamp position to viewport — the critical function from the local code
    const clampToViewport = useCallback((pos: Position, width: number, height: number): Position => {
        const vw = window.innerWidth;
        const vh = window.innerHeight;
        const padding = 8;
        return {
            x: Math.max(padding, Math.min(pos.x, vw - width - padding)),
            y: Math.max(padding, Math.min(pos.y, vh - height - padding))
        };
    }, []);

    const onMouseDown = useCallback((e: React.MouseEvent | MouseEvent) => {
        if (e instanceof MouseEvent && e.button !== 0) return;
        if ('button' in e && e.button !== 0) return;

        const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
        dragOffset.current = {
            x: e.clientX - rect.left,
            y: e.clientY - rect.top
        };
        initialMousePos.current = { x: e.clientX, y: e.clientY };
        hasMovedPastThreshold.current = false;

        setIsDragging(true);
        if (onDragStart) onDragStart();

        document.body.style.userSelect = 'none';
        document.body.style.cursor = 'grabbing';
    }, [onDragStart]);

    const onMouseMove = useCallback((e: MouseEvent) => {
        if (!isDragging || !initialMousePos.current) return;

        const dx = e.clientX - initialMousePos.current.x;
        const dy = e.clientY - initialMousePos.current.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (!hasMovedPastThreshold.current) {
            if (dist > clickThreshold) {
                hasMovedPastThreshold.current = true;

                // Smart Minimize logic
                if (onSmartMinimize && !isMinimizedRef.current) {
                    onSmartMinimize(true);
                    setIsMinimizedByDrag(true);
                    isMinimizedRef.current = true;
                    // Adjust offset for circular icon (64x64)
                    dragOffset.current = { x: 32, y: 32 };
                }
            } else {
                return;
            }
        }

        const newX = e.clientX - dragOffset.current.x;
        const newY = e.clientY - dragOffset.current.y;

        // Boundary checking — always clamp to viewport
        const currentWidth = isMinimizedRef.current ? 64 : (elementWidth || 100);
        const currentHeight = isMinimizedRef.current ? 64 : (elementHeight || 100);

        const clamped = clampToViewport({ x: newX, y: newY }, currentWidth, currentHeight);
        setPosition(clamped);
    }, [isDragging, clickThreshold, elementWidth, elementHeight, onSmartMinimize, clampToViewport]);

    // Touch support
    const onTouchStart = useCallback((e: React.TouchEvent) => {
        const touch = e.touches[0];
        const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
        dragOffset.current = {
            x: touch.clientX - rect.left,
            y: touch.clientY - rect.top
        };
        initialMousePos.current = { x: touch.clientX, y: touch.clientY };
        hasMovedPastThreshold.current = false;

        setIsDragging(true);
        if (onDragStart) onDragStart();
    }, [onDragStart]);

    const onTouchMove = useCallback((e: TouchEvent) => {
        if (!isDragging || !initialMousePos.current) return;
        e.preventDefault(); // Prevent scrolling while dragging

        const touch = e.touches[0];
        const dx = touch.clientX - initialMousePos.current.x;
        const dy = touch.clientY - initialMousePos.current.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (!hasMovedPastThreshold.current) {
            if (dist > clickThreshold) {
                hasMovedPastThreshold.current = true;
                if (onSmartMinimize && !isMinimizedRef.current) {
                    onSmartMinimize(true);
                    setIsMinimizedByDrag(true);
                    isMinimizedRef.current = true;
                    dragOffset.current = { x: 32, y: 32 };
                }
            } else {
                return;
            }
        }

        const newX = touch.clientX - dragOffset.current.x;
        const newY = touch.clientY - dragOffset.current.y;
        const currentWidth = isMinimizedRef.current ? 64 : (elementWidth || 100);
        const currentHeight = isMinimizedRef.current ? 64 : (elementHeight || 100);
        const clamped = clampToViewport({ x: newX, y: newY }, currentWidth, currentHeight);
        setPosition(clamped);
    }, [isDragging, clickThreshold, elementWidth, elementHeight, onSmartMinimize, clampToViewport]);

    const onMouseUp = useCallback(() => {
        if (!isDragging) return;

        setIsDragging(false);
        if (onDragEnd) onDragEnd(position);

        document.body.style.userSelect = '';
        document.body.style.cursor = '';

        initialMousePos.current = null;
    }, [isDragging, onDragEnd, position]);

    useEffect(() => {
        if (isDragging) {
            window.addEventListener('mousemove', onMouseMove);
            window.addEventListener('mouseup', onMouseUp);
            window.addEventListener('touchmove', onTouchMove, { passive: false });
            window.addEventListener('touchend', onMouseUp);
        } else {
            window.removeEventListener('mousemove', onMouseMove);
            window.removeEventListener('mouseup', onMouseUp);
            window.removeEventListener('touchmove', onTouchMove);
            window.removeEventListener('touchend', onMouseUp);
        }

        return () => {
            window.removeEventListener('mousemove', onMouseMove);
            window.removeEventListener('mouseup', onMouseUp);
            window.removeEventListener('touchmove', onTouchMove);
            window.removeEventListener('touchend', onMouseUp);
        };
    }, [isDragging, onMouseMove, onMouseUp, onTouchMove]);

    return {
        position,
        setPosition,
        isDragging,
        isMinimizedByDrag,
        setIsMinimizedByDrag,
        onMouseDown,
        onTouchStart,
        clampToViewport,
        hasMoved: hasMovedPastThreshold.current,
        resetIsMinimized: () => { isMinimizedRef.current = false; setIsMinimizedByDrag(false); }
    };
};
