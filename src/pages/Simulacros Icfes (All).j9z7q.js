import { fetch } from 'wix-fetch';
import wixLocationFrontend from 'wix-location-frontend';
import { currentMember } from 'wix-members-frontend';
import { fetchUserProgress } from 'backend/userProgress.jsw';

const CDN_CATALOG_URL = "https://cdn.invicto.com.co/icfes/general/icfes_exam.json";

$w.onReady(function () {
    console.log("🚀 1. Page loaded, starting script...");

    // 1. Setup Repeater Behavior (This just tells the repeater HOW to act)
    $w('#componentRepeater').onItemReady(($item, itemData) => {
        if (!itemData.componentId) return;
        
        $item('#componentTitle').text = itemData.componentTitle || "Título no disponible";
        $item('#componentDescription').text = itemData.componentDescription || "Descripción no disponible";
        $item('#componentStats').text = `${itemData.questionCount || 0} Preguntas • ${itemData.timeLimitMinutes || 0} Minutos`;

        let imageUrl = itemData.componentImage;
        if (!imageUrl || imageUrl.includes("...")) {
            imageUrl = "https://upload.wikimedia.org/wikipedia/commons/thumb/a/ac/No_image_available.svg/300px-No_image_available.svg.png"; 
        }
        $item('#componentImage').src = imageUrl;

        // Ensure scores are hidden by default
        $item('#textScore').collapse();
        $item('#textTime').collapse();

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

        const box8 = $item('#box8');
        if (box8 && typeof box8.onClick === 'function') {
            box8.onClick(() => wixLocationFrontend.to(targetUrl));
        }
    });

    // 2. Execute Data Fetching Safely
    loadPageSafely();
});

// --- STAGE 1: Load Catalog (Priority) ---
async function loadPageSafely() {
    try {
        console.log("🌐 2. Fetching Catalog from CDN...");
        const response = await fetch(CDN_CATALOG_URL, { method: 'GET' });
        
        if (!response.ok) throw new Error(`Error CDN: ${response.status}`);
        
        const responseData = await response.json();
        const catalog = responseData.catalog || [];
        console.log(`✅ 3. CDN loaded! Found ${catalog.length} exams.`);

        const randomizedCatalog = processAndRandomizeCatalog(catalog);
        
        // This instantly shows the cards to the user
        $w('#componentRepeater').data = randomizedCatalog;
        console.log("✅ 4. Repeater populated with CDN data!");

        // Trigger Phase 2 in the background
        fetchAndApplyUserProgress();

    } catch (error) {
        console.error("❌ CRITICAL: Failed to load CDN catalog:", error);
    }
}

// --- STAGE 2: Fetch User Progress (Background) ---
async function fetchAndApplyUserProgress() {
    try {
        console.log("👤 5. Checking for logged-in user...");
        const member = await currentMember.getMember();
        
        if (!member || !member._id) {
            console.log("⚠️ 6. No user logged in. Skipping AWS fetch.");
            return;
        }

        console.log(`☁️ 7. User found (${member._id}). Fetching AWS progress...`);
        const progressResponse = await fetchUserProgress(member._id);

        if (progressResponse && progressResponse.ok && progressResponse.progress) {
            console.log("✅ 8. AWS progress received! Injecting into repeater...");
            
            // Build dictionary map
            let progressMap = {};
            progressResponse.progress.forEach(item => {
                progressMap[item.ExamId] = item;
            });

            // Loop through existing repeater items and inject scores
            $w('#componentRepeater').forEachItem(($item, itemData) => {
                const userProgress = progressMap[itemData.examId];

                if (userProgress) {
                    $item('#textScore').text = `Puntaje: ${userProgress.TotalScore}%`;
                    
                    const minutes = Math.floor(userProgress.TimeUsedSeconds / 60);
                    const seconds = Math.round(userProgress.TimeUsedSeconds % 60);
                    $item('#textTime').text = `Tiempo: ${minutes}m ${seconds}s`;
                    
                    $item('#textScore').expand();
                    $item('#textTime').expand();
                }
            });

            console.log("🎉 9. Success! Scores applied to the UI.");
        } else {
            console.log("⚠️ 8. No progress returned from AWS or error occurred:", progressResponse);
        }

    } catch (error) {
        console.error("❌ ERROR: Failed during User Progress phase:", error);
    }
}

function processAndRandomizeCatalog(catalog) {
    const groupedExams = {};
    catalog.forEach(exam => {
        if (!groupedExams[exam.componentId]) groupedExams[exam.componentId] = [];
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