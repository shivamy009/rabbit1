const connectDB = require('./config/db');

async function debugDatabase() {
  try {
    console.log('🔍 Debugging database content...');
    const collection = await connectDB();
    
    // Get all messages to see what's actually stored
    console.log('\n📋 All messages in database:');
    const allMessages = await collection.find({}).sort({ timestamp: 1 }).toArray();
    
    allMessages.forEach((msg, index) => {
      console.log(`\n${index + 1}. Message ID: ${msg.msg_id}`);
      console.log(`   From: ${msg.from}`);
      console.log(`   To (recipient_id): ${msg.recipient_id}`);
      console.log(`   Contact: ${msg.contact_name}`);
      console.log(`   Body: "${msg.body}"`);
      console.log(`   Timestamp: ${msg.timestamp}`);
      console.log(`   Status: ${msg.status}`);
    });
    
    console.log(`\n📊 Total messages: ${allMessages.length}`);
    
    // Check conversation grouping
    console.log('\n💬 Conversation grouping:');
    const conversations = await collection
      .aggregate([
        { $match: { from: { $ne: '918329446654' } } },
        { $group: { 
          _id: { wa_id: '$from', contact_name: '$contact_name' },
          messages: { $push: '$$ROOT' },
          messageCount: { $sum: 1 },
          lastMessage: { $last: '$$ROOT' }
        }},
        { $project: { 
          wa_id: '$_id.wa_id',
          contact_name: '$_id.contact_name',
          messageCount: '$messageCount',
          messages: '$messages',
          lastMessageTime: '$lastMessage.timestamp',
          _id: 0
        }},
        { $sort: { lastMessageTime: -1 } }
      ])
      .toArray();
    
    conversations.forEach((conv, index) => {
      console.log(`\n${index + 1}. ${conv.contact_name} (${conv.wa_id})`);
      console.log(`   Messages: ${conv.messageCount}`);
      conv.messages.forEach((msg, msgIndex) => {
        console.log(`   ${msgIndex + 1}. "${msg.body}" [${msg.msg_id}]`);
      });
    });
    
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

debugDatabase();
