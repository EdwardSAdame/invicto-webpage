import { setupChatToggle } from 'public/chatToggle.js';
import { setupCloseChatListener } from 'public/closeChatListener.js';
import wixLocationFrontend from 'wix-location-frontend';
import { fetchSpecificExam } from 'backend/mockExamService'; // Importamos el backend de forma segura

$w.onReady(function () {
    // 1. Configuración original de tu Chat
    $w('#chatContainer').collapse(); 
    setupChatToggle($w);
    setupCloseChatListener($w);

    // 2. Iniciar la descarga del examen en segundo plano
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
            
            // Hacemos el llamado seguro a AWS desde la página principal
            const response = await fetchSpecificExam(component, examId);
            
            if (response && response.exam_data) {
                console.log("Página Host: ¡Examen descargado con éxito! Inyectándolo al Widget...");
                
                // INYECTAMOS LOS DATOS AL WIDGET USANDO TU ID #staticExamUi
                if ($w('#staticExamUi').loadExamData) {
                    $w('#staticExamUi').loadExamData(response.exam_data);
                    console.log("Página Host: Datos enviados al widget correctamente.");
                } else {
                    console.warn("Página Host: El widget #staticExamUi aún no está listo o el nombre exportado es incorrecto.");
                }

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