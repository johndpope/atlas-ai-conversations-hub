import express from 'express';
import cors from 'cors';
import { Request, Response } from 'express';

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));

// Mock conversation storage
const conversations = new Map<string, any>();
let conversationCounter = 1;
let responseCounter = 1;

// Mock responses pool with different types
const mockResponses = [
  {
    type: 'basic',
    message: "I'm a mock Grok AI assistant. I can help you with various questions and tasks. What would you like to know?",
    followUps: ["What are your capabilities?", "How can I use this API?", "Tell me about the features"],
    hasWebSearch: false,
    hasImages: false
  },
  {
    type: 'informative',
    message: "That's an interesting question! As a mock assistant, I'm designed to simulate responses to help with development and testing. I can provide various types of responses including basic text, lists, and structured data.",
    followUps: ["Can you show me different response types?", "What testing scenarios are supported?", "How realistic are the mock responses?"],
    hasWebSearch: false,
    hasImages: false
  },
  {
    type: 'helpful',
    message: "I understand you're looking for information on that topic. While I'm just a mock endpoint, I can provide simulated responses with different formats and structures to help test your integration.",
    followUps: ["Show me a list format", "Can you provide structured data?", "What other formats are available?"],
    hasWebSearch: Math.random() > 0.7,
    hasImages: false
  },
  {
    type: 'list',
    message: "Here are some key features of this mock API:\n\n1. **Streaming responses** - Simulates real-time token streaming\n2. **Conversation management** - Maintains conversation state\n3. **Variable response types** - Different formats and structures\n4. **Follow-up suggestions** - Dynamic conversation prompts\n5. **Realistic timing** - Simulates natural response delays",
    followUps: ["Tell me more about streaming", "How does conversation management work?", "What other features are planned?"],
    hasWebSearch: false,
    hasImages: false
  },
  {
    type: 'code',
    message: "Here's a simple example of how to use this API:\n\n```javascript\nconst response = await fetch('/rest/app-chat/conversations/new', {\n  method: 'POST',\n  headers: { 'Content-Type': 'application/json' },\n  body: JSON.stringify({ message: 'Hello!' })\n});\n```\n\nThis mock server supports both new conversations and continuing existing ones.",
    followUps: ["Show me more code examples", "How do I handle streaming responses?", "What about error handling?"],
    hasWebSearch: false,
    hasImages: false
  },
  {
    type: 'thinking',
    message: "🤔 Let me think about that... This mock server can simulate different types of responses including thinking processes, code examples, lists, and structured data. It's designed to help developers test their integrations thoroughly.",
    followUps: ["Can you simulate errors too?", "What about different response speeds?", "How do I test edge cases?"],
    hasWebSearch: false,
    hasImages: Math.random() > 0.8
  },
  {
    type: 'creative',
    message: "✨ Here's something creative! This mock server isn't just about boring test responses. It can simulate:\n\n🎯 **Targeted responses** based on your input\n🔄 **Dynamic content** that changes each time\n📊 **Structured data** for complex testing\n🎨 **Rich formatting** with emojis and markdown\n\nPerfect for comprehensive API testing!",
    followUps: ["Show me more creative examples", "How do I test different scenarios?", "What about performance testing?"],
    hasWebSearch: Math.random() > 0.6,
    hasImages: Math.random() > 0.5
  }
];

// Store for uploaded files
const uploadedFiles = new Map<string, any>();

