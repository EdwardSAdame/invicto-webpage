import { setupChatToggle } from 'public/chatToggle.js';
import { setupCloseChatListener } from 'public/closeChatListener.js';

$w.onReady(async function () {
    // Widget References
    const chatWidget = $w('#chatUi'); 
    const staticExamWidget = $w('#staticExamUi'); 

    // 1. Establish initial state sequentially to avoid race conditions
    await $w('#chatContainer').expand();

    // 2. Bind event listeners only after the DOM is ready
    setupChatToggle($w);
    setupCloseChatListener($w);

    // 3. Exam to Chat Bridge
    if (staticExamWidget && typeof staticExamWidget.on === 'function') {
        staticExamWidget.on('postHiddenMessageToChat', (event) => {
            const contextText = event.data.text;
            
            // Route the hidden context payload to the Chat UI
            if (chatWidget && typeof chatWidget.sendHiddenMessage === 'function') {
                chatWidget.sendHiddenMessage(contextText);
            }
        });
    }
});