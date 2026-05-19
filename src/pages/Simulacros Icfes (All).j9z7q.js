import { fetchMockExamCatalog } from 'backend/mockExamService';
import wixLocation from 'wix-location';

$w.onReady(function () {
    // 1. Enseñarle al Repeater cómo llenar sus elementos internos
    $w('#componentRepeater').onItemReady(($item, itemData, index) => {
        
        // Asignar textos e imagen
        $item('#componentTitle').text = itemData.componentTitle;
        $item('#componentDescription').text = itemData.componentDescription;
        $item('#componentImage').src = itemData.componentImage;
        
        // Combinar el número de preguntas y el tiempo en un solo texto
        $item('#componentStats').text = `${itemData.questionCount} Preguntas • ${itemData.timeLimitMinutes} Minutos`;

        // (OPCIONAL) Configurar el clic: 
        // Si quieres que al hacer clic en un botón (ej. #startBtn) vayan al examen específico:
        /*
        $item('#startBtn').onClick(() => {
            // Navegamos a la página dinámica pasando el examId en la URL
            wixLocation.to(`/simulacro-icfes/${itemData.componentId}?examId=${itemData.examId}`);
        });
        */
    });

    // 2. Ejecutar la función para traer los datos y cargarlos
    loadCatalog();
});

async function loadCatalog() {
    try {
        // Llamamos al backend de Wix, que a su vez llama a AWS
        const catalogData = await fetchMockExamCatalog();

        if (catalogData && catalogData.length > 0) {
            
            // TRUCO WIX: El repeater necesita obligatoriamente un campo "_id" tipo string
            const dataForRepeater = catalogData.map((exam) => {
                return {
                    ...exam,
                    _id: exam.examId // Usamos el nombre del archivo (ej. "math_vol_02.json") como ID único
                };
            });

            // Al asignar la data, Wix automáticamente dibuja las 5 tarjetas usando el onItemReady
            $w('#componentRepeater').data = dataForRepeater;
            
        } else {
            console.warn("El catálogo llegó vacío o hubo un error.");
        }

    } catch (error) {
        console.error("Error al cargar el menú de simulacros:", error);
    }
}