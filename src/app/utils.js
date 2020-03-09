import { Strategy as LocalStrategy } from 'passport-local';
import { Strategy as FacebookStrategy } from 'passport-facebook';
import { Strategy as VKontakteStrategy } from 'passport-vkontakte';
import { Strategy as InstagramStrategy } from 'passport-instagram';
import { User } from 'src/db/models';
import { createUser } from 'src/controllers/utils.js';
import md5 from 'md5';

import {
  FACEBOOK_APP_ID,
  FACEBOOK_APP_SECRET,
  VKONTAKTE_APP_ID,
  VKONTAKTE_APP_SECRET,
  INSTAGRAM_APP_ID,
  INSTAGRAM_APP_SECRET
} from './passport-config';

function passportJSConfigure(passport) {
  // сериализуем юзера в сессию
  passport.serializeUser((user, done) => {
    done(null, { id: user.id });
  });

  // десериализуем юзера из сессии
  passport.deserializeUser(({ id }, done) => {
    User.findOne({ id }, (err, user) => {
      done(err, user);
    });
  });

  passport.use(new LocalStrategy({ usernameField: 'login', passwordField: 'password' },
    (login, password, done) => {
      console.log('login: ', login);
      if (login === undefined || login === null || login === '') {
        return done('login is empty');
      }

      User.findOne({ login }, (err, user) => {
        if (err) {
          console.log(err); // eslint-disable-line
          return done(err);
        }

        if (user) {
          const passwordHash = getPasswordHash(password);

          done(null, passwordHash === user.password ? user : null); // вход с паролем
          // done(null, user); // вход без пароля
        } else {
          done(null, false);
        }
      });
    }
  ));

  passport.use(new FacebookStrategy({
    clientID: FACEBOOK_APP_ID,
    clientSecret: FACEBOOK_APP_SECRET,
    callbackURL: 'https://lollipap.ru/api/users/authorize/fb',
    scope: 'email',
    profileFields: ['id', 'emails', 'name']
  },
  (accessToken, refreshToken, profile, done) => {
    const emails = profile.emails || [{}];
    const email = emails[0].value;
    const name = profile.name;

    const targetEmail = email || '';
    const findOptions = {};

    if (targetEmail) {
      findOptions.email = targetEmail;
    } else {
      findOptions.facebookId = profile.id;
    }

    User.findOne(findOptions, (err, user) => {
      if (user) {
        done(err, user);
      } else {
        createUser({
          login: targetEmail,
          email: targetEmail,
          status: targetEmail ? 'approved' : 'facebook',
          firstName: name ? name.givenName : email,
          lastName: name ? (name.familyName || '') : '',
          facebookId: profile.id
        }, (newUser) => {
          done(null, newUser);
        });
      }
    });
  }
  ));

  passport.use(new VKontakteStrategy({
    clientID:     VKONTAKTE_APP_ID, // VK.com docs call it 'API ID', 'app_id', 'api_id', 'client_id' or 'apiId'
    clientSecret: VKONTAKTE_APP_SECRET,
    callbackURL:  'https://lollipap.ru/api/users/authorize/vk',
    scope: 'email',
    profileFields: ['id', 'emails', 'name']
  },
  (accessToken, refreshToken, params, profile, done) => {
    const email = profile.email || params.email;
    const name = profile.name;

    const targetEmail = email || '';
    const findOptions = {};

    if (targetEmail) {
      findOptions.email = targetEmail;
    } else {
      findOptions.vkontakteId = profile.id;
    }

    User.findOne(findOptions, (err, user) => {
      if (user) {
        done(err, user);
      } else {
        createUser({
          login: targetEmail,
          email: targetEmail,
          status: targetEmail ? 'approved' : 'vkontakte',
          firstName: name ? name.givenName : email,
          lastName: name ? (name.familyName || '') : '',
          vkontakteId: profile.id
        }, (newUser) => {
          done(null, newUser);
        });
      }
    });
  }
  ));

  passport.use(new InstagramStrategy({
    clientID: INSTAGRAM_APP_ID,
    clientSecret: INSTAGRAM_APP_SECRET,
    callbackURL: 'https://lollipap.ru/api/users/authorize/instagram',
    scope: 'basic',
    profileFields: ['id', 'emails', 'name']
  },
  (accessToken, refreshToken, profile, done) => {
    const name = profile.name;
    const email = profile.email;

    const firstName = (name && name.givenName) || profile.displayName || profile.username;

    const targetEmail = email || '';
    const findOptions = {};

    if (targetEmail) {
      findOptions.email = targetEmail;
    } else {
      findOptions.instagramId = profile.id;
    }

    User.findOne(findOptions, (err, user) => {
      if (user) {
        done(err, user);
      } else {
        createUser({
          login: profile.username,
          status: 'instagram',
          firstName,
          lastName: name ? (name.familyName || '') : '',
          instagramId: profile.id
        }, (newUser) => {
          done(null, newUser);
        });
      }
    });
  }
  ));
}

function hashing(string = '', soul = '', iteration = 1) {
  const resultString = string + soul;

  return iteration > 1
    ? hashing(md5(resultString), soul, iteration - 1)
    : md5(resultString);
}

function getPasswordHash(password) {
  return hashing(password, 'soul', 20);
}

async function validateData(data, constraints) {
  const constraintsKeys = Object.keys(constraints);

  return await constraintsKeys.reduce(async (result, constraintKey) => {
    const errors = await result;

    const value = data[constraintKey];
    const constraint = constraints[constraintKey];
    const error = errors[constraintKey] || {};

    try {
      // isRequired
      if (constraint.isRequired) {
        const valueExists = value !== undefined && value !== null && value !== '';

        if (!valueExists) {
          error.isRequired = constraint.isRequired;
        }
      }

      // minLength
      if (constraint.minLength) {
        const valueLength = (value && value.length) || 0;
        const validValue = valueLength >= constraint.minLength;

        if (!validValue) {
          error.minLength = constraint.minLength;
        }
      }

      // maxLength
      if (constraint.maxLength) {
        const valueLength = (value && value.length) || 0;
        const validValue = valueLength <= constraint.maxLength;

        if (!validValue) {
          error.maxLength = constraint.maxLength;
        }
      }

      // unique
      if (constraint.unique) {
        const Schema = constraint.unique;
        const exists = await Schema.findOne({ [constraintKey]: value });

        if (exists) {
          error.unique = true;
        }
      }
    } catch (validateError) {
      console.log(validateError); // eslint-disable-line
    }

    const errorKeys = Object.keys(error);
    const errorExists = Boolean(errorKeys.length);

    if (errorExists) {
      errors[constraintKey] = error;
    }

    return errors;
  }, {});
}

async function validate(data, constraints, res) {
  const errors = await validateData(data, constraints);
  const errorsKeys = Object.keys(errors);
  const errorsExists = Boolean(errorsKeys.length);

  if (errorsExists) {
    res.status(400).json(errors);

    throw new Error('invalid data');
  }
}

export { passportJSConfigure, hashing, getPasswordHash, validate };
