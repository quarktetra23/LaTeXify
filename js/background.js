// background.js

chrome.runtime.onMessage.addListener(async (message, sender, sendResponse) => {
    if (message.type === 'SCREENSHOT_REQUEST') {
        console.log('[Background] Screenshot request received');
        try {
            // 1️⃣ Capture full visible tab
            const imageUri = await chrome.tabs.captureVisibleTab(sender.tab.windowId, { format: 'png' });
            console.log('[Background] Screenshot captured');

            // 2️⃣ Adjust selection for devicePixelRatio
            const scale = await getDevicePixelRatio(sender.tab.id);
            const scaledSelection = {
                x: message.selection.x * scale,
                y: message.selection.y * scale,
                width: message.selection.width * scale,
                height: message.selection.height * scale
            };
            console.log('[Background] Scaled selection:', scaledSelection);

            // 3️⃣ Crop image
            const croppedImageBase64 = await cropImage(imageUri, scaledSelection);
            console.log('[Background] Cropped image ready');

            // 4️⃣ Determine selected engine
            chrome.storage.local.get(['selectedEngine'], async (data) => {
                const engine = data.selectedEngine || 'mathpix'; // default to mathpix
                console.log(`[Background] Using engine: ${engine}`);

                // 5️⃣ Call appropriate API
                let latexResult = '';
                let status = '';

                try {
                    if (engine === 'mathpix') {
                        latexResult = await callMathpixAPI(croppedImageBase64);
                        status = 'Mathpix API call succeeded';
                    } else if (engine === 'llm') {
                        latexResult = await callLLMAPI(croppedImageBase64);
                        status = 'LLM API call succeeded';
                    } else {
                        latexResult = 'Invalid engine selected';
                        status = 'Error';
                    }
                } catch (apiError) {
                    console.error('[Background] API call failed:', apiError);
                    latexResult = 'No equation detected.';
                    status = 'API call failed';
                }

                // 6️⃣ Save result to storage
                chrome.storage.local.set({
                    lastLatexResult: latexResult,
                    lastStatus: status
                }, () => {
                    console.log('[Background] LaTeX result saved');
                });
            });

            sendResponse({ success: true });
        } catch (err) {
            console.error('[Background] Screenshot failed:', err);
            sendResponse({ success: false, error: err.message });
        }

        return true; // Keep message channel open for async response
    }
});

// 7️⃣ Hotkey command → trigger content script selection
chrome.commands.onCommand.addListener((command) => {
    if (command === '_execute_action') {
        console.log('[Background] Command triggered: Activate selection');
        // Send message to active tab
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            chrome.tabs.sendMessage(tabs[0].id, { type: 'ACTIVATE_SELECTION' });
        });
    }
});

// 8️⃣ Mathpix API call stub
async function callMathpixAPI(imageBase64) {
    const MATHPIX_API_KEY = 'YOUR_MATHPIX_API_KEY';
    const MATHPIX_APP_ID = 'YOUR_MATHPIX_APP_ID';

    const response = await fetch('https://api.mathpix.com/v3/text', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'app_id': MATHPIX_APP_ID,
            'app_key': MATHPIX_API_KEY
        },
        body: JSON.stringify({
            src: `data:image/png;base64,${imageBase64}`,
            formats: ['latex_simplified'],
            data_options: { include_asciimath: false }
        })
    });

    const data = await response.json();
    console.log('[Background] Mathpix API response:', data);

    return data.latex_simplified || 'No equation detected.';
}

// 9️⃣ LLM API call stub
async function callLLMAPI(imageBase64) {
    const OPENAI_API_KEY = 'YOUR_OPENAI_API_KEY';

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
                    content: 'You are a LaTeX OCR assistant. Given an image of a mathematical expression, you must output the exact corresponding LaTeX code, and nothing else.'
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

// 🔟 Crop helper function
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
                selection.x, selection.y, selection.width, selection.height, // source
                0, 0, selection.width, selection.height                      // destination
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

// 🔟 DevicePixelRatio helper
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
