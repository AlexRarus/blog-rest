import passport from 'passport';
import { allowAccess } from './middlewares';
import controllers from './controllers';
import app from './app';

// Controllers
app.get('/api/posts/', controllers.posts);
app.get('/api/posts/favourite', controllers.posts);
app.get('/api/posts/moderation/', allowAccess(['admin']), controllers.posts);
app.get('/api/posts/:id', controllers.posts);
app.post('/api/posts/', allowAccess(['user']), controllers.posts);
app.delete('/api/posts/:id', allowAccess(['admin']), controllers.posts);
app.put('/api/posts/like/:id', allowAccess(['user']), controllers.posts);
app.put('/api/posts/dislike/:id', allowAccess(['user']), controllers.posts);
app.put('/api/posts/allow-comments/:id', allowAccess(['user']), controllers.posts);
app.put('/api/posts/anonymous-trigger/:id', allowAccess(['user']), controllers.posts);
app.put('/api/posts/accept/:id', allowAccess(['admin']), controllers.posts);
app.put('/api/posts/decline/:id', allowAccess(['admin']), controllers.posts);
app.put('/api/posts/update/', allowAccess(['user']), controllers.posts);

// Auth system
app.get('/api/users/', controllers.user);
app.get('/api/users/auth/', controllers.user);
app.get('/api/users/check-auth/', controllers.user);
app.get('/api/users/admin-access/', allowAccess(['admin']), controllers.user);
app.get('/api/users/signin/facebook', passport.authenticate('facebook', { scope: ['email'] })); // passportJS facebook strategy
app.get('/api/users/authorize/fb', passport.authenticate('facebook', { failureRedirect: '/signin', successRedirect: '/' })); // passportJS facebook strategy
app.get('/api/users/signin/vkontakte', passport.authenticate('vkontakte', { scope: ['email'] })); // passportJS vkontakte strategy
app.get('/api/users/authorize/vk', passport.authenticate('vkontakte', { failureRedirect: '/signin', successRedirect: '/' })); // passportJS vkontakte strategy
app.get('/api/users/signin/instagram', passport.authenticate('instagram', { scope: ['basic'] })); // passportJS instagram strategy
app.get('/api/users/authorize/instagram', passport.authenticate('instagram', { failureRedirect: '/signin', successRedirect: '/' })); // passportJS instagram strategy
app.post('/api/users/signin', passport.authenticate('local'), controllers.user); // passportJS local strategy
app.post('/api/users/signup/', controllers.user);
app.get('/api/users/signout/', allowAccess(['user']), controllers.user);
app.post('/api/users/avatar/', allowAccess(['user']), controllers.user);
app.post('/api/users/check-exists/', controllers.user);
app.put('/api/users/change/password/', allowAccess(['user']), controllers.user);

app.get('/api/users/:id', controllers.user);
app.put('/api/users/:id/', allowAccess(['user']), controllers.user);
app.delete('/api/users/:id', allowAccess(['admin']), controllers.user);

// запускаем сервер
const PORT = 9090;

app.listen(PORT, () => {
  // eslint-disable-next-line
  console.log(`API Server listening on: ${PORT}`);
});
