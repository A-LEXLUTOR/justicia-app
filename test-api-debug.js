// Test de débogage de l'API
const testAPI = async () => {
  try {
    console.log('Testing API...');
    
    const response = await fetch('https://api.manus.im/api/llm-proxy/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer sk-iGPVRafgVXnXXrRALaVsRh',
      },
      body: JSON.stringify({
        model: 'gpt-4.1-mini',
        messages: [
          { role: 'user', content: 'Test simple' }
        ],
        temperature: 0.1,
        max_tokens: 50,
      }),
    });

    console.log('Response status:', response.status);
    console.log('Response headers:', Object.fromEntries(response.headers.entries()));
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Error response:', errorText);
      return;
    }

    const data = await response.json();
    console.log('Success! Response:', data);
    
  } catch (error) {
    console.error('Fetch error:', error);
  }
};

testAPI();
