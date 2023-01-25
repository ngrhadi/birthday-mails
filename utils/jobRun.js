const cron = require("node-cron");
const fetch = require('node-fetch');
const nodemailer = require('nodemailer');
const ts = require('@mapbox/timespace');

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

  const bodyResponse = {
    email: user.email,
    message: `Hey, ${user.firsName + ' ' + user.lastName} Happy birthday`
  }
  if (new Date(getLocalDate).getHours() === 9) {
    const send = transporter.sendMail(options, async (err, info) => {
      try {
        const data = info.response
        const response = await fetch(`https://email-service.digitalenvision.com.au/send-email`, {
          method: 'POST',
          body: JSON.stringify(bodyResponse),
          headers: { 'Content-Type': 'application/json' }
        })
        console.log(await response.json(), "response")
        return await response.json()
      } catch (error) {
        throw new Error(err)
      }
    })

    return send
  } else {
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

function initScheduledJobs (port) {
  const scheduledJobFunction = cron.schedule("* * * * *", async () => {
    const response = await fetch(`http://localhost:${port}/users`);
    const data = await response.json();

    return validateUser(data, scheduledJobFunction, port)
  });

  scheduledJobFunction.start();
}

module.exports = {
  initScheduledJobs
}
