// content-script.js

let overlay = null;
let selectionBox = null;
let startX, startY, endX, endY;
let isSelecting = false;

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === 'ACTIVATE_SELECTION') {
        console.log('[Content Script] Activating crosshair selection');
        startSelection();
        sendResponse({ success: true });
    }
});

function startSelection() {
    if (overlay) return; // already active

    overlay = document.createElement('div');
    overlay.id = 'latexify-overlay';
    document.body.appendChild(overlay);

    overlay.addEventListener('mousedown', onMouseDown);
    overlay.addEventListener('mousemove', onMouseMove);
    overlay.addEventListener('mouseup', onMouseUp);
    window.addEventListener('keydown', onKeyDown); // add ESC support
}

function stopSelection() {
    if (overlay) {
        overlay.remove();
        overlay = null;
    }
    if (selectionBox) {
        selectionBox.remove();
        selectionBox = null;
    }
    window.removeEventListener('keydown', onKeyDown); // cleanup
    isSelecting = false;
}

function onMouseDown(e) {
    isSelecting = true;
    startX = e.clientX;
    startY = e.clientY;

    selectionBox = document.createElement('div');
    selectionBox.id = 'latexify-selection';
    selectionBox.style.left = `${startX}px`;
    selectionBox.style.top = `${startY}px`;
    document.body.appendChild(selectionBox);
}

function onMouseMove(e) {
    if (!isSelecting) return;

    endX = e.clientX;
    endY = e.clientY;

    const rect = getSelectionRect(startX, startY, endX, endY);

    selectionBox.style.left = `${rect.x}px`;
    selectionBox.style.top = `${rect.y}px`;
    selectionBox.style.width = `${rect.width}px`;
    selectionBox.style.height = `${rect.height}px`;
}

function onMouseUp(e) {
    if (!isSelecting) return;
    isSelecting = false;

    endX = e.clientX;
    endY = e.clientY;

    const rect = getSelectionRect(startX, startY, endX, endY);

    console.log('[Content Script] Selection rectangle:', rect);

    // Clean up overlay and selection box
    stopSelection();

    // Send selection to background
    chrome.runtime.sendMessage({
        type: 'SCREENSHOT_REQUEST',
        selection: rect
    }, (response) => {
        console.log('[Content Script] Screenshot request response:', response);
    });
}

function getSelectionRect(x1, y1, x2, y2) {
    const x = Math.min(x1, x2);
    const y = Math.min(y1, y2);
    const width = Math.abs(x2 - x1);
    const height = Math.abs(y2 - y1);
    return { x, y, width, height };
}

// Handle Escape key → cancel selection
function onKeyDown(e) {
    if (e.key === 'Escape') {
        console.log('[Content Script] ESC pressed → cancelling selection');
        stopSelection();
    }
}
