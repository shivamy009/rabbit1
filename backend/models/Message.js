const messageSchema = {
  msg_id: String,
  conversation_id: String,
  gs_app_id: String,
  from: String,
  recipient_id: String,
  text: String,
  type: String,
  status: String,
  timestamp: Number,
  contact_name: String,
  createdAt: Date,
  updatedAt: Date,
};

module.exports = messageSchema;