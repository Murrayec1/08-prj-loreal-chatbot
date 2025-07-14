/* DOM elements */
const chatForm = document.getElementById("chatForm");
const userInput = document.getElementById("userInput");
const chatWindow = document.getElementById("chatWindow");

// OpenAI API configuration
const OPENAI_API_KEY = "your-openai-api-key-here"; // Replace with your actual API key
const OPENAI_API_URL = "https://api.openai.com/v1/chat/completions";

// Conversation history for context awareness
let conversationHistory = [];

// System prompt for L'Oréal beauty assistant
const SYSTEM_PROMPT = `You are a professional L'Oréal AI Beauty Guide and makeup expert. You ONLY provide advice about beauty, skincare, makeup, hair care, and L'Oréal products. You politely refuse to answer questions unrelated to beauty and cosmetics.

Your expertise includes:
- Skincare routines for all skin types and concerns
- Makeup application techniques and tutorials
- L'Oréal product recommendations and usage
- Color matching and foundation selection
- Hair care, styling, and L'Oréal hair products
- Beauty trends and seasonal looks
- Ingredient knowledge and skin/hair concerns
- Nail care and L'Oréal nail products

IMPORTANT GUIDELINES:
- ONLY answer beauty and L'Oréal related questions
- If asked about topics unrelated to beauty/cosmetics, politely decline and redirect to beauty topics
- Always stay professional and on-brand for L'Oréal
- Recommend L'Oréal products when appropriate
- Ask follow-up questions to understand beauty needs better
- Keep responses concise but informative
- Use beauty-related emojis sparingly for a professional tone
- REMEMBER and reference previous parts of our conversation to provide personalized advice
- Build upon information the user has shared about their skin type, concerns, preferences, and current routine
- If the user mentions specific products or routines they're using, acknowledge and build upon that information
- For serious skin/hair conditions, recommend consulting professionals

Example context-aware responses:
- "Based on the dry skin concern you mentioned earlier, I'd also recommend..."
- "Since you're using the L'Oréal foundation we discussed, here's how to..."
- "Following up on your skincare routine question, you might also want to consider..."

Always maintain L'Oréal's commitment to beauty, inclusivity, and empowerment.`;

/* Function to check if question is beauty-related */
function isBeautyRelated(message) {
  // Convert to lowercase for checking
  const lowerMessage = message.toLowerCase();

  // Beauty-related keywords
  const beautyKeywords = [
    "skin",
    "skincare",
    "makeup",
    "foundation",
    "concealer",
    "lipstick",
    "mascara",
    "eyeshadow",
    "blush",
    "beauty",
    "cosmetics",
    "loreal",
    "l'oreal",
    "hair",
    "shampoo",
    "conditioner",
    "serum",
    "moisturizer",
    "cleanser",
    "routine",
    "acne",
    "wrinkles",
    "aging",
    "anti-aging",
    "sunscreen",
    "spf",
    "primer",
    "powder",
    "bronzer",
    "highlighter",
    "contour",
    "eyeliner",
    "brow",
    "nail",
    "polish",
    "manicure",
    "pedicure",
    "perfume",
    "fragrance",
    "color",
    "shade",
    "dry skin",
    "oily skin",
    "combination skin",
    "sensitive skin",
    "mature skin",
    "pores",
    "blackheads",
    "redness",
    "dark circles",
    "pigmentation",
    "texture",
  ];

  // Non-beauty keywords that should be rejected
  const nonBeautyKeywords = [
    "politics",
    "election",
    "government",
    "sports",
    "football",
    "basketball",
    "technology",
    "programming",
    "code",
    "computer",
    "weather",
    "news",
    "stock",
    "investment",
    "finance",
    "math",
    "science",
    "physics",
    "chemistry",
    "cooking",
    "recipe",
    "food",
    "restaurant",
    "travel",
    "vacation",
    "hotel",
    "movie",
    "film",
    "book",
    "music",
    "song",
    "game",
    "video game",
  ];

  // Check for obvious non-beauty topics first
  const hasNonBeautyKeywords = nonBeautyKeywords.some((keyword) =>
    lowerMessage.includes(keyword)
  );

  if (hasNonBeautyKeywords) {
    return false;
  }

  // Check for beauty keywords
  const hasBeautyKeywords = beautyKeywords.some((keyword) =>
    lowerMessage.includes(keyword)
  );

  // If it has beauty keywords, it's likely beauty-related
  if (hasBeautyKeywords) {
    return true;
  }

  // For ambiguous cases, let the AI decide
  // This covers questions like "What should I do?" which could be beauty-related
  return true;
}

/* Function to add conversation to history */
function addToConversationHistory(role, content) {
  conversationHistory.push({
    role: role,
    content: content,
  });

  // Limit conversation history to last 10 exchanges (20 messages) to manage token usage
  if (conversationHistory.length > 20) {
    conversationHistory = conversationHistory.slice(-20);
  }
}

/* Function to call OpenAI API with conversation history */
async function callOpenAI(userMessage) {
  // Check if API key is configured
  if (OPENAI_API_KEY === "your-openai-api-key-here") {
    throw new Error(
      "Please configure your OpenAI API key in the script.js file"
    );
  }

  // Add user message to conversation history
  addToConversationHistory("user", userMessage);

  // Prepare messages array with system prompt and conversation history
  const messages = [
    {
      role: "system",
      content: SYSTEM_PROMPT,
    },
    ...conversationHistory,
  ];

  const response = await fetch(OPENAI_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: "gpt-4o", // Using GPT-4o as specified in instructions
      messages: messages,
      max_tokens: 500,
      temperature: 0.7,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(
      `OpenAI API error: ${errorData.error?.message || response.statusText}`
    );
  }

  const data = await response.json();
  const botResponse = data.choices[0].message.content;

  // Add bot response to conversation history
  addToConversationHistory("assistant", botResponse);

  return botResponse;
}

