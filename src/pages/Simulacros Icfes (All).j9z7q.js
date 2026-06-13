import { fetch } from 'wix-fetch';
import wixLocation from 'wix-location';

const CDN_CATALOG_URL = "https://cdn.invicto.com.co/icfes/general/icfes_exam.json";

$w.onReady(function () {
    
    $w('#componentRepeater').onItemReady(($item, itemData, index) => {
        
        // Text and Images
        $item('#componentTitle').text = itemData.componentTitle || "Titulo no disponible";
        $item('#componentDescription').text = itemData.componentDescription || "Descripcion no disponible";
        $item('#componentStats').text = `${itemData.questionCount || 0} Preguntas • ${itemData.timeLimitMinutes || 0} Minutos`;

        let imageUrl = itemData.componentImage;
        if (!imageUrl || imageUrl.includes("...")) {
            imageUrl = "https://static.wixstatic.com/media/c837a6_b80ba1a2939540028a4cb0b230f2c41c~mv2.jpg"; 
        }
        $item('#componentImage').src = imageUrl;

        // Encapsulate navigation logic
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

        // Assign the shared logic to interactive elements
        $item('#startExamButton').onClick(navigateToExam);
        $item('#componentImage').onClick(navigateToExam);

    });

    loadCatalog();
});

async function loadCatalog() {
    try {
        const response = await fetch(CDN_CATALOG_URL, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error(`CDN fetch failed with status: ${response.status}`);
        }

        const responseData = await response.json();
        const catalogData = responseData.catalog;

        if (catalogData && catalogData.length > 0) {
            const randomizedCatalog = processAndRandomizeCatalog(catalogData);
            $w('#componentRepeater').data = randomizedCatalog;
        } else {
            console.warn("El catalogo llego vacio.");
        }
    } catch (error) {
        console.error("Error critico al cargar el menu desde el CDN:", error);
    }
}

/**
 * Groups the catalog by componentId, selects a random exam for each component, 
 * and formats the resulting array for the Wix Repeater.
 */
function processAndRandomizeCatalog(catalog) {
    const groupedExams = {};

    // Grouping exams by their componentId (e.g., 'matematicas', 'ingles')
    catalog.forEach(exam => {
        if (!groupedExams[exam.componentId]) {
            groupedExams[exam.componentId] = [];
        }
        groupedExams[exam.componentId].push(exam);
    });

    const finalSelection = [];

    // Select one random exam per componentId
    for (const componentId in groupedExams) {
        const examsArray = groupedExams[componentId];
        const randomIndex = Math.floor(Math.random() * examsArray.length);
        const selectedExam = examsArray[randomIndex];

        // Wix repeaters require a unique _id field as a string
        finalSelection.push({
            ...selectedExam,
            _id: selectedExam.componentId 
        });
    }

    return finalSelection;
}