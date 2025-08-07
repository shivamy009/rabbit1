const connectDB = require('./config/db');

async function testGetMessages() {
  try {
    console.log('🧪 Testing getMessages function...');
    const collection = await connectDB();
    
    // Test for Ravi Kumar conversation
    console.log('\n📞 Testing Ravi Kumar conversation (919937320320):');
    const raviMessages = await collection
      .find({ 
        $or: [
          { from: '919937320320' },        // Messages Ravi sent to business
          { recipient_id: '919937320320' } // Messages business sent to Ravi
        ]
      })
      .sort({ timestamp: 1 })
      .toArray();
      
    console.log(`Found ${raviMessages.length} messages for Ravi:`);
    raviMessages.forEach((msg, index) => {
      console.log(`   ${index + 1}. [${msg.from}]: "${msg.body}"`);
    });
    
    // Test for Neha Joshi conversation
    console.log('\n📞 Testing Neha Joshi conversation (929967673820):');
    const nehaMessages = await collection
      .find({ 
        $or: [
          { from: '929967673820' },        // Messages Neha sent to business
          { recipient_id: '929967673820' } // Messages business sent to Neha
        ]
      })
      .sort({ timestamp: 1 })
      .toArray();
      
    console.log(`Found ${nehaMessages.length} messages for Neha:`);
    nehaMessages.forEach((msg, index) => {
      console.log(`   ${index + 1}. [${msg.from}]: "${msg.body}"`);
    });
    
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

testGetMessages();
