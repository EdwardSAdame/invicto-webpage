import wixWindow from 'wix-window-frontend';

$w.onReady(function () {
    // 1. Get Data
    const sourcesData = wixWindow.lightbox.getContext();

    if (!sourcesData || !Array.isArray(sourcesData) || sourcesData.length === 0) {
        console.warn("No sources data received.");
        return;
    }

    // 2. Update Count
    const count = sourcesData.length;
    const label = count === 1 ? "resultado" : "resultados";
    
    const $numberSources = $w('#numberSources');
    if ($numberSources) {
        $numberSources.text = `${count} ${label}`;
    }

    // 3. Setup Repeater
    const $rep = $w('#sourceRepeater');

    $rep.onItemReady(($item, itemData) => {
        // A. Set Visuals (Normal Text - Preserves your design!)
        $item('#favicon').src = itemData.src;
        $item('#title').text  = itemData.title;
        $item('#url').text    = itemData.cleanDomain;

        // B. Handle the Click (The Overlay Button)
        const $overlay = $item('#sourceOverlayBtn');

        if (itemData.link) {
            $overlay.link   = itemData.link;
            $overlay.target = "_blank"; // <--- This forces the New Tab
            $overlay.label  = "";       // Ensure no text shows
            $overlay.expand();          // Make sure it's active
        } else {
            $overlay.collapse();        // Hide if no link exists
        }
    });

    $rep.data = sourcesData;
});