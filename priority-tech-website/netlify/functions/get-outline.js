// This is a revised serverless function to resolve build issues.
// Replace the code in your netlify/functions/get-outline.js file with this.

exports.handler = async function (event, context) {
  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    const { userInput } = JSON.parse(event.body);
    
    if (!userInput) {
        return { statusCode: 400, body: 'User input is required.' };
    }

    // This is the prompt that instructs the Gemini model.
    const prompt = `
        You are an expert IT Project Manager and consultant named Daniyal Khan, founder of Priority Tech. You have 8+ years of experience in Agile, ITIL, Azure cloud migrations, data analytics (Databricks, SQL, Power BI), and cybersecurity.

        A potential client has described a project: "${userInput}".

        Your task is to analyze this request and generate a structured JSON response. This response must include a high-level project outline and a preliminary cost estimation based on the following competitive consulting rates (in CAD):
        - Standard IT Project Management: $115/hour
        - Specialized Consulting (Data Analytics, Cloud Architecture, Cybersecurity): $145/hour

        Analyze the user's request to determine the project's complexity and which rate is more appropriate. Estimate the total hours required. Small projects might be 40-80 hours, medium 80-160, and large 160+.

        You MUST return only a valid JSON object. The JSON object should have two main keys: "projectOutline" and "costEstimation".
        The "projectOutline" object should contain: keyObjectives (array of strings), highLevelPhases (array of strings), recommendedTech (array of strings), and potentialRisks (array of strings).
        The "costEstimation" object should contain: estimatedHours (number), hourlyRate (number), totalCost (number), currency (string), and disclaimer (string).
        Also include a "summary" key with a concluding string of text.
    `;

    // Securely get the API key from Netlify's environment variables
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        console.error("Function Error: GEMINI_API_KEY environment variable not set or found.");
        throw new Error("API key is not configured on the server. Please contact the site administrator.");
    }
    
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=${apiKey}`;

    // Simplified payload without the complex responseSchema object
    const payload = {
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
            responseMimeType: "application/json",
        }
    };

    // Call the Gemini API from the serverless function
    const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    });

    if (!response.ok) {
        const errorBody = await response.json();
        console.error("API Error:", errorBody);
        const errorMessage = errorBody?.error?.message || "An unknown API error occurred.";
        return {
            statusCode: response.status,
            body: JSON.stringify({ error: { message: errorMessage } })
        };
    }

    const result = await response.json();

    // Return the successful response to the frontend
    return {
        statusCode: 200,
        body: JSON.stringify(result)
    };

  } catch (error) {
    console.error('Function Error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: { message: error.message } })
    };
  }
};
