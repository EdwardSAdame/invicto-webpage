import wixWindow from 'wix-window'; 
import { session } from 'wix-storage-frontend';
import { RomaLayoutManager } from 'public/RomaLayoutManager';
import { handleDocumentView } from 'public/services/documentViewer.js';

/** @type {RomaLayoutManager} */
let layoutManager; 

const ACTIVE_VIEW_KEY = 'romaActiveView';
const DOC_URL_KEY = 'romaDocUrl';

// --- Safe Event Binding Helper ---
// Prioritizes strict Wix Blocks API methods (e.g., onQuizStreamGroupStart) over generic .on() wrappers.
function bindWidgetEvent(widget, eventName, handler) {
    if (!widget) return;
    const camelCaseName = 'on' + eventName.charAt(0).toUpperCase() + eventName.slice(1);
    
    if (typeof widget[camelCaseName] === 'function') {
        widget[camelCaseName](handler);
    } else if (typeof widget.on === 'function') {
        widget.on(eventName, handler);
    }
}

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
        handleDocumentView($w, url, layoutManager);
    }

    function resetToSoloMode() {
        $docContainer.collapse();
        $docFrame.postMessage(""); 
        layoutManager.setSoloMode();
        
        session.removeItem(ACTIVE_VIEW_KEY);
        session.removeItem(DOC_URL_KEY);
    }

    if (chatWidget) {
        bindWidgetEvent(chatWidget, 'quizMode', () => {
            activateQuizView(); 
            if (quizWidget && typeof quizWidget.initQuizLoading === 'function') {
                quizWidget.initQuizLoading();
            }
        });

        bindWidgetEvent(chatWidget, 'mentalMapMode', () => {
            activateMentalMapView(); 
        });

        bindWidgetEvent(chatWidget, 'flashcardsMode', () => {
            activateFlashcardsView(); 
            if (flashcardsWidget && typeof flashcardsWidget.startLoading === 'function') {
                flashcardsWidget.startLoading();
            }
        });

        bindWidgetEvent(chatWidget, 'flashcardsDataAvailable', (event) => {
            const flashcardsPayload = event.detail || event.data || event;
            activateFlashcardsView();
            if (flashcardsWidget && typeof flashcardsWidget.loadFlashcards === 'function') {
                flashcardsWidget.loadFlashcards(flashcardsPayload);
            }
        });

        bindWidgetEvent(chatWidget, 'flashcardsImageAvailable', (event) => {
            const imagePayload = event.detail || event.data || event;
            activateFlashcardsView();
            if (flashcardsWidget && typeof flashcardsWidget.streamBackgroundImage === 'function') {
                flashcardsWidget.streamBackgroundImage(imagePayload);
            }
        });

        bindWidgetEvent(chatWidget, 'flashcardStreamItem', (event) => {
            const cardPayload = event.detail || event.data || event;
            activateFlashcardsView();
            if (flashcardsWidget && typeof flashcardsWidget.streamFlashcardItem === 'function') {
                flashcardsWidget.streamFlashcardItem(cardPayload);
            }
        });

        bindWidgetEvent(chatWidget, 'quizDataAvailable', (event) => {
            const quizPayload = event.detail || event.data || event;
            activateQuizView(); 
            if (quizWidget && typeof quizWidget.renderQuiz === 'function') {
                quizWidget.renderQuiz(quizPayload);
            }
        });

        bindWidgetEvent(chatWidget, 'mindMapStreamNode', (event) => {
            const nodePayload = event.detail || event.data || event;
            activateMentalMapView(); 
            if (mentalMapWidget && typeof mentalMapWidget.appendStreamedNode === 'function') {
                mentalMapWidget.appendStreamedNode(nodePayload);
            }
        });

        bindWidgetEvent(chatWidget, 'mindMapStreamEdge', (event) => {
            const edgePayload = event.detail || event.data || event;
            activateMentalMapView(); 
            if (mentalMapWidget && typeof mentalMapWidget.appendStreamedEdge === 'function') {
                mentalMapWidget.appendStreamedEdge(edgePayload);
            }
        });

        bindWidgetEvent(chatWidget, 'openMindMap', (event) => {
            const mapPayload = event.detail || event.data || event;
            activateMentalMapView(); 
            if (mentalMapWidget && typeof mentalMapWidget.renderMap === 'function') {
                mentalMapWidget.renderMap(mapPayload);
            }
        });

        bindWidgetEvent(chatWidget, 'quizStreamGroupStart', (event) => {
            const chunkData = event.detail || event.data || event;
            activateQuizView(); 
            if (quizWidget && typeof quizWidget.streamGroupStart === 'function') {
                quizWidget.streamGroupStart(chunkData);
            }
        });

        bindWidgetEvent(chatWidget, 'quizStreamItem', (event) => {
            const chunkData = event.detail || event.data || event;
            activateQuizView(); 
            if (quizWidget && typeof quizWidget.streamQuestion === 'function') {
                quizWidget.streamQuestion(chunkData);
            }
        });

        bindWidgetEvent(chatWidget, 'quizStreamImage', (event) => {
            const chunkData = event.detail || event.data || event;
            activateQuizView(); 
            if (quizWidget && typeof quizWidget.streamImage === 'function') {
                quizWidget.streamImage(chunkData);
            }
        });

        bindWidgetEvent(chatWidget, 'openDocument', (event) => {
            const pdfUrl = event.detail || event.data || event;
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
        bindWidgetEvent(quizWidget, 'onCloseRequested', () => {
            resetToSoloMode();
        });

        bindWidgetEvent(quizWidget, 'postMessageToChat', (event) => {
            const promptText = event.detail?.text || event.data?.text || event.text;
            if (chatWidget && typeof chatWidget.sendMessage === 'function') {
                chatWidget.sendMessage(promptText);
            }
        });

        bindWidgetEvent(quizWidget, 'postHiddenMessageToChat', (event) => {
            const contextText = event.detail?.text || event.data?.text || event.text;
            if (chatWidget && typeof chatWidget.sendHiddenMessage === 'function') {
                chatWidget.sendHiddenMessage(contextText);
            } 
        });
    }

    if (mentalMapWidget) {
        bindWidgetEvent(mentalMapWidget, 'onCloseRequested', () => {
            resetToSoloMode();
        });

        bindWidgetEvent(mentalMapWidget, 'onNodeExplored', (event) => {
            const clickedLabel = event.detail?.label || event.data?.label || event.label;
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
        bindWidgetEvent(flashcardsWidget, 'onCloseRequested', () => {
            resetToSoloMode();
        });

        bindWidgetEvent(flashcardsWidget, 'postMessageToChat', (event) => {
            const promptText = event.detail?.text || event.data?.text || event.text;
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