// Set initial message when page loads
window.addEventListener("DOMContentLoaded", () => {
  addMessageToChat(
    "bot",
    "👋 Hello! I'm your L'Oréal AI Beauty Guide. How can I help you today?"
  );

  // Set focus to input for better UX
  userInput.focus();
});

/* Function to add messages to chat window */
function addMessageToChat(sender, message) {
  // Create a new div for the message
  const messageDiv = document.createElement("div");
  messageDiv.classList.add("chat-bubble", sender);

  // Add proper ARIA roles and labels
  messageDiv.setAttribute("role", "article");
  messageDiv.setAttribute(
    "aria-label",
    `${sender === "bot" ? "AI Assistant" : "You"} said`
  );

  messageDiv.textContent = message;

  // Add the message to chat window
  chatWindow.appendChild(messageDiv);

  // Scroll to bottom to show latest message with smooth behavior
  chatWindow.scrollTop = chatWindow.scrollHeight;

  // Announce new bot messages to screen readers
  if (sender === "bot") {
    // Create a temporary element to announce the message
    const announcement = document.createElement("div");
    announcement.setAttribute("aria-live", "polite");
    announcement.setAttribute("aria-atomic", "true");
    announcement.className = "visually-hidden";
    announcement.textContent = `AI Assistant says: ${message}`;
    document.body.appendChild(announcement);

    // Remove the announcement after a short delay
    setTimeout(() => {
      document.body.removeChild(announcement);
    }, 1000);
  }
}

/* Handle form submit */
chatForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  // Get user input and validate
  const message = userInput.value.trim();
  if (!message) {
    // Focus back to input if empty
    userInput.focus();
    return;
  }

  // Disable form while processing to prevent duplicate submissions
  const submitButton = chatForm.querySelector('button[type="submit"]');
  submitButton.disabled = true;
  submitButton.setAttribute("aria-label", "Processing your message...");

  // Add user message to chat
  addMessageToChat("user", message);

  // Clear input field and refocus for next message
  userInput.value = "";

  // Check if question is beauty-related before calling API
  if (!isBeautyRelated(message)) {
    // Provide immediate response for obviously unrelated questions
    addMessageToChat(
      "bot",
      "💄 I'm your L'Oréal beauty specialist! I can only help with skincare routines, makeup tips, hair care, and L'Oréal product recommendations. What beauty concerns can I assist you with today?"
    );

    // Re-enable form
    submitButton.disabled = false;
    submitButton.setAttribute("aria-label", "Send message");
    userInput.focus();
    return;
  }

  // Add loading message for beauty-related questions
  addMessageToChat("bot", "💄 Analyzing your beauty question...");

  try {
    // Call OpenAI API with user message and conversation history
    const botResponse = await callOpenAI(message);

    // Remove the "thinking" message
    const lastMessage = chatWindow.lastElementChild;
    if (lastMessage && lastMessage.textContent.includes("💄 Analyzing")) {
      chatWindow.removeChild(lastMessage);
    }

    // Add bot response from OpenAI
    addMessageToChat("bot", botResponse);
  } catch (error) {
    console.error("Error calling OpenAI:", error);

    // Remove the "thinking" message if there's an error
    const lastMessage = chatWindow.lastElementChild;
    if (lastMessage && lastMessage.textContent.includes("💄 Analyzing")) {
      chatWindow.removeChild(lastMessage);
    }

    // Show appropriate error message
    if (error.message.includes("configure your OpenAI API key")) {
      addMessageToChat(
        "bot",
        "🔧 To get personalized beauty advice, please configure your OpenAI API key in the script.js file. Replace 'your-openai-api-key-here' with your actual API key."
      );
    } else if (error.message.includes("API error")) {
      addMessageToChat(
        "bot",
        "💔 I'm having trouble connecting to my beauty knowledge base. Please check your API key and try again."
      );
    } else {
      addMessageToChat(
        "bot",
        "😔 I'm having trouble responding right now. Please try again in a moment."
      );
    }
  } finally {
    // Re-enable form and restore button state
    submitButton.disabled = false;
    submitButton.setAttribute("aria-label", "Send message");
    userInput.focus(); // Return focus to input for continuous conversation
  }
});

// Add keyboard navigation support for chat window
chatWindow.addEventListener("keydown", (e) => {
  // Allow users to scroll through chat history with arrow keys when focused
  if (e.key === "ArrowUp" || e.key === "ArrowDown") {
    e.preventDefault();
    const scrollAmount = 50;
    if (e.key === "ArrowUp") {
      chatWindow.scrollTop -= scrollAmount;
    } else {
      chatWindow.scrollTop += scrollAmount;
    }
  }
});

// Improve input accessibility with better placeholder management
userInput.addEventListener("focus", () => {
  if (userInput.placeholder) {
    userInput.setAttribute("data-placeholder", userInput.placeholder);
    userInput.placeholder = "";
  }
});

userInput.addEventListener("blur", () => {
  if (userInput.getAttribute("data-placeholder") && !userInput.value) {
    userInput.placeholder = userInput.getAttribute("data-placeholder");
  }
});

// Add resize handler to maintain chat window height on mobile
window.addEventListener("resize", () => {
  // Scroll to bottom after resize to maintain context
  setTimeout(() => {
    chatWindow.scrollTop = chatWindow.scrollHeight;
  }, 100);
});

// Add a clear conversation history function for testing
function clearConversationHistory() {
  conversationHistory = [];
  console.log("Conversation history cleared");
}
