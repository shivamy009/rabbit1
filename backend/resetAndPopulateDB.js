const fs = require('fs');
const path = require('path');
const connectDB = require('./config/db');
const processPayload = require('./utils/processPayload');

async function resetAndPopulateDatabase() {
  console.log('🧹 Starting database reset and population with sample payloads...');
  
  // Mock io object for the processPayload function
  const mockIo = {
    emit: (event, data) => {
      console.log(`📡 Would emit ${event}:`, data?.msg_id || data?.contact_name || 'data');
    }
  };
  
  try {
    // Connect to database
    console.log('🔌 Connecting to MongoDB...');
    const collection = await connectDB();
    console.log('✅ Connected to database');
    
    // STEP 1: Clear existing data
    console.log('🧹 Clearing existing messages...');
    const deleteResult = await collection.deleteMany({});
    console.log(`🗑️ Deleted ${deleteResult.deletedCount} existing messages`);
    
    // STEP 2: Process sample payload files in correct order
    const payloadFiles = [
      'conversation_1_message_1.json',
      'conversation_1_message_2.json', 
      'conversation_1_status_1.json',
      'conversation_1_status_2.json',
      'conversation_2_message_1.json',
      'conversation_2_message_2.json',
      'conversation_2_status_1.json',
      'conversation_2_status_2.json'
    ];
    
    console.log(`📄 Processing ${payloadFiles.length} sample payload files...`);
    
    // Check if payloads directory exists
    const payloadsDir = path.join(__dirname, '..', 'payloads');
    if (!fs.existsSync(payloadsDir)) {
      console.error('❌ Payloads directory not found. Please ensure payloads/ directory exists with sample files');
      process.exit(1);
    }
    
    // Process each payload file in order
    for (const file of payloadFiles) {
      const filePath = path.join(payloadsDir, file);
      
      if (!fs.existsSync(filePath)) {
        console.warn(`⚠️ File not found: ${file} - skipping`);
        continue;
      }
      
      const payload = JSON.parse(fs.readFileSync(filePath, 'utf8'));
      
      console.log(`📤 Processing ${file}...`);
      
      try {
        await processPayload(payload, mockIo);
        console.log(`✅ ${file} processed successfully`);
        
        // Small delay to ensure proper ordering
        await new Promise(resolve => setTimeout(resolve, 100));
      } catch (error) {
        console.error(`❌ Error processing ${file}:`, error.message);
      }
    }
    
    // STEP 3: Verify the results
    console.log('\n🔍 Verifying inserted data...');
    
    // Get unique conversations
    const conversations = await collection
      .aggregate([
        { $match: { from: { $ne: '918329446654' } } },
        { $group: { 
          _id: { wa_id: '$from', contact_name: '$contact_name' },
          lastMessage: { $last: '$$ROOT' },
          messageCount: { $sum: 1 }
        }},
        { $project: { 
          wa_id: '$_id.wa_id',
          contact_name: '$_id.contact_name',
          messageCount: '$messageCount',
          lastMessageTime: '$lastMessage.timestamp',
          _id: 0
        }},
        { $sort: { lastMessageTime: -1 } }
      ])
      .toArray();
    
    console.log(`💬 Conversations created: ${conversations.length}`);
    
    conversations.forEach((conv, index) => {
      console.log(`   ${index + 1}. ${conv.contact_name} (${conv.wa_id}) - ${conv.messageCount} messages`);
    });
    
    // Get total messages
    const messageCount = await collection.countDocuments();
    console.log(`📨 Total messages in database: ${messageCount}`);
    
    // Show sample messages for verification
    console.log('\n📋 Sample messages:');
    const sampleMessages = await collection
      .find({})
      .sort({ timestamp: 1 })
      .limit(4)
      .toArray();
    
    sampleMessages.forEach((msg, index) => {
      console.log(`   ${index + 1}. [${msg.contact_name}]: ${msg.body?.substring(0, 50)}${msg.body?.length > 50 ? '...' : ''}`);
    });
    
    console.log('\n🎉 Database reset and population completed successfully!');
    console.log('🌐 Your production app should now show the sample conversations');
    console.log('\nExpected conversations:');
    console.log('1. Ravi Kumar (919937320320) - 2 messages');
    console.log('2. Neha Joshi (929967673820) - 2 messages');
    
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Error during database reset:', error);
    process.exit(1);
  }
}

// Run the reset script
resetAndPopulateDatabase();
