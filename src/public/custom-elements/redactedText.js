// src/public/custom-elements/redactedText.js
/* global HTMLElement, customElements, document */
// @ts-nocheck

class RedactedText extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
    }

    static get observedAttributes() {
        return ['text', 'pulse-speed', 'bg-color', 'text-color', 'revealed'];
    }

    attributeChangedCallback(name, oldValue, newValue) {
        if (oldValue !== newValue) {
            if (name === 'text') {
                this.updateText();
            } else {
                this.updateStyles();
            }
        }
    }

    connectedCallback() {
        this.render();
        this.updateStyles();
        this.updateText();
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

    render() {
        const style = document.createElement('style');
        style.textContent = `
            :host {
                display: block;
                width: 100%;
                height: 100%;
                overflow: hidden;
                border-radius: 0px;
                
                --pulse-speed: 1.5s;
                --bg-color: #ffffff;
                --text-color: #1d1d1f;
            }

            .redacted-container {
                position: relative;
                display: flex;
                align-items: center;
                width: 100%;
                height: 100%;
                background-color: var(--bg-color);
                animation: redacted-pulse var(--pulse-speed) infinite ease-in-out;
                transition: background-color 0.4s ease;
            }

            .text-content {
                position: relative;
                z-index: 1;
                color: var(--text-color);
                font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
                font-size: inherit;
                font-weight: 600;
                width: 100%;
                padding: 0 8px;
                opacity: 0;
                transition: opacity 0.5s ease-in;
                user-select: none;
            }

            /* State transition when text is revealed */
            :host([revealed="true"]) .redacted-container {
                animation: none;
                background-color: transparent;
            }

            :host([revealed="true"]) .text-content {
                opacity: 1;
            }

            @keyframes redacted-pulse {
                0% { opacity: 1; }
                50% { opacity: 0.4; }
                100% { opacity: 1; }
            }
        `;

        const container = document.createElement('div');
        container.className = 'redacted-container';

        const textSpan = document.createElement('span');
        textSpan.className = 'text-content';

        container.appendChild(textSpan);

        this.shadowRoot.innerHTML = '';
        this.shadowRoot.appendChild(style);
        this.shadowRoot.appendChild(container);
    }
}

if (!customElements.get('redacted-text')) {
    customElements.define('redacted-text', RedactedText);
}