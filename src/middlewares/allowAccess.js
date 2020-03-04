export default function (roles = []) {
  return (req, res, next) => {
    if (!roles.includes('admin')) {
      roles.push('admin');
    }

    const { user } = req;

    if (user && (user.admin || roles.includes(user.role))) {
      next();
    } else {
      res.status(403).json(null);
    }
  };
}
