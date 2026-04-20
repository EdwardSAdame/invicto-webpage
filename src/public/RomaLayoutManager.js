// src/public/RomaLayoutManager.js
import wixWindow from 'wix-window';

export class RomaLayoutManager {
    
    constructor({ chatWidget, quizPanel, mentalMapPanel, marginL, marginR }) {
        this.chatWidget = chatWidget;
        this.quizPanel = quizPanel;
        this.mentalMapPanel = mentalMapPanel; // NEW: Added mental map container
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
            if (this.quizPanel.collapsed && (!this.mentalMapPanel || this.mentalMapPanel.collapsed)) {
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
                this.chatWidget.collapse(),
                this.mentalMapPanel ? this.mentalMapPanel.collapse() : Promise.resolve() // 🟢 Force Mental Map Close
            ]);
            await this.quizPanel.expand();
        } else {
            await Promise.all([
                this.marginL.collapse(),
                this.marginR.collapse(),
                this.mentalMapPanel ? this.mentalMapPanel.collapse() : Promise.resolve() // 🟢 Force Mental Map Close
            ]);
            await this.quizPanel.expand(); // Forces Quiz Open
        }
    }

    // 🟢 NEW Mode: MENTAL MAP OPEN
    // Collapses margins and hides Quiz, opens Mental Map
    async setMentalMapMode() {
        if (this.isMobile) {
            await Promise.all([
                this.marginL.collapse(),
                this.marginR.collapse(),
                this.chatWidget.collapse(),
                this.quizPanel.collapse() // Force Quiz Close
            ]);
            if (this.mentalMapPanel) await this.mentalMapPanel.expand();
        } else {
            await Promise.all([
                this.marginL.collapse(),
                this.marginR.collapse(),
                this.quizPanel.collapse() // Force Quiz Close
            ]);
            if (this.mentalMapPanel) await this.mentalMapPanel.expand(); 
        }
    }

    // Mode B: DOCUMENT OPEN 
    // Collapses margins but ensures Quiz and Mental Map are HIDDEN so they don't overlap.
    async setDocumentLayout() {
        if (this.isMobile) {
            await Promise.all([
                this.marginL.collapse(),
                this.marginR.collapse(),
                this.chatWidget.collapse(),
                this.quizPanel.collapse(), 
                this.mentalMapPanel ? this.mentalMapPanel.collapse() : Promise.resolve()
            ]);
        } else {
            await Promise.all([
                this.marginL.collapse(),
                this.marginR.collapse(),
                this.quizPanel.collapse(), 
                this.mentalMapPanel ? this.mentalMapPanel.collapse() : Promise.resolve()
            ]);
        }
    }

    // Mode C: SOLO CHAT
    async setSoloMode() {
        if (this.isMobile) {
            await Promise.all([
                this.marginL.collapse(),
                this.marginR.collapse(),
                this.quizPanel.collapse(),
                this.mentalMapPanel ? this.mentalMapPanel.collapse() : Promise.resolve()
            ]);
            await this.chatWidget.expand();
        } else {
            await Promise.all([
                this.quizPanel.collapse(),
                this.mentalMapPanel ? this.mentalMapPanel.collapse() : Promise.resolve()
            ]);
            await Promise.all([
                this.marginL.expand(),
                this.marginR.expand()
            ]);
        }
    }
}