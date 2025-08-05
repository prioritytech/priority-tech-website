// This is a simplified "hello world" function for debugging.
// Temporarily replace the code in your netlify/functions/get-outline.js file with this.

exports.handler = async function (event, context) {
  console.log("Debugging function was called!");

  const responseData = {
    message: "Hello from your Netlify function! The setup is working."
  };

  return {
    statusCode: 200,
    body: JSON.stringify(responseData)
  };
};
