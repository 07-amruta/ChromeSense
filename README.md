# ChromeSense - AI Product Comparison Extension

> Compare products across Amazon & Flipkart with AI-powered insights

Built for **Google Chrome AI Challenge 2025** using Chrome's built-in Gemini Nano

---

## 🚀 Quick Installation

### Option 1: With Chrome AI (Recommended)

**1. Install Chrome Dev**
- Download: https://www.google.com/chrome/dev/

**2. Enable AI (in Chrome Dev)**
```bash
chrome://flags
```

Enable these 3 flags:
- `prompt-api-for-gemini-nano` → Enabled
- `optimization-guide-on-device-model` → Enabled BypassPerfRequirement  
- `summarization-api-for-gemini-nano` → Enabled

Click "Relaunch"

**3. Download AI Model**
```bash
chrome://components
```

- Find "Optimization Guide On Device Model"
- Click "Check for update"
- Wait 5-15 mins (~1.5GB)

**4. Load Extension**
- Go to `chrome://extensions`
- Enable "Developer mode"
- Click "Load unpacked"
- Select extension folder

✅ Result: AI-powered summaries

---

### Option 2: Regular Chrome (Fallback)

**1. Load Extension**
- Go to `chrome://extensions` in any Chrome
- Enable "Developer mode"  
- Click "Load unpacked"
- Select extension folder

✅ Result: Keyword-based analysis

---

## 📖 How to Use

1. Open Amazon/Flipkart product pages
2. Click extension icon
3. Click "Scan Tabs"
4. View AI summaries and comparisons

---

## 🔍 AI vs Fallback

| Feature | Chrome AI | Regular Chrome |
|---------|-----------|----------------|
| Analysis | Intelligent | Keyword-based |
| Privacy | 100% local | 100% local |
| Indicator | "AI-Powered" | "Using fallback" |

---

## 🛠️ Tech Stack

- Chrome Prompt API (Gemini Nano)
- Manifest V3
- JavaScript ES6+
- No external APIs

---
## 🎯 Hackathon Compliance

✅ Uses Chrome Prompt API  
✅ Works with/without AI  
✅ No external dependencies  
✅ 100% privacy-focused  

---

## 📄 License

MIT License

---

**Made for Google Chrome AI Challenge 2025**