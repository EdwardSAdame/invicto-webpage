// src/public/custom-elements/redactedText.js
/* global HTMLElement, customElements, document */

class RedactedText extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
    }

    static get observedAttributes() {
        return ['text', 'pulse-speed', 'bg-color', 'text-color', 'revealed', 'lines'];
    }

    attributeChangedCallback(name, oldValue, newValue) {
        if (oldValue !== newValue) {
            if (name === 'text') {
                this.updateText();
            } else if (name === 'lines') {
                this.renderSkeletonLines();
            } else {
                this.updateStyles();
            }
        }
    }

    connectedCallback() {
        this.render();
        this.updateStyles();
        this.updateText();
        this.renderSkeletonLines();
    }

    updateText() {
        const textElement = this.shadowRoot.querySelector('.text-content');
        if (textElement) {
            textElement.textContent = this.getAttribute('text') || '';
        }
    }

    updateStyles() {
        const pulseSpeed = this.getAttribute('pulse-speed') || '1.5s';
        const bgColor = this.getAttribute('bg-color') || '#ffffff';
        const textColor = this.getAttribute('text-color') || '#1d1d1f';

        this.style.setProperty('--pulse-speed', pulseSpeed);
        this.style.setProperty('--bg-color', bgColor);
        this.style.setProperty('--text-color', textColor);
    }

    renderSkeletonLines() {
        const wrapper = this.shadowRoot.querySelector('.skeleton-wrapper');
        if (!wrapper) return;

        wrapper.innerHTML = '';
        
        const linesCount = parseInt(this.getAttribute('lines'), 10) || 2;

        for (let i = 0; i < linesCount; i++) {
            const line = document.createElement('div');
            line.className = 'skeleton-line';
            
            if (i === linesCount - 1 && linesCount > 1) {
                line.classList.add('short');
            }
            wrapper.appendChild(line);
        }
    }

    render() {
        const style = document.createElement('style');
        style.textContent = `
            :host {
                display: block;
                width: 100%;
                overflow: hidden;

                --pulse-speed: 1.5s;
                --bg-color: #ffffff;
                --text-color: #1d1d1f;
                --line-height: 1.2em;
                --gap: 8px;
            }

            .container {
                position: relative;
                width: 100%;
            }

            .skeleton-wrapper {
                display: flex;
                flex-direction: column;
                gap: var(--gap);
                width: 100%;
            }

            .skeleton-line {
                height: var(--line-height);
                width: 100%;
                background-color: var(--bg-color);
                animation: redacted-pulse var(--pulse-speed) infinite ease-in-out;
                border-radius: 0px;
            }

            .skeleton-line.short {
                width: 65%;
            }

            .text-content {
                display: none;
                color: var(--text-color);
                font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
                font-size: inherit;
                font-weight: 600;
                width: 100%;
                user-select: none;
                opacity: 0;
                transition: opacity 0.5s ease-in;
            }

            :host([revealed="true"]) .skeleton-wrapper {
                display: none;
            }

            :host([revealed="true"]) .text-content {
                display: block;
                opacity: 1;
            }

            @keyframes redacted-pulse {
                0% { opacity: 1; }
                50% { opacity: 0.4; }
                100% { opacity: 1; }
            }
        `;

        const container = document.createElement('div');
        container.className = 'container';

        const skeletonWrapper = document.createElement('div');
        skeletonWrapper.className = 'skeleton-wrapper';

        const textSpan = document.createElement('div');
        textSpan.className = 'text-content';

        container.appendChild(skeletonWrapper);
        container.appendChild(textSpan);

        this.shadowRoot.innerHTML = '';
        this.shadowRoot.appendChild(style);
        this.shadowRoot.appendChild(container);
    }
}

if (!customElements.get('redacted-text')) {
    customElements.define('redacted-text', RedactedText);
}