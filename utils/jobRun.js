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

async function handleEmail(result) {
  try {
    const options = {
      header: "Testing",
      from: 'jhos-gandos@hotmail.com',
      to: result.email,
      subject: 'Happy Birthday',
      text: `Hey, ${result.firstName + ' ' + result.lastName} Happy birthday`
    }
    return transporter.sendMail(options, (err, info) => info.response)
  } catch (error) {
    console.log(error)
  }
}

async function sendMail(user, port) {
  const timestamp = Date.now();
  const point = user.location; // [longitude, latitude]
  const getLocalDate = ts.getFuzzyLocalTimeFromPoint(timestamp, point);
  let localHour = parseInt(moment(getLocalDate).format('HH'))
  let localMinutes = parseInt(moment(getLocalDate).format('mm'))
  let dataUser = []

  console.log(user.firstName, localHour, localMinutes)


  const bodyResponse = {
    email: user.email,
    message: `Hey, ${user.firstName + ' ' + user.lastName} Happy birthday`
  }

  if (localHour === 10 && localMinutes === 30) {
    const response = await fetch(`https://email-service.digitalenvision.com.au/send-email`, {
      method: 'POST',
      body: JSON.stringify(bodyResponse),
      headers: { 'Content-Type': 'application/json' }
    })
    await response.json()

    handleEmail(user)
  } else if (localHour < 9) {
    console.log(`is someone have birthday, ready to send at 9am`)
  } else if (localHour > 9) {
    console.log("is to late for saying birthday for", user.firstName)
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
      console.log("using runtime 30 minutes")
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