// Generate mock streaming response
function generateStreamingResponse(message: string, hasFileAttachments = false): { chunks: string[], responseData: any, isImageGeneration?: boolean } {
  // Check if this should be an image generation response
  const isImageGeneration = hasFileAttachments && Math.random() > 0.3; // 70% chance for image generation if files are attached
  
  if (isImageGeneration) {
    const imagePrompt = `moody, emotional illustration inspired by "${message}", depicting the uploaded image content with artistic enhancements, incorporating creative visual elements and atmospheric styling`;
    const customResponse = `I generated images with the prompt: '${imagePrompt}'`;
    
    return {
      chunks: [customResponse],
      responseData: {
        type: 'image_generation',
        message: customResponse,
        hasWebSearch: false,
        hasImages: true,
        followUps: [
          {
            properties: {
              messageType: "IMAGE_GEN",
              followUpType: "STYLE"
            },
            label: "artistic atmosphere",
            toolOverrides: {}
          },
          {
            properties: {
              messageType: "IMAGE_GEN",
              followUpType: "ADD"
            },
            label: "creative elements",
            toolOverrides: {}
          },
          {
            properties: {
              messageType: "IMAGE_GEN",
              followUpType: "MODIFY"
            },
            label: "mood enhancement",
            toolOverrides: {}
          }
        ]
      },
      isImageGeneration: true
    };
  }
  
  const baseResponse = mockResponses[Math.floor(Math.random() * mockResponses.length)];
  let customResponse = `You asked: "${message}". ${baseResponse.message}`;
  
  // Add file attachment acknowledgment if files were uploaded
  if (hasFileAttachments) {
    customResponse += `\n\nI can see you've uploaded some files. In a real implementation, I would analyze the content of these files and provide specific responses based on their content.`;
  }
  
  // Split into chunks for streaming simulation
  const words = customResponse.split(' ');
  const chunks: string[] = [];
  
  for (let i = 0; i < words.length; i++) {
    const word = words[i];
    if (i === words.length - 1) {
      chunks.push(word);
    } else {
      chunks.push(word + ' ');
    }
  }
  
  return {
    chunks,
    responseData: baseResponse
  };
}

// Generate image generation streaming sequence
function generateImageGenerationSequence(message: string, responseId: string, userResponseId: string): any[] {
  const imagePrompt = `moody, emotional illustration inspired by "${message}", depicting the uploaded image content with artistic enhancements, incorporating creative visual elements and atmospheric styling`;
  const imageId = `img_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  
  return [
    // Progress report for attachment preprocessing
    {
      result: {
        response: {
          progressReport: {
            type: "ATTACHMENT_PREPROCESSING",
            state: "COMPLETE",
            progressPercentage: 100,
            message: "Attachment preprocessing complete"
          },
          responseId: responseId
        }
      }
    },
    // Image dimensions
    {
      result: {
        response: {
          imageDimensions: {
            width: 1024,
            height: 1024
          },
          responseId: responseId
        }
      }
    },
    // Image attachment info
    {
      result: {
        response: {
          imageAttachmentInfo: {
            imageId: imageId,
            prompt: imagePrompt,
            style: "artistic",
            aspectRatio: "1:1"
          },
          responseId: responseId
        }
      }
    },
    // Query action
    {
      result: {
        response: {
          queryAction: {
            actionType: "IMAGE_GENERATION",
            prompt: imagePrompt,
            parameters: {
              width: 1024,
              height: 1024,
              style: "artistic",
              mood: "emotional"
            }
          },
          responseId: responseId
        }
      }
    },
    // Streaming image generation responses with progress
    {
      result: {
        response: {
          streamingImageGenerationResponse: {
            progress: 25,
            status: "PROCESSING",
            message: "Generating image..."
          },
          responseId: responseId
        }
      }
    },
    {
      result: {
        response: {
          streamingImageGenerationResponse: {
            progress: 50,
            status: "PROCESSING",
            message: "Refining details..."
          },
          responseId: responseId
        }
      }
    },
    {
      result: {
        response: {
          streamingImageGenerationResponse: {
            progress: 75,
            status: "PROCESSING",
            message: "Applying artistic effects..."
          },
          responseId: responseId
        }
      }
    },
    {
      result: {
        response: {
          streamingImageGenerationResponse: {
            progress: 100,
            status: "COMPLETE",
            message: "Image generation complete",
            imageUrl: `https://example.com/generated-images/${imageId}.jpg`
          },
          responseId: responseId
        }
      }
    }
  ];
}

