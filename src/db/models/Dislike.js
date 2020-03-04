import mongoose from 'mongoose';
import connection from '../connection.js';

const { Schema } = mongoose;

const DislikeModelSchema = new Schema({
  id: {
    type: Schema.ObjectId,
    default: mongoose.Types.ObjectId
  },
  authorId: {
    type: Schema.ObjectId,
    required: true
  },
  entityAuthorId: {
    type: Schema.ObjectId,
    required: true
  },
  entityId: {
    type: Schema.ObjectId,
    required: true
  },
  entityType: {
    type: String,
    required: true
  }
});

export default connection.model('Dislike', DislikeModelSchema);
