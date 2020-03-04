import { Post, Like, Dislike } from 'src/db/models';
import ClientUser from './ClientUser';

async function getTargetUser(user) {
  const posts = await Post.find({ authorId: user.id });
  const likes = await Like.find({ authorId: user.id });
  const dislikes = await Dislike.find({ authorId: user.id });

  return new ClientUser(user, posts, likes, dislikes);
}

export { getTargetUser };
