import { fetch } from 'wix-fetch';
import wixLocationFrontend from 'wix-location-frontend';
import { currentMember } from 'wix-members-frontend';

const CDN_CATALOG_URL = "https://cdn.invicto.com.co/icfes/general/icfes_exam.json";

// Global map to store user progress by ExamId for O(1) lookup
let progressMap = {};

$w.onReady(function () {
    // 1. Initialize Repeater Logic before assigning data
    $w('#componentRepeater').onItemReady(($item, itemData) => {
        if (!itemData.componentId) {
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

        // 2. Map Progress Data to UI Elements
        const userProgress = progressMap[itemData.examId];

        if (userProgress) {
            $item('#textScore').text = `Puntaje: ${userProgress.TotalScore}%`;
            
            const minutes = Math.floor(userProgress.TimeUsedSeconds / 60);
            const seconds = Math.round(userProgress.TimeUsedSeconds % 60);
            $item('#textTime').text = `Tiempo: ${minutes}m ${seconds}s`;
            
            $item('#textScore').expand();
            $item('#textTime').expand();
        } else {
            $item('#textScore').collapse();
            $item('#textTime').collapse();
        }

        // 3. Navigation Logic
        const prefix = "simulacro-icfes"; 
        const uniqueToken = Date.now().toString();
        
        const targetUrl = `/${prefix}/${itemData.componentId}` + 
                          `?examId=${itemData.examId}` +
                          `&title=${encodeURIComponent(itemData.componentTitle || "")}` +
                          `&qCount=${itemData.questionCount || 0}` +
                          `&time=${itemData.timeLimitMinutes || 0}` +
                          `&img=${encodeURIComponent(imageUrl)}` +
                          `&reset=${uniqueToken}`;
        
        $item('#startExamButton').link = targetUrl;
        $item('#startExamButton').target = "_self"; 
        
        $item('#componentImage').link = targetUrl;
        $item('#componentImage').target = "_self";

        if ($item('#box8')) {
            $item('#box8').onClick(() => {
                wixLocationFrontend.to(targetUrl);
            });
            $item('#box8').style.cursor = "pointer"; 
        }
    });

    // 4. Trigger Data Fetching
    loadDataAndPopulateRepeater();
});

async function loadDataAndPopulateRepeater() {
    let memberId = null;
    
    try {
        const member = await currentMember.getMember();
        if (member && member._id) {
            memberId = member._id;
        }
    } catch (error) {
        console.warn("User not authenticated or member retrieval failed.");
    }

    // Fetch catalog and user progress concurrently
    const [catalogData, progressResponse] = await Promise.all([
        fetchCatalogFromCDN(),
        memberId ? fetchUserProgressFromAWS(memberId) : Promise.resolve({ ok: false, progress: [] })
    ]);

    // Populate progress map if data exists
    if (progressResponse && progressResponse.ok && progressResponse.progress) {
        progressResponse.progress.forEach(item => {
            progressMap[item.ExamId] = item;
        });
    }

    // Process and assign catalog data to the repeater
    if (catalogData && catalogData.length > 0) {
        const randomizedCatalog = processAndRandomizeCatalog(catalogData);
        $w('#componentRepeater').data = randomizedCatalog;
    }
}

// --- NEW FUNCTION: Direct call to AWS API Gateway ---
async function fetchUserProgressFromAWS(userId) {
    const url = `https://sljyavsulf.execute-api.us-east-1.amazonaws.com/prod/GetUserProgressHandler?userId=${userId}`;

    try {
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error(`AWS API returned status: ${response.status}`);
        }

        const json = await response.json();
        return json; // Expecting { ok: true, progress: [...] }
        
    } catch (error) {
        console.error("❌ Error fetching user progress directly from AWS:", error);
        return { ok: false, progress: [], error: error.message };
    }
}

async function fetchCatalogFromCDN() {
    try {
        const response = await fetch(CDN_CATALOG_URL, { method: 'GET' });
        
        if (!response.ok) {
            throw new Error(`Error CDN: ${response.status}`);
        }

        const responseData = await response.json();
        return responseData.catalog || [];
    } catch (error) {
        console.error("Failed to load CDN catalog:", error);
        return [];
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
            _id: `${selectedExam.componentId}_${Math.random().toString(36).substring(2, 9)}` 
        });
    }

    return finalSelection;
}