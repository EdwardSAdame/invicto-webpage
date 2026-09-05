import { setupChatToggle } from 'public/chatToggle.js';
import { setupCloseChatListener } from 'public/closeChatListener.js';

$w.onReady(async function () {
    // 1. Establish initial state sequentially to avoid race conditions
    await $w('#chatContainer').collapse();

    // Note: If your UNAL page uses the same spacer elements as the ICFES page, 
    // you should collapse them here as well to maintain layout consistency:
    // await $w('#leftMarginSpacer').collapse();
    // await $w('#rightMarginSpacer').collapse();

    // 2. Bind event listeners only after the DOM is ready
    setupChatToggle($w);
    setupCloseChatListener($w);
});