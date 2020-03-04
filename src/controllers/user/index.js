import express from 'express';
import moment from 'moment';
import momentDurationFormatSetup from 'moment-duration-format';
import mongoose from 'mongoose';
import { User } from'src/db/models';
import CONSTANTS from 'src/constants.js';
import ClientUser from './ClientUser';
import { getPasswordHash, validate } from 'src/app/utils';
import { removeEmptyFields, mapValuesToRegExp, removeImage, createUser } from '../utils.js';
import { getTargetUser } from './utils.js';

const router = express.Router();

momentDurationFormatSetup(moment);


router.post('/api/users/signup/', async (req, res) => {
  const body = {
    login: req.body.login,
    email: req.body.login,
    firstName: req.body.firstName,
    lastName: req.body.lastName,
    password: req.body.password,
    registrationDate: new Date()
  };

  const constraints = {
    login: { unique: User, isRequired: true, maxLength: 100 },
    email: { isRequired: true, maxLength: 100 },
    firstName: { isRequired: true, maxLength: 100 },
    lastName: { maxLength: 100 },
    password: { isRequired: true, maxLength: 100 }
  };

  try {
    await validate(body, constraints, res);
  } catch (validateError) {
    return;
  }

  try {
    const user = await createUser(body);

    // логинимся  // passportJS method
    req.login(user, (err) => {
      if (err) {
        console.log(err); // eslint-disable-line
        res.status(505).json(null);
      }
      res.send(new ClientUser(user));
    });
  } catch (error) {
    console.log(error); // eslint-disable-line
    res.status(400).json({ error });
  }
});

router.post('/api/users/signin', async (req, res) => {
  const { user } = req;

  try {
    if (user) {
      res.send(new ClientUser(user));
    } else {
      res.status(404).json(null);
    }
  } catch (error) {
    console.log(error); // eslint-disable-line
    res.status(500).json(null);
  }
});

router.get('/api/users/signout/', (req, res) => {
  req.logout(); // passportJS method
  res.json({ success: true });
});

router.get('/api/users/auth/', (req, res) => {
  const { user } = req;
  if (user) {
    res.send(new ClientUser(user));
  } else {
    res.status(200).json(null);
  }
});

router.get('/api/users/check-auth/', (req, res) => {
  const { user } = req;
  res.send(!!user);
});

router.get('/api/users/admin-access/', (req, res) => {
  res.status(200).json(null);
});

router.get('/api/users/', async (req, res) => {
  const { query = {} } = req;
  const { filter = {}, offset = 0, offsetStep = 15 } = query;

  // делаем объект фильтра, нужные строковые поля делаем регулярными выражениями
  let filterData = {
    ...filter
  };
  // удаляем пустые поля
  filterData = removeEmptyFields(filterData);
  const regExKeys = ['firstName', 'lastName', 'patronymic', 'login', 'email'];
  filterData = mapValuesToRegExp(filterData, regExKeys);

  try {
    const users = await User.find(filterData).sort({ login: 1 }).skip(parseInt(offset, 10)).limit(parseInt(offsetStep, 10));
    res.send(users.map(user => new ClientUser(user)));
  } catch (error) {
    console.log(error); // eslint-disable-line
    res.status(505).json(null);
  }
});

router.get('/api/users/:id', async (req, res) => {
  const { params = {} } = req;
  const { id } = params;

  try {
    const user = await User.findOne({ id });
    const targetUser = await getTargetUser(user); // получаем юзера с комментами, постами, лайками, дизлайкими и кармной
    res.send(targetUser);
  } catch (error) {
    console.log(error); // eslint-disable-line
    res.status(505).json(null);
  }
});

router.put('/api/users/:id', async (req, res) => {
  const { params: { id }, body } = req;
  const opts = { strict: false };
  const update = {
    firstName: body.firstName,
    lastName: body.lastName,
    patronymic: body.patronymic,
    birthday: body.birthday
  };

  const constraints = {
    firstName: { minLength: 1, maxLength: 100 },
    lastName: { maxLength: 100 },
    patronymic: { maxLength: 100 }
  };

  try {
    await validate(update, constraints, res);
  } catch (validateError) {
    return;
  }

  try {
    await User.update({ id }, update, opts);
    const updatedUser = await User.findOne({ id });
    const targetUser = await getTargetUser(updatedUser); // получаем юзера с комментами, постами, лайками, дизлайкими и кармной
    res.send(targetUser);
  } catch (error) {
    console.log(error); // eslint-disable-line
    res.status(505).json(null);
  }
});

router.post('/api/users/check-exists/', async (req, res) => {
  const { body: { login } } = req;

  try {
    const user = await User.findOne({ login });

    res.send({ exists: !!user });
  } catch (error) {
    console.log(error); // eslint-disable-line
    res.status(505).json(null);
  }
});

router.delete('/api/users/:id', async (req, res) => {
  const { params: { id } } = req;

  try {
    const user = await User.findOne({ id: mongoose.Types.ObjectId(id) });

    if (user) {
      const avatar = `${CONSTANTS.DIRS.IMAGES}/${user.avatar}`;

      // если есть аватарка - удаляем ее
      if (user.avatar) {
        removeImage(avatar);
      }

      await User.remove({ id: mongoose.Types.ObjectId(id) });
      res.status(200).json(null);
      return;
    }

    res.status(404).json(null);
  } catch (error) {
    console.log(error); // eslint-disable-line
    res.status(505).json(null);
  }
});

router.put('/api/users/change/password/', async (req, res) => {
  const { user, body: { currentPassword, newPassword } } = req;
  const opts = { strict: false };

  try {
    const data = {
      currentPassword,
      newPassword
    };

    const constraints = {
      currentPassword: { isRequired: true, minLength: 3 },
      newPassword: { isRequired: true, minLength: 3 }
    };

    try {
      await validate(data, constraints, res);
    } catch (validateError) {
      return;
    }

    const currentPasswordHash = getPasswordHash(currentPassword);

    // если текущий пароль введенный пользователем не совпал с тем, что хранится в базе
    if (user.password !== currentPasswordHash) {
      return res.send({ error: true });
    }

    const newPasswordHash = getPasswordHash(newPassword);

    // обновляем юзера
    await User.update({ id: user.id }, { password: newPasswordHash }, opts);

    res.send({ success: true });
  } catch (error) {
    console.log(error); // eslint-disable-line
    res.status(505).json(null);
  }
});

export default router;
