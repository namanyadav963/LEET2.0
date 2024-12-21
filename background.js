// Handle API key validation
async function validateApiKey(apiKey) {
    try {
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: 'gpt-3.5-turbo',
                messages: [{ role: 'user', content: 'test' }],
                max_tokens: 5
            })
        });
        return response.ok;
    } catch (error) {
        console.error('API Key validation error:', error);
        return false;
    }
}

// Generate hint using OpenAI API
async function generateHint(problemContext, apiKey) {
    try {
        console.log('Generating hint for context:', problemContext);

        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: 'gpt-3.5-turbo',
                messages: [
                    {
                        role: 'system',
                        content: 'You are a helpful coding mentor providing step-by-step hints for LeetCode problems. Provide clear, concise hints without giving away the complete solution.'
                    },
                    {
                        role: 'user',
                        content: `Problem: ${problemContext.title}\nDescription: ${problemContext.description}\nDifficulty: ${problemContext.difficulty}\n\nProvide a helpful hint for solving this problem.`
                    }
                ],
                max_tokens: 300,
                temperature: 0.7
            })
        });

        if (!response.ok) {
            throw new Error('API request failed');
        }

        const data = await response.json();
        console.log('Hint generated successfully:', data.choices[0].message.content);
        return {
            success: true,
            hint: data.choices[0].message.content
        };
    } catch (error) {
        console.error('Hint generation error:', error);
        return {
            success: false,
            error: error.message
        };
    }
}

// Listen for messages from content script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    console.log('Message received in background.js:', request);
    if (request.type === 'FETCH_HINT') {
        chrome.storage.sync.get(['apiKey'], async function(result) {
            if (!result.apiKey) {
                sendResponse({
                    success: false,
                    error: 'API key not configured. Please set up your OpenAI API key in the extension settings.'
                });
                return;
            }

            const hintResult = await generateHint(request.problemContext, result.apiKey);
            sendResponse(hintResult);
        });
        return true; // Required for async response
    }
});

// Handle installation and updates
chrome.runtime.onInstalled.addListener((details) => {
    console.log('Extension installed or updated:', details);
    if (details.reason === 'install') {
        chrome.runtime.openOptionsPage(); // Open options page on initial installation
    }
});