/**
 * Web helpers to stop the browser from treating slider drags
 * as text-selection gestures.
 */

const DRAG_CLASS = 'rp-dragging';

export function lockWebTextSelection() {
  if (typeof document === 'undefined') return;

  document.body.classList.add(DRAG_CLASS);
  const selection = window.getSelection?.();
  selection?.removeAllRanges();

  const block = (e: Event) => {
    e.preventDefault();
  };

  document.addEventListener('selectstart', block, true);
  document.addEventListener('dragstart', block, true);

  return () => {
    document.removeEventListener('selectstart', block, true);
    document.removeEventListener('dragstart', block, true);
    document.body.classList.remove(DRAG_CLASS);
    window.getSelection?.()?.removeAllRanges();
  };
}

export function clearWebSelection() {
  if (typeof window === 'undefined') return;
  window.getSelection?.()?.removeAllRanges();
}
