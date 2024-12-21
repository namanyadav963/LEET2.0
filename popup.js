document.addEventListener('DOMContentLoaded', function() {
    // Check if API key is configured
    chrome.storage.sync.get(['apiKey'], function(result) {
        const statusDiv = document.getElementById('status');
        if (!result.apiKey) {
            statusDiv.textContent = 'Please configure your OpenAI API key in settings';
            statusDiv.className = 'status-message error';
        } else {
            statusDiv.textContent = 'Extension is ready to use';
            statusDiv.className = 'status-message success';
        }
    });

    // Open options page when clicking the settings link
    document.getElementById('openOptions').addEventListener('click', function() {
        chrome.runtime.openOptionsPage();
    });
});