// Mock endpoint for new conversations
app.post('/rest/app-chat/conversations/new', (req: Request, res: Response) => {
  const { message, modelName = 'grok-3', temporary = false, fileAttachments = [] } = req.body;
  
  const conversationId = `conv_${conversationCounter++}`;
  const responseId = `resp_${responseCounter++}`;
  const userResponseId = `user_${responseCounter++}`;
  
  console.log(`Mock: New conversation ${conversationId} - Message: "${message}"`);
  if (fileAttachments.length > 0) {
    console.log(`Mock: File attachments: ${fileAttachments.length}`);
  }
  
  // Store conversation
  conversations.set(conversationId, {
    id: conversationId,
    title: `Mock Conversation ${conversationCounter - 1}`,
    messages: [
      { id: userResponseId, message, sender: 'user', timestamp: new Date().toISOString() }
    ]
  });
  
  // Check if request has file attachments
  const hasFileAttachments = fileAttachments && fileAttachments.length > 0;
  const { chunks, responseData, isImageGeneration } = generateStreamingResponse(message, hasFileAttachments);
  
  // Send response as streaming JSON lines
  res.writeHead(200, {
    'Content-Type': 'application/json',
    'Transfer-Encoding': 'chunked',
    'Access-Control-Allow-Origin': '*'
  });
  
  // First, send conversation creation
  res.write(JSON.stringify({
    result: {
      conversation: {
        conversationId,
        title: `Mock Conversation ${conversationCounter - 1}`,
        starred: false,
        createTime: new Date().toISOString(),
        modifyTime: new Date().toISOString(),
        systemPromptName: "default",
        temporary: false,
        mediaTypes: []
      }
    }
  }) + '\n');
  
  // Send user response confirmation
  res.write(JSON.stringify({
    result: {
      userResponse: {
        responseId: userResponseId,
        message,
        sender: "user",
        createTime: new Date().toISOString(),
        parentResponseId: "",
        manual: true,
        partial: false,
        shared: false,
        query: message,
        queryType: "text",
        fileAttachments: fileAttachments
      }
    }
  }) + '\n');
  
  if (isImageGeneration) {
    // Send image generation sequence
    const imageSequence = generateImageGenerationSequence(message, responseId, userResponseId);
    let sequenceIndex = 0;
    
    const streamImageSequence = () => {
      if (sequenceIndex < imageSequence.length) {
        res.write(JSON.stringify(imageSequence[sequenceIndex]) + '\n');
        sequenceIndex++;
        setTimeout(streamImageSequence, 800); // Longer delays for image generation
      } else {
        // Send final response token
        res.write(JSON.stringify({
          result: {
            response: {
              token: chunks[0],
              isThinking: false,
              isSoftStop: false,
              responseId: responseId
            }
          }
        }) + '\n');
        
        // Send final metadata with special follow-up format
        setTimeout(() => {
          res.write(JSON.stringify({
            result: {
              response: {
                finalMetadata: {
                  followUpSuggestions: responseData.followUps,
                  feedbackLabels: ["helpful", "accurate", "clear"],
                  toolsUsed: {}
                },
                modelResponse: {
                  responseId: responseId,
                  message: chunks.join(''),
                  sender: "assistant",
                  createTime: new Date().toISOString(),
                  parentResponseId: userResponseId,
                  manual: false,
                  partial: false,
                  shared: false,
                  query: message,
                  queryType: "text",
                  webSearchResults: [],
                  xpostIds: [],
                  xposts: [],
                  generatedImageUrls: [
                    `https://example.com/generated-images/img_${Date.now()}.jpg`
                  ],
                  imageAttachments: [],
                  fileAttachments: fileAttachments,
                  cardAttachmentsJson: [],
                  fileUris: [],
                  fileAttachmentsMetadata: [],
                  isControl: false,
                  steps: [],
                  mediaTypes: []
                }
              }
            }
          }) + '\n');
          
          // Send title update
          res.write(JSON.stringify({
            result: {
              title: {
                newTitle: `Image: ${message.substring(0, 50)}${message.length > 50 ? '...' : ''}`
              }
            }
          }) + '\n');
          
          res.end();
        }, 100);
      }
    };
    
    setTimeout(streamImageSequence, 500);
  } else {
    // Stream response tokens normally
    let tokenIndex = 0;
    const streamTokens = () => {
      if (tokenIndex < chunks.length) {
        const isLast = tokenIndex === chunks.length - 1;
        
        res.write(JSON.stringify({
          result: {
            response: {
              token: chunks[tokenIndex],
              isThinking: false,
              isSoftStop: false,
              responseId: responseId
            }
          }
        }) + '\n');
        
        tokenIndex++;
        
        if (isLast) {
          // Send final metadata
          setTimeout(() => {
            res.write(JSON.stringify({
              result: {
                response: {
                  finalMetadata: {
                    followUpSuggestions: responseData.followUps || [
                      "Can you tell me more about this topic?",
                      "What are the key points I should remember?",
                      "How does this relate to other concepts?"
                    ],
                    feedbackLabels: ["helpful", "accurate", "clear"],
                    toolsUsed: {}
                  },
                  modelResponse: {
                    responseId: responseId,
                    message: chunks.join(''),
                    sender: "assistant",
                    createTime: new Date().toISOString(),
                    parentResponseId: userResponseId,
                    manual: false,
                    partial: false,
                    shared: false,
                    query: message,
                    queryType: "text",
                    webSearchResults: responseData.hasWebSearch ? [
                      {
                        title: "Mock Search Result",
                        url: "https://example.com/mock-result",
                        snippet: "This is a mock web search result for testing purposes."
                      }
                    ] : [],
                    xpostIds: [],
                    xposts: [],
                    generatedImageUrls: responseData.hasImages ? [
                      "https://example.com/mock-generated-image.jpg"
                    ] : [],
                    imageAttachments: [],
                    fileAttachments: fileAttachments,
                    cardAttachmentsJson: [],
                    fileUris: [],
                    fileAttachmentsMetadata: [],
                    isControl: false,
                    steps: [],
                    mediaTypes: []
                  }
                }
              }
            }) + '\n');
            
            // Send title update
            res.write(JSON.stringify({
              result: {
                title: {
                  newTitle: `Mock: ${message.substring(0, 50)}${message.length > 50 ? '...' : ''}`
                }
              }
            }) + '\n');
            
            res.end();
          }, 100);
        } else {
          setTimeout(streamTokens, 50 + Math.random() * 100); // Simulate realistic timing
        }
      }
    };
    
    setTimeout(streamTokens, 200); // Initial delay
  }
});

