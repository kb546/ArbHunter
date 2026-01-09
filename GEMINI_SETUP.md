# 🚀 GOOGLE GEMINI IMAGE SETUP

## ✅ **STEP 1: ADD API KEY TO .env.local**

Add this line to your `.env.local` file:

```bash
GEMINI_API_KEY=AIzaSyDNpmJD1jYnyUpYLs3BTH-xaJUrvVHjkas
```

---

## 🎯 **MODELS AVAILABLE**

### **Nano Banana (Fast)** - `gemini-2.5-flash-image`
- **Speed**: Ultra-fast (2-5 seconds)
- **Cost**: Low
- **Use**: High-volume, quick testing
- **Quality**: Good (85/100)

### **Nano Banana Pro (Quality)** - `gemini-3-pro-image-preview`
- **Speed**: Moderate (10-15 seconds)
- **Cost**: Higher
- **Use**: Professional assets, complex instructions
- **Quality**: Excellent (95/100)
- **Special**: Advanced reasoning ("Thinking"), high-fidelity text rendering

---

## 📦 **INSTALLATION**

```bash
npm install @google/generative-ai
```

---

## 🧪 **TEST SCRIPT**

```bash
# Create test file
cat > test-gemini-image.js << 'EOF'
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

console.log('🧪 Testing Gemini Nano Banana (Fast)...\n');

// Test Nano Banana (Fast)
const model = genAI.getGenerativeModel({ 
  model: 'gemini-2.5-flash-image' 
});

const result = await model.generateContent(
  'Professional recruitment advertisement for KFC. Red KFC polo shirt on wooden hanger, white background, KFC logo visible, studio lighting, headline "KFC IS HIRING NOW" in bold red text'
);

console.log('✅ Generation complete!');
console.log('Response:', result);

// Extract image from parts
for (const part of result.response.candidates[0].content.parts) {
  if (part.inlineData) {
    console.log('📸 Image found! Type:', part.inlineData.mimeType);
    console.log('📊 Size:', part.inlineData.data.length, 'bytes');
  }
}
EOF

# Run test
node test-gemini-image.js
```

---

## ✅ **READY!**

Your Gemini API key is set up. Now I'll integrate it into the Creative Studio.


