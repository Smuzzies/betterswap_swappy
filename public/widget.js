(function() {
    // Create and inject required styles
    const styles = document.createElement('style');
    styles.textContent = `
            html, body {
            margin: 0;
            padding: 0;
        }
        .swappy-widget-container {
            position: fixed;
            bottom: 20px;
            right: 20px;
            z-index: 999999;
        }

        .swappy-chat-button {
            width: 60px;
            height: 60px;
            border-radius: 50%;
            background: none;
            border: none;
            cursor: pointer;
            padding: 0;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: transform 0.3s ease;
        }

        .swappy-chat-button:hover {
            transform: scale(1.1);
        }

        .swappy-chat-modal {
            position: fixed;
            top: 50%;
            right: 20px;
            transform: translateY(-50%);
            width: 450px;
            height: 600px !important;
            margin-top: 30px;
            background: transparent;
            border-radius: 16px;
            display: none;
            overflow: hidden;
            box-shadow: 0 4px 24px rgba(0, 0, 0, 0.2);
        }

        .swappy-chat-modal.active {
            display: block;
        }

        .swappy-iframe {
            width: 100%;
            height: 100%;
            border: none;
            margin: 0;
            padding: 0;
            display: block;
            border-radius: 16px;
        }
    `;
    document.head.appendChild(styles);

    // Create widget HTML
    const widgetHTML = `
        <div class="swappy-widget-container">
            <button class="swappy-chat-button">
                <img src="https://swappy.smuzzies.com/swappy.png" alt="Chat with Swappy" width="60" height="60">
            </button>
            <div class="swappy-chat-modal">
                <iframe class="swappy-iframe" src="https://swappy.smuzzies.com/widget/chat"></iframe>
            </div>
        </div>
    `;

    // Insert widget into page
    const container = document.createElement('div');
    container.innerHTML = widgetHTML;
    document.body.appendChild(container);

    // Add click handler
    const button = document.querySelector('.swappy-chat-button');
    const modal = document.querySelector('.swappy-chat-modal');
    
    button.addEventListener('click', () => {
        modal.classList.toggle('active');
    });

    // Close modal when clicking outside
    document.addEventListener('click', (event) => {
        if (!event.target.closest('.swappy-widget-container')) {
            modal.classList.remove('active');
        }
    });
})(); 