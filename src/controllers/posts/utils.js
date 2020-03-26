import { Post, User, Like, Dislike } from 'src/db/models';
import ClientPost from './ClientPost';

async function updatePost(post, user) {
  const author = await User.findOne({ id: post.authorId });
  const relatedLikes = user ? await Like.find({ entityId: post.id, authorId: user.id }) : [];
  const relatedDislikes = user ? await Dislike.find({ entityId: post.id, authorId: user.id }) : [];

  return new ClientPost(post, author, relatedLikes, relatedDislikes);
}

async function updatePosts(posts, user) {
  return await Promise.all(posts.map(post => updatePost(post, user)));
}

async function removePost(post) {
  // удаляем все лайки поста
  const likes = await Like.find({ entityId: post.id });
  const likesIds = likes.map(like => like.id);
  await Like.remove({ id: { $in: likesIds.map(likeId => likeId) } });

  // удаляем все диз-лайки поста
  const dislikes = await Dislike.find({ entityId: post.id });
  const dislikesIds = dislikes.map(like => like.id);
  await Dislike.remove({ id: { $in: dislikesIds.map(dislikeId => dislikeId) } });

  // удаляем пост
  await Post.remove({ id: post.id });
}

export { updatePost,updatePosts, removePost };
