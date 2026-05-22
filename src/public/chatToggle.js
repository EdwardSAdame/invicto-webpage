import wixWindow from 'wix-window';

export function setupChatToggle($w) {
  const formFactor = wixWindow.formFactor;
  const isDesktop = formFactor === "Desktop";
  const isMobileOrTablet = formFactor === "Mobile" || formFactor === "Tablet";

  // Cache element references for cleaner code
  const chatBox = $w('#chatContainer');
  const testBox = $w('#testContainer');
  const leftSpacer = $w('#leftMarginSpacer');
  const rightSpacer = $w('#rightMarginSpacer');

  // Initial State Setup
  if (isDesktop) {
    // Desktop: chat starts open, so spacers must be collapsed
    if (chatBox.collapsed) {
      chatBox.expand(); 
    }
    leftSpacer.collapse();
    rightSpacer.collapse();
  } else {
    // Mobile & Tablet: start collapsed (unchanged)
    chatBox.collapse();
    testBox.expand();
    leftSpacer.collapse();
    rightSpacer.collapse();
  }

  // Target the new Custom Element
  const aiButton = $w('#aiCustomButton');

  // Ensure the element exists on the current rendering cycle before attaching events
  if (aiButton) {
    // @ts-ignore - Bypasses Velo strict type linter for custom element methods
    aiButton.on('onAiButtonClick', () => {
      
      if (chatBox.collapsed) {
        // ACTION: Opening the chat
        chatBox.expand();
        
        if (isMobileOrTablet) {
          testBox.collapse();
        } else if (isDesktop) {
          // On desktop, chat takes up space, so we remove the breathing room
          leftSpacer.collapse();
          rightSpacer.collapse();
        }
        
      } else {
        // ACTION: Closing the chat
        chatBox.collapse();
        testBox.expand();
        
        if (isDesktop) {
          // On desktop, test container takes full width, so we add breathing room
          leftSpacer.expand();
          rightSpacer.expand();
        }
      }
    });
  }
}