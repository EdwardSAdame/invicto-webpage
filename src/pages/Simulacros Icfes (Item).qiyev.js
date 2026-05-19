import { setupChatToggle } from 'public/chatToggle.js';
import { setupCloseChatListener } from 'public/closeChatListener.js';
import wixLocationFrontend from 'wix-location-frontend';

$w.onReady(function () {
    $w('#chatContainer').collapse(); 
    setupChatToggle($w);
    setupCloseChatListener($w);

    // Arrancamos la función que lee la URL
    enviarParametrosAlWidget();
});

function enviarParametrosAlWidget() {
    try {
        const queryParams = wixLocationFrontend.query;
        const pathParts = wixLocationFrontend.path; 
        
        const examId = queryParams.examId;
        const component = pathParts[pathParts.length - 1]; 

        if (examId && component) {
            console.log(`Página Host: Diciéndole al Widget que descargue -> ${component} / ${examId}`);
            
            // Le pasamos solo las "llaves" al Widget para que él haga el trabajo pesado
            // Usaremos una nueva función llamada 'loadExamParams'
            $w('#staticExamUi').loadExamParams(component, examId);
            
        } else {
            console.warn("Página Host: Faltan parámetros en la URL (examId o component).");
        }
    } catch (error) {
        console.error("Página Host: Error al leer la URL:", error);
    }
}