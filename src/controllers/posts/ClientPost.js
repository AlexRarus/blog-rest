import ClientUser from '../user/ClientUser';

export default class ClientPost {
  constructor(post, author, commentsCount, likes, dislikes) {
    const objectPost = post.toObject();
    const normalizeAuthor = new ClientUser(author);

    return {
      ...objectPost,
      author: objectPost.anonymous ? null : normalizeAuthor,
      commentsCount,
      likes,
      dislikes
    };
  }
};
