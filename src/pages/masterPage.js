// src/pages/masterPage.js

$w.onReady(function () {
    
    // @ts-ignore - Bypasses Velo's cache if the new ID hasn't registered in the dictionary yet
    const aiButton = $w('#aiCustomButton');

    // Safely check if the element exists AND if the .on() function is available
    if (aiButton && typeof aiButton.on === 'function') {
        
        // @ts-ignore - Bypasses Velo's strict type linter for custom element methods
        aiButton.on('onAiButtonClick', (event) => {
            
            // TODO: Add your specific Wix Blocks chatbot logic here.
            // For example, if your chatbot is hidden, you would show it:
            // $w('#yourChatbotWidgetId').show();
            // or if it has an API:
            // $w('#yourChatbotWidgetId').openChat();
            
        });
    }
});