// src/public/RomaLayoutManager.js
import wixWindow from 'wix-window';

export class RomaLayoutManager {
    
    constructor({ chatWidget, quizPanel, marginL, marginR }) {
        this.chatWidget = chatWidget;
        this.quizPanel = quizPanel;
        this.marginL = marginL;
        this.marginR = marginR;
        this.isMobile = wixWindow.formFactor === "Mobile";
    }

    init() {
        if (this.isMobile) {
            this.marginL.collapse();
            this.marginR.collapse();
        } else {
            // Restore state based on Editor visibility
            if (this.quizPanel.collapsed) {
                this.marginL.expand();
                this.marginR.expand();
            } else {
                this.marginL.collapse();
                this.marginR.collapse();
            }
        }
    }

    // Mode A: QUIZ OPEN (Duo Mode)
    async setDuoMode() {
        if (this.isMobile) {
            await Promise.all([
                this.marginL.collapse(),
                this.marginR.collapse(),
                this.chatWidget.collapse()
            ]);
            await this.quizPanel.expand();
        } else {
            await Promise.all([
                this.marginL.collapse(),
                this.marginR.collapse()
            ]);
            await this.quizPanel.expand(); // Forces Quiz Open
        }
    }

    // 🟢 Mode B: DOCUMENT OPEN (New Method)
    // Collapses margins but ensures Quiz is HIDDEN so they don't overlap.
    async setDocumentLayout() {
        if (this.isMobile) {
            // MOBILE: Hide Chat, Hide Quiz, Hide Margins
            // (The DocViewer frame will take over screen space via Page Code)
            await Promise.all([
                this.marginL.collapse(),
                this.marginR.collapse(),
                this.chatWidget.collapse(),
                this.quizPanel.collapse() // 🟢 Force Quiz Close
            ]);
        } else {
            // DESKTOP: Hide Margins, Hide Quiz
            await Promise.all([
                this.marginL.collapse(),
                this.marginR.collapse(),
                this.quizPanel.collapse() // 🟢 Force Quiz Close
            ]);
        }
    }

    // Mode C: SOLO CHAT
    async setSoloMode() {
        if (this.isMobile) {
            await Promise.all([
                this.marginL.collapse(),
                this.marginR.collapse(),
                this.quizPanel.collapse()
            ]);
            await this.chatWidget.expand();
        } else {
            await this.quizPanel.collapse();
            await Promise.all([
                this.marginL.expand(),
                this.marginR.expand()
            ]);
        }
    }
}