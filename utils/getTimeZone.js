const getTimeZone = (timeZone, offset) => {
  // create Date object for current location
  var d = new Date();

  // convert to msec
  // subtract local time zone offset
  // get UTC time in msec
  var utc = d.getTime() + d.getTimezoneOffset() * 60000;

  // create new Date object for different city
  // using supplied offset
  var nd = new Date(utc + 3600000 * offset).toLocaleString();

  // return time as a string
  // return 'The local time for city' + timeZone + ' is ' + nd.toLocaleString();
  return {
    timeZone: timeZone,
    time: nd
  }
};

module.exports = getTimeZone
