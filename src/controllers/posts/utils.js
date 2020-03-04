import { Post, User, Like, Dislike } from 'src/db/models';
import ClientPost from './ClientPost';

async function updatePost(post) {
  const author = await User.findOne({ id: post.authorId });
  const likes = await Like.find({ entityId: post.id });
  const dislikes = await Dislike.find({ entityId: post.id });

  return new ClientPost(post, author, likes, dislikes);
}

async function updatePosts(posts) {
  return await Promise.all(posts.map(updatePost));
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
