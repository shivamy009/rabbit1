const connectDB = require('../config/db');

async function processPayload(data, io) {
  try {
    const collection = await connectDB();
    
    // Handle both custom payload format and standard WhatsApp webhook format
    let changes;
    
    // Check for standard WhatsApp webhook format
    if (data.entry && data.entry[0] && data.entry[0].changes) {
      changes = data.entry[0].changes[0];
    }
    // Check for custom payload format
    else if (data.metaData?.entry?.[0]?.changes?.[0]) {
      changes = data.metaData.entry[0].changes[0];
    }
    
    if (!changes) {
      console.log('No changes found in payload');
      return;
    }

    const value = changes.value;

    // Process incoming messages
    if (value.messages && value.messages.length > 0) {
      for (const message of value.messages) {
        await processIncomingMessage(message, value, data, collection, io);
      }
    }

    // Process status updates
    if (value.statuses && value.statuses.length > 0) {
      for (const status of value.statuses) {
        await processStatusUpdate(status, collection, io);
      }
    }
    
  } catch (error) {
    console.error('Error in processPayload:', error);
    throw error;
  }
}

async function processIncomingMessage(message, value, data, collection, io) {
  try {
    const contact = value.contacts ? value.contacts.find(c => c.wa_id === message.from) : null;
    
    const doc = {
      msg_id: message.id,
      conversation_id: value.conversation?.id || `conv-${message.from}`,
      gs_app_id: data.metaData?.gs_app_id || 'whatsapp-webhook',
      from: message.from,
      recipient_id: value.metadata?.display_phone_number || process.env.BUSINESS_PHONE_NUMBER,
      text: message.text?.body || message.text,
      type: message.type || 'text',
      status: 'delivered', // Incoming messages are delivered by default
      timestamp: parseInt(message.timestamp),
      contact_name: contact?.profile?.name || 'Unknown Contact',
      createdAt: data.createdAt ? new Date(data.createdAt) : new Date(),
      updatedAt: data.createdAt ? new Date(data.createdAt) : new Date(),
    };

    const result = await collection.updateOne(
      { msg_id: doc.msg_id },
      { $setOnInsert: doc },
      { upsert: true }
    );

    if (result.upsertedCount > 0) {
      console.log(`New message saved: ${doc.msg_id}`);
      // Emit new message to clients
      io.emit('newMessage', doc);
    }
    
  } catch (error) {
    console.error('Error processing incoming message:', error);
  }
}

async function processStatusUpdate(status, collection, io) {
  try {
    const updated = await collection.findOneAndUpdate(
      { msg_id: status.id },
      {
        $set: {
          status: status.status,
          updatedAt: new Date(status.timestamp * 1000),
        },
      },
      { returnDocument: 'after' }
    );

    if (updated.value) {
      console.log(`Status updated for message ${status.id}: ${status.status}`);
      // Emit status update to clients
      io.emit('statusUpdate', {
        msg_id: status.id,
        status: status.status,
        updatedAt: new Date(status.timestamp * 1000)
      });
    }
  } catch (error) {
    console.error('Error processing status update:', error);
  }
}

module.exports = processPayload;