import express from 'express';
import bodyParser from 'body-parser';
import session from 'express-session';
import passport from 'passport';
import cookieParser from 'cookie-parser';
import logger from 'morgan'; // логгирование запросов в консоль
import { allowCORS, optionController } from '../middlewares';
import { passportJSConfigure } from './utils';
import 'src/db/connection'; // подключаемся к базе

const sessionConfig = {
  secret: 'keyboard-cat', // todo заменить
  resave: false, // do not automatically write to the session store
  saveUninitialized: false, // saved new sessions
  cookie : {
    httpOnly: true,
    maxAge: 1000 * 60 * 60 * 24 // configure when sessions expires // todo увеличить maxAge
  }
};

const app = express();

app.set('trust proxy', true); // trusted
app.enable('trust proxy');

app.use(cookieParser());
app.use(session(sessionConfig));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(allowCORS);
app.options('*', optionController);
app.use(express.static('upload'));// отдаем картинки
app.use(logger('dev')); // logger
app.use(passport.initialize()); // passportJS
app.use(passport.session()); // passportJS
passportJSConfigure(passport);

export default app;
