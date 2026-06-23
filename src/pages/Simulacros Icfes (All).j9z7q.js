import { fetch } from 'wix-fetch';
import wixLocationFrontend from 'wix-location-frontend';
import { currentMember } from 'wix-members-frontend';
import { fetchUserProgress } from 'backend/userProgress.jsw';

const CDN_CATALOG_URL = "https://cdn.invicto.com.co/icfes/general/icfes_exam.json";

let progressMap = {};

$w.onReady(function () {
    console.log("🚀 DEBUG: Script initialized. Version: 2026-06-22-DEBUG");

    $w('#componentRepeater').onItemReady(($item, itemData) => {
        if (!itemData.componentId) return;
        
        // 🔍 DEBUG: Log the incoming raw data
        console.log("🔍 DEBUG: Processing item:", itemData.componentTitle, "Data:", itemData);
        
        // Formatted Title
        const newTitle = itemData.componentTitle ? `ICFES | ${itemData.componentTitle}` : "Titulo no disponible";
        $item('#componentTitle').text = newTitle;
        console.log("✅ Applied Title:", newTitle);
        
        $item('#componentDescription').text = itemData.componentDescription || "Descripcion no disponible";
        
        // Formatted Stats
        const newStats = `${itemData.questionCount || 0} Preguntas, ${itemData.timeLimitMinutes || 0} Minutos`;
        $item('#componentStats').text = newStats;
        console.log("✅ Applied Stats:", newStats);

        let imageUrl = itemData.componentImage;
        if (!imageUrl || imageUrl.includes("...")) {
            imageUrl = "https://upload.wikimedia.org/wikipedia/commons/thumb/a/ac/No_image_available.svg/300px-No_image_available.svg.png"; 
        }
        $item('#componentImage').src = imageUrl;

        $item('#textScore').collapse();
        $item('#textTime').collapse();

        const userProgress = progressMap[itemData.examId];

        if (userProgress) {
            const formattedScore = `${userProgress.TotalScore}/100`;
            $item('#textScore').text = formattedScore;
            console.log("✅ Applied Score:", formattedScore, "for Exam:", itemData.examId);
            
            const minutes = Math.floor(userProgress.TimeUsedSeconds / 60);
            const seconds = Math.round(userProgress.TimeUsedSeconds % 60);
            $item('#textTime').text = `${minutes}m ${seconds}s`;
            
            $item('#textScore').expand();
            $item('#textTime').expand();
        }

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

    loadPageSafely();
});

async function loadPageSafely() {
    try {
        console.log("🌐 DEBUG: Fetching CDN...");
        const response = await fetch(CDN_CATALOG_URL, { method: 'GET' });
        
        if (!response.ok) throw new Error(`Error CDN: ${response.status}`);
        
        const responseData = await response.json();
        const catalog = responseData.catalog || [];
        console.log("✅ DEBUG: CDN loaded", catalog.length, "items.");

        const randomizedCatalog = processAndRandomizeCatalog(catalog);
        
        $w('#componentRepeater').data = randomizedCatalog;
        console.log("✅ DEBUG: Repeater data assigned.");

        fetchAndApplyUserProgress();

    } catch (error) {
        console.error("❌ DEBUG: CDN Error:", error);
    }
}

async function fetchAndApplyUserProgress() {
    try {
        const member = await currentMember.getMember();
        
        if (!member || !member._id) {
            console.log("⚠️ DEBUG: No member logged in.");
            return;
        }

        console.log("👤 DEBUG: Fetching AWS progress for:", member._id);
        const progressResponse = await fetchUserProgress(member._id);

        if (progressResponse && progressResponse.ok && progressResponse.progress) {
            console.log("✅ DEBUG: AWS data received:", progressResponse.progress);
            progressResponse.progress.forEach(item => {
                progressMap[item.ExamId] = item;
            });

            $w('#componentRepeater').forEachItem(($item, itemData) => {
                const userProgress = progressMap[itemData.examId];

                if (userProgress) {
                    $item('#textScore').text = `${userProgress.TotalScore}/100`;
                    
                    const minutes = Math.floor(userProgress.TimeUsedSeconds / 60);
                    const seconds = Math.round(userProgress.TimeUsedSeconds % 60);
                    $item('#textTime').text = `${minutes}m ${seconds}s`;
                    
                    $item('#textScore').expand();
                    $item('#textTime').expand();
                }
            });
        }
    } catch (error) {
        console.error("❌ DEBUG: AWS Fetch Error:", error);
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