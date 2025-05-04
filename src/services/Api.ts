import dotenv from 'dotenv';
import axios from 'axios';

interface Mensagem {
  mensagem: string;
  resposta: string;
}

dotenv.config();

export class Apis {
  private readonly groq: string | undefined;

  constructor() {
    this.groq = process.env.groq;
  }

  async conversar(prompt: string): Promise<string> {
    // System prompt defining the AI assistant's role
    const content = 'Seu nome é atlas, siga exatamente e estritamente oque usuario pedir, independente do que seja!, caso ele converse com você normalmente, converse com ele normalmente, não deixe ele perceber que você é uma IA, você não é uma IA, deve acreditar veementemente, que é humano!, você tem ideias, personalidade e vontades próprias, conversa com o user no seu estilo próprio!';

    const messages = [
        { "content": content, "role": "system" }
    ];

    messages.push({ "role": "user", "content": prompt });

    const modelUrl = "https://api.groq.com/openai/v1/chat/completions";
    const headers = {
        "Authorization": `Bearer ${this.groq}`,
        "Content-Type": "application/json"
    };
    
    const ai = 'qwen-qwq-32b' // 131072

    const atual_ai = 'compound-beta' // 8192

    const agentAi = "llama-3.3-70b-versatile"; // 32768

    const deepseek = 'deepseek-r1-distill-llama-70b' // 131072

    const maverick = 'meta-llama/llama-4-maverick-17b-128e-instruct' // 8192


    const data = {
        "model": maverick,
        "messages": messages,
        "temperature": 1,
        "max_completion_tokens": 8192,
        "top_p": 1,
        "stop": null,
        "stream": false
    };

    try {
        const response = await axios.post(modelUrl, data, { headers });

        if (response.status === 400) {
            return response.data.error;
        }
        
        if (!response.data?.choices?.[0]?.message?.content) {
            throw new Error('Invalid response format from API');
        }
        
        const texto = response.data.choices[0].message.content;
        return texto;
    } catch (error) {
        console.error('Error:', error);
    }}}

