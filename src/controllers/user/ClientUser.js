export default class ClientUser {
  constructor(user, posts, likes, dislikes) {
    this.id = user.id;
    this.role = user.role;
    this.admin = user.admin;
    this.login = user.login;
    this.firstName = user.firstName;
    this.lastName = user.lastName;
    this.patronymic = user.patronymic;
    this.avatar = user.avatar;
    this.birthday = user.birthday;
    this.registrationDate = user.registrationDate;
    this.email = user.email;

    if (posts) {
      this.postsCount = posts.length;
    }

    if (likes) {
      this.likesCount = likes.length;
    }

    if (dislikes) {
      this.dislikesCount = dislikes.length;
    }
  }
};
