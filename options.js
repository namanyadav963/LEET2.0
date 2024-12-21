// Save options to chrome.storage
function saveOptions() {
    const apiKey = document.getElementById('apiKey').value;
    const statusDiv = document.getElementById('status');

    chrome.storage.sync.set(
        { apiKey: apiKey },
        function() {
            // Update status to let user know options were saved
            statusDiv.textContent = 'Settings saved successfully!';
            statusDiv.className = 'status success';
            statusDiv.style.display = 'block';

            // Hide status after 2 seconds
            setTimeout(function() {
                statusDiv.style.display = 'none';
            }, 2000);
        }
    );
}

// Restore options from chrome.storage
function restoreOptions() {
    chrome.storage.sync.get(
        { apiKey: '' }, // default value
        function(items) {
            document.getElementById('apiKey').value = items.apiKey;
        }
    );
}

// Event listeners
document.addEventListener('DOMContentLoaded', restoreOptions);
document.getElementById('saveBtn').addEventListener('click', saveOptions);