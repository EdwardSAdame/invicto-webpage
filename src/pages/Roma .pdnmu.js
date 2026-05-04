// PAGE CODE: /roma
import wixWindow from 'wix-window'; 
import { RomaLayoutManager } from 'public/RomaLayoutManager';

/** @type {RomaLayoutManager} */
let layoutManager; 

$w.onReady(async function () {

    const chatWidget = $w('#chatUi');
    const quizWidget = $w('#quizUi');
    const mentalMapWidget = $w('#mentalMindUi'); 
    const flashcardsWidget = $w('#flashcardUi');
    
    const $quizWrapper = $w('#quizWrapper');
    const $mentalMapWrapper = $w('#mentalMapWrapper'); 
    const $flashcardsWrapper = $w('#flashcardsWrapper'); 
    
    const $docContainer = $w('#docViewerContainer');
    const $docFrame = $w('#docViewerFrame');
    
    const $marginL = $w('#marginL');
    const $marginR = $w('#marginR');

    layoutManager = new RomaLayoutManager({
        chatWidget: chatWidget, 
        quizPanel: $quizWrapper, 
        mentalMapPanel: $mentalMapWrapper, 
        flashcardsPanel: $flashcardsWrapper, 
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
        console.log("[HOST PAGE DEBUG] resetToSoloMode() executing. Collapsing active views.");
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

        chatWidget.on('flashcardsMode', () => {
            activateFlashcardsView(); 
            if (flashcardsWidget && typeof flashcardsWidget.startLoading === 'function') {
                flashcardsWidget.startLoading();
            }
        });

        chatWidget.on('flashcardsDataAvailable', (eventOrData) => {
            const flashcardsPayload = eventOrData.data || eventOrData;
            activateFlashcardsView();
            if (flashcardsWidget && typeof flashcardsWidget.loadFlashcards === 'function') {
                flashcardsWidget.loadFlashcards(flashcardsPayload);
            }
        });

        // NEW: Listener to catch the image stream and pass it to the flashcards widget
        chatWidget.on('flashcardsImageAvailable', (eventOrData) => {
            const imagePayload = eventOrData.data || eventOrData;
            activateFlashcardsView();
            if (flashcardsWidget && typeof flashcardsWidget.streamBackgroundImage === 'function') {
                flashcardsWidget.streamBackgroundImage(imagePayload);
            }
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
        if (typeof quizWidget.onCloseRequested === 'function') {
            quizWidget.onCloseRequested(() => {
                resetToSoloMode();
            });
        } else if (typeof quizWidget.on === 'function') {
            quizWidget.on('onCloseRequested', () => {
                resetToSoloMode();
            });
        }

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
        if (typeof mentalMapWidget.onCloseRequested === 'function') {
            mentalMapWidget.onCloseRequested(() => {
                resetToSoloMode();
            });
        } else if (typeof mentalMapWidget.on === 'function') {
            mentalMapWidget.on('onCloseRequested', () => {
                resetToSoloMode();
            });
        }

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

    if (flashcardsWidget) {
        if (typeof flashcardsWidget.onCloseRequested === 'function') {
            flashcardsWidget.onCloseRequested(() => {
                console.log("[HOST PAGE DEBUG] Caught event via flashcardsWidget.onCloseRequested()");
                resetToSoloMode();
            });
        } 
        else if (typeof flashcardsWidget.on === 'function') {
            flashcardsWidget.on('onCloseRequested', () => {
                console.log("[HOST PAGE DEBUG] Caught event via flashcardsWidget.on('onCloseRequested')");
                resetToSoloMode();
            });
        } 
        else if (typeof flashcardsWidget.onOnCloseRequested === 'function') {
            flashcardsWidget.onOnCloseRequested(() => {
                console.log("[HOST PAGE DEBUG] Caught event via flashcardsWidget.onOnCloseRequested()");
                resetToSoloMode();
            });
        }
    }
});