// Mock endpoint for continuing conversations
app.post('/rest/app-chat/conversations/:conversationId/responses', (req: Request, res: Response) => {
  const { conversationId } = req.params;
  const { message, parentResponseId, fileAttachments = [] } = req.body;
  
  console.log(`Mock: Continue conversation ${conversationId} - Message: "${message}"`);
  
  const responseId = `resp_${responseCounter++}`;
  const userResponseId = `user_${responseCounter++}`;
  
  // Check if request has file attachments
  const hasFileAttachments = fileAttachments && fileAttachments.length > 0;
  const { chunks, responseData, isImageGeneration } = generateStreamingResponse(message, hasFileAttachments);
  
  // Send response as streaming JSON lines
  res.writeHead(200, {
    'Content-Type': 'application/json',
    'Transfer-Encoding': 'chunked',
    'Access-Control-Allow-Origin': '*'
  });
  
  // Send user response confirmation
  res.write(JSON.stringify({
    result: {
      userResponse: {
        responseId: userResponseId,
        message,
        sender: "user",
        createTime: new Date().toISOString(),
        parentResponseId: parentResponseId || "",
        manual: true,
        partial: false,
        shared: false,
        query: message,
        queryType: "text",
        fileAttachments: fileAttachments
      }
    }
  }) + '\n');
  
  if (isImageGeneration) {
    // Send image generation sequence
    const imageSequence = generateImageGenerationSequence(message, responseId, userResponseId);
    let sequenceIndex = 0;
    
    const streamImageSequence = () => {
      if (sequenceIndex < imageSequence.length) {
        res.write(JSON.stringify(imageSequence[sequenceIndex]) + '\n');
        sequenceIndex++;
        setTimeout(streamImageSequence, 800); // Longer delays for image generation
      } else {
        // Send final response token
        res.write(JSON.stringify({
          result: {
            response: {
              token: chunks[0],
              isThinking: false,
              isSoftStop: false,
              responseId: responseId
            }
          }
        }) + '\n');
        
        // Send final metadata with special follow-up format
        setTimeout(() => {
          res.write(JSON.stringify({
            result: {
              response: {
                finalMetadata: {
                  followUpSuggestions: responseData.followUps,
                  feedbackLabels: ["helpful", "accurate", "clear"],
                  toolsUsed: {}
                },
                modelResponse: {
                  responseId: responseId,
                  message: chunks.join(''),
                  sender: "assistant",
                  createTime: new Date().toISOString(),
                  parentResponseId: userResponseId,
                  manual: false,
                  partial: false,
                  shared: false,
                  query: message,
                  queryType: "text",
                  webSearchResults: [],
                  xpostIds: [],
                  xposts: [],
                  generatedImageUrls: [
                    `https://example.com/generated-images/img_${Date.now()}.jpg`
                  ],
                  imageAttachments: [],
                  fileAttachments: fileAttachments,
                  cardAttachmentsJson: [],
                  fileUris: [],
                  fileAttachmentsMetadata: [],
                  isControl: false,
                  steps: [],
                  mediaTypes: []
                }
              }
            }
          }) + '\n');
          
          res.end();
        }, 100);
      }
    };
    
    setTimeout(streamImageSequence, 500);
  } else {
    // Stream response tokens normally
    let tokenIndex = 0;
    const streamTokens = () => {
      if (tokenIndex < chunks.length) {
        const isLast = tokenIndex === chunks.length - 1;
        
        res.write(JSON.stringify({
          result: {
            response: {
              token: chunks[tokenIndex],
              isThinking: false,
              isSoftStop: false,
              responseId: responseId
            }
          }
        }) + '\n');
        
        tokenIndex++;
        
        if (isLast) {
          // Send final metadata
          setTimeout(() => {
            res.write(JSON.stringify({
              result: {
                response: {
                  finalMetadata: {
                    followUpSuggestions: responseData.followUps || [
                      "What else would you like to know?",
                      "Can you elaborate on that?",
                      "Are there any related topics?"
                    ],
                    feedbackLabels: ["helpful", "accurate", "clear"],
                    toolsUsed: {}
                  },
                  modelResponse: {
                    responseId: responseId,
                    message: chunks.join(''),
                    sender: "assistant",
                    createTime: new Date().toISOString(),
                    parentResponseId: userResponseId,
                    manual: false,
                    partial: false,
                    shared: false,
                    query: message,
                    queryType: "text",
                    webSearchResults: responseData.hasWebSearch ? [
                      {
                        title: "Mock Search Result",
                        url: "https://example.com/mock-result",
                        snippet: "This is a mock web search result for testing purposes."
                      }
                    ] : [],
                    xpostIds: [],
                    xposts: [],
                    generatedImageUrls: responseData.hasImages ? [
                      "https://example.com/mock-generated-image.jpg"
                    ] : [],
                    imageAttachments: [],
                    fileAttachments: fileAttachments,
                    cardAttachmentsJson: [],
                    fileUris: [],
                    fileAttachmentsMetadata: [],
                    isControl: false,
                    steps: [],
                    mediaTypes: []
                  }
                }
              }
            }) + '\n');
            
            res.end();
          }, 100);
        } else {
          setTimeout(streamTokens, 50 + Math.random() * 100);
        }
      }
    };
    
    setTimeout(streamTokens, 200);
  }
});

