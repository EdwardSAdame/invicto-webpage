import { setupChatToggle } from 'public/chatToggle.js';
import { setupCloseChatListener } from 'public/closeChatListener.js';
import wixLocationFrontend from 'wix-location-frontend';
import { fetchSpecificExam } from 'backend/mockExamService'; 

$w.onReady(function () {
    $w('#chatContainer').collapse(); 
    setupChatToggle($w);
    setupCloseChatListener($w);

    cargarExamenYPasarloAlWidget();
});

async function cargarExamenYPasarloAlWidget() {
    try {
        const queryParams = wixLocationFrontend.query;
        const pathParts = wixLocationFrontend.path; 
        
        const examId = queryParams.examId;
        const component = pathParts[pathParts.length - 1]; 

        if (examId && component) {
            console.log(`Página Host: Solicitando examen a AWS -> ${component} / ${examId}`);
            
            const response = await fetchSpecificExam(component, examId);
            
            if (response && response.exam_data) {
                console.log("Página Host: ¡Examen descargado con éxito! Inyectándolo al Widget...");
                
                // --- LA SOLUCIÓN ESTÁ AQUÍ ---
                // Intentamos inyectar la data directamente (ignorando el proxy de Wix)
                try {
                    $w('#staticExamUi').loadExamData(response.exam_data);
                    console.log("Página Host: Datos inyectados al widget al primer intento.");
                } catch (error) {
                    console.warn("Página Host: El proxy bloqueó el primer intento. Reintentando en 1 segundo...");
                    
                    // Si falla por micro-segundos, le damos 1 segundo de ventaja al Widget
                    setTimeout(() => {
                        $w('#staticExamUi').loadExamData(response.exam_data);
                        console.log("Página Host: Datos inyectados al widget en el segundo intento.");
                    }, 1000);
                }
                // ------------------------------

            } else {
                console.error("Página Host: No se pudo obtener la data del examen desde AWS.");
            }
        } else {
            console.warn("Página Host: Faltan parámetros en la URL (examId o component).");
        }
    } catch (error) {
        console.error("Página Host: Error crítico al descargar el examen:", error);
    }
}