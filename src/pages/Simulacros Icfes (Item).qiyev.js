import { setupChatToggle } from 'public/chatToggle.js';
import { setupCloseChatListener } from 'public/closeChatListener.js';

$w.onReady(function () {
  $w('#chatContainer').collapse(); // Collapse on load

  setupChatToggle($w);
  setupCloseChatListener($w);
});
