
**Overview**\
LaTeXify is a web extension that is built for bother Firefox/Chrome. It serves a simple yet efficient purpose- You take a screenshot of the mathematical equation, which, if valid will return the LaTeX code which is ready to copied from the clipboard. For Mac users they key combination is Cmd+Shift+Y, anf for the Window users the combination is Ctrl+Shift+Y. I wanted to build a Safari version of this extension too- I started off with Firefox/Chrome You don't have to do a lot of extra work (afaik) as they both have similar web extension stadards.

**Motivation**\
Typing an equation in latex takes a lot of time, especially when you mess something up and then document does not compile anymore. Latex isn't beginner friendly too. Instead of 
looking for the correct latex syntax, this extension aims to save a lots of time by generating the latex code within moments. As an undergrad I have written a lot of standard mathematical expressions in an overleaf doc, going over to different tabs to find or generate the LaTeX code. I hope to save a lot of time with this extension. 

**Running the extension**

Instead of installing the extension conventioanlly, I have decided to set it up manually which should be equally easy (if nothing goes wrong). The reason for this being the extensions utilizes Open AI's API which requires a private key. I won't trust anyone with my API key, and I don't expect anyone to trust me too. Perhaps there is a way to handle API keys as a database convingly; if there is something like that, I would like to add that feature to this extension as well. 

You can put in your private API key in async function callLLMAPI in background.js

async function callLLMAPI(imageBase64) {
    const OPENAI_API_KEY = 'sk-proj-xxx...'; // Replace with your real API key

For Chrome: 
1. Visit chrome://extensions/ and enable developer mode
2. Click “Load unpacked”
3. Select the local LaTeXify-main folder

For Firefox:
1. Open manifest.json file, and change the version from 3 to 2, replace "action" with "browser_action", and remove unsupported keys like "scripting". This should be present in the coments, just feel free to uncomment.
2. Vist about:debugging
3.  Click "Load Temporary Add-on"
4.   Select **just** your manifest.json the local LaTeXify-main folder

**Development Phase**\
The extension is currently open to development and welcomes feedback and new feature suggestions!

_This project is licensed under a Creative Commons License to know more, visti- https://creativecommons.org/licenses/by-nc/4.0/_
