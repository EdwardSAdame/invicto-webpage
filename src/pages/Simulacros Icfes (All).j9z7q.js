import { fetch } from 'wix-fetch';
import wixLocationFrontend from 'wix-location-frontend';
import { currentMember } from 'wix-members-frontend';
import { fetchUserProgress } from 'backend/userProgress.jsw';

const CDN_CATALOG_URL = "https://cdn.invicto.com.co/icfes/general/icfes_exam.json";

let progressMap = {};

$w.onReady(function () {
    $w('#componentRepeater').onItemReady(($item, itemData) => {
        if (!itemData.componentId) return;
        
        // --- UPDATED: Appended 'ICFES | ' to the title ---
        $item('#componentTitle').text = itemData.componentTitle ? `ICFES | ${itemData.componentTitle}` : "Titulo no disponible";
        
        $item('#componentDescription').text = itemData.componentDescription || "Descripcion no disponible";
        
        // --- UPDATED: Replaced bullet with a comma ---
        $item('#componentStats').text = `${itemData.questionCount || 0} Preguntas, ${itemData.timeLimitMinutes || 0} Minutos`;

        let imageUrl = itemData.componentImage;
        if (!imageUrl || imageUrl.includes("...")) {
            imageUrl = "https://upload.wikimedia.org/wikipedia/commons/thumb/a/ac/No_image_available.svg/300px-No_image_available.svg.png"; 
        }
        $item('#componentImage').src = imageUrl;

        $item('#textScore').collapse();
        $item('#textTime').collapse();

        const userProgress = progressMap[itemData.examId];

        if (userProgress) {
            $item('#textScore').text = `${userProgress.TotalScore}/100`;
            
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
        const response = await fetch(CDN_CATALOG_URL, { method: 'GET' });
        
        if (!response.ok) throw new Error(`Error CDN: ${response.status}`);
        
        const responseData = await response.json();
        const catalog = responseData.catalog || [];

        const randomizedCatalog = processAndRandomizeCatalog(catalog);
        
        $w('#componentRepeater').data = randomizedCatalog;

        fetchAndApplyUserProgress();

    } catch (error) {
        // Silenced for production environments
    }
}

async function fetchAndApplyUserProgress() {
    try {
        const member = await currentMember.getMember();
        
        if (!member || !member._id) {
            return;
        }

        const progressResponse = await fetchUserProgress(member._id);

        if (progressResponse && progressResponse.ok && progressResponse.progress) {
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
        // Silenced for production environments
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