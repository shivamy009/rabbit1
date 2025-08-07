// Simple test to check if frontend can reach backend
console.log('🧪 Testing frontend connection to backend...');
console.log('API URL:', import.meta.env.VITE_API_URL);

// Test API connection
fetch(`${import.meta.env.VITE_API_URL}/api/conversations`)
  .then(response => {
    console.log('✅ API Response Status:', response.status);
    return response.json();
  })
  .then(data => {
    console.log('✅ Conversations data:', data);
    console.log(`📊 Found ${data.length} conversations`);
    
    if (data.length > 0) {
      // Test fetching messages for first conversation
      const firstConv = data[0];
      console.log(`🔍 Testing messages for ${firstConv.contact_name} (${firstConv.wa_id})`);
      
      return fetch(`${import.meta.env.VITE_API_URL}/api/messages/${firstConv.wa_id}`);
    }
  })
  .then(response => {
    if (response) {
      console.log('✅ Messages Response Status:', response.status);
      return response.json();
    }
  })
  .then(messages => {
    if (messages) {
      console.log('✅ Messages data:', messages);
      console.log(`📨 Found ${messages.length} messages`);
    }
  })
  .catch(error => {
    console.error('❌ API Error:', error);
  });
