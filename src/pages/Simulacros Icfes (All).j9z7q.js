import { fetch } from 'wix-fetch';
import wixLocationFrontend from 'wix-location-frontend';
import { currentMember } from 'wix-members-frontend';
import { orders } from 'wix-pricing-plans-frontend';
import { fetchUserProgress } from 'backend/userProgress.jsw';

const CDN_CATALOG_URL = "https://cdn.invicto.com.co/icfes/general/icfes_exam.json";
const PAYWALL_URL = "https://www.invicto.com.co/pricing-plans/planes-precios";

// Global State Management
let globalCatalog = [];
let progressMap = {};
let completedComponents = new Set();
let isPremiumUser = false;

$w.onReady(function () {
    $w('#componentRepeater').onItemReady(($item, itemData) => {
        if (!itemData.componentId) return;
        
        $item('#componentTitle').text = itemData.componentTitle ? `ICFES | ${itemData.componentTitle}` : "Titulo no disponible";
        $item('#componentDescription').text = itemData.componentDescription || "Descripcion no disponible";
        $item('#componentStats').text = `${itemData.questionCount || 0} Preguntas, ${itemData.timeLimitMinutes || 0} Minutos`;

        let imageUrl = itemData.componentImage;
        if (!imageUrl || imageUrl.includes("...")) {
            imageUrl = "https://upload.wikimedia.org/wikipedia/commons/thumb/a/ac/No_image_available.svg/300px-No_image_available.svg.png"; 
        }
        $item('#componentImage').src = imageUrl;

        $item('#textScore').collapse();
        $item('#textTime').collapse();
        
        if ($item('#paywallOverlay')) {
            $item('#paywallOverlay').collapse();
        }

        // 1. Render Specific Exam Progress
        const userProgress = progressMap[itemData.examId];

        if (userProgress) {
            $item('#textScore').text = `${userProgress.TotalScore}/100`;
            
            const minutes = Math.floor(userProgress.TimeUsedSeconds / 60);
            const seconds = Math.round(userProgress.TimeUsedSeconds % 60);
            $item('#textTime').text = `${minutes}m ${seconds}s`;
            
            $item('#textScore').expand();
            $item('#textTime').expand();
        }

        // 2. Evaluate Paywall State
        const isComponentLocked = completedComponents.has(itemData.componentId) && !isPremiumUser;
        let finalTargetUrl = "";

        if (isComponentLocked) {
            if ($item('#paywallOverlay')) {
                $item('#paywallOverlay').expand();
            }
            finalTargetUrl = PAYWALL_URL;
        } else {
            const prefix = "simulacro-icfes"; 
            const uniqueToken = Date.now().toString();
            
            finalTargetUrl = `/${prefix}/${itemData.componentId}` + 
                             `?examId=${encodeURIComponent(itemData.examId || "")}` +
                             `&title=${encodeURIComponent(itemData.componentTitle || "")}` +
                             `&qCount=${itemData.questionCount || 0}` +
                             `&time=${itemData.timeLimitMinutes || 0}` +
                             `&img=${encodeURIComponent(imageUrl)}` +
                             `&reset=${uniqueToken}`;
        }
        
        // 3. Bind Final Routing
        $item('#startExamButton').link = finalTargetUrl;
        $item('#startExamButton').target = "_self"; 
        
        $item('#componentImage').link = finalTargetUrl;
        $item('#componentImage').target = "_self";

        const box8 = $item('#box8');
        if (box8 && typeof box8.onClick === 'function') {
            box8.onClick(() => wixLocationFrontend.to(finalTargetUrl));
        }
    });

    loadPageSafely();
});

async function loadPageSafely() {
    try {
        const response = await fetch(CDN_CATALOG_URL, { method: 'GET' });
        
        if (!response.ok) throw new Error(`Error CDN: ${response.status}`);
        
        const responseData = await response.json();
        globalCatalog = responseData.catalog || [];

        await fetchUserProgressAndStatus();

        const randomizedCatalog = processAndRandomizeCatalog(globalCatalog);
        $w('#componentRepeater').data = randomizedCatalog;

    } catch (error) {
        // Silenced for production
    }
}

async function fetchUserProgressAndStatus() {
    try {
        const member = await currentMember.getMember();
        
        if (!member || !member._id) {
            return;
        }

        // Check Premium Status
        try {
            const ordersList = await orders.listCurrentMemberOrders();
            if (ordersList && ordersList.length > 0) {
                const activeOrders = ordersList.filter(order => order.status === 'ACTIVE');
                isPremiumUser = activeOrders.length > 0;
            }
        } catch (planError) {
            // Silenced for production
        }

        const progressResponse = await fetchUserProgress(member._id);

        if (progressResponse && progressResponse.ok && progressResponse.progress) {
            progressResponse.progress.forEach(item => {
                
                // Backwards Compatibility: Match legacy IDs (math_vol_01.json) to new absolute URLs
                const catalogMatch = globalCatalog.find(ex => 
                    ex.examId === item.ExamId || ex.examId.endsWith(`/${item.ExamId}`)
                );

                if (catalogMatch) {
                    // Normalize the map key to the absolute URL
                    progressMap[catalogMatch.examId] = item;
                    completedComponents.add(catalogMatch.componentId);
                } else {
                    progressMap[item.ExamId] = item;
                }
            });
        }
    } catch (error) {
        // Silenced for production
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