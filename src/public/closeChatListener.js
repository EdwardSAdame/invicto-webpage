export function setupCloseChatListener($w) {
  $w('#chatUi1').on('closeChat', () => {
    $w('#chatContainer').collapse();
    $w('#testContainer').expand();
  });
}
