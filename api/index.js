// Vercel serverless function for AI Battle Arena
module.exports = async (req, res) => {
  // Simple redirect to the main battle interface
  // This is a lightweight deployment that will build in seconds

  if (req.method === 'GET') {
    return res.status(200).send(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>AI Battle Arena - Deploying</title>
        </head>
        <body>
          <h1>AI Battle Arena</h1>
          <p>The full application is being configured. Please check back soon!</p>
          <p>Access Code: Casper_33</p>
        </body>
      </html>
    `);
  }

  return res.status(200).json({
    message: 'AI Battle Arena API',
    status: 'deploying'
  });
};
