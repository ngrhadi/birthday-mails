
const { nanoid } = require("nanoid");
const scheduleRuntime = require('../utils/jobRun')

const idLength = 8;

/**
 * @swagger
 * tags:
 *   name: Users
 *   description: Users API
*/

/**
 * @swagger
 * components:
 *   schemas:
 *     Users:
 *       type: object
 *       required:
 *         - firstName
 *         - lastName
 *         - email
 *         - birthDate
 *         - location
 *       properties:
 *         id:
 *           type: string
 *           description: The auto-generated id of the user
 *         firstName:
 *           type: string
 *           description: User first name
 *         lastName:
 *           type: string
 *           description: User last name
 *         email:
 *           type: email
 *           description: User email
 *         birthDate:
 *           type: string
 *           description: User birth date
 *         location:
 *           type: array
 *           items:
 *             type: integer
 *             nullable: true
 *           description: User location
 *       example:
 *         id: d5fE_asz
 *         firstName: Jhos
 *         lastName: Bush
 *         email: jhos@gmail.com
 *         birthDate: 1999-12-01
 *         location:
 *           - 110.3123
 *           - -7.203123
 */

/**
 * @swagger
 * /users:
 *   get:
 *     summary: Returns the list of all users
 *     tags: [Users]
 *     responses:
 *       200:
 *         description: The list of users
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Users'
 *       500:
 *         description: Server error
 */

async function getUsers(req, res) {
  try {
    const users = await req.app.db.get("users");
    res.send(users)
  } catch (error) {
    console.log(error)
  }
}

/**
 * @swagger
 * /users/start-render:
 *   get:
 *     summary: Refresh of birth information
 *     tags: [Users]
 *     responses:
 *       200:
 *         description: Imediately looking for birth information
 *       500:
 *         description: Server error
 */

async function refreshBirthDayUser(req, res) {
  try {
    scheduleRuntime.initScheduledJobs(process.env.PORT, true);
    res.send({ message: "Birthday runtimes has refreshed by 1 minutes" })
  } catch (error) {
    console.log(error)
  }
}

/**
 * @swagger
 * /users/stop-render:
 *   get:
 *     summary: Stop refresh of birth information
 *     tags: [Users]
 *     responses:
 *       200:
 *         description: Using 30 minutes by default settings for refresh birth information
 *       500:
 *         description: Server error
 */

async function stopRefreshBirthDayUser(req, res) {
  try {
    scheduleRuntime.initScheduledJobs(process.env.PORT, false);
    res.send({ message: "Birthday runtimes has refreshed by 30 minutes" })
  } catch (error) {
    console.log(error)
  }
}

/**
 * @swagger
 * /users/{id}:
 *  put:
 *    summary: Update the user by the id
 *    tags: [Users]
 *    parameters:
 *      - in: path
 *        name: id
 *        schema:
 *          type: string
 *        required: true
 *        description: The users id
 *    requestBody:
 *      required: true
 *      content:
 *        application/json:
 *          schema:
 *            $ref: '#/components/schemas/Users'
 *    responses:
 *      200:
 *        description: The user was updated
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/Users'
 *      404:
 *        description: The user was not found
 *      500:
 *        description: Server error
 */


function editUsers(req, res) {
  try {
    req.app.db
      .get("users")
      .find({ id: req.params.id })
      .assign(req.body)
      .write();

    res.send(req.app.db.get("users").find({ id: req.params.id }));
  } catch (error) {
    return res.status(500).send(error);
  }
}

/**
 * @swagger
 * /users:
 *   post:
 *     summary: Create a new users
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Users'
 *     responses:
 *       200:
 *         description: The Users was successfully created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Users'
 *       500:
 *         description: Server error
 */

async function addUsers(req, res) {
  try {
    const newUsers = {
      id: nanoid(idLength),
      ...req.body
    };

    await req.app.db.get("users").push(newUsers).write();

    res.send(newUsers)
  } catch (error) {
    return res.status(500).send(error);
  }
}

/**
 * @swagger
 * /users/{id}:
 *   delete:
 *     summary: Remove the user by id
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The user id
 *
 *     responses:
 *       200:
 *         description: The user was deleted
 *       404:
 *         description: The user was not found
 *       500:
 *         description: Server error
 */

async function deleteUser(req, res) {
  try {
    req.app.db.get("users").remove({ id: req.params.id }).write();

    res.sendStatus(200)
  } catch (error) {
    return res.status(500).send(error);
  }
}



module.exports = {
  getUsers,
  editUsers,
  addUsers,
  deleteUser,
  refreshBirthDayUser,
  stopRefreshBirthDayUser
}
