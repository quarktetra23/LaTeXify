document.addEventListener('DOMContentLoaded', async () => {
    const latexDisplay = document.getElementById('latex-display-area');
    const copyButton = document.getElementById('copy-to-clipboard');
    const statusLine = document.getElementById('status-line');

    // Load last result
    chrome.storage.local.get(['lastLatexResult', 'lastStatus'], (data) => {
        if (data.lastLatexResult) {
            latexDisplay.textContent = data.lastLatexResult;
        } else {
            latexDisplay.textContent = 'No equation detected.';
        }
        if (data.lastStatus) {
            statusLine.textContent = `Status: ${data.lastStatus}`;
        }
    });

    // Copy to clipboard
    copyButton.addEventListener('click', () => {
        const text = latexDisplay.textContent;
        navigator.clipboard.writeText(text).then(() => {
            statusLine.textContent = 'Status: Copied to clipboard!';
        }).catch((err) => {
            statusLine.textContent = 'Status: Failed to copy.';
            console.error(err);
        });
    });

    // Auto-refresh on storage change
    chrome.storage.onChanged.addListener((changes, areaName) => {
        if (areaName === 'local') {
            if (changes.lastLatexResult) {
                const newLatex = changes.lastLatexResult.newValue || 'No equation detected.';
                latexDisplay.textContent = newLatex;
            }
            if (changes.lastStatus) {
                const newStatus = changes.lastStatus.newValue || 'Idle';
                statusLine.textContent = `Status: ${newStatus}`;
            }
        }
    });
});
