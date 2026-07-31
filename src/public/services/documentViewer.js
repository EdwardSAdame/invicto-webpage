// FILE: src/public/services/documentViewer.js
import { session } from 'wix-storage-frontend';

const ACTIVE_VIEW_KEY = 'romaActiveView';
const DOC_URL_KEY = 'romaDocUrl';

export function handleDocumentView($w, url, layoutManager) {
    if (!url || typeof url !== 'string') return;
    
    let secureUrl = url.startsWith('http') ? url : `https://${url}`;
    const urlLower = secureUrl.toLowerCase();
    let finalUrl = "";

    if (
        urlLower.endsWith('.doc') || 
        urlLower.endsWith('.docx') || 
        urlLower.endsWith('.xls') || 
        urlLower.endsWith('.xlsx') || 
        urlLower.endsWith('.ppt') || 
        urlLower.endsWith('.pptx')
    ) {
        const encodedUrl = encodeURIComponent(secureUrl);
        finalUrl = `https://view.officeapps.live.com/op/embed.aspx?src=${encodedUrl}`;
    } else {
        finalUrl = `${secureUrl}#toolbar=0&navpanes=0&scrollbar=0`;
    }
    
    const $docFrame = $w('#docViewerFrame');
    const $docContainer = $w('#docViewerContainer');

    $docFrame.postMessage(finalUrl);
    $docContainer.expand();
    layoutManager.setDocumentLayout();
    
    session.setItem(ACTIVE_VIEW_KEY, 'document');
    session.setItem(DOC_URL_KEY, url);
}