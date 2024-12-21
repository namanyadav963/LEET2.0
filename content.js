// Helper function to create and show loading spinner
function createLoadingSpinner() {
    const spinner = document.createElement('div');
    spinner.className = 'loading-spinner';
    return spinner;
}

// Extract problem context from LeetCode page
function extractProblemContext() {
    const title = document.querySelector('[data-cy="question-title"]')?.textContent || 
                 document.querySelector('.mr-2.text-lg.font-medium.text-label-1')?.textContent;
    
    const description = document.querySelector('[data-cy="question-content"]')?.textContent || 
                       document.querySelector('.content__eAC7')?.textContent;
    
    const difficulty = document.querySelector('[difficulty]')?.textContent ||
                      document.querySelector('.text-difficulty-medium')?.textContent;

    if (!title || !description) {
        console.error('Failed to extract problem context');
        return null;
    }

    return { title, description, difficulty };
}

// Create and insert hint button
function createHintButton() {
    const button = document.createElement('button');
    button.id = 'ai-hint-button';
    button.textContent = 'Get AI Hint';
    button.addEventListener('click', handleHintRequest);
    return button;
}

// Handle hint request
async function handleHintRequest() {
    const hintPanel = document.getElementById('ai-hint-panel');
    if (hintPanel) {
        hintPanel.remove(); // Remove existing hint panel if present
    }

    const problemContext = extractProblemContext();
    if (!problemContext) {
        showError('Unable to extract problem context');
        return;
    }

    const panel = createHintPanel();
    panel.querySelector('.hint-content').appendChild(createLoadingSpinner());
    
    try {
        const response = await new Promise((resolve, reject) => {
            chrome.runtime.sendMessage(
                { type: 'FETCH_HINT', problemContext },
                response => {
                    if (chrome.runtime.lastError) {
                        reject(chrome.runtime.lastError);
                    } else {
                        resolve(response);
                    }
                }
            );
        });

        console.log('Response received in content.js:', response);
        if (!response.success) {
            throw new Error(response.error || 'Failed to generate hint');
        }

        updateHintPanel(panel, response.hint);
    } catch (error) {
        console.error('Error getting hint:', error);
        showError(error.message);
    }
}

// Create hint panel
function createHintPanel() {
    const panel = document.createElement('div');
    panel.id = 'ai-hint-panel';
    panel.innerHTML = `
        <div class="hint-header">
            <h3 style="margin: 0;">AI Hint</h3>
            <button class="close-button" style="border: none; background: none; cursor: pointer;">✕</button>
        </div>
        <div class="hint-content"></div>
    `;

    document.body.appendChild(panel);

    panel.querySelector('.close-button').addEventListener('click', () => panel.remove());
    return panel;
}

// Update hint panel with content
function updateHintPanel(panel, content) {
    const contentDiv = panel.querySelector('.hint-content');
    contentDiv.innerHTML = '';  // Clear loading spinner
    contentDiv.textContent = content;
}

// Show error message
function showError(message) {
    const errorDiv = document.createElement('div');
    errorDiv.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background-color: #f8d7da;
        color: #721c24;
        padding: 10px 20px;
        border-radius: 4px;
        z-index: 10000;
        box-shadow: 0 2px 5px rgba(0,0,0,0.2);
    `;
    errorDiv.textContent = message;

    document.body.appendChild(errorDiv);
    setTimeout(() => errorDiv.remove(), 5000);
}

// Try to initialize the extension multiple times
function tryInitializeExtension(retries = 5, interval = 1000) {
    let attempts = 0;

    const intervalId = setInterval(() => {
        if (initializeExtension() || attempts >= retries) {
            clearInterval(intervalId);
        }
        attempts++;
    }, interval);
}

// Initialize the extension
function initializeExtension() {
    console.log('Initializing extension...');
    const targetNode = document.querySelector('.editor-container') || 
    document.querySelector('[data-cy="problem-description"]');
    
    if (targetNode) {
        console.log('Target node found:', targetNode);
        if (!document.getElementById('ai-hint-button')) {
            const button = createHintButton();
            targetNode.appendChild(button);
            console.log('Hint button injected');
            return true;
        } else {
            console.log('Hint button already injected');
        }
    } else {
        console.log('Target node not found');
    }
    return false;
}

// Check if the page is loaded
if (document.readyState === 'complete') {
    tryInitializeExtension();
} else {
    window.addEventListener('load', tryInitializeExtension);
}

// Watch for dynamic content changes
const observer = new MutationObserver((mutations) => {
    if (!document.getElementById('ai-hint-button')) {
        tryInitializeExtension();
    }
});

observer.observe(document.body, {
    childList: true,
    subtree: true
});