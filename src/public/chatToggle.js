import wixWindow from 'wix-window';

export function setupChatToggle($w) {
  const formFactor = wixWindow.formFactor;
  const isMobileOrTablet = formFactor === "Mobile" || formFactor === "Tablet";

  // Desktop: just uncollapse the chat; do not collapse anything else
  if (!isMobileOrTablet) {
    if ($w('#chatContainer').collapsed) {
      $w('#chatContainer').expand(); // restores the editor-defined size
    }
    // DO NOT collapse #testContainer here
  } else {
    // Mobile & Tablet: start collapsed (unchanged)
    $w('#chatContainer').collapse();
    $w('#testContainer').expand();
  }

  // Target the new Custom Element
  const aiButton = $w('#aiCustomButton');

  // Ensure the element exists on the current rendering cycle before attaching events
  if (aiButton) {
    // @ts-ignore - Bypasses Velo's strict type linter for custom element methods
    aiButton.on('onAiButtonClick', () => {
      const chatBox = $w('#chatContainer');
      const testBox = $w('#testContainer');

      if (chatBox.collapsed) {
        chatBox.expand();
        // On small screens hide the test; on desktop keep it visible
        if (isMobileOrTablet) testBox.collapse();
      } else {
        chatBox.collapse();
        testBox.expand();
      }
    });
  }
}