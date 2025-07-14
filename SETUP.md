# L'Oréal AI Beauty Guide Setup

## OpenAI API Key Configuration

To make your chatbot work with real AI responses, you need to set up an OpenAI API key.

### Step 1: Get an OpenAI API Key

1. Go to [OpenAI's website](https://openai.com/api/)
2. Sign up or log in to your account
3. Navigate to the API section
4. Create a new API key
5. Copy your API key

### Step 2: Configure Your Chatbot

1. Open the `script.js` file in your project
2. Find this line near the top:
   ```javascript
   const OPENAI_API_KEY = "your-openai-api-key-here";
   ```
3. Replace `"your-openai-api-key-here"` with your actual API key:
   ```javascript
   const OPENAI_API_KEY = "sk-your-actual-api-key-here";
   ```

### Step 3: Test Your Chatbot

1. Open `index.html` in your browser
2. Type a beauty question like "What's the best skincare routine for dry skin?"
3. Your chatbot should now respond with personalized beauty advice!

## Features

✅ **System Prompt**: The chatbot uses a specialized L'Oréal beauty expert prompt
✅ **User Input Capture**: Captures and validates user questions
✅ **OpenAI Integration**: Sends messages to GPT-4o model
✅ **Response Display**: Shows AI responses in the chat interface
✅ **Error Handling**: Handles API errors gracefully
✅ **Accessibility**: Fully accessible with screen reader support
✅ **Mobile Optimized**: Works perfectly on all devices

## Customization

You can modify the system prompt in `script.js` to change how the AI responds:

```javascript
const SYSTEM_PROMPT = `Your custom prompt here...`;
```

## Troubleshooting

- **"Please configure your OpenAI API key"**: You need to add your API key
- **"API error"**: Check that your API key is valid and has credits
- **No response**: Check browser console for error messages

Enjoy your L'Oréal AI Beauty Guide! 💄✨
