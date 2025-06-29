
export const makeGroqRequest = async (messages: any[], apiKey: string, includeImage = false) => {
  console.log('Making Groq API request with messages:', messages);
  
  if (!apiKey.trim()) {
    throw new Error('API key is required');
  }

  const requestBody: any = {
    model: 'meta-llama/llama-4-scout-17b-16e-instruct',
    messages: messages,
    temperature: 0.8,
    max_completion_tokens: 2000,
  };

  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(requestBody),
  });

  console.log('Groq API response status:', response.status);
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    console.error('Groq API error:', errorData);
    
    if (response.status === 401) {
      throw new Error('Invalid API key. Please check your Groq API key.');
    } else if (response.status === 400 && errorData?.error?.message?.includes('decommissioned')) {
      throw new Error('Model is no longer supported. Please try again.');
    } else {
      throw new Error(errorData?.error?.message || `API request failed: ${response.statusText}`);
    }
  }

  const data = await response.json();
  console.log('Groq API response data:', data);
  
  if (!data.choices || !data.choices[0] || !data.choices[0].message) {
    throw new Error('Invalid response format from API');
  }

  return data.choices[0].message.content;
};
