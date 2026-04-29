// PAGE CODE: /roma
import wixWindow from 'wix-window'; 
import { RomaLayoutManager } from 'public/RomaLayoutManager';

/** @type {RomaLayoutManager} */
let layoutManager; 

$w.onReady(async function () {

    const chatWidget = $w('#chatUi');
    const quizWidget = $w('#quizUi');
    const mentalMapWidget = $w('#mentalMindUi'); 
    const flashcardsWidget = $w('#flashcardsUi'); // NEW: Reference for future flashcards widget
    
    const $quizWrapper = $w('#quizWrapper');
    const $mentalMapWrapper = $w('#mentalMapWrapper'); 
    const $flashcardsWrapper = $w('#flashcardsWrapper'); // NEW: Added flashcards container reference
    
    const $docContainer = $w('#docViewerContainer');
    const $docFrame = $w('#docViewerFrame');
    
    const $marginL = $w('#marginL');
    const $marginR = $w('#marginR');

    layoutManager = new RomaLayoutManager({
        chatWidget: chatWidget, 
        quizPanel: $quizWrapper, 
        mentalMapPanel: $mentalMapWrapper, 
        flashcardsPanel: $flashcardsWrapper, // NEW: Passed to layout manager
        marginL: $marginL,
        marginR: $marginR
    });

    layoutManager.init();

    function activateQuizView() {
        if (!$docContainer.collapsed) {
            $docContainer.collapse();
            $docFrame.postMessage(""); 
        }
        layoutManager.setDuoMode(); 
    }

    function activateMentalMapView() {
        if (!$docContainer.collapsed) {
            $docContainer.collapse();
            $docFrame.postMessage(""); 
        }
        layoutManager.setMentalMapMode(); 
    }

    // NEW: Function to activate Flashcards view
    function activateFlashcardsView() {
        if (!$docContainer.collapsed) {
            $docContainer.collapse();
            $docFrame.postMessage(""); 
        }
        layoutManager.setFlashcardsMode(); 
    }

    function activateDocumentView(url) {
        let secureUrl = url.startsWith('http') ? url : `https://${url}`;
        secureUrl += "#toolbar=0&navpanes=0&scrollbar=0";
        $docFrame.postMessage(secureUrl);
        $docContainer.expand();
        layoutManager.setDocumentLayout();
    }

    function resetToSoloMode() {
        $docContainer.collapse();
        $docFrame.postMessage(""); 
        layoutManager.setSoloMode();
    }

    if (chatWidget) {
        chatWidget.on('quizMode', () => {
            activateQuizView(); 
            if (quizWidget && typeof quizWidget.initQuizLoading === 'function') {
                quizWidget.initQuizLoading();
            }
        });

        chatWidget.on('mentalMapMode', () => {
            activateMentalMapView(); 
        });

        // NEW: Listen for flashcards intent from the chat widget
        chatWidget.on('flashcardsMode', () => {
            activateFlashcardsView(); 
        });

        chatWidget.on('quizDataAvailable', (eventOrData) => {
            const quizPayload = eventOrData.data || eventOrData;
            activateQuizView(); 
            if (quizWidget && typeof quizWidget.renderQuiz === 'function') {
                quizWidget.renderQuiz(quizPayload);
            }
        });

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

        mentalMapWidget.on('onNodeExplored', (event) => {
            const clickedLabel = event.data.label;
            if (!clickedLabel) return;

            if (chatWidget && typeof chatWidget.exploreMindmapNode === 'function') {
                chatWidget.exploreMindmapNode(clickedLabel);
                
                const deviceType = wixWindow.formFactor;
                if (deviceType === "Mobile" || deviceType === "Tablet") {
                    resetToSoloMode(); 
                }
            }
        });
    }

    // NEW: Listen for close requests from the future flashcards widget
    if (flashcardsWidget) {
        flashcardsWidget.on('onCloseRequested', () => {
            resetToSoloMode();
        });
    }
});