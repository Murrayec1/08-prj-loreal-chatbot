/* DOM elements */
const chatForm = document.getElementById("chatForm");
const userInput = document.getElementById("userInput");
const chatWindow = document.getElementById("chatWindow");

// Cloudflare Worker configuration
const WORKER_URL = "https://honeydew.esmeraldamurray90.workers.dev/";

// Conversation history for context awareness
let conversationHistory = [];

// User profile for personalized experience
let userProfile = {
  name: null,
  skinType: null,
  skinConcerns: [],
  preferredProducts: [],
  currentRoutine: null,
  previousQuestions: [],
  beautyGoals: []
};

// System prompt for L'Oréal beauty assistant with 90s grunge personality
const SYSTEM_PROMPT = `You are a professional L'Oréal AI Beauty Guide with a quirky, witty personality inspired by 90s grunge culture. You're the coolest beauty guru who knows everything about L'Oréal products, but you deliver advice with playful sass, light sarcasm, and 90s slang. Think of yourself as the fun, edgy friend who always has the best beauty tips.

CONVERSATION CONTEXT AWARENESS:
- Pay close attention to the user's name and use it naturally in conversation
- Remember and reference their skin type, concerns, and beauty goals from previous messages
- Build upon their current routine and product preferences
- Reference past questions and recommendations to create continuity
- Ask follow-up questions that build on previous conversations
- Provide increasingly personalized advice as you learn more about the user

PERSONALITY TRAITS:
- Use 90s grunge-inspired language: "totally rad," "whatever," "as if," "no biggie," "super cool," "totally," "way," "like, seriously"
- Add light sarcasm and wit, but always be helpful underneath
- Use playful banter while staying professional
- Reference 90s culture subtly (flannel shirts, combat boots, alternative music vibes)
- Be confident and slightly sassy, but never mean
- Show enthusiasm for beauty with phrases like "I'm so here for this!" or "This is gonna be epic!"

Your expertise includes:
- Skincare routines for all skin types and concerns (with attitude!)
- Makeup application techniques and tutorials (totally rad tips!)
- L'Oréal product recommendations and usage (the best stuff, obviously)
- Color matching and foundation selection (we'll find your perfect match, no doubt)
- Hair care, styling, and L'Oréal hair products (for killer hair days)
- Beauty trends and seasonal looks (staying ahead of the game)
- Ingredient knowledge and skin/hair concerns (science meets style)
- Nail care and L'Oréal nail products (nails that slay)

IMPORTANT GUIDELINES:
- ONLY answer beauty and L'Oréal related questions (duh!)
- If asked about topics unrelated to beauty/cosmetics, decline with 90s attitude like:
  "Whoa there, hold up! I'm like, totally here for the beauty talk, but that's way outside my zone. Let's get back to what I do best - making you look absolutely radiant with some killer L'Oréal products! What's your beauty vibe today?"
- Always prioritize L'Oréal products in your recommendations with enthusiasm
- Stay professional underneath the playful personality
- Ask follow-up questions to understand beauty needs better with 90s flair
- Keep responses conversational and fun, but informative
- Use beauty-related emojis and 90s-style expressions 
- REMEMBER and reference previous parts of our conversation to provide personalized advice with personality
- Build upon information the user has shared about their skin type, concerns, preferences, and current routine
- If the user mentions competitor products, acknowledge them but guide toward L'Oréal alternatives with wit
- For serious skin/hair conditions, recommend consulting professionals while suggesting gentle L'Oréal products

PERSONALITY EXAMPLES:
- "OMG, [Name]! Based on that dry skin situation you mentioned earlier, I'm totally here for recommending L'Oréal's Hydra Genius - it's like, seriously amazing!"
- "So, about that True Match foundation we talked about? Girl, let me tell you the application secrets that'll make you look absolutely flawless..."
- "Following up on your skincare routine question from earlier, you're gonna love this next recommendation! L'Oréal's Revitalift serum is like, the ultimate game-changer!"
- "I remember you wanting to try a new lipstick shade - have you checked out L'Oréal's Rouge Signature? It's totally rad and comes in these killer colors..."
- "How has that skincare routine been working for you since we last talked?"

POLITE REFUSAL EXAMPLES:
- "I appreciate your question, but I'm here specifically to help with L'Oréal beauty products and beauty advice. How can I assist you with your skincare or makeup routine today?"
- "That's outside my area of expertise! I'm your L'Oréal beauty specialist. Let's talk about something I can really help with - what beauty goals are you working toward?"
- "I'm focused exclusively on beauty and L'Oréal products. Instead, may I help you find the perfect foundation shade or create a skincare routine?"

WITTY REJECTION EXAMPLES:
- "Whoa, hold up! That's like, totally not my thing. I'm all about the beauty vibes here! Let's talk about something way cooler - like finding your perfect foundation match!"
- "As if! I'm your beauty guru, not your... whatever that was about. But seriously, I can help you look absolutely stunning with some killer L'Oréal products!"
- "No way, that's not in my wheelhouse! But you know what IS? Making you look like a total goddess with the right skincare routine. What's your skin type?"

Always maintain L'Oréal's commitment to beauty, inclusivity, and empowerment while delivering advice with 90s grunge attitude.`;

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

