import express from 'express';
import cors from 'cors';
import { GrokAPI } from 'grok-api-ts';

const app = express();
const port = 3003;

// Middleware
app.use(cors());
app.use(express.json());

// Initialize Grok API
let grokApi = null;

// Initialize Grok API connection
const initializeGrokAPI = async () => {
  try {
    grokApi = new GrokAPI();
    console.log('Grok API initialized successfully');
  } catch (error) {
    console.error('Failed to initialize Grok API:', error);
  }
};

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', grokConnected: grokApi !== null });
});

// Grok streaming endpoint
app.post('/grok/stream', async (req, res) => {
  try {
    const { message, customInstructions, messageHistory } = req.body;

    if (!grokApi) {
      return res.status(500).json({ error: 'Grok API not initialized' });
    }

    // Set up SSE headers
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Cache-Control'
    });

    let fullResponse = '';

    try {
      await grokApi.sendMessageStream(
        {
          message: message,
          customInstructions: customInstructions || '',
          messageHistory: messageHistory || []
        },
        {
          onToken: (token) => {
            fullResponse += token;
            // Send token as SSE event
            res.write(`data: ${JSON.stringify({ type: 'token', token })}\n\n`);
          },
          onComplete: (response) => {
            // Send completion event
            res.write(`data: ${JSON.stringify({ 
              type: 'complete', 
              fullMessage: response.fullMessage,
              messageId: response.messageId 
            })}\n\n`);
            res.write(`data: [DONE]\n\n`);
            res.end();
          },
          onError: (error) => {
            console.error('Grok streaming error:', error);
            res.write(`data: ${JSON.stringify({ 
              type: 'error', 
              error: error.message || 'Unknown error' 
            })}\n\n`);
            res.end();
          }
        }
      );
    } catch (streamError) {
      console.error('Stream setup error:', streamError);
      res.write(`data: ${JSON.stringify({ 
        type: 'error', 
        error: streamError.message || 'Failed to start stream' 
      })}\n\n`);
      res.end();
    }

  } catch (error) {
    console.error('Grok API error:', error);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
});

// Regular Grok endpoint (non-streaming)
app.post('/grok/message', async (req, res) => {
  try {
    const { message, customInstructions, messageHistory } = req.body;

    if (!grokApi) {
      return res.status(500).json({ error: 'Grok API not initialized' });
    }

    const response = await grokApi.sendMessage({
      message: message,
      customInstructions: customInstructions || '',
      messageHistory: messageHistory || []
    });

    res.json(response);

  } catch (error) {
    console.error('Grok API error:', error);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('Server error:', error);
  res.status(500).json({ error: 'Internal server error' });
});

// Start server
app.listen(port, async () => {
  console.log(`Grok API server running on http://localhost:${port}`);
  await initializeGrokAPI();
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('Shutting down Grok API server...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('Shutting down Grok API server...');
  process.exit(0);
});