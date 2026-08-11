import { useEffect } from "react";

// Module-level counter shared by every consumer of this hook. Several
// overlays can independently want the page scroll-locked at the same
// time — the mobile nav drawer, the gallery lightbox, the chat widget.
// Using a shared reference count instead of each consumer blindly setting
// / clearing `overflow: hidden` on its own means one overlay closing
// can't accidentally re-enable scrolling while another is still open.
let lockCount = 0;
let originalOverflow = "";
let originalPaddingRight = "";

function lock() {
  if (lockCount === 0) {
    // Measure the scrollbar's width before hiding it, so we can pad the
    // body by the same amount — otherwise the page shifts sideways by a
    // few pixels every time an overlay opens/closes on desktop browsers
    // with a visible scrollbar.
    const scrollbarWidth =
      window.innerWidth - document.documentElement.clientWidth;
    originalOverflow = document.body.style.overflow;
    originalPaddingRight = document.body.style.paddingRight;
    document.body.style.overflow = "hidden";
    if (scrollbarWidth > 0) {
      document.body.style.paddingRight = `${scrollbarWidth}px`;
    }
  }
  lockCount += 1;
}

function unlock() {
  lockCount = Math.max(0, lockCount - 1);
  if (lockCount === 0) {
    document.body.style.overflow = originalOverflow;
    document.body.style.paddingRight = originalPaddingRight;
  }
}

// Locks page scroll for as long as `locked` is true. Use this for any
// overlay that sits on top of page content — mobile nav drawers, modals /
// lightboxes, slide-in panels (like the chat widget) — so the page behind
// it can't be scrolled while it's open.
export function useLockBodyScroll(locked) {
  useEffect(() => {
    if (!locked) return;
    lock();
    return unlock;
  }, [locked]);
}