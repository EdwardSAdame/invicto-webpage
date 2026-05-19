import { fetchMockExamCatalog } from 'backend/mockExamService';
import wixLocation from 'wix-location'; // 1. Descomentamos la librería de navegación

$w.onReady(function () {
    
    $w('#componentRepeater').onItemReady(($item, itemData, index) => {
        
        // Textos e Imágenes (Paracaídas de seguridad)
        $item('#componentTitle').text = itemData.componentTitle || "Título no disponible";
        $item('#componentDescription').text = itemData.componentDescription || "Descripción no disponible";
        $item('#componentStats').text = `${itemData.questionCount || 0} Preguntas • ${itemData.timeLimitMinutes || 0} Minutos`;

        let imageUrl = itemData.componentImage;
        if (!imageUrl || imageUrl.includes("...")) {
            imageUrl = "https://static.wixstatic.com/media/c837a6_b80ba1a2939540028a4cb0b230f2c41c~mv2.jpg"; 
        }
        $item('#componentImage').src = imageUrl;

        // 2. Evento de clic en el botón
        $item('#startExamButton').onClick(() => {
            // Construimos la URL a la que el usuario será enviado.
            // Ejemplo: /simulacro-icfes/matematicas?examId=math_vol_02.json
            const targetUrl = `/simulacro-icfes/${itemData.componentId}?examId=${itemData.examId}`;
            
            console.log("Redirigiendo a:", targetUrl);
            
            // Navegamos a la nueva página
            wixLocation.to(targetUrl);
        });

    });

    loadCatalog();
});

async function loadCatalog() {
    try {
        const catalogData = await fetchMockExamCatalog();

        if (catalogData && catalogData.length > 0) {
            const dataForRepeater = catalogData.map((exam) => {
                return {
                    ...exam,
                    _id: exam.examId 
                };
            });

            $w('#componentRepeater').data = dataForRepeater;
        } else {
            console.warn("El catálogo llegó vacío.");
        }
    } catch (error) {
        console.error("Error crítico al cargar el menú:", error);
    }
}