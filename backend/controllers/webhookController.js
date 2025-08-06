const processPayload = require('../utils/processPayload');
const connectDB = require('../config/db');

// Handle webhook verification (GET request)
async function verifyWebhook(req, res) {
  try {
    const mode = req.query['hub.mode'];
    const token = req.query['hub.verify_token'];
    const challenge = req.query['hub.challenge'];
    
    const VERIFY_TOKEN = process.env.WEBHOOK_VERIFY_TOKEN || 'your_verify_token';
    
    console.log('Webhook verification attempt:', { mode, token, challenge });
    
    if (mode === 'subscribe' && token === VERIFY_TOKEN) {
      console.log('Webhook verified successfully');
      return res.status(200).send(challenge);
    } else {
      console.log('Webhook verification failed');
      return res.status(403).send('Forbidden');
    }
  } catch (error) {
    console.error('Error in webhook verification:', error);
    res.status(500).json({ error: 'Verification error', details: error.message });
  }
}

// Handle webhook messages (POST request)
async function handleWebhook(req, res, io) {
  try {
    console.log('Received webhook payload:', JSON.stringify(req.body, null, 2));
    
    // Handle incoming messages (POST request)
    await processPayload(req.body, io);
    res.status(200).json({ message: 'Payload processed successfully' });
  } catch (error) {
    console.error('Error processing webhook payload:', error);
    res.status(500).json({ error: 'Error processing payload', details: error.message });
  }
}

async function getConversations(req, res) {
  try {
    console.log('Getting conversations...');
    const collection = await connectDB();
    
    // This MongoDB aggregation does the following:
    // 1. Filter: Only get messages FROM customers (not messages you sent)
    // 2. Group: Group messages by customer phone number and name
    // 3. Sort: Show most recent conversations first
    
    const conversations = await collection
      .aggregate([
        // Step 1: Filter out messages sent by the business (918329446654)
        // Only keep messages where 'from' is NOT your business number
        { $match: { from: { $ne: '918329446654' } } },
        
        // Step 2: Group by customer phone number and name
        // This creates one conversation per unique customer
        { $group: { 
          _id: { wa_id: '$from', contact_name: '$contact_name' },
          lastMessage: { $last: '$$ROOT' }  // Keep the last message for sorting
        }},
        
        // Step 3: Format the output data
        { $project: { 
          wa_id: '$_id.wa_id',           // Customer's phone number
          contact_name: '$_id.contact_name', // Customer's name
          lastMessageTime: '$lastMessage.timestamp',
          _id: 0  // Don't include MongoDB's _id field
        }},
        
        // Step 4: Sort by most recent message first
        { $sort: { lastMessageTime: -1 } }
      ])
      .toArray();
      
    console.log('Found conversations:', conversations.length);
    console.log('Conversations:', conversations);
    res.json(conversations);
  } catch (error) {
    console.error('Error in getConversations:', error);
    res.status(500).json({ error: 'Error fetching conversations', details: error.message });
  }
}

async function getMessages(req, res) {
  try {
    const collection = await connectDB();
    
    // This finds ALL messages for a specific conversation
    // It looks for messages where:
    // - Customer sent TO you: { from: customer_phone }
    // - You sent TO customer: { recipient_id: customer_phone }
    
    const messages = await collection
      .find({ 
        $or: [
          { from: req.params.wa_id },        // Messages customer sent to you
          { recipient_id: req.params.wa_id } // Messages you sent to customer
        ]
      })
      .sort({ timestamp: 1 })  // Sort by time (oldest first)
      .toArray();
      
    console.log(`Found ${messages.length} messages for ${req.params.wa_id}`);
    res.json(messages);
  } catch (error) {
    console.error('Error in getMessages:', error);
    res.status(500).json({ error: 'Error fetching messages' });
  }
}

async function sendMessage(req, res, io) {
  try {
    const collection = await connectDB();
    const message = req.body;
    await collection.insertOne(message);

    // Emit new message to clients
    io.emit('newMessage', message);
    res.status(201).json({ message: 'Message saved' });
  } catch (error) {
    res.status(500).json({ error: 'Error sending message' });
  }
}

async function updateMessageStatus(req, res, io) {
  try {
    const collection = await connectDB();
    const { msg_id } = req.params;
    const { status } = req.body;
    
    console.log(`Updating message ${msg_id} status to: ${status}`);
    
    const updated = await collection.findOneAndUpdate(
      { msg_id: msg_id },
      { 
        $set: { 
          status: status,
          updatedAt: new Date()
        }
      },
      { returnDocument: 'after' }
    );

    if (updated.value) {
      // Emit status update to all connected clients
      io.emit('statusUpdate', {
        msg_id: msg_id,
        status: status,
        updatedAt: new Date()
      });
      
      res.status(200).json({ 
        message: 'Status updated', 
        updatedMessage: updated.value 
      });
    } else {
      res.status(404).json({ error: 'Message not found' });
    }
  } catch (error) {
    console.error('Error updating message status:', error);
    res.status(500).json({ error: 'Error updating message status' });
  }
}

module.exports = { verifyWebhook, handleWebhook, getConversations, getMessages, sendMessage, updateMessageStatus };