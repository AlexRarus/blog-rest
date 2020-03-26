import ClientUser from '../user/ClientUser';

export default class ClientPost {
  constructor(post, author, relatedLikes, relatedDislikes) {
    const objectPost = post.toObject();
    const normalizeAuthor = new ClientUser(author);

    return {
      ...objectPost,
      author: normalizeAuthor,
      relatedLikes: relatedLikes.map(like => like.authorId),
      relatedDislikes: relatedDislikes.map(dislike => dislike.authorId),
    };
  }
};
