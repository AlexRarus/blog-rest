import express from 'express';
import { Post, Like, Dislike } from 'src/db/models';
import { updatePost, updatePosts, removePost } from './utils';
import { removeEmptyFields } from '../utils.js';
import { validate } from 'src/app/utils.js';
import mongoose from "mongoose";

const router = express.Router();

router.get('/api/posts/', async (req, res) => {
  const { query = {}, user } = req;
  const { authorId, offset = 0, offsetStep = 5, search, sort } = query;

  try {
    const filter = {};

    // если есть автор, то достаем его настройки
    if (authorId) {
      filter.authorId = authorId;
    }

    const sortParams = {};
    switch (sort) {
      case 'best':
        sortParams.rating = -1;
        break;
      case 'popular':
        sortParams.viewsCount = -1;
        break;
      case 'new':
      default:
        sortParams.date = -1;
        break;
    }

    const posts = await Post.find(filter)
      .filterBySubstring(search)
      .sort(sortParams)
      .skip(parseInt(offset, 10))
      .limit(parseInt(offsetStep, 10));

    res.send(await updatePosts(posts, user));
  } catch (error) {
    console.log(error); // eslint-disable-line
    res.status(500).json(null);
  }
});

router.get('/api/posts/favourite/', async (req, res) => {
  const { query, user } = req;
  const { offset = 0, offsetStep = 5, search } = query;

  if (!user) {
    res.status(403).json({ error: 'not authorized' });
  }

  try {
    const likesOfPosts = await Like.find({ entityType: 'post', authorId: user.id });
    const likesOfPostsExists = Boolean(likesOfPosts.length);
    const likesOfPostsIds = likesOfPosts.map(like => mongoose.Types.ObjectId(like.entityId));
    const posts = likesOfPostsExists
      ? await Post.find({
        id: {
          $in: likesOfPostsIds
        }
      })
        .filterBySubstring(search)
        .sort({ date: -1 })
        .skip(parseInt(offset, 10))
        .limit(parseInt(offsetStep, 10))
      : [];

    res.send(await updatePosts(posts, user));
  } catch (error) {
    console.log(error); // eslint-disable-line
    res.status(500).json(null);
  }
});

router.get('/api/posts/:id', async (req, res) => {
  const { params: { id }, user } = req;
  const filter = { id };
  const opts = { strict: false };

  try {
    const prevPost = await Post.findOne(filter);
    const { viewsCount } = prevPost.toObject();

    const post = await Post.findOneAndUpdate({ id }, { viewsCount: viewsCount + 1 }, opts);

    res.send(await updatePost(post, user));
  } catch (error) {
    // пост не найден
    res.status(404).json(null);
  }
});

router.post('/api/posts/', async (req, res) => {
  const { body, user } = req;

  let data = {
    title: body.title, // maxLength
    content: body.content, // maxLength
    authorId: user.id, // isRequired
  };

  const constraints = {
    title: { maxLength: 200 },
    content: { maxLength: 10000 },
    authorId: { isRequired: true },
  };

  try {
    await validate(data, constraints, res);
  } catch (validateError) {
    return;
  }

  data = removeEmptyFields(data);

  try {
    const post = new Post(data);
    const createdPost = await Post.create(post);
    res.send(await updatePost(createdPost, user));
  } catch (error) {
    console.log(error); // eslint-disable-line
    res.status(500).json(null);
  }
});

router.put('/api/posts/:id', async (req, res) => {
  const { params: { id }, body, user } = req;

  try {
    const targetPost = await Post.findOne({ id }, { strict: false });

    const admin = user.role === 'admin';
    // нельзя изменять чужие посты
    if (user.id !== targetPost.authorId || !admin) {
      return res.status(403).json(null);
    }
  } catch (error) {
    return res.status(500).json(null);
  }

  const title = body.title;
  const content = body.content;

  let data = {
    title, // maxLength
    content, // maxLength
  };

  const constraints = {
    title: { maxLength: 200 },
    content: { maxLength: 1000 },
  };

  try {
    await validate(data, constraints, res);
  } catch (validateError) {
    return;
  }

  data = removeEmptyFields(data);

  try {
    const post = await Post.findOneAndUpdate({ id }, data, { strict: false });
    res.send(await updatePost(post, user));
  } catch (error) {
    console.log(error); // eslint-disable-line
    res.status(500).json(null);
  }
});

router.delete('/api/posts/:id', async (req, res) => {
  const { user, params: { id } } = req;

  // находим пост по id
  try {
    const post = await Post.findOne({ id });

    if (post.authorId !== user.id) {
      return res.status(403).json(null);
    }

    await removePost(post);
    res.send({ id, removed: 'success' });
  } catch (error) {
    console.log(error); // eslint-disable-line
    res.status(500).json(null);
  }
});

router.put('/api/posts/like/:id', async (req, res) => {
  const { params: { id }, user } = req;

  try {
    // находим нужный пост
    const post = await Post.findOne({ id });
    let { likesCount, rating } = post.toObject();
    const existsLike = await Like.findOne({ entityId: post.id, authorId: user.id });

    // добавляем или удаляем лайк из базы
    if (existsLike) {
      await Like.remove({ id: existsLike.id });
      likesCount -= 1;
      rating -= 1;
    } else {
      const like = new Like({ entityType: 'post', entityId: post.id, entityAuthorId: post.authorId, authorId: user.id });
      await Like.create(like);
      likesCount += 1;
      rating += 1;
    }

    await Post.update({ id }, { likesCount, rating }, { strict: false });
    const updatedPost = await Post.findOne({ id });

    res.send(await updatePost(updatedPost, user));
  } catch (error) {
    console.log(error); // eslint-disable-line
    res.status(500).json(null);
  }
});

router.put('/api/posts/dislike/:id', async (req, res) => {
  const { params: { id }, user } = req;

  try {
    // находим нужный пост
    const post = await Post.findOne({ id });
    let { dislikesCount, rating } = post.toObject();
    const existsDislike = await Dislike.findOne({ entityId: post.id, authorId: user.id });

    // добавляем или удаляем лайк из базы
    if (existsDislike) {
      await Dislike.remove({ id: existsDislike.id });
      dislikesCount -= 1;
      rating += 1;
    } else {
      const dislike = new Dislike({ entityType: 'post', entityId: post.id, entityAuthorId: post.authorId, authorId: user.id });
      await Dislike.create(dislike);
      dislikesCount += 1;
      rating -= 1;
    }

    await Post.update({ id }, { dislikesCount, rating }, { strict: false });
    const updatedPost = await Post.findOne({ id });

    res.send(await updatePost(updatedPost, user));
  } catch (error) {
    console.log(error); // eslint-disable-line
    res.status(500).json(null);
  }
});

export default router;
