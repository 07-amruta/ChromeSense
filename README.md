# ChromeSense - AI Product Comparison Extension

> Smart product comparison tool for Amazon & Flipkart with Chrome's built-in AI capabilities

**Built for Google Chrome AI Challenge 2025** | Uses Gemini Nano

---

## 🚀 Installation Guide

Choose the installation method that works for your system:

### Option 1: Chrome Dev + Gemini Nano AI (Recommended)

Best for experiencing full AI capabilities.

**Step 1: Install Chrome Dev**
- Download Chrome Dev: https://www.google.com/chrome/dev/
- This is Chrome's development version with experimental AI features

**Step 2: Enable AI Features**
1. Open Chrome Dev and navigate to: `chrome://flags`
2. Search for and enable these **3 flags**:
   - `prompt-api-for-gemini-nano` → Set to **Enabled**
   - `optimization-guide-on-device-model` → Set to **Enabled BypassPerfRequirement**
   - `summarization-api-for-gemini-nano` → Set to **Enabled**
3. Click the **"Relaunch"** button

**Step 3: Download AI Model**
1. Navigate to: `chrome://components`
2. Find **"Optimization Guide On Device Model"**
3. Click **"Check for update"**
4. Wait for download (approximately 5-15 minutes, ~1.5GB file size)
5. Status will show as "Up-to-date" when complete

**Step 4: Install Extension**
1. Go to `chrome://extensions`
2. Enable **"Developer mode"** (toggle in top-right corner)
3. Click **"Load unpacked"**
4. Select your extension folder
5. ChromeSense is now installed ✅

**Result:** AI-powered product summaries and intelligent recommendations

---

### Option 2: Regular Chrome (Automatic Fallback)

Works on any Chrome browser without extra setup.

**Installation Steps:**
1. Open any Chrome browser and go to `chrome://extensions`
2. Enable **"Developer mode"** (top-right toggle)
3. Click **"Load unpacked"**
4. Select your extension folder
5. ChromeSense is now installed ✅

**Result:** Keyword-based analysis (fully functional, no AI required)

---

## 📖 How to Use ChromeSense

1. **Open product pages** - Browse Amazon.in or Flipkart.com
2. **Click the extension icon** in your Chrome toolbar
3. **Click "Scan Tabs"** button
4. **View results** - See product cards, summaries, and smart comparisons

---

## 🔍 Feature Comparison: AI vs Fallback Mode

| Feature | Chrome Dev + AI | Regular Chrome |
|---------|-----------------|----------------|
| **Summary Type** | AI-generated, context-aware | Keyword pattern-based |
| **Comparison Quality** | Intelligent insights | Price & rating based |
| **Privacy** | 100% local, on-device | 100% local, on-device |
| **Data Sent Externally** | None | None |
| **Speed** | Fast (after model loads) | Instant |
| **Indicator** | "AI-Powered Recommendation" | "Using fallback analysis" |

---

## ⚠️ About Gemini Nano Availability

Chrome's built-in AI (Gemini Nano) is currently in **limited rollout**. Access varies by system.

**If you don't have Gemini Nano access:**
- Extension works perfectly with **keyword-based analysis**
- All features remain fully functional
- Product comparisons and recommendations work normally
- No performance loss or errors

**To check your AI status:**
1. Open DevTools: Press **F12** in Chrome Dev
2. Go to **Console** tab
3. Run this command:

```bash
(async () => {
const caps = await self.ai.languageModel.capabilities();
console.log("AI Status:", caps.available);
})();
```


**Interpreting results:**
- `"readily"` → Gemini Nano is active ✅ (You have AI!)
- `"no"` or `"after-download"` → Using fallback ✅ (Still works great!)

---

## 🛠️ Technical Stack

- **Chrome Prompt API** - For Gemini Nano integration
- **Manifest V3** - Latest Chrome extension architecture
- **JavaScript ES6+** - Modern async/await implementation
- **Zero External APIs** - No external dependencies

---

## 🎯 Hackathon Compliance Checklist

✅ Implements Chrome Prompt API  
✅ Works with or without built-in AI  
✅ No external dependencies required  
✅ 100% privacy-focused (local processing only)  
✅ Graceful fallback system  

---

## 📄 License

MIT License - Free to use and modify

---

**Made for Google Chrome AI Challenge 2025**

*Works reliably on all Chrome browsers - with or without Gemini Nano*
