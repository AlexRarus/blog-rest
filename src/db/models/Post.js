import mongoose from 'mongoose';
import autoIncrement from 'mongoose-auto-increment';
import connection from '../connection.js';

autoIncrement.initialize(connection);

const { Schema } = mongoose;

const PostModelSchema = new Schema({
  id: {
    type: Schema.ObjectId,
    default: mongoose.Types.ObjectId
  },
  title: {
    type: String
  },
  content: String,
  authorId: Schema.ObjectId,
  date: {
    type: Date,
    default: Date.now
  },
  views: {
    type: Array,
    default: []
  },
  viewsCount: { // поле нужно для сортировки
    type: Number,
    default: 0
  },
  likesCount: { // поле нужно для сортировки
    type: Number,
    default: 0
  },
  dislikesCount: { // поле нужно для сортировки
    type: Number,
    default: 0
  },
  rating: { // поле нужно для сортировки (разница между likesCount и dislikesCount)
    type: Number,
    default: 0
  },
});

PostModelSchema.plugin(autoIncrement.plugin, {
  model: 'PostModel',
  field: 'postNumber',
  startAt: 0,
  incrementBy: 1
});

// метод фильтрации коллекции по совпадению substring в свойствах content и title
PostModelSchema.query.filterBySubstring = function (substring) {
  return this.find({ $or: [{ content: new RegExp(substring, 'i') }, { title: new RegExp(substring, 'i') }] });
};

// Define a pre-save method for categorySchema
PostModelSchema.pre('save', function (next) {
  this.title = this.title || `post #${this.postNumber}`;
  next();
});

export default connection.model('PostModel', PostModelSchema);