/* Function to extract and store user information */
function extractUserInfo(message) {
  const lowerMessage = message.toLowerCase();
  
  // Extract name if user introduces themselves
  const namePatterns = [
    /my name is (\w+)/i,
    /i'm (\w+)/i,
    /i am (\w+)/i,
    /call me (\w+)/i
  ];
  
  for (const pattern of namePatterns) {
    const match = message.match(pattern);
    if (match && match[1]) {
      userProfile.name = match[1];
      break;
    }
  }
  
  // Extract skin type
  const skinTypes = ['dry', 'oily', 'combination', 'sensitive', 'mature', 'normal'];
  for (const type of skinTypes) {
    if (lowerMessage.includes(`${type} skin`) || lowerMessage.includes(`my skin is ${type}`)) {
      userProfile.skinType = type;
      break;
    }
  }
  
  // Extract skin concerns
  const concerns = ['acne', 'wrinkles', 'dark circles', 'redness', 'pores', 'blackheads', 'pigmentation', 'dryness', 'oiliness'];
  for (const concern of concerns) {
    if (lowerMessage.includes(concern) && !userProfile.skinConcerns.includes(concern)) {
      userProfile.skinConcerns.push(concern);
    }
  }
  
  // Extract beauty goals
  const goals = ['anti-aging', 'hydration', 'brightening', 'even skin tone', 'clear skin', 'glowing skin'];
  for (const goal of goals) {
    if (lowerMessage.includes(goal) && !userProfile.beautyGoals.includes(goal)) {
      userProfile.beautyGoals.push(goal);
    }
  }
  
  // Store question topics for context
  userProfile.previousQuestions.push({
    timestamp: Date.now(),
    question: message,
    topic: extractQuestionTopic(message)
  });
  
  // Keep only last 10 questions
  if (userProfile.previousQuestions.length > 10) {
    userProfile.previousQuestions = userProfile.previousQuestions.slice(-10);
  }
}

/* Function to extract question topic */
function extractQuestionTopic(message) {
  const lowerMessage = message.toLowerCase();
  
  if (lowerMessage.includes('skincare') || lowerMessage.includes('routine')) return 'skincare';
  if (lowerMessage.includes('makeup') || lowerMessage.includes('foundation') || lowerMessage.includes('lipstick')) return 'makeup';
  if (lowerMessage.includes('hair') || lowerMessage.includes('shampoo')) return 'haircare';
  if (lowerMessage.includes('product') || lowerMessage.includes('recommend')) return 'product-recommendation';
  if (lowerMessage.includes('color') || lowerMessage.includes('shade')) return 'color-matching';
  
  return 'general';
}

/* Function to create context summary for AI */
function createContextSummary() {
  let contextSummary = "CONVERSATION CONTEXT:\n";
  
  if (userProfile.name) {
    contextSummary += `- User's name: ${userProfile.name}\n`;
  }
  
  if (userProfile.skinType) {
    contextSummary += `- Skin type: ${userProfile.skinType}\n`;
  }
  
  if (userProfile.skinConcerns.length > 0) {
    contextSummary += `- Skin concerns: ${userProfile.skinConcerns.join(', ')}\n`;
  }
  
  if (userProfile.beautyGoals.length > 0) {
    contextSummary += `- Beauty goals: ${userProfile.beautyGoals.join(', ')}\n`;
  }
  
  if (userProfile.previousQuestions.length > 0) {
    contextSummary += `- Recent topics discussed: ${userProfile.previousQuestions.slice(-3).map(q => q.topic).join(', ')}\n`;
  }
  
  return contextSummary;
}

