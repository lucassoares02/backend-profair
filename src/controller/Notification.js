const Insert = require("@insert");
const logger = require("@logger");
const admin = require('firebase-admin');
const { connection } = require("@server");

const Notification = {

  async insertNotification(req, res, next) {
    logger.info("Insert Notifications");
    const data = req.body;

    let params = {
      table: "notifications",
      data: [data],
    };
    return Insert(params)
      .then(async (resp) => {

        if (data.method == 1) {
          await Notification.sendNotification(data.title, data.content, data.redirect, data.target);
        } else if (data.method == 2) {
          await Notification.scheduleNotification(data.title, data.content, data.token, data.scheduleTime);
        }

        res.status(200).send({
          message: "Notification Inserted Successfully",
          data: resp,
        });
      })
      .catch((error) => {
        res.status(400).send(error);
      });
  },

  async sendNotification(title, content, redirect, target) {
    logger.info("Send Notifications");

    const decodedKey = Buffer.from(process.env.FIREBASE_KEY_BASE64, 'base64').toString('utf8');
    const serviceAccount = JSON.parse(decodedKey);

    if (!title || !content || !redirect || !target) {
      return res.status(400).send({ message: "Title, body and token are required" });
    }

    if (!admin.apps.length) {
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
      });
    }

    var tokens = [];
    var query = '';
    if (redirect == 0) {
      query = `SELECT token FROM acesso WHERE token IS NOT NULL AND token != '';`;
    } else if (redirect == 1 || redirect == 2 || redirect == 3) {
      query = `SELECT token FROM acesso WHERE token IS NOT NULL AND token != '' and direcAcesso = ${redirect};`;
    }


    console.log("=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=");
    console.log("Query:");
    console.log(query);
    console.log("=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=");


    connection.query(query, async (error, results) => {
      if (error) {
        logger.error("Error fetching tokens:", error);
        return ({ message: "Error fetching tokens", error });
      }
      if (results.length === 0) {
        logger.warn("No tokens found for the specified redirect.");
        return ({ message: "No tokens found for the specified redirect." });
      }
      tokens = results.map(row => row.token);
    });

    console.log("=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=");
    console.log("Tokens:");
    console.log(tokens);
    console.log("=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=");


    try {

      const message = {
        notification: {
          title: title,
          body: content,
        },
        tokens: tokens,
      };


      console.log("=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=");
      console.log("Message:");
      console.log(message);
      console.log("=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=");


      const response = await admin.messaging().sendMulticast(message);
      // if (response.failureCount > 0) {
      //   const failedTokens = response.responses
      //     .map((resp, idx) => (resp.success ? null : tokens[idx]))
      //     .filter(token => token !== null);
      //   logger.error("Failed to send notifications to tokens:", failedTokens);
      //   return ({ message: "Failed to send notifications", failedTokens });
      // }
      logger.info("Notification sent successfully:", response);
      res.status(200).send({ message: "Notification sent successfully", response });
    } catch (error) {
      logger.error("Error sending notification:", error);
      res.status(500).send({ message: "Error sending notification", error });
    }
  },

  async scheduleNotification(title, content, redirect, target, day, month, hour, minute) {
    logger.info("Schedule Notifications");

    if (!title || !content || !redirect || !target) {
      return res.status(400).send({ message: "Title, body, token and schedule time are required" });
    }

    // scheduleTime should be in the format 'YYYY-MM-DD HH:mm:ss'
    const scheduleTime = `${day}-${month} ${hour}:${minute}:00`;





    res.status(200).send({
      message: "Notification scheduled successfully",
      data: { title, content, token, scheduleTime },
    });
  },




};

module.exports = Notification;
