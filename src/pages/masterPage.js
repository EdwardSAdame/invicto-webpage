// src/pages/masterPage.js
import wixSeo from 'wix-seo';

$w.onReady(function () {
    
    // Preload the Roma video poster image globally to eliminate the LCP resource load delay
    wixSeo.setLinks([
        {
            rel: 'preload',
            as: 'image',
            href: 'https://static.wixstatic.com/media/11062b_7cdacca63f9249c7ad1f953ab46a23d3f000.png/v1/fill/w_160,h_135,al_c,q_85,usm_0.33_1.00_0.00,enc_avif,quality_auto/11062b_7cdacca63f9249c7ad1f953ab46a23d3f000.png'
        }
    ])
    .catch((error) => {
        console.error("Failed to set preload link:", error);
    });

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