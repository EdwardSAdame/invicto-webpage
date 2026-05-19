import { fetchMockExamCatalog } from 'backend/mockExamService';
// import wixLocation from 'wix-location'; // Descomentar cuando agreguemos navegación

$w.onReady(function () {
    
    // 1. Enseñarle al Repeater cómo llenar sus elementos de forma segura
    $w('#componentRepeater').onItemReady(($item, itemData, index) => {
        
        // Paracaídas para Textos (Evita el error "cannot be set to null")
        $item('#componentTitle').text = itemData.componentTitle || "Título no disponible";
        $item('#componentDescription').text = itemData.componentDescription || "Descripción no disponible";
        $item('#componentStats').text = `${itemData.questionCount || 0} Preguntas • ${itemData.timeLimitMinutes || 0} Minutos`;

        // Paracaídas para la Imagen (Evita el error de URL inválida)
        let imageUrl = itemData.componentImage;
        // Si la URL está vacía, no es válida, o tiene nuestros "..." de prueba en el JSON, usa una imagen por defecto
        if (!imageUrl || imageUrl.includes("...")) {
            // URL de una imagen genérica de placeholder
            imageUrl = "https://static.wixstatic.com/media/c837a6_b80ba1a2939540028a4cb0b230f2c41c~mv2.jpg"; 
        }
        $item('#componentImage').src = imageUrl;

    });

    // 2. Ejecutar la función para traer los datos
    loadCatalog();
});

async function loadCatalog() {
    try {
        console.log("Solicitando catálogo a AWS...");
        const catalogData = await fetchMockExamCatalog();

        if (catalogData && catalogData.length > 0) {
            console.log("Catálogo recibido:", catalogData);
            
            // TRUCO WIX: Agregar el _id necesario
            const dataForRepeater = catalogData.map((exam) => {
                return {
                    ...exam,
                    _id: exam.examId 
                };
            });

            // Asignar datos al repeater
            $w('#componentRepeater').data = dataForRepeater;
            
        } else {
            console.warn("El catálogo llegó vacío.");
        }

    } catch (error) {
        console.error("Error crítico al cargar el menú:", error);
    }
}