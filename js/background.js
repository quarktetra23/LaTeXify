// background.js

chrome.runtime.onMessage.addListener(async (message, sender, sendResponse) => {
    if (message.type === 'SCREENSHOT_REQUEST') {
        console.log('[Background] Screenshot request received');
        try {
            const imageUri = await chrome.tabs.captureVisibleTab(sender.tab.windowId, { format: 'png' });
            console.log('[Background] Screenshot captured');

            const scale = await getDevicePixelRatio(sender.tab.id);
            const scaledSelection = {
                x: message.selection.x * scale,
                y: message.selection.y * scale,
                width: message.selection.width * scale,
                height: message.selection.height * scale
            };
            console.log('[Background] Scaled selection:', scaledSelection);

            const croppedImageBase64 = await cropImage(imageUri, scaledSelection);
            console.log('[Background] Cropped image ready');

            let latexResult = '';
            let status = '';

            try {
                latexResult = await callLLMAPI(croppedImageBase64);
                status = 'LLM API call succeeded';
            } catch (apiError) {
                console.error('[Background] API call failed:', apiError);
                latexResult = 'No equation detected.';
                status = 'API call failed';
            }

            chrome.storage.local.set({
                lastLatexResult: latexResult,
                lastStatus: status
            }, () => {
                console.log('[Background] LaTeX result saved');
            });

            sendResponse({ success: true });
        } catch (err) {
            console.error('[Background] Screenshot failed:', err);
            sendResponse({ success: false, error: err.message });
        }

        return true;
    }
});

chrome.commands.onCommand.addListener((command) => {
    if (command === 'activate_selection') {
        console.log('[Background] Command triggered: Activate selection');
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            chrome.tabs.sendMessage(tabs[0].id, { type: 'ACTIVATE_SELECTION' });
        });
    }
});

async function callLLMAPI(imageBase64) {
    const OPENAI_API_KEY = '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';  // <== Your real API key here

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${OPENAI_API_KEY}`
        },
        body: JSON.stringify({
            model: 'gpt-4o',
            messages: [
                {
                    role: 'system',
                    content: 'You are a LaTeX OCR assistant. Given an image of a mathematical expression, you must output ONLY the corresponding LaTeX code — no commentary, no explanation.'
                },
                {
                    role: 'user',
                    content: [
                        { type: 'text', text: 'Please extract the LaTeX code from this image.' },
                        {
                            type: 'image_url',
                            image_url: {
                                url: `data:image/png;base64,${imageBase64}`
                            }
                        }
                    ]
                }
            ]
        })
    });

    const data = await response.json();
    console.log('[Background] LLM API response:', data);

    const content = data?.choices?.[0]?.message?.content?.trim();
    return content || 'No equation detected.';
}

async function cropImage(imageUri, selection) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => {
            const canvas = document.createElement('canvas');
            canvas.width = selection.width;
            canvas.height = selection.height;

            const ctx = canvas.getContext('2d');
            ctx.drawImage(
                img,
                selection.x, selection.y, selection.width, selection.height,
                0, 0, selection.width, selection.height
            );

            const croppedDataUri = canvas.toDataURL('image/png');
            const croppedBase64 = croppedDataUri.split(',')[1];
            resolve(croppedBase64);
        };

        img.onerror = (err) => {
            reject(err);
        };

        img.src = imageUri;
    });
}

async function getDevicePixelRatio(tabId) {
    return new Promise((resolve) => {
        chrome.scripting.executeScript({
            target: { tabId: tabId },
            func: () => window.devicePixelRatio
        }, (results) => {
            if (chrome.runtime.lastError || !results || !results[0]) {
                console.warn('[Background] Failed to get devicePixelRatio, defaulting to 1');
                resolve(1);
            } else {
                console.log('[Background] devicePixelRatio:', results[0].result);
                resolve(results[0].result);
            }
        });
    });
}
