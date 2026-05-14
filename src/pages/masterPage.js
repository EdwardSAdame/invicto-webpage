// src/pages/masterPage.js

$w.onReady(function () {
    
    // @ts-ignore - Bypasses Velo's cache if the new ID hasn't registered in the dictionary yet
    const aiButton = $w('#aiCustomButton');

    // Ensure the element exists on the current rendering cycle before attaching events
    if (aiButton) {
        
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