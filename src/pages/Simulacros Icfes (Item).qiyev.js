import { setupChatToggle } from 'public/chatToggle.js';
import { setupCloseChatListener } from 'public/closeChatListener.js';

$w.onReady(function () {
    $w('#chatContainer').collapse(); 
    setupChatToggle($w);
    setupCloseChatListener($w);
    
    console.log("Página Host: Lista. El Widget se encargará del resto.");
});