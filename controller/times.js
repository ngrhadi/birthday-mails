const getTimeZone = require('../utils/getTimeZone');

function timeServer(req, res, next) {
  const time = new Date()
    .toISOString()
    .replace(/T/, " ")
    .replace(/\..+/, "")
    .slice(0, -3);
  next()
  return res.status(200).json({
    data: time
  });
}

function isBirthTime(req, res, next) {
  const timeZone = getTimeZone('US', '+0.5');
  next();

  return res.status(200).json({
    data: timeZone,
  });
}

module.exports = {
  timeServer,
  isBirthTime
}
