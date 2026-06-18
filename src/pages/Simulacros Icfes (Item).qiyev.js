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
            console.log("[PAGE BRIDGE] 🟢 Evento 'postHiddenMessageToChat' recibido del Exam Widget");
            const contextText = event.data.text;
            console.log("[PAGE BRIDGE] 🟢 Payload a enviar:", contextText);
            
            // Route the hidden context payload to the Chat UI
            if (chatWidget) {
                console.log("[PAGE BRIDGE] 🟢 Widget de Chat encontrado en la página.");
                
                if (typeof chatWidget.sendHiddenMessage === 'function') {
                    console.log("[PAGE BRIDGE] 🟢 Función 'sendHiddenMessage' encontrada. Llamando...");
                    chatWidget.sendHiddenMessage(contextText);
                    console.log("[PAGE BRIDGE] 🟢 Llamada completada.");
                } else {
                    console.warn("[PAGE BRIDGE] 🔴 ADVERTENCIA: El widget de chat no tiene la función 'sendHiddenMessage' expuesta públicamente en esta página.");
                }
            } else {
                console.error("[PAGE BRIDGE] 🔴 ERROR: El widget de chat (#chatUi) no fue encontrado en la página.");
            }
        });
    } else {
        console.warn("[PAGE BRIDGE] 🔴 ADVERTENCIA: El widget staticExamUi no fue encontrado al cargar la página.");
    }
});