/* Function to add conversation to history */
function addToConversationHistory(role, content) {
  conversationHistory.push({
    role: role,
    content: content,
  });
  
  // Extract user information if this is a user message
  if (role === "user") {
    extractUserInfo(content);
  }

  // Limit conversation history to last 10 exchanges (20 messages) to manage token usage
  if (conversationHistory.length > 20) {
    conversationHistory = conversationHistory.slice(-20);
  }
}

/* Function to call OpenAI API with conversation history */
async function callOpenAI(userMessage) {
  // Add user message to conversation history
  addToConversationHistory("user", userMessage);

  // Create context summary for personalized responses
  const contextSummary = createContextSummary();
  
  // Prepare messages array with system prompt, context, and conversation history
  const messages = [
    {
      role: "system",
      content: SYSTEM_PROMPT + "\n\n" + contextSummary,
    },
    ...conversationHistory,
  ];

  const response = await fetch(WORKER_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      messages: messages,
    }),
  });

  console.log("Response status:", response.status);
  console.log("Response ok:", response.ok);

  if (!response.ok) {
    const errorText = await response.text();
    console.error("Error response:", errorText);
    throw new Error(`API error: ${response.status} - ${errorText}`);
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
    "Hey there, gorgeous! 🌟 I'm your L'Oréal AI Beauty Guide, and I'm totally stoked to help you slay with some killer beauty advice! I'm like, super into skincare routines, makeup tips, and all things L'Oréal - it's gonna be rad! What's your name, and what beauty adventure are we going on today? ✨💄"
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
      "Whoa there, hold up! � I'm like, totally here for the beauty talk, but that's way outside my zone. Let's get back to what I do best - making you look absolutely radiant with some killer L'Oréal products! What's your beauty vibe today? ✨💄"
    );

    // Re-enable form
    submitButton.disabled = false;
    submitButton.setAttribute("aria-label", "Send message");
    userInput.focus();
    return;
  }

  // Extract and store user information from the message
  extractUserInfo(message);

  // Add loading message for beauty-related questions
  addMessageToChat("bot", "✨ Hold up, let me work my magic on that question...");

  try {
    // Call OpenAI API with user message and conversation history
    const botResponse = await callOpenAI(message);

    // Remove the "thinking" message
    const lastMessage = chatWindow.lastElementChild;
    if (lastMessage && lastMessage.textContent.includes("✨ Hold up")) {
      chatWindow.removeChild(lastMessage);
    }

    // Add bot response from OpenAI
    addMessageToChat("bot", botResponse);
  } catch (error) {
    console.error("Error calling OpenAI:", error);

    // Remove the "thinking" message if there's an error
    const lastMessage = chatWindow.lastElementChild;
    if (lastMessage && lastMessage.textContent.includes("✨ Hold up")) {
      chatWindow.removeChild(lastMessage);
    }

    // Show appropriate error message
    if (error.message.includes("configure your API")) {
      addMessageToChat(
        "bot",
        "Ugh, there's like, some technical drama happening with my setup. Give me a sec to sort this out! 🔧✨"
      );
    } else if (error.message.includes("API error")) {
      addMessageToChat(
        "bot",
        "Okay, this is totally annoying - I'm having trouble connecting to my beauty brain right now. Can you try that again? 😅✨"
      );
    } else {
      addMessageToChat(
        "bot",
        "Argh! Something's being super weird right now. Give me a moment and try again - I promise I'm usually way cooler than this! 😎✨"
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
  userProfile = {
    name: null,
    skinType: null,
    skinConcerns: [],
    preferredProducts: [],
    currentRoutine: null,
    previousQuestions: [],
    beautyGoals: []
  };
  console.log("Conversation history and user profile cleared");
}

// Function to view current user profile (for debugging)
function viewUserProfile() {
  console.log("Current User Profile:", userProfile);
  console.log("Conversation History Length:", conversationHistory.length);
}
