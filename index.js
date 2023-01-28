const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const morgan = require('morgan');
const swaggerUI = require('swagger-ui-express');
const swaggerJsDoc = require('swagger-jsdoc');
const low = require('lowdb');
const FileSync = require('lowdb/adapters/FileSync');
const scheduleRuntime = require('./utils/jobRun')


const now = require('./routes/times');
const users = require('./routes/users');

dotenv.config();

const app = express();
const port = process.env.PORT;


const adapter = new FileSync('db.json');
const db = low(adapter)

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Assessment Test",
      version: "1.0.0",
      description: "Write a simple application to send a happy birthday message to users on their birthday at exactly 9 am on their local time",
      contact: {
        email: "adinugraha.ista@yahoo.com",
      }
    },
    servers: [
      {
        url: `http://localhost:${port}`,
      },
    ],
  },
  apis: ["./controller/*.js"],
};

const specs = swaggerJsDoc(options);

app.use(cors())
app.use(express.json());
app.use(morgan('dev'));

app.db = db;
app.get('/', (req, res) => {
  scheduleRuntime.initScheduledJobs(port, true)
  res.redirect('/docs')
});

scheduleRuntime.initScheduledJobs(port, false)

app.use("/docs", swaggerUI.serve, swaggerUI.setup(specs));

app.use('/time', now)
app.use('/users', users)

var serverApps = app.listen(port, () => {
  console.log(`⚡️[server]: Server is running at http://localhost:${port}`);
});

serverApps.keepAlive = true;
