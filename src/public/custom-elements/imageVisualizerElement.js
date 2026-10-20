// src/public/custom-elements/imageVisualizerElement.js
/* global HTMLElement, customElements, document, ResizeObserver */
// @ts-nocheck

class ImageVisualizer extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this.resizeObserver = null;
    }

    static get observedAttributes() {
        // Kept your original attributes to maintain compatibility with your app
        return ['max-size', 'duration', 'rgb-color'];
    }

    attributeChangedCallback(name, oldValue, newValue) {
        if (oldValue !== newValue) {
            this.updateStyles();
        }
    }

    connectedCallback() {
        this.render();
        this.updateStyles();

        const container = this.shadowRoot.querySelector('.loader-container');

        // Dynamically rebuild the matrix if the element changes size
        this.resizeObserver = new ResizeObserver(entries => {
            for (let entry of entries) {
                const { width, height } = entry.contentRect;
                if (width > 0 && height > 0) {
                    this.buildMatrix(container, width, height);
                }
            }
        });

        this.resizeObserver.observe(this);
    }

    disconnectedCallback() {
        if (this.resizeObserver) {
            this.resizeObserver.disconnect();
        }
    }

    updateStyles() {
        const maxSize = this.getAttribute('max-size') || '100vw';
        const duration = this.getAttribute('duration') || '4s';

        this.style.setProperty('--max-size', maxSize);
        this.style.setProperty('--anim-duration', duration);
    }

    buildMatrix(container, width, height) {
        // Clear old grid when resizing
        container.innerHTML = '';

        const dotSize = 6;
        const gap = 8;
        const totalCellSize = dotSize + gap;

        // Use Math.floor so the dots don't overflow the container bounds
        const cols = Math.floor(width / totalCellSize);
        const rows = Math.floor(height / totalCellSize);

        if (cols === 0 || rows === 0) return;

        container.style.gridTemplateColumns = `repeat(${cols}, ${dotSize}px)`;
        container.style.gridTemplateRows = `repeat(${rows}, ${dotSize}px)`;

        const centerX = cols / 2;
        const centerY = rows / 2;

        // DocumentFragment is used to inject all dots at once for better performance
        const fragment = document.createDocumentFragment();

        for (let r = 0; r < rows; r++) {
            for (let c = 0; c < cols; c++) {
                const dot = document.createElement('div');
                dot.classList.add('dot');

                // 1. Rainbow Spectrum
                const hue = cols > 1 ? (c / (cols - 1)) * 360 : 0;
                dot.style.backgroundColor = `hsl(${hue}, 90%, 50%)`;

                // 2. Oceanic Breathing Wave
                const distX = c - centerX;
                const distY = r - centerY;
                const distance = Math.sqrt(distX * distX + distY * distY);

                // Negative delay starts animation instantly
                const delay = -(distance * 0.15);
                dot.style.animationDelay = `${delay}s`;

                fragment.appendChild(dot);
            }
        }

        container.appendChild(fragment);
    }

    render() {
        const style = document.createElement('style');
        style.textContent = `
            :host {
                display: flex;
                justify-content: center;
                align-items: center;
                width: 100%;
                height: 100%;
                background-color: transparent; 
                overflow: hidden;

                --max-size: 100vw;
                --anim-duration: 4s;
            }

            .loader-container {
                position: relative;
                width: 100%;
                height: 100%;
                max-width: var(--max-size);
                display: grid;
                gap: 8px;
                align-content: center;
                justify-content: center;
                overflow: hidden;
            }

            .dot {
                width: 6px;
                height: 6px;
                border-radius: 50%;
                
                opacity: 0.1;
                transform: scale(0.3);
                
                /* Uses the duration variable passed from attributes */
                animation: oceanic-breathe var(--anim-duration) infinite ease-in-out;
                will-change: transform, opacity;
            }

            @keyframes oceanic-breathe {
                0%, 100% {
                    opacity: 0.1;
                    transform: scale(0.3);
                }
                50% {
                    opacity: 1;
                    transform: scale(1);
                }
            }
        `;

        this.shadowRoot.innerHTML = `
            <div class="loader-container"></div>
        `;
        this.shadowRoot.appendChild(style);
    }
}

if (!customElements.get('image-visualizer')) {
    customElements.define('image-visualizer', ImageVisualizer);
}