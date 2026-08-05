import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  View,
  StyleSheet,
  PanResponder,
  Platform,
  type LayoutChangeEvent,
  type GestureResponderEvent,
  type PointerEvent,
} from 'react-native';
import { colors, noSelect, radius } from '../theme';
import { clearWebSelection, lockWebTextSelection } from '../webSelection';

type Props = {
  value: number;
  minimumValue: number;
  maximumValue: number;
  step?: number;
  onValueChange: (value: number) => void;
  onSlidingStart?: () => void;
  onSlidingComplete?: (value: number) => void;
};

function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n));
}

function snap(n: number, min: number, max: number, step: number) {
  const snapped = Math.round((n - min) / step) * step + min;
  return clamp(snapped, min, max);
}

type CaptureTarget = {
  setPointerCapture?: (id: number) => void;
  releasePointerCapture?: (id: number) => void;
};

/**
 * Custom stake slider with pointer/gesture capture so dragging
 * outside the track (or modal) does not lose control or select text.
 */
export function StakeSlider({
  value,
  minimumValue,
  maximumValue,
  step = 10,
  onValueChange,
  onSlidingStart,
  onSlidingComplete,
}: Props) {
  const trackRef = useRef<View>(null);
  const trackWidthRef = useRef(0);
  const trackPageXRef = useRef(0);
  const valueRef = useRef(value);
  const draggingRef = useRef(false);
  const unlockSelectionRef = useRef<(() => void) | undefined>(undefined);
  const [trackWidth, setTrackWidth] = useState(0);

  valueRef.current = value;

  useEffect(() => {
    return () => {
      unlockSelectionRef.current?.();
      unlockSelectionRef.current = undefined;
    };
  }, []);

  const range = Math.max(1, maximumValue - minimumValue);
  const ratio = clamp((value - minimumValue) / range, 0, 1);

  const measureTrack = useCallback(() => {
    trackRef.current?.measureInWindow((x, _y, width) => {
      trackPageXRef.current = x;
      trackWidthRef.current = width;
      setTrackWidth(width);
    });
  }, []);

  const updateFromPageX = useCallback(
    (pageX: number) => {
      const width = trackWidthRef.current;
      if (width <= 0) return valueRef.current;
      const x = pageX - trackPageXRef.current;
      const next = snap(
        minimumValue + (x / width) * range,
        minimumValue,
        maximumValue,
        step,
      );
      if (next !== valueRef.current) {
        onValueChange(next);
      }
      return next;
    },
    [maximumValue, minimumValue, onValueChange, range, step],
  );

  const startWebDragLock = useCallback(() => {
    clearWebSelection();
    unlockSelectionRef.current?.();
    unlockSelectionRef.current = lockWebTextSelection();
  }, []);

  const stopWebDragLock = useCallback(() => {
    unlockSelectionRef.current?.();
    unlockSelectionRef.current = undefined;
    clearWebSelection();
  }, []);

  const onTrackLayout = (e: LayoutChangeEvent) => {
    const width = e.nativeEvent.layout.width;
    trackWidthRef.current = width;
    setTrackWidth(width);
    measureTrack();
  };

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onStartShouldSetPanResponderCapture: () => true,
        onMoveShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponderCapture: () => true,
        onPanResponderTerminationRequest: () => false,
        onShouldBlockNativeResponder: () => true,
        onPanResponderGrant: (e: GestureResponderEvent) => {
          draggingRef.current = true;
          if (Platform.OS === 'web') startWebDragLock();
          measureTrack();
          onSlidingStart?.();
          updateFromPageX(e.nativeEvent.pageX);
        },
        onPanResponderMove: (e: GestureResponderEvent) => {
          if (!draggingRef.current) return;
          updateFromPageX(e.nativeEvent.pageX);
        },
        onPanResponderRelease: (e: GestureResponderEvent) => {
          const next = updateFromPageX(e.nativeEvent.pageX);
          draggingRef.current = false;
          if (Platform.OS === 'web') stopWebDragLock();
          onSlidingComplete?.(next);
        },
        onPanResponderTerminate: () => {
          draggingRef.current = false;
          if (Platform.OS === 'web') stopWebDragLock();
          onSlidingComplete?.(valueRef.current);
        },
      }),
    [
      measureTrack,
      onSlidingComplete,
      onSlidingStart,
      startWebDragLock,
      stopWebDragLock,
      updateFromPageX,
    ],
  );

  const captureTarget = (e: PointerEvent): CaptureTarget =>
    e.currentTarget as unknown as CaptureTarget;

  const preventBrowserSelect = (e: PointerEvent) => {
    e.preventDefault?.();
    const native = e.nativeEvent as unknown as { preventDefault?: () => void };
    native.preventDefault?.();
  };

  const webPointerProps =
    Platform.OS === 'web'
      ? {
          onPointerDown: (e: PointerEvent) => {
            preventBrowserSelect(e);
            const ne = e.nativeEvent as unknown as {
              pointerId?: number;
              pageX: number;
              preventDefault?: () => void;
            };
            ne.preventDefault?.();
            const pointerId = ne.pointerId ?? 1;
            captureTarget(e).setPointerCapture?.(pointerId);
            draggingRef.current = true;
            startWebDragLock();
            measureTrack();
            onSlidingStart?.();
            updateFromPageX(ne.pageX);
          },
          onMouseDown: (e: PointerEvent) => {
            preventBrowserSelect(e);
          },
          onPointerMove: (e: PointerEvent) => {
            if (!draggingRef.current) return;
            preventBrowserSelect(e);
            updateFromPageX(e.nativeEvent.pageX);
          },
          onPointerUp: (e: PointerEvent) => {
            if (!draggingRef.current) return;
            const ne = e.nativeEvent as unknown as {
              pointerId?: number;
              pageX: number;
            };
            const next = updateFromPageX(ne.pageX);
            draggingRef.current = false;
            captureTarget(e).releasePointerCapture?.(ne.pointerId ?? 1);
            stopWebDragLock();
            onSlidingComplete?.(next);
          },
          onPointerCancel: () => {
            draggingRef.current = false;
            stopWebDragLock();
            onSlidingComplete?.(valueRef.current);
          },
        }
      : {};

  const thumbLeft =
    trackWidth > 0 ? ratio * trackWidth - THUMB_SIZE / 2 : 0;

  return (
    <View
      ref={trackRef}
      style={styles.hitArea}
      onLayout={onTrackLayout}
      {...(Platform.OS === 'web' ? webPointerProps : panResponder.panHandlers)}
    >
      <View style={styles.track}>
        <View style={[styles.fill, { width: `${ratio * 100}%` }]} />
      </View>
      <View
        style={[
          styles.thumb,
          { transform: [{ translateX: Math.max(0, thumbLeft) }] },
        ]}
        pointerEvents="none"
      />
    </View>
  );
}

const THUMB_SIZE = 28;

const styles = StyleSheet.create({
  hitArea: {
    width: '100%',
    height: 48,
    justifyContent: 'center',
    ...noSelect,
    ...(Platform.OS === 'web'
      ? ({
          cursor: 'grab',
          touchAction: 'none',
          WebkitUserDrag: 'none',
          WebkitTouchCallout: 'none',
        } as object)
      : null),
  },
  track: {
    height: 8,
    borderRadius: radius.full,
    backgroundColor: colors.border,
    overflow: 'hidden',
    width: '100%',
    ...noSelect,
  },
  fill: {
    height: '100%',
    backgroundColor: colors.brand,
    borderRadius: radius.full,
  },
  thumb: {
    position: 'absolute',
    left: 0,
    width: THUMB_SIZE,
    height: THUMB_SIZE,
    borderRadius: radius.full,
    backgroundColor: colors.brand,
    borderWidth: 3,
    borderColor: colors.white,
    shadowColor: colors.brand,
    shadowOpacity: 0.55,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 4,
    ...noSelect,
  },
});
