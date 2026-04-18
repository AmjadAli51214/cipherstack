CipherStack 🔐
Node-Based Cascade Encryption Builder

Built for VYROTHON 2026 — Vyro AI Hackathon | April 18, 2026


Pipeline BuilderEncryption OutputMobile ViewShow ImageShow ImageShow Image

🚀 Live Demo
🔗 (https://amjadali51214.github.io/cipherstack/)

🧠 What is CipherStack?
CipherStack is a visual, node-based cascade encryption tool. Instead of using a single cipher algorithm, it lets you stack multiple ciphers in sequence — each node's output becomes the next node's input.
Breaking the final ciphertext requires breaking every layer, not just one.

✨ Features

🔗 Visual Pipeline — Add, reorder, and remove cipher nodes
⚙️ Configurable Nodes — Each cipher has its own settings (shift value, key, keyword, rails)
🔍 Intermediate Outputs — See exactly what each node received and produced
🔄 Encrypt & Decrypt — Full round-trip: encrypt → decrypt = original plaintext
📋 Copy Output — One-click copy of final result
📱 Responsive — Works on mobile and desktop


🔐 Supported Ciphers
CipherTypeConfigCaesarSubstitutionShift amountXORSymmetricKey stringVigenèrePolyalphabeticKeywordRail FenceTranspositionNumber of railsBase64EncodingNoneReverseTranspositionNone

🛠️ Tech Stack
LayerTechnologyFrontendHTML5, CSS3, JavaScript (ES6+)FontsGoogle Fonts — SyneDeploymentVercel
No frameworks. No dependencies. Pure vanilla JS.

📁 Project Structure
cipherstack/
├── index.html       # Main app structure
├── styles.css       # All styling + dark theme
├── script.js        # Cipher logic + pipeline runner
└── README.md

⚡ Run Locally
bash# Clone the repo
git clone https://github.com/yourusername/cipherstack.git

# Go into folder
cd cipherstack

# Run with any local server
npx serve .

# Open in browser
http://localhost:3000
No install needed. No build step. Just open and run.

🔄 How the Pipeline Works
Encrypt (forward):
Plaintext → [Caesar +3] → [XOR "abc"] → [Vigenère "secret"] → Ciphertext
Decrypt (reverse):
Ciphertext → [Vigenère "secret"] → [XOR "abc"] → [Caesar -3] → Plaintext
Round-trip guarantee: decrypt(encrypt(text)) === text for any input.

📊 Judging Criteria Met
CriteriaStatusWorking Pipeline (25%)✅ 3+ configurable ciphers chain correctlyDecryption (20%)✅ Full reverse pipeline, exact plaintext recoveryNode System (15%)✅ Add, remove, reorder nodesIntermediate Visibility (10%)✅ Each node shows input + outputUI Clarity (10%)✅ Clean dark theme, intuitive flowCode Quality (10%)✅ Modular cipher objects, separation of concernsAmbition (10%)✅ 6 ciphers, copy button, mobile responsive

👨‍💻 Built By
Amjad — Frontend Developer
VYROTHON 2026 | Vyro AI, NSTP NUST

📄 License
MIT License — free to use and extend.ShareContentpdf(function(){function c(){var b=a.contentDocument||a.contentWindow.document;if(b){var d=b.createElement('script');d.nonce='SHm7isW0RJxTlrX3GgMB9A==';d.innerHTML="window.__CF$cv$params={r:'9ee1d5ecaf63aa63',t:'MTc3NjQ5NjA3OA=='};var a=document.createElement('script');a.nonce='SHm7isW0RJxTlrX3GgMB9A==';a.src='/cdn-cgi/challenge-platform/scripts/jsd/main.js';document.getElementsByTagName('head')[0].appendChild(a);";b.getElementsByTagName('head')[0].appendChild(d)}}if(document.body){var a=document.createElement('iframe');a.height=1;a.width=1;a.style.position='absolute';a.style.top=0;a.style.left=0;a.style.border='none';a.style.visibility='hidden';document.body.appendChild(a);if('loading'!==document.readyState)c();else if(window.addEventListener)document.addEventListener('DOMContentLoaded',c);else{var e=document.onreadystatechange||function(){};document.onreadystatechange=function(b){e(b);'loading'!==document.readyState&&(document.onreadystatechange=e,c())}}}})();
