// src/public/custom-elements/imageVisualizerElement.js
/* global HTMLElement, customElements */
// @ts-nocheck

class ImageVisualizer extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
    }

    static get observedAttributes() {
        // Added 'bg-color' to the list of attributes to watch
        return ['max-size', 'duration', 'rgb-color', 'bg-color'];
    }

    attributeChangedCallback(name, oldValue, newValue) {
        if (oldValue !== newValue) {
            this.updateStyles();
        }
    }

    connectedCallback() {
        this.render();
        this.updateStyles();
    }

    updateStyles() {
        const maxSize = this.getAttribute('max-size') || '600px';
        const duration = this.getAttribute('duration') || '3s';
        
        // Controls the wave/cloud color (Must be comma-separated RGB values, e.g., "255, 0, 0")
        const rgbColor = this.getAttribute('rgb-color') || '255, 255, 255';
        
        // Controls the background color (Can be hex "#000", named "black", or rgba)
        const bgColor = this.getAttribute('bg-color') || 'transparent';

        this.style.setProperty('--max-size', maxSize);
        this.style.setProperty('--anim-duration', duration);
        this.style.setProperty('--rgb-color', rgbColor);
        this.style.setProperty('--bg-color', bgColor);
    }

    render() {
        const style = `
            <style>
                :host {
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    width: 100%;
                    height: 100%;
                    /* Now uses the CSS variable for the background */
                    background-color: var(--bg-color); 
                    overflow: hidden;

                    --max-size: 600px;
                    --anim-duration: 3s;
                    --rgb-color: 255, 255, 255;
                    --bg-color: transparent;
                }

                .loader-container {
                    position: relative;
                    aspect-ratio: 5 / 3;
                    width: 100%;
                    max-width: var(--max-size);
                    display: flex;
                    justify-content: center;
                    align-items: center;
                }

                .cloud-core {
                    position: absolute;
                    width: 40px;
                    height: 40px;
                    background: rgb(var(--rgb-color));
                    border-radius: 50%;
                    filter: blur(8px);
                    animation: core-breath 2s ease-in-out infinite;
                    z-index: 10;
                    will-change: transform, opacity;
                }

                .cloud-wave {
                    position: absolute;
                    top: 50%;
                    left: 50%;
                    width: var(--max-size);
                    height: var(--max-size);
                    background: radial-gradient(circle, rgba(var(--rgb-color), 0.8) 0%, rgba(var(--rgb-color), 0) 70%);
                    border-radius: 50%;
                    filter: blur(8px);
                    opacity: 0;
                    transform: translate(-50%, -50%) scale(0.02);
                    animation: spectrum-expand var(--anim-duration) cubic-bezier(0.1, 0.4, 0.2, 1) infinite;
                    will-change: transform, opacity;
                    pointer-events: none;
                }

                .cloud-wave:nth-child(2) { animation-delay: 0s; }
                .cloud-wave:nth-child(3) { animation-delay: calc(var(--anim-duration) / 3); }
                .cloud-wave:nth-child(4) { animation-delay: calc(var(--anim-duration) * 2 / 3); }

                @keyframes core-breath {
                    0%, 100% {
                        transform: scale(0.8);
                        opacity: 0.6;
                    }
                    50% {
                        transform: scale(1.4);
                        opacity: 1;
                    }
                }

                @keyframes spectrum-expand {
                    0% {
                        transform: translate(-50%, -50%) scale(0.02);
                        opacity: 0.8;
                    }
                    100% {
                        transform: translate(-50%, -50%) scale(1);
                        opacity: 0;
                    }
                }
            </style>
        `;

        const html = `
            <div class="loader-container">
                <div class="cloud-core"></div>
                <div class="cloud-wave"></div>
                <div class="cloud-wave"></div>
                <div class="cloud-wave"></div>
            </div>
        `;

        this.shadowRoot.innerHTML = style + html;
    }
}

if (!customElements.get('image-visualizer')) {
    customElements.define('image-visualizer', ImageVisualizer);
}