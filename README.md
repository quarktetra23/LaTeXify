<p align="center">
  <img width="202" alt="Screenshot 2025-06-17 at 12 08 13" src="https://github.com/user-attachments/assets/c4efbcfb-7af4-4043-93a4-7483ee52e002" />
</p>

<h1 align="center">LaTeXify</h1>

---

## Overview

LaTeXify is a browser extension built for both **Firefox** and **Chrome**. It serves a simple but efficient purpose—take a screenshot of a mathematical equation, and if it’s valid, LaTeX code is instantly generated and copied to your clipboard.

- Mac users: **Cmd+Shift+Y**  
- Windows users: **Ctrl+Shift+Y**

I plan to support Safari too, as its extension model is now more aligned with Chrome/Firefox.

---

## Motivation

Typing equations in LaTeX can be time-consuming—especially when minor syntax errors prevent compilation. LaTeX isn’t always beginner-friendly either. Instead of switching tabs or looking for/genertaing syntax, this extension helps save time by generating LaTeX within moments.

As an undergrad who’s spent hours writing equations in Overleaf, this tool is something I always wished existed.

<p align="center">
  <img width="330" alt="Screenshot 2025-06-17 at 11 59 15" src="https://github.com/user-attachments/assets/60082085-d6c3-4384-b824-acdcfa3db3f4" />
</p>

---

## Running the Extension

Instead of publishing the extension on a store, I’ve opted for manual installation. This is because the extension uses OpenAI's API, which requires a private key.

> If there's a secure way to handle API keys (e.g., via a backend or encrypted vault), I’d love to integrate that in the future.

To set your API key, open `background.js` and update this section:

```js
async function callLLMAPI(imageBase64) {
  const OPENAI_API_KEY = 'sk-proj-xxx...'; // Replace with your real API key
  ...
}
```

For Chrome: 
1. Visit chrome://extensions/ and enable developer mode
2. Click “Load unpacked”
3. Select the local LaTeXify-main folder

For Firefox:
1. Open manifest.json file, and change the version from 3 to 2, replace "action" with "browser_action", and remove unsupported keys like "scripting". This should be present in the coments, just feel free to uncomment.
2. Vist bout:debugging#/runtime/this-firefox
3.  Click "Load Temporary Add-on"
4.   Select **just** your manifest.json the local LaTeXify-main folder

<p align="center">
  <img width="1440" alt="Screenshot 2025-06-17 at 12 18 27" src="https://github.com/user-attachments/assets/598cf03c-0cba-4d0a-97f9-ce1d68e22d99" />
</p>

---

**Architecture**\

<p align="center">
  <img width="202" alt="Screenshot 2025-06-17 at 12 08 13" src="https://github.com/user-attachments/assets/c4efbcfb-7af4-4043-93a4-7483ee52e002" />
</p>

---

**Development Phase**\
The extension is currently open to development and welcomes feedback and new feature suggestions!

_This project is licensed under a Creative Commons License to know more, visti- https://creativecommons.org/licenses/by-nc/4.0/_
