document.addEventListener('DOMContentLoaded', async () => {
    const engineSelector = document.getElementsByName('engine');
    const latexDisplay = document.getElementById('latex-display-area');
    const copyButton = document.getElementById('copy-to-clipboard');
    const statusLine = document.getElementById('status-line');

    // Load saved engine selection and last result
    chrome.storage.local.get(['selectedEngine', 'lastLatexResult', 'lastStatus'], (data) => {
        if (data.selectedEngine) {
            for (const radio of engineSelector) {
                if (radio.value === data.selectedEngine) {
                    radio.checked = true;
                }
            }
        }
        if (data.lastLatexResult) {
            latexDisplay.textContent = data.lastLatexResult;
        } else {
            latexDisplay.textContent = 'No equation detected.';
        }
        if (data.lastStatus) {
            statusLine.textContent = `Status: ${data.lastStatus}`;
        }
    });

    // Handle engine selection change
    for (const radio of engineSelector) {
        radio.addEventListener('change', () => {
            if (radio.checked) {
                chrome.storage.local.set({ selectedEngine: radio.value });
            }
        });
    }

    // Handle copy to clipboard
    copyButton.addEventListener('click', () => {
        const text = latexDisplay.textContent;
        navigator.clipboard.writeText(text).then(() => {
            statusLine.textContent = 'Status: Copied to clipboard!';
        }).catch((err) => {
            statusLine.textContent = 'Status: Failed to copy.';
            console.error(err);
        });
    });

    // 🆕 Auto-refresh: listen for storage changes
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
