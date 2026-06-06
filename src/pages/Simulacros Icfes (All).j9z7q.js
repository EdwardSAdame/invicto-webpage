import { fetchMockExamCatalog } from 'backend/mockExamService';
import wixLocation from 'wix-location';

$w.onReady(function () {
    
    $w('#componentRepeater').onItemReady(($item, itemData, index) => {
        
        // Textos e Imagenes
        $item('#componentTitle').text = itemData.componentTitle || "Titulo no disponible";
        $item('#componentDescription').text = itemData.componentDescription || "Descripcion no disponible";
        $item('#componentStats').text = `${itemData.questionCount || 0} Preguntas • ${itemData.timeLimitMinutes || 0} Minutos`;

        let imageUrl = itemData.componentImage;
        if (!imageUrl || imageUrl.includes("...")) {
            imageUrl = "https://static.wixstatic.com/media/c837a6_b80ba1a2939540028a4cb0b230f2c41c~mv2.jpg"; 
        }
        $item('#componentImage').src = imageUrl;

        // 2. Encapsulate navigation logic to avoid repetition (Clean Code)
        const navigateToExam = () => {
            const targetUrl = `/simulacro-icfes/${itemData.componentId}` + 
                              `?examId=${itemData.examId}` +
                              `&title=${encodeURIComponent(itemData.componentTitle || "")}` +
                              `&qCount=${itemData.questionCount || 0}` +
                              `&time=${itemData.timeLimitMinutes || 0}` +
                              `&img=${encodeURIComponent(imageUrl)}`;
            
            console.log("Redirigiendo a:", targetUrl);
            wixLocation.to(targetUrl);
        };

        // 3. Assign the shared logic to both elements
        $item('#startExamButton').onClick(navigateToExam);
        $item('#componentImage').onClick(navigateToExam);

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
            console.warn("El catalogo llego vacio.");
        }
    } catch (error) {
        console.error("Error critico al cargar el menu:", error);
    }
}