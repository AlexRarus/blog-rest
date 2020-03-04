import mongoose from 'mongoose';
import fs from 'fs';
import Avatars from '@dicebear/avatars';
import SpriteCollection from '@dicebear/avatars-male-sprites';
import path from 'path';
import CONSTANTS from 'src/constants.js';
import { User } from 'src/db/models';
import { hashing, getPasswordHash } from 'src/app/utils';

function createUser(data, callback) {
  const userData = { ...data };

  if (userData.email === 'alexserebryakov92@mail.ru') {
    userData.role = 'admin';
  }

  if (userData.password) {
    userData.password = getPasswordHash(userData.password);
  }

  if (!userData.avatar) {
    // генерируем аватарку
    const avatarName = `avatar-${hashing(userData.email + Math.random().toString())}.svg`;
    const avatars = new Avatars(SpriteCollection);
    const svg = avatars.create(avatarName);

    fs.writeFile(path.resolve('upload', avatarName), svg, (err) => {
      if (err) {
        return console.log(err); // eslint-disable-line
      }
    });

    userData.avatar = avatarName;
  }

  const userTemplate = new User(userData);

  if (callback) {
    User.create(userTemplate, (error, user) => { //  создаем юзера
      if (error) {
        console.log(error); // eslint-disable-line
      }

      callback(user);
    });
  } else {
    return new Promise((resolve) => {
      User.create(userTemplate, (error, user) => { //  создаем юзера
        if (error) {
          console.log(error); // eslint-disable-line
        }

        resolve(user)
      });
    });
  }
}

/**
 * Удаляем пустые поля из объекта
 * @param object
 * @return {*}
 */
function removeEmptyFields(object) {
  const keys = Object.keys(object);

  return keys.reduce((prevResult, key) => {
    const result = prevResult;

    if (object[key] !== undefined && object[key] !== null && object[key] !== '') {
      result[key] = object[key];
    }

    return result;
  }, {});
}

/**
 * принимает объект и массив ключей, значение которых нужно превратить в RegExp
 * @param object
 * @param regExKeys
 * @return {*}
 */
function mapValuesToRegExp(object, regExKeys) {
  const keys = Object.keys(object);

  return keys.reduce((prevResult, key) => {
    const result = prevResult;

    if (regExKeys.includes(key)) {
      result[key] = { $regex: new RegExp(object[key]), $options: 'ig' };
    }

    return result;
  }, object);
}

function removeFile(fileName) {
  // проверяем наличие
  if (fs.existsSync(fileName)) {
    fs.unlinkSync(fileName);
  }
}

function removeImage(fileName) {
  const dirPath = `${CONSTANTS.DIRS.IMAGES}/`;
  removeFile(`${dirPath}${fileName}`);
}

export { createUser, removeEmptyFields, mapValuesToRegExp, removeFile, removeImage };
