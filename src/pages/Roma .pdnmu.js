import wixWindow from 'wix-window'; 
import { session } from 'wix-storage-frontend';
import { RomaLayoutManager } from 'public/RomaLayoutManager';

/** @type {RomaLayoutManager} */
let layoutManager; 

const ACTIVE_VIEW_KEY = 'romaActiveView';
const DOC_URL_KEY = 'romaDocUrl';

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
    restoreViewState();

    function restoreViewState() {
        const savedView = session.getItem(ACTIVE_VIEW_KEY);
        if (savedView === 'quiz') {
            activateQuizView();
        } else if (savedView === 'mentalMap') {
            activateMentalMapView();
        } else if (savedView === 'flashcards') {
            activateFlashcardsView();
        } else if (savedView === 'document') {
            const savedUrl = session.getItem(DOC_URL_KEY);
            if (savedUrl) {
                activateDocumentView(savedUrl);
            }
        }
    }

    function activateQuizView() {
        if (!$docContainer.collapsed) {
            $docContainer.collapse();
            $docFrame.postMessage(""); 
        }
        layoutManager.setDuoMode(); 
        session.setItem(ACTIVE_VIEW_KEY, 'quiz');
    }

    function activateMentalMapView() {
        if (!$docContainer.collapsed) {
            $docContainer.collapse();
            $docFrame.postMessage(""); 
        }
        layoutManager.setMentalMapMode(); 
        session.setItem(ACTIVE_VIEW_KEY, 'mentalMap');
    }

    function activateFlashcardsView() {
        if (!$docContainer.collapsed) {
            $docContainer.collapse();
            $docFrame.postMessage(""); 
        }
        layoutManager.setFlashcardsMode(); 
        session.setItem(ACTIVE_VIEW_KEY, 'flashcards');
    }

    function activateDocumentView(url) {
        let secureUrl = url.startsWith('http') ? url : `https://${url}`;
        secureUrl += "#toolbar=0&navpanes=0&scrollbar=0";
        $docFrame.postMessage(secureUrl);
        $docContainer.expand();
        layoutManager.setDocumentLayout();
        
        session.setItem(ACTIVE_VIEW_KEY, 'document');
        session.setItem(DOC_URL_KEY, url);
    }

    function resetToSoloMode() {
        $docContainer.collapse();
        $docFrame.postMessage(""); 
        layoutManager.setSoloMode();
        
        session.removeItem(ACTIVE_VIEW_KEY);
        session.removeItem(DOC_URL_KEY);
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

        chatWidget.on('flashcardsImageAvailable', (eventOrData) => {
            const imagePayload = eventOrData.data || eventOrData;
            activateFlashcardsView();
            if (flashcardsWidget && typeof flashcardsWidget.streamBackgroundImage === 'function') {
                flashcardsWidget.streamBackgroundImage(imagePayload);
            }
        });

        chatWidget.on('flashcardStreamItem', (eventOrData) => {
            const cardPayload = eventOrData.data || eventOrData;
            activateFlashcardsView();
            if (flashcardsWidget && typeof flashcardsWidget.streamFlashcardItem === 'function') {
                flashcardsWidget.streamFlashcardItem(cardPayload);
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
                resetToSoloMode();
            });
        } 
        else if (typeof flashcardsWidget.on === 'function') {
            flashcardsWidget.on('onCloseRequested', () => {
                resetToSoloMode();
            });
        } 
        else if (typeof flashcardsWidget.onOnCloseRequested === 'function') {
            flashcardsWidget.onOnCloseRequested(() => {
                resetToSoloMode();
            });
        }

        flashcardsWidget.on('postMessageToChat', (event) => {
            const promptText = event.data.text;
            if (chatWidget && typeof chatWidget.sendMessage === 'function') {
                activateFlashcardsView();
                if (typeof flashcardsWidget.startLoading === 'function') {
                    flashcardsWidget.startLoading();
                }
                chatWidget.sendMessage(promptText);
            }
        });
    }
});