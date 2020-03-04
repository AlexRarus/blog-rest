import mongoose from 'mongoose';
import connection from '../connection.js';

const { Schema } = mongoose;

const UserModelSchema = new Schema({
  id: {
    type: Schema.ObjectId,
    default: mongoose.Types.ObjectId
  },
  login: {
    type: String,
    unique: true
  },
  password: {
    type: String
  },
  email: {
    type: String,
    unique: true
  },
  admin: {
    type: Boolean,
    default: false
  },
  role: {
    type: String,
    default: 'user'
  },
  firstName: {
    type: String,
    default: ''
  },
  lastName: {
    type: String,
    default: ''
  },
  patronymic: {
    type: String,
    default: ''
  },
  avatar: {
    type: String,
    default: ''
  },
  birthday: {
    type: Date
  },
  registrationDate: {
    type: Date,
    default: Date.now
  },
  vkontakteId: {
    type: String
  },
  facebookId: {
    type: String
  },
  instagramId: {
    type: String
  }
});

export default connection.model('UserModel', UserModelSchema);
