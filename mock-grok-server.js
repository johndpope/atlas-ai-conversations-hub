import express from 'express';
import cors from 'cors';
const app = express();

app.use(cors());
app.use(express.json());

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'mock-grok-server' });
});

// Mock Grok API endpoint for new conversations
app.post('/rest/app-chat/conversations/new', async (req, res) => {
  const { message } = req.body;
  
  res.setHeader('Content-Type', 'text/plain');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  // Send conversation creation response
  const conversationId = `mock-conv-${Date.now()}`;
  const responseId = `mock-resp-${Date.now()}`;
  
  const conversationResponse = {
    result: {
      conversation: {
        conversationId,
        title: 'New Conversation',
        starred: false,
        createTime: new Date().toISOString(),
        modifyTime: new Date().toISOString(),
        systemPromptName: 'grok-3',
        temporary: false,
        mediaTypes: []
      }
    }
  };

  res.write(JSON.stringify(conversationResponse) + '\n');
  await delay(100);

  // Simulate streaming response
  const mockResponse = `Hello! This is a mock response from Grok AI. You asked: "${message}"\n\nThis is a simulated streaming response to test the integration. The mock server is working correctly!`;
  
  const tokens = mockResponse.split(' ');
  
  for (const token of tokens) {
    const tokenResponse = {
      result: {
        response: {
          token: token + ' ',
          isThinking: false,
          isSoftStop: false,
          responseId
        }
      }
    };
    
    res.write(JSON.stringify(tokenResponse) + '\n');
    await delay(50); // Simulate typing delay
  }

  // Send final metadata
  const finalResponse = {
    result: {
      response: {
        finalMetadata: {
          followUpSuggestions: [
            "Can you tell me more about AI?",
            "What are your capabilities?",
            "How does the mock server work?"
          ],
          feedbackLabels: [],
          toolsUsed: {}
        },
        modelResponse: {
          responseId,
          message: mockResponse,
          sender: 'assistant',
          createTime: new Date().toISOString(),
          parentResponseId: '',
          manual: false,
          partial: false,
          shared: false,
          query: message,
          queryType: 'text',
          webSearchResults: [],
          xpostIds: [],
          xposts: [],
          generatedImageUrls: [],
          imageAttachments: [],
          fileAttachments: [],
          cardAttachmentsJson: [],
          fileUris: [],
          fileAttachmentsMetadata: [],
          isControl: false,
          steps: [],
          mediaTypes: []
        }
      }
    }
  };

  res.write(JSON.stringify(finalResponse) + '\n');
  res.end();
});

// Mock Grok API endpoint for continuing conversations
app.post('/rest/app-chat/conversations/:conversationId/responses', async (req, res) => {
  const { conversationId } = req.params;
  const { message } = req.body;
  
  res.setHeader('Content-Type', 'text/plain');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  const responseId = `mock-resp-${Date.now()}`;
  
  // Simulate streaming response
  const mockResponse = `This is a follow-up response in conversation ${conversationId}. You said: "${message}"\n\nI'm continuing our conversation with this mock response.`;
  
  const tokens = mockResponse.split(' ');
  
  for (const token of tokens) {
    const tokenResponse = {
      result: {
        response: {
          token: token + ' ',
          isThinking: false,
          isSoftStop: false,
          responseId
        }
      }
    };
    
    res.write(JSON.stringify(tokenResponse) + '\n');
    await delay(50); // Simulate typing delay
  }

  // Send final metadata
  const finalResponse = {
    result: {
      response: {
        finalMetadata: {
          followUpSuggestions: [
            "What else can you help with?",
            "Continue the conversation",
            "Ask another question"
          ],
          feedbackLabels: [],
          toolsUsed: {}
        },
        modelResponse: {
          responseId,
          message: mockResponse,
          sender: 'assistant',
          createTime: new Date().toISOString(),
          parentResponseId: req.body.parentResponseId || '',
          manual: false,
          partial: false,
          shared: false,
          query: message,
          queryType: 'text',
          webSearchResults: [],
          xpostIds: [],
          xposts: [],
          generatedImageUrls: [],
          imageAttachments: [],
          fileAttachments: [],
          cardAttachmentsJson: [],
          fileUris: [],
          fileAttachmentsMetadata: [],
          isControl: false,
          steps: [],
          mediaTypes: []
        }
      }
    }
  };

  res.write(JSON.stringify(finalResponse) + '\n');
  res.end();
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Mock Grok server running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/health`);
});