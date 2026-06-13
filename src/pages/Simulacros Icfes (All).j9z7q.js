import { fetch } from 'wix-fetch';
import wixLocationFrontend from 'wix-location-frontend';

const CDN_CATALOG_URL = "https://cdn.invicto.com.co/icfes/general/icfes_exam.json";

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

        // 2. Encapsulate navigation logic using the NEW wixLocationFrontend
        const navigateToExam = () => {
            // This builds exactly the URL you requested: /simulacro-icfes/ingles, etc.
            const targetUrl = `/simulacro-icfes/${itemData.componentId}` + 
                              `?examId=${itemData.examId}` +
                              `&title=${encodeURIComponent(itemData.componentTitle || "")}` +
                              `&qCount=${itemData.questionCount || 0}` +
                              `&time=${itemData.timeLimitMinutes || 0}` +
                              `&img=${encodeURIComponent(imageUrl)}`;
            
            console.log("Redirigiendo dinámicamente a:", targetUrl);
            
            // USING THE NEW ROUTER TO FIX THE SILENT CLICK
            wixLocationFrontend.to(targetUrl);
        };

        // 3. Assign the shared logic to both elements
        $item('#startExamButton').onClick(navigateToExam);
        $item('#componentImage').onClick(navigateToExam);

    });

    loadCatalogFromCDN();
});

async function loadCatalogFromCDN() {
    try {
        const response = await fetch(CDN_CATALOG_URL, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' }
        });

        if (!response.ok) {
            throw new Error(`CDN Error: ${response.status}`);
        }

        const responseData = await response.json();
        const catalogData = responseData.catalog;

        if (catalogData && catalogData.length > 0) {
            // Agrupar y seleccionar aleatoriamente un volumen por materia
            const randomizedCatalog = processAndRandomizeCatalog(catalogData);
            $w('#componentRepeater').data = randomizedCatalog;
        } else {
            console.warn("El catalogo llego vacio.");
        }
    } catch (error) {
        console.error("Error critico al cargar el menu desde CDN:", error);
    }
}

/**
 * Agrupa los exámenes por materia y elige uno al azar.
 */
function processAndRandomizeCatalog(catalog) {
    const groupedExams = {};

    catalog.forEach(exam => {
        if (!groupedExams[exam.componentId]) {
            groupedExams[exam.componentId] = [];
        }
        groupedExams[exam.componentId].push(exam);
    });

    const finalSelection = [];

    for (const componentId in groupedExams) {
        const examsArray = groupedExams[componentId];
        const randomIndex = Math.floor(Math.random() * examsArray.length);
        const selectedExam = examsArray[randomIndex];

        finalSelection.push({
            ...selectedExam,
            _id: selectedExam.componentId 
        });
    }

    return finalSelection;
}