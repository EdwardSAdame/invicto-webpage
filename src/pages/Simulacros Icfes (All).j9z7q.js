import { fetch } from 'wix-fetch';
import wixLocationFrontend from 'wix-location-frontend';

const CDN_CATALOG_URL = "https://cdn.invicto.com.co/icfes/general/icfes_exam.json";

$w.onReady(function () {
    
    $w('#componentRepeater').onItemReady(($item, itemData, index) => {
        console.log(`Renderizando tarjeta ${index}:`, itemData);

        // PROTECCIÓN: Si es una tarjeta vacía (fantasma) del editor, ignorarla.
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

        // --- LÓGICA DE NAVEGACIÓN A PRUEBA DE BALAS ---
        const prefix = "simulacro-icfes"; 
        
        // Construimos la URL limpia
        const targetUrl = `/${prefix}/${itemData.componentId}` + 
                          `?examId=${itemData.examId}` +
                          `&title=${encodeURIComponent(itemData.componentTitle || "")}` +
                          `&qCount=${itemData.questionCount || 0}` +
                          `&time=${itemData.timeLimitMinutes || 0}` +
                          `&img=${encodeURIComponent(imageUrl)}`;
        
        // 1. Asignamos la URL directamente como link nativo (Esto JAMÁS falla)
        $item('#startExamButton').link = targetUrl;
        $item('#startExamButton').target = "_self"; // Abre en la misma pestaña
        
        $item('#componentImage').link = targetUrl;
        $item('#componentImage').target = "_self";

        // 2. Mantenemos el fallback para el contenedor completo por si acaso (ajusta #box8 si tu contenedor se llama distinto)
        if ($item('#box8')) {
            $item('#box8').onClick(() => {
                console.log("🔗 Navegando vía click en la tarjeta a:", targetUrl);
                wixLocationFrontend.to(targetUrl);
            });
            $item('#box8').style.cursor = "pointer"; 
        }
    });

    loadCatalogFromCDN();
});

async function loadCatalogFromCDN() {
    try {
        console.log("Iniciando descarga del catálogo desde CDN...");
        
        // PETICIÓN SIMPLE: Quitamos los 'headers' para evitar el bloqueo por CORS Preflight
        const response = await fetch(CDN_CATALOG_URL, {
            method: 'GET'
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