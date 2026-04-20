// src/public/custom-elements/aiButton.js
/* global HTMLElement, CustomEvent, customElements */
// @ts-nocheck

class AiButton extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
    }

    connectedCallback() {
        this.render();
        this.attachEvents();
    }

    render() {
        const style = `
            <style>
                /* Make the component fill the Wix canvas container */
                :host {
                    display: block;
                    width: 100%;
                    height: 100%;
                }

                .ai-indicator {
                    display: flex;
                    align-items: center;
                    justify-content: center; /* Centers horizontally */
                    width: 100%;             /* Takes full width of the 80x80 box */
                    height: 100%;            /* Takes full height of the 80x80 box */
                    gap: 8px;
                    background: transparent;
                    cursor: pointer;
                }

                .sparks-container {
                    position: relative;
                    width: 28px;
                    height: 28px;
                }

                .spark {
                    position: absolute;
                    transform-origin: center;
                    transition: transform 0.7s cubic-bezier(0.25, 1, 0.5, 1);
                }

                .spark path {
                    fill: #1d1d1f;
                }

                .big-spark {
                    width: 24px;
                    height: 24px;
                    bottom: 0;
                    left: 0;
                }

                .small-spark {
                    width: 12px;
                    height: 12px;
                    top: -2px;
                    right: -2px;
                }

                .ai-text {
                    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
                    font-size: 15px;
                    font-weight: 600;
                    color: #1d1d1f;
                    letter-spacing: 0.3px;
                    user-select: none;
                }

                @keyframes sparkFlicker {
                    0% { fill: #1d1d1f; filter: drop-shadow(0px 0px 0px transparent); }
                    15% { fill: #ffffff; filter: drop-shadow(0px 0px 4px rgba(255, 255, 255, 0.9)); }
                    100% { fill: #1d1d1f; filter: drop-shadow(0px 0px 0px transparent); }
                }

                @keyframes textFlicker {
                    0% { color: #1d1d1f; text-shadow: none; }
                    15% { color: #ffffff; text-shadow: 0px 0px 6px rgba(255, 255, 255, 0.8); }
                    100% { color: #1d1d1f; text-shadow: none; }
                }

                .ai-indicator:hover .big-spark {
                    transform: rotate(90deg) scale(1.05);
                }

                .ai-indicator:hover .small-spark {
                    transform: rotate(-90deg) scale(1.15);
                }

                .ai-indicator:hover .spark path {
                    animation: sparkFlicker 1.2s cubic-bezier(0.25, 1, 0.5, 1) forwards;
                }

                .ai-indicator:hover .ai-text {
                    animation: textFlicker 1.2s cubic-bezier(0.25, 1, 0.5, 1) forwards;
                }
            </style>
        `;

        const html = `
            <div class="ai-indicator">
                <div class="sparks-container">
                    <svg class="spark big-spark" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                        <path d="M 50,0 C 50,30 70,50 100,50 C 70,50 50,70 50,100 C 50,70 30,50 0,50 C 30,50 50,30 50,0 Z" />
                    </svg>
                    <svg class="spark small-spark" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                        <path d="M 50,0 C 50,30 70,50 100,50 C 70,50 50,70 50,100 C 50,70 30,50 0,50 C 30,50 50,30 50,0 Z" />
                    </svg>
                </div>
                <span class="ai-text">AI</span>
            </div>
        `;

        this.shadowRoot.innerHTML = style + html;
    }

    attachEvents() {
        const container = this.shadowRoot.querySelector('.ai-indicator');
        if (container) {
            container.addEventListener('click', () => {
                this.dispatchEvent(new CustomEvent('onAiButtonClick'));
            });
        }
    }
}

customElements.define('ai-button', AiButton);