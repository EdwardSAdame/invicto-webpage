import { fetch } from 'wix-fetch';
import wixLocationFrontend from 'wix-location-frontend';

const CDN_CATALOG_URL = "https://cdn.invicto.com.co/icfes/general/icfes_exam.json";

$w.onReady(function () {
    
    $w('#componentRepeater').onItemReady(($item, itemData, index) => {
        
        $item('#componentTitle').text = itemData.componentTitle || "Titulo no disponible";
        $item('#componentDescription').text = itemData.componentDescription || "Descripcion no disponible";
        $item('#componentStats').text = `${itemData.questionCount || 0} Preguntas • ${itemData.timeLimitMinutes || 0} Minutos`;

        let imageUrl = itemData.componentImage;
        if (!imageUrl || imageUrl.includes("...")) {
            imageUrl = "https://static.wixstatic.com/media/c837a6_b80ba1a2939540028a4cb0b230f2c41c~mv2.jpg"; 
        }
        $item('#componentImage').src = imageUrl;

        // --- NAVIGATION LOGIC WITH HEAVY LOGS ---
        const navigateToExam = (event) => {
            console.log("====================================");
            console.log("👉 ¡Clic detectado en el Repeater!");
            console.log("Elemento clickeado ID:", event.target.id);
            console.log("Datos de la materia seleccionada:", itemData.componentId);
            
            const targetUrl = `/simulacro-icfes/${itemData.componentId}` + 
                              `?examId=${itemData.examId}` +
                              `&title=${encodeURIComponent(itemData.componentTitle || "")}` +
                              `&qCount=${itemData.questionCount || 0}` +
                              `&time=${itemData.timeLimitMinutes || 0}` +
                              `&img=${encodeURIComponent(imageUrl)}`;
            
            console.log("🔗 URL dinámica generada:", targetUrl);
            
            try {
                wixLocationFrontend.to(targetUrl);
                console.log("🚀 Comando wixLocationFrontend.to() ejecutado.");
            } catch (err) {
                console.error("❌ Error en código al intentar navegar:", err);
            }
            console.log("====================================");
        };

        // Asignación de clics
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
            const randomizedCatalog = processAndRandomizeCatalog(catalogData);
            $w('#componentRepeater').data = randomizedCatalog;
        } else {
            console.warn("El catalogo llego vacio.");
        }
    } catch (error) {
        console.error("Error critico al cargar el menu desde CDN:", error);
    }
}

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