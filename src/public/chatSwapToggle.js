// One-button swap between #testContainer and #chatContainer on all devices.
// Ensures only one is visible at a time.
export function setupChatSwapToggle($w) {
  let inTransition = false;

  function showChat() {
    inTransition = true;
    return $w('#testContainer').collapse()
      .then(() => $w('#chatContainer').expand())
      .finally(() => { inTransition = false; });
  }

  function showTest() {
    inTransition = true;
    return $w('#chatContainer').collapse()
      .then(() => $w('#testContainer').expand())
      .finally(() => { inTransition = false; });
  }

  // Safety: if both start visible, prefer showing test
  if (!$w('#testContainer').collapsed && !$w('#chatContainer').collapsed) {
    $w('#chatContainer').collapse();
  }

  // Target the new Custom Element
  const aiButton = $w('#aiCustomButton');

  if (aiButton) {
    // @ts-ignore - Bypasses Velo's strict type linter for custom element methods
    aiButton.on('onAiButtonClick', () => {
      if (inTransition) return;

      const chatCollapsed = $w('#chatContainer').collapsed;
      const testCollapsed = $w('#testContainer').collapsed;

      if (chatCollapsed && !testCollapsed) return showChat();  // test -> chat
      if (!chatCollapsed && testCollapsed) return showTest();   // chat -> test
      if (chatCollapsed && testCollapsed) return showTest();    // both hidden -> test
      return showChat();                                        // both visible -> chat
    });
  }
}