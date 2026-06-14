import wixWindow from 'wix-window';
import { setupChatToggle } from 'public/chatToggle.js';
import { setupCloseChatListener } from 'public/closeChatListener.js';

$w.onReady(function () {
    const isDesktop = wixWindow.formFactor === "Desktop";

    // 1. Initial Page Load State
    if (isDesktop) {
        // On desktop, the chat usually starts open, so we don't need the breathing room yet
        $w('#chatContainer').expand();
        $w('#leftMarginSpacer').collapse();
        $w('#rightMarginSpacer').collapse();
    } else {
        // On mobile/tablet, chat starts closed, and we want full width (no spacers)
        $w('#chatContainer').collapse();
        $w('#leftMarginSpacer').collapse();
        $w('#rightMarginSpacer').collapse();
    }

    // 2. Initialize Event Listeners
    setupChatToggle($w);
    setupCloseChatListener($w);
});