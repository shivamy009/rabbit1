const axios = require('axios');
const fs = require('fs');
const path = require('path');

async function populateDatabase() {
  const API_URL = 'http://localhost:3000';
  const payloadsDir = path.join(__dirname, '..', 'payloads');
  
  console.log('🚀 Starting database population...');
  console.log('📁 Reading payloads from:', payloadsDir);
  
  try {
    // Read all JSON files from payloads directory
    const files = fs.readdirSync(payloadsDir).filter(file => file.endsWith('.json'));
    console.log(`📄 Found ${files.length} payload files`);
    
    // Process each payload file
    for (const file of files) {
      const filePath = path.join(payloadsDir, file);
      const payload = JSON.parse(fs.readFileSync(filePath, 'utf8'));
      
      console.log(`📤 Processing ${file}...`);
      
      try {
        const response = await axios.post(`${API_URL}/api/webhook`, payload, {
          headers: { 'Content-Type': 'application/json' }
        });
        
        if (response.status === 200) {
          console.log(`✅ ${file} processed successfully`);
        } else {
          console.log(`⚠️ ${file} processed with status: ${response.status}`);
        }
      } catch (error) {
        console.error(`❌ Error processing ${file}:`, error.response?.data || error.message);
      }
      
      // Small delay between requests
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    // Check results
    console.log('\n🔍 Checking populated data...');
    
    const conversationsResponse = await axios.get(`${API_URL}/api/conversations`);
    console.log(`💬 Conversations created: ${conversationsResponse.data.length}`);
    
    conversationsResponse.data.forEach((conv, index) => {
      console.log(`   ${index + 1}. ${conv.contact_name} (${conv.wa_id})`);
    });
    
    console.log('\n🎉 Database population completed!');
    console.log('🌐 You should now see conversations in your frontend UI');
    
  } catch (error) {
    console.error('❌ Error during population:', error.message);
  }
}

// Run the population script
populateDatabase();
