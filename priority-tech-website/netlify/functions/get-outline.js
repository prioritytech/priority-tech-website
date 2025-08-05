// This is your new serverless function.
// Save this code in a file named: netlify/functions/get-outline.js

exports.handler = async function (event, context) {
  console.log("Function 'get-outline' has been invoked."); // Added for debugging

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

        You MUST return only a valid JSON object that adheres to the provided schema.
    `;

    // Securely get the API key from Netlify's environment variables
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        console.error("GEMINI_API_KEY environment variable not set.");
        throw new Error("API key is not configured on the server.");
    }
    
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=${apiKey}`;

    const payload = {
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
            responseMimeType: "application/json",
            responseSchema: {
                type: "OBJECT",
                properties: {
                    projectOutline: {
                        type: "OBJECT",
                        properties: {
                            keyObjectives: { type: "ARRAY", items: { type: "STRING" } },
                            highLevelPhases: { type: "ARRAY", items: { type: "STRING" } },
                            recommendedTech: { type: "ARRAY", items: { type: "STRING" } },
                            potentialRisks: { type: "ARRAY", items: { type: "STRING" } }
                        }
                    },
                    costEstimation: {
                        type: "OBJECT",
                        properties: {
                            estimatedHours: { type: "NUMBER" },
                            hourlyRate: { type: "NUMBER" },
                            totalCost: { type: "NUMBER" },
                            currency: { type: "STRING" },
                            disclaimer: { type: "STRING" }
                        }
                    },
                    summary: { type: "STRING" }
                }
            }
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
        return {
            statusCode: response.status,
            body: JSON.stringify(errorBody)
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
      body: JSON.stringify({ error: error.message })
    };
  }
};
