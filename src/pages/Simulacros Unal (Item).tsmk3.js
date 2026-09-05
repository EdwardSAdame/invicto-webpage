import { setupChatToggle } from 'public/chatToggle.js';
import { setupCloseChatListener } from 'public/closeChatListener.js';

$w.onReady(async function () {
    await $w('#chatContainer').expand();

    setupChatToggle($w);
    setupCloseChatListener($w);
});