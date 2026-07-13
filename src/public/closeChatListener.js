import wixWindow from 'wix-window';

export function setupCloseChatListener($w) {
  const isDesktop = wixWindow.formFactor === "Desktop";

  // Updated the selector from '#chatUi1' to '#chatUi' to match the dynamic page implementation
  $w('#chatUi').on('closeChat', () => {
    $w('#chatContainer').collapse();
    $w('#testContainer').expand();
    
    // If on Desktop, taking full width means we need to add breathing room
    if (isDesktop) {
      $w('#leftMarginSpacer').expand();
      $w('#rightMarginSpacer').expand();
    }
  });
}