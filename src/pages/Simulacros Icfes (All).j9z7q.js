import { fetch } from 'wix-fetch';
import wixLocationFrontend from 'wix-location-frontend';

const CDN_CATALOG_URL = "https://cdn.invicto.com.co/icfes/general/icfes_exam.json";

$w.onReady(function () {
    
    $w('#componentRepeater').onItemReady(($item, itemData, index) => {
        console.log(`Renderizando tarjeta ${index}:`, itemData);

        if (!itemData.componentId) {
            console.warn("Ignorando tarjeta vacía del editor.");
            return;
        }
        
        $item('#componentTitle').text = itemData.componentTitle || "Título no disponible";
        $item('#componentDescription').text = itemData.componentDescription || "Descripción no disponible";
        $item('#componentStats').text = `${itemData.questionCount || 0} Preguntas • ${itemData.timeLimitMinutes || 0} Minutos`;

        let imageUrl = itemData.componentImage;
        if (!imageUrl || imageUrl.includes("...")) {
            imageUrl = "https://upload.wikimedia.org/wikipedia/commons/thumb/a/ac/No_image_available.svg/300px-No_image_available.svg.png"; 
        }
        $item('#componentImage').src = imageUrl;

        // --- LÓGICA DE NAVEGACIÓN CORREGIDA ---
        const navigateToExam = (event) => {
            // Asegúrate de que este prefijo sea EXACTAMENTE el de tu página dinámica en Wix.
            // Si en Wix dice "/simulacros-icfes/{Title}", cámbialo aquí abajo añadiendo la "s".
            const prefix = "simulacro-icfes"; 
            
            // Construimos la URL limpia sin dobles slashes
            const targetUrl = `/${prefix}/${itemData.componentId}` + 
                              `?examId=${itemData.examId}` +
                              `&title=${encodeURIComponent(itemData.componentTitle || "")}` +
                              `&qCount=${itemData.questionCount || 0}` +
                              `&time=${itemData.timeLimitMinutes || 0}` +
                              `&img=${encodeURIComponent(imageUrl)}`;
            
            console.log("🔗 Navegando dinámicamente a:", targetUrl);
            wixLocationFrontend.to(targetUrl);
        };

        // Asignación de clics
        $item('#startExamButton').onClick(navigateToExam);
        $item('#componentImage').onClick(navigateToExam);
        
        // Clic en la tarjeta completa (ajusta #box8 si tu contenedor tiene otro ID)
        if ($item('#box8')) {
            $item('#box8').onClick(navigateToExam);
            $item('#box8').style.cursor = "pointer"; 
        }
    });

    loadCatalogFromCDN();
});

async function loadCatalogFromCDN() {
    try {
        console.log("Iniciando descarga del catálogo desde CDN...");
        const response = await fetch(CDN_CATALOG_URL, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' }
        });

        if (!response.ok) {
            throw new Error(`Error CDN: ${response.status}`);
        }

        const responseData = await response.json();
        console.log("Catálogo descargado con éxito:", responseData);

        const catalogData = responseData.catalog;

        if (catalogData && catalogData.length > 0) {
            const randomizedCatalog = processAndRandomizeCatalog(catalogData);
            console.log("Inyectando data limpia al Repeater:", randomizedCatalog);
            
            $w('#componentRepeater').data = randomizedCatalog;
        } else {
            console.warn("El catálogo llegó vacío o no tiene la propiedad 'catalog'.");
        }
    } catch (error) {
        console.error("Error crítico al cargar el menú desde CDN:", error);
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