// Mock file upload endpoint
app.post('/rest/app-chat/upload-file', (req: Request, res: Response) => {
  const { fileName, fileMimeType, content } = req.body;
  
  console.log(`Mock: File upload - ${fileName} (${fileMimeType})`);
  
  // Generate a mock file metadata response
  const fileMetadataId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  const userId = 'mock-user-id';
  
  const fileMetadata = {
    fileMetadataId,
    fileMimeType,
    fileName,
    fileUri: `users/${userId}/${fileMetadataId}/content`,
    parsedFileUri: "",
    createTime: new Date().toISOString(),
    fileSource: "SELF_UPLOAD_FILE_SOURCE"
  };
  
  // Store the file data
  uploadedFiles.set(fileMetadataId, {
    ...fileMetadata,
    content
  });
  
  res.json(fileMetadata);
});

// Health check endpoint
app.get('/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', message: 'Mock Grok API server is running' });
});

// Start server
app.listen(PORT, () => {
  console.log(`Mock Grok API server running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/health`);
  console.log('Endpoints:');
  console.log(`  POST http://localhost:${PORT}/rest/app-chat/conversations/new`);
  console.log(`  POST http://localhost:${PORT}/rest/app-chat/conversations/:id/responses`);
  console.log(`  POST http://localhost:${PORT}/rest/app-chat/upload-file`);
});

export default app;