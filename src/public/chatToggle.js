import wixWindow from 'wix-window';

export function setupChatToggle($w) {
  const formFactor = wixWindow.formFactor;
  const isDesktop = formFactor === "Desktop";
  const isMobileOrTablet = formFactor === "Mobile" || formFactor === "Tablet";

  const chatBox = $w('#chatContainer');
  const testBox = $w('#testContainer');
  const leftSpacer = $w('#leftMarginSpacer');
  const rightSpacer = $w('#rightMarginSpacer');
  const aiButton = $w('#aiCustomButton');

  if (!aiButton) {
    return;
  }

  // @ts-ignore - Bypasses Velo strict type linter for custom element methods
  aiButton.on('onAiButtonClick', async () => {
    if (chatBox.collapsed) {
      await chatBox.expand();
      
      if (isMobileOrTablet) {
        await testBox.collapse();
      } else if (isDesktop) {
        await leftSpacer.collapse();
        await rightSpacer.collapse();
      }
    } else {
      await chatBox.collapse();
      await testBox.expand();
      
      if (isDesktop) {
        await leftSpacer.expand();
        await rightSpacer.expand();
      }
    }
  });
}