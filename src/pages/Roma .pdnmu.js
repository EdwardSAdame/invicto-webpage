// PAGE CODE: /roma
import wixWindow from 'wix-window'; // 🟢 NEW: Import wixWindow to check device type
import { RomaLayoutManager } from 'public/RomaLayoutManager';

/** @type {RomaLayoutManager} */
let layoutManager; 

$w.onReady(async function () {

    // 1. Get UI Elements
    const chatWidget = $w('#chatUi');
    const quizWidget = $w('#quizUi');
    const mentalMapWidget = $w('#mentalMindUi'); 
    
    // Containers
    const $quizWrapper = $w('#quizWrapper');
    const $mentalMapWrapper = $w('#mentalMapWrapper'); 
    const $docContainer = $w('#docViewerContainer');
    const $docFrame = $w('#docViewerFrame');
    
    // Margins
    const $marginL = $w('#marginL');
    const $marginR = $w('#marginR');

    // 2. Initialize Layout Manager
    layoutManager = new RomaLayoutManager({
        chatWidget: chatWidget, 
        quizPanel: $quizWrapper, 
        mentalMapPanel: $mentalMapWrapper, 
        marginL: $marginL,
        marginR: $marginR
    });

    layoutManager.init();

    // HELPER: MUTUAL EXCLUSION LOGIC
    
    // Scenario A: Show Quiz 
    function activateQuizView() {
        if (!$docContainer.collapsed) {
            $docContainer.collapse();
            $docFrame.postMessage(""); 
        }
        layoutManager.setDuoMode(); 
    }

    // Scenario: Show Mental Map 
    function activateMentalMapView() {
        if (!$docContainer.collapsed) {
            $docContainer.collapse();
            $docFrame.postMessage(""); 
        }
        layoutManager.setMentalMapMode(); 
    }

    // Scenario B: Show Document 
    function activateDocumentView(url) {
        let secureUrl = url.startsWith('http') ? url : `https://${url}`;
        secureUrl += "#toolbar=0&navpanes=0&scrollbar=0";
        $docFrame.postMessage(secureUrl);
        $docContainer.expand();
        layoutManager.setDocumentLayout();
    }

    // Scenario C: Close Everything
    function resetToSoloMode() {
        $docContainer.collapse();
        $docFrame.postMessage(""); 
        layoutManager.setSoloMode();
    }

    // 3. Bind Event Listeners 
    if (chatWidget) {
        
        chatWidget.on('quizMode', () => {
            activateQuizView(); 
            if (quizWidget && typeof quizWidget.initQuizLoading === 'function') {
                quizWidget.initQuizLoading();
            }
        });

        chatWidget.on('mentalMapMode', () => {
            activateMentalMapView(); 
            // 🟢 NEW: Instantly trigger the pulsing skeleton map!
            if (mentalMapWidget && typeof mentalMapWidget.showLoading === 'function') {
                mentalMapWidget.showLoading();
            }
        });

        chatWidget.on('quizDataAvailable', (eventOrData) => {
            const quizPayload = eventOrData.data || eventOrData;
            activateQuizView(); 
            if (quizWidget && typeof quizWidget.renderQuiz === 'function') {
                quizWidget.renderQuiz(quizPayload);
            }
        });

        // ------------------------------------------------------------------
        // 🟢 NEW: MIND MAP STREAMING LISTENERS
        // ------------------------------------------------------------------
        chatWidget.on('mindMapStreamNode', (eventOrData) => {
            const nodePayload = eventOrData.data || eventOrData;
            activateMentalMapView(); 
            if (mentalMapWidget && typeof mentalMapWidget.appendStreamedNode === 'function') {
                mentalMapWidget.appendStreamedNode(nodePayload);
            }
        });

        chatWidget.on('mindMapStreamEdge', (eventOrData) => {
            const edgePayload = eventOrData.data || eventOrData;
            activateMentalMapView(); 
            if (mentalMapWidget && typeof mentalMapWidget.appendStreamedEdge === 'function') {
                mentalMapWidget.appendStreamedEdge(edgePayload);
            }
        });
        // ------------------------------------------------------------------

        chatWidget.on('openMindMap', (eventOrData) => {
            const mapPayload = eventOrData.data || eventOrData;
            activateMentalMapView(); 
            if (mentalMapWidget && typeof mentalMapWidget.renderMap === 'function') {
                mentalMapWidget.renderMap(mapPayload);
            }
        });

        chatWidget.on('quizStreamItem', (eventOrData) => {
            const chunkData = eventOrData.data || eventOrData;
            activateQuizView(); 
            if (quizWidget && typeof quizWidget.streamQuestion === 'function') {
                quizWidget.streamQuestion(chunkData);
            }
        });

        chatWidget.on('quizStreamImage', (eventOrData) => {
            const chunkData = eventOrData.data || eventOrData;
            activateQuizView(); 
            if (quizWidget && typeof quizWidget.streamImage === 'function') {
                quizWidget.streamImage(chunkData);
            }
        });

        chatWidget.on('openDocument', (eventOrData) => {
            const pdfUrl = eventOrData.data || eventOrData;
            if (pdfUrl && typeof pdfUrl === 'string') {
                activateDocumentView(pdfUrl); 
            }
        });
    }

    if ($w('#closeDocViewer')) {
        $w('#closeDocViewer').onClick(() => {
            resetToSoloMode();
        });
    }

    if (quizWidget) {
        quizWidget.on('onCloseRequested', () => {
            resetToSoloMode();
        });

        quizWidget.on('postMessageToChat', (event) => {
            const promptText = event.data.text;
            if (chatWidget && typeof chatWidget.sendMessage === 'function') {
                chatWidget.sendMessage(promptText);
            }
        });

        quizWidget.on('postHiddenMessageToChat', (event) => {
            const contextText = event.data.text;
            if (chatWidget && typeof chatWidget.sendHiddenMessage === 'function') {
                chatWidget.sendHiddenMessage(contextText);
            } 
        });
    }

    if (mentalMapWidget) {
        mentalMapWidget.on('onCloseRequested', () => {
            resetToSoloMode();
        });

        // ------------------------------------------------------------------
        // THE CLEAN BRIDGE: Connect Mind Map Clicks to the Chat Widget
        // ------------------------------------------------------------------
        mentalMapWidget.on('onNodeExplored', (event) => {
            const clickedLabel = event.data.label;
            if (!clickedLabel) return;

            // Pass the label to the Chat Widget's new public function!
            if (chatWidget && typeof chatWidget.exploreMindmapNode === 'function') {
                chatWidget.exploreMindmapNode(clickedLabel);
                
                // NEW LOGIC: Only collapse the map if on Mobile or Tablet
                const deviceType = wixWindow.formFactor;
                if (deviceType === "Mobile" || deviceType === "Tablet") {
                    resetToSoloMode(); 
                }
            }
        });
    }
});