import wixWindow from 'wix-window';

export class RomaLayoutManager {
    
    constructor({ chatWidget, quizPanel, mentalMapPanel, flashcardsPanel, marginL, marginR }) {
        this.chatWidget = chatWidget;
        this.quizPanel = quizPanel;
        this.mentalMapPanel = mentalMapPanel; 
        this.flashcardsPanel = flashcardsPanel;
        this.marginL = marginL;
        this.marginR = marginR;
        this.isMobile = wixWindow.formFactor === "Mobile";
    }

    init() {
        if (this.isMobile) {
            this.marginL.collapse();
            this.marginR.collapse();
        } else {
            if (this.quizPanel.collapsed && 
               (!this.mentalMapPanel || this.mentalMapPanel.collapsed) && 
               (!this.flashcardsPanel || this.flashcardsPanel.collapsed)) {
                this.marginL.expand();
                this.marginR.expand();
            } else {
                this.marginL.collapse();
                this.marginR.collapse();
            }
        }
    }

    async setDuoMode() {
        if (this.isMobile) {
            await Promise.all([
                this.marginL.collapse(),
                this.marginR.collapse(),
                this.chatWidget.collapse(),
                this.mentalMapPanel ? this.mentalMapPanel.collapse() : Promise.resolve(),
                this.flashcardsPanel ? this.flashcardsPanel.collapse() : Promise.resolve()
            ]);
            await this.quizPanel.expand();
        } else {
            await Promise.all([
                this.marginL.collapse(),
                this.marginR.collapse(),
                this.mentalMapPanel ? this.mentalMapPanel.collapse() : Promise.resolve(),
                this.flashcardsPanel ? this.flashcardsPanel.collapse() : Promise.resolve()
            ]);
            await this.quizPanel.expand(); 
        }
    }

    async setMentalMapMode() {
        if (this.isMobile) {
            await Promise.all([
                this.marginL.collapse(),
                this.marginR.collapse(),
                this.chatWidget.collapse(),
                this.quizPanel.collapse(),
                this.flashcardsPanel ? this.flashcardsPanel.collapse() : Promise.resolve()
            ]);
            if (this.mentalMapPanel) await this.mentalMapPanel.expand();
        } else {
            await Promise.all([
                this.marginL.collapse(),
                this.marginR.collapse(),
                this.quizPanel.collapse(),
                this.flashcardsPanel ? this.flashcardsPanel.collapse() : Promise.resolve()
            ]);
            if (this.mentalMapPanel) await this.mentalMapPanel.expand(); 
        }
    }

    async setFlashcardsMode() {
        if (this.isMobile) {
            await Promise.all([
                this.marginL.collapse(),
                this.marginR.collapse(),
                this.chatWidget.collapse(),
                this.quizPanel.collapse(),
                this.mentalMapPanel ? this.mentalMapPanel.collapse() : Promise.resolve()
            ]);
            if (this.flashcardsPanel) await this.flashcardsPanel.expand();
        } else {
            await Promise.all([
                this.marginL.collapse(),
                this.marginR.collapse(),
                this.quizPanel.collapse(),
                this.mentalMapPanel ? this.mentalMapPanel.collapse() : Promise.resolve()
            ]);
            if (this.flashcardsPanel) await this.flashcardsPanel.expand(); 
        }
    }

    async setDocumentLayout() {
        if (this.isMobile) {
            await Promise.all([
                this.marginL.collapse(),
                this.marginR.collapse(),
                this.chatWidget.collapse(),
                this.quizPanel.collapse(), 
                this.mentalMapPanel ? this.mentalMapPanel.collapse() : Promise.resolve(),
                this.flashcardsPanel ? this.flashcardsPanel.collapse() : Promise.resolve()
            ]);
        } else {
            await Promise.all([
                this.marginL.collapse(),
                this.marginR.collapse(),
                this.quizPanel.collapse(), 
                this.mentalMapPanel ? this.mentalMapPanel.collapse() : Promise.resolve(),
                this.flashcardsPanel ? this.flashcardsPanel.collapse() : Promise.resolve()
            ]);
        }
    }

    async setSoloMode() {
        if (this.isMobile) {
            await Promise.all([
                this.marginL.collapse(),
                this.marginR.collapse(),
                this.quizPanel.collapse(),
                this.mentalMapPanel ? this.mentalMapPanel.collapse() : Promise.resolve(),
                this.flashcardsPanel ? this.flashcardsPanel.collapse() : Promise.resolve()
            ]);
            await this.chatWidget.expand();
        } else {
            await Promise.all([
                this.quizPanel.collapse(),
                this.mentalMapPanel ? this.mentalMapPanel.collapse() : Promise.resolve(),
                this.flashcardsPanel ? this.flashcardsPanel.collapse() : Promise.resolve()
            ]);
            await Promise.all([
                this.marginL.expand(),
                this.marginR.expand()
            ]);
        }
    }
}