const fs = require('fs');
const path = require('path');
const connectDB = require('./config/db');
const processPayload = require('./utils/processPayload');

async function populateDatabase() {
  console.log('🚀 Starting database population...');
  
  // Mock io object for the processPayload function
  const mockIo = {
    emit: (event, data) => {
      console.log(`📡 Would emit ${event}:`, data?.msg_id || data?.contact_name || 'data');
    }
  };
  
  try {
    // Connect to database
    console.log('🔌 Connecting to MongoDB...');
    await connectDB();
    console.log('✅ Connected to database');
    
    const payloadsDir = path.join(__dirname, '..', 'payloads');
    const files = fs.readdirSync(payloadsDir).filter(file => file.endsWith('.json'));
    
    console.log(`📄 Found ${files.length} payload files`);
    
    // Process each payload file
    for (const file of files) {
      const filePath = path.join(payloadsDir, file);
      const payload = JSON.parse(fs.readFileSync(filePath, 'utf8'));
      
      console.log(`📤 Processing ${file}...`);
      
      try {
        await processPayload(payload, mockIo);
        console.log(`✅ ${file} processed successfully`);
      } catch (error) {
        console.error(`❌ Error processing ${file}:`, error.message);
      }
    }
    
    // Check results
    console.log('\n🔍 Checking populated data...');
    const collection = await connectDB();
    
    // Get unique conversations
    const conversations = await collection
      .aggregate([
        { $match: { from: { $ne: '918329446654' } } },
        { $group: { 
          _id: { wa_id: '$from', contact_name: '$contact_name' },
          lastMessage: { $last: '$$ROOT' }
        }},
        { $project: { 
          wa_id: '$_id.wa_id',
          contact_name: '$_id.contact_name',
          lastMessageTime: '$lastMessage.timestamp',
          _id: 0
        }},
        { $sort: { lastMessageTime: -1 } }
      ])
      .toArray();
    
    console.log(`💬 Conversations created: ${conversations.length}`);
    
    conversations.forEach((conv, index) => {
      console.log(`   ${index + 1}. ${conv.contact_name} (${conv.wa_id})`);
    });
    
    // Get total messages
    const messageCount = await collection.countDocuments();
    console.log(`📨 Total messages: ${messageCount}`);
    
    console.log('\n🎉 Database population completed!');
    console.log('🌐 Refresh your frontend to see the conversations');
    
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Error during population:', error);
    process.exit(1);
  }
}

// Run the population script
populateDatabase();
