function allowCORS(req, res, next) { // todo настроить допустимые ресурсы
  const baseUrl = `${req.protocol}://${req.hostname}${req.hostname === 'localhost' ? ':4000' : ''}`;

  res.setHeader('Access-Control-Allow-Origin', baseUrl);
  res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, content-type, Accept');
  res.setHeader('Access-Control-Allow-Credentials', true);
  next();
}

function optionController(req, res) { // todo настроить допустимые ресурсы
  res.setHeader('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.sendStatus(200);
}

export { allowCORS, optionController };
