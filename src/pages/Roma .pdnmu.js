// PAGE CODE: /roma
import { RomaLayoutManager } from 'public/RomaLayoutManager';

/** @type {RomaLayoutManager} */
let layoutManager; 

$w.onReady(async function () {

    // 1. Get UI Elements
    const chatWidget = $w('#chatUi');
    const quizWidget = $w('#quizUi');
    const mentalMapWidget = $w('#mentalMindUi'); // NEW
    
    // Containers
    const $quizWrapper = $w('#quizWrapper');
    const $mentalMapWrapper = $w('#mentalMapWrapper'); // NEW
    const $docContainer = $w('#docViewerContainer');
    const $docFrame = $w('#docViewerFrame');
    
    // Margins
    const $marginL = $w('#marginL');
    const $marginR = $w('#marginR');

    // 2. Initialize Layout Manager
    layoutManager = new RomaLayoutManager({
        chatWidget: chatWidget, 
        quizPanel: $quizWrapper, 
        mentalMapPanel: $mentalMapWrapper, // NEW
        marginL: $marginL,
        marginR: $marginR
    });

    layoutManager.init();

    // HELPER: MUTUAL EXCLUSION LOGIC
    
    // Scenario A: Show Quiz 
    function activateQuizView() {
        
        // 1. Force Close Document Viewer
        if (!$docContainer.collapsed) {
            $docContainer.collapse();
            $docFrame.postMessage(""); 
        }

        // 2. Open Quiz Layout
        layoutManager.setDuoMode(); 
    }

    // NEW Scenario: Show Mental Map 
    function activateMentalMapView() {
        // 1. Force Close Document Viewer
        if (!$docContainer.collapsed) {
            $docContainer.collapse();
            $docFrame.postMessage(""); 
        }

        // 2. Open Mental Map Layout
        layoutManager.setMentalMapMode(); 
    }

    // Scenario B: Show Document 
    function activateDocumentView(url) {

        // 1. Prepare Secure URL
        let secureUrl = url.startsWith('http') ? url : `https://${url}`;
        
        secureUrl += "#toolbar=0&navpanes=0&scrollbar=0";

        // 2. Send URL to HTML Component
        $docFrame.postMessage(secureUrl);

        // 3. Open Container
        $docContainer.expand();

        // 4. ADJUST LAYOUT
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
        
        // A. Quiz Trigger
        chatWidget.on('quizMode', () => {
            activateQuizView(); 
            if (quizWidget && typeof quizWidget.initQuizLoading === 'function') {
                quizWidget.initQuizLoading();
            }
        });

        // NEW: Mental Map Status Trigger (Just opens the layout)
        chatWidget.on('mentalMapMode', () => {
            activateMentalMapView(); 
        });

        // B. Data Trigger (Quiz)
        chatWidget.on('quizDataAvailable', (eventOrData) => {
            const quizPayload = eventOrData.data || eventOrData;
            activateQuizView(); 
            if (quizWidget && typeof quizWidget.renderQuiz === 'function') {
                quizWidget.renderQuiz(quizPayload);
            }
        });

        // ------------------------------------------------------------------
        // 🟢 NEW: DATA TRIGGER (MIND MAP)
        // Catches the JSON payload and pushes it into the Mind Map Widget
        // ------------------------------------------------------------------
        chatWidget.on('openMindMap', (eventOrData) => {
            const mapPayload = eventOrData.data || eventOrData;
            activateMentalMapView(); 
            if (mentalMapWidget && typeof mentalMapWidget.renderMap === 'function') {
                mentalMapWidget.renderMap(mapPayload);
            }
        });

        // C. Stream Trigger (Questions Text)
        chatWidget.on('quizStreamItem', (eventOrData) => {
            const chunkData = eventOrData.data || eventOrData;
            activateQuizView(); 
            if (quizWidget && typeof quizWidget.streamQuestion === 'function') {
                quizWidget.streamQuestion(chunkData);
            }
        });

        // Stream Trigger (Images)
        chatWidget.on('quizStreamImage', (eventOrData) => {
            const chunkData = eventOrData.data || eventOrData;
            activateQuizView(); // Ensure the layout is open
            if (quizWidget && typeof quizWidget.streamImage === 'function') {
                quizWidget.streamImage(chunkData);
            }
        });

        // D. DOCUMENT VIEWER TRIGGER
        chatWidget.on('openDocument', (eventOrData) => {
            const pdfUrl = eventOrData.data || eventOrData;
            if (pdfUrl && typeof pdfUrl === 'string') {
                activateDocumentView(pdfUrl); 
            }
        });
    }

    // E. DOCUMENT VIEWER CLOSE BUTTON
    if ($w('#closeDocViewer')) {
        $w('#closeDocViewer').onClick(() => {
            resetToSoloMode();
        });
    }

    if (quizWidget) {
        // F. Quiz Close Request
        quizWidget.on('onCloseRequested', () => {
            resetToSoloMode();
        });

        // G. Ghost Bridge
        quizWidget.on('postMessageToChat', (event) => {
            const promptText = event.data.text;
            if (chatWidget && typeof chatWidget.sendMessage === 'function') {
                chatWidget.sendMessage(promptText);
            }
        });

        // H. HIDDEN CONTEXT BRIDGE 
        quizWidget.on('postHiddenMessageToChat', (event) => {
            const contextText = event.data.text;
            if (chatWidget && typeof chatWidget.sendHiddenMessage === 'function') {
                chatWidget.sendHiddenMessage(contextText);
            } 
        });
    }

    // NEW: Mental Map Close Binding
    if (mentalMapWidget) {
        mentalMapWidget.on('onCloseRequested', () => {
            resetToSoloMode();
        });
    }
});