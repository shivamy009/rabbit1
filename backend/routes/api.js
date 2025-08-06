const express = require('express');
const router = express.Router();
const { verifyWebhook, handleWebhook, getConversations, getMessages, sendMessage, updateMessageStatus } = require('../controllers/webhookController');

module.exports = (io) => {
  // API Documentation
  router.get('/', (req, res) => {
    res.json({
      name: 'WhatsApp Webhook API',
      version: '1.0.0',
      endpoints: {
        'GET /api/': 'API documentation',
        'GET /api/webhook': 'WhatsApp webhook verification',
        'POST /api/webhook': 'WhatsApp webhook endpoint',
        'GET /api/conversations': 'Get all conversations',
        'GET /api/messages/:wa_id': 'Get messages for a conversation',
        'POST /api/messages': 'Send a new message',
        'PUT /api/messages/:msg_id': 'Update message status'
      },
      websocket: {
        events: {
          'newMessage': 'Emitted when a new message is received',
          'statusUpdate': 'Emitted when message status changes'
        }
      }
    });
  });

  // WhatsApp webhook routes (separate GET for verification and POST for messages)
  router.get('/webhook', verifyWebhook);
  router.post('/webhook', (req, res) => handleWebhook(req, res, io));
  
  // API routes for frontend
  router.get('/conversations', getConversations);
  router.get('/messages/:wa_id', getMessages);
  router.post('/messages', (req, res) => sendMessage(req, res, io));
  router.put('/messages/:msg_id', (req, res) => updateMessageStatus(req, res, io));
  
  return router;
};