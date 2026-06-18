import wixWindow from 'wix-window';
import { setupChatToggle } from 'public/chatToggle.js';
import { setupCloseChatListener } from 'public/closeChatListener.js';

$w.onReady(function () {
    const isDesktop = wixWindow.formFactor === "Desktop";

    // 0. Widget References (Updated to chatUi)
    const chatWidget = $w('#chatUi'); 
    const staticExamWidget = $w('#staticExamUi'); 

    // 1. Initial Page Load State
    if (isDesktop) {
        $w('#chatContainer').expand();
        $w('#leftMarginSpacer').collapse();
        $w('#rightMarginSpacer').collapse();
    } else {
        $w('#chatContainer').collapse();
        $w('#leftMarginSpacer').collapse();
        $w('#rightMarginSpacer').collapse();
    }

    // 2. Initialize Event Listeners
    setupChatToggle($w);
    setupCloseChatListener($w);

    // 3. Exam to Chat Bridge
    if (staticExamWidget) {
        staticExamWidget.on('postHiddenMessageToChat', (event) => {
            const contextText = event.data.text;
            
            // Route the hidden context payload to the Chat UI
            if (chatWidget && typeof chatWidget.sendHiddenMessage === 'function') {
                chatWidget.sendHiddenMessage(contextText);
            }
        });
    }
});