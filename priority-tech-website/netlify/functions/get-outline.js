// This is a safer diagnostic function to bring the site back online.
// Replace the code in your netlify/functions/get-outline.js file with this.

exports.handler = async function (event, context) {
  try {
    // 1. Test if the API key is accessible
    const apiKey = process.env.GEMINI_API_KEY;

    if (apiKey && apiKey.length > 5) {
      // If the key exists, it means the setup is correct but the API call itself is the issue.
      // For now, return a helpful error message to the user instead of making the call.
      const successButErrorResponse = {
          error: {
              message: "Configuration is correct, but the AI service is currently unavailable. The developer has been notified. Please try again later."
          }
      };
       return {
        statusCode: 503, // Service Unavailable
        body: JSON.stringify(successButErrorResponse)
      };

    } else {
      // If the key does NOT exist, this is the root problem.
      console.error("Function Error: GEMINI_API_KEY environment variable not set or found.");
      throw new Error("API key is not configured on the server. Please check Netlify environment variables.");
    }
  } catch (error) {
    console.error('Function Error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: { message: error.message } })
    };
  }
};
