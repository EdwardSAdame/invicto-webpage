// ImageViewer lightbox page code
// @ts-nocheck
import wixWindow from 'wix-window';

// Safe getter
function safe($w, id) { try { return $w(id); } catch { return null; } }

function isValidMediaSrc(v) {
  if (typeof v !== 'string') return false;
  return (
      v.startsWith('https://') || 
      v.startsWith('http://') || 
      v.startsWith('wix:image://') || 
      v.startsWith('wix:document://')
  );
}

$w.onReady(function () {
  // 1) Read context passed from openLightbox(...)
  const ctx = (wixWindow.lightbox.getContext && wixWindow.lightbox.getContext()) || {};

  const images = Array.isArray(ctx.images) ? ctx.images.filter(Boolean) : [];
  let index = Number(ctx.index);
  if (!Number.isInteger(index)) index = 0;
  index = Math.max(0, Math.min(index, Math.max(0, images.length - 1)));

  // 2) Elements (only required ones)
  const $img   = safe($w, '#viewerImage');
  const $close = safe($w, '#viewerClose');

  if (!$img) {
    try { wixWindow.lightbox.close(); } catch {}
    return;
  }
  if (images.length === 0) {
    try { wixWindow.lightbox.close(); } catch {}
    return;
  }

  // 3) Render helper
  function setImage(i) {
    const next = Math.max(0, Math.min(i, images.length - 1));
    const url = images[next];

    try {
      if (isValidMediaSrc(url)) {
        $img.src = url;
        if ('fitMode' in $img) $img.fitMode = 'fit';
      }
    } catch (e) {
      // Silent catch to prevent UI breaking
    }
  }

  // 4) Close button
  if ($close && typeof $close.onClick === 'function') {
    $close.onClick(() => wixWindow.lightbox.close());
  }

  // 5) Initial paint
  setImage(index);
});