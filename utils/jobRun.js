const cron = require("node-cron");
const fetch = require('node-fetch');
const nodemailer = require('nodemailer');
const ts = require('@mapbox/timespace');
const moment = require('moment-timezone');

const transporter = nodemailer.createTransport({
  service: 'hotmail',
  auth: {
    user: 'jhos-gandos@hotmail.com',
    pass: 'P@ssw0rd!@#123'
  }
})

async function sendMail(user, port) {
  const options = {
    header: "Testing",
    from: 'jhos-gandos@hotmail.com',
    to: user.email,
    subject: 'Happy Birthday',
    text: `Hey, ${user.firsName + ' ' + user.lastName} Happy birthday`
  }

  const timestamp = Date.now();
  const point = user.location; // [latitude,longitude]
  const getLocalDate = ts.getFuzzyLocalTimeFromPoint(timestamp, point);
  let localHour = parseInt(moment(getLocalDate).format('HH'))


  const bodyResponse = {
    email: user.email,
    message: `Hey, ${user.firsName + ' ' + user.lastName} Happy birthday`
  }
  if (localHour === 9) {
    let running = true
    // setTimeout(() => {
    const send = transporter.sendMail(options, async (err, info) => {
      try {
        const data = info.response
        const response = await fetch(`https://email-service.digitalenvision.com.au/send-email`, {
          method: 'POST',
          body: JSON.stringify(bodyResponse),
          headers: { 'Content-Type': 'application/json' }
        })
        await response.json()
        return data
      } catch (error) {
        console.log("email send not rendering")
        throw new Error(err)
      }
    })
    running = false
    return send
    // }, 90000);
  } else if (localHour < 9) {
    console.log(`is someone have birthday, ready to send at 9am`)
  } else if (localHour > 9) {
    console.log("is to late for saying birthday")
  }

}

async function validateUser(data, scheduledJobFunction, port) {
  const mountNow = new Date().getMonth() + 1
  const dateNow = new Date().getDate()
  try {
    return data.forEach((user) => {
      let dateUser = new Date(user.birthDate)
      if (mountNow === dateUser.getMonth() + 1 && dateNow === dateUser.getDate()) {
        sendMail(user, port)
      }
      if (mountNow !== dateUser.getMonth() + 1 && dateNow !== dateUser.getDate()) {
        console.log(`${user.firstName} ${user.lastName} is not birthday this day`)
        scheduledJobFunction.stop()
        setTimeout(() => {
          scheduledJobFunction.start()
        }, 36000);
      }
    })
  } catch (error) {
    console.log("nothing user birtday this day")
  }
}

function initScheduledJobs(port, isUsingGetUser) {
  let isTrigered = isUsingGetUser
  if (isTrigered === true) {
    const scheduledJobFunction = cron.schedule("* * * * *", async () => {
      const response = await fetch(`http://localhost:${port}/users`);
      const data = await response.json();
      // console.log("using runtime 1 minutes")
      // console.log("using runtime 1 minutes", isTrigered, new Date(new Date().getTime()))
      return validateUser(data, scheduledJobFunction, port)
    });
    scheduledJobFunction.start();
  } else {
    const scheduledJobFunction = cron.schedule("*/30 * * * *", async () => {
      const response = await fetch(`http://localhost:${port}/users`);
      const data = await response.json();
      // console.log("using runtime 30 minutes")
      // console.log("using runtime 30 minutes", isTrigered, new Date(new Date().getTime()))
      return validateUser(data, scheduledJobFunction, port)
    });
    scheduledJobFunction.start();
  }
}

module.exports = {
  initScheduledJobs,
  validateUser
}
