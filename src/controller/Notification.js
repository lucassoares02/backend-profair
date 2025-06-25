const Insert = require("@insert");
const logger = require("@logger");
const admin = require('firebase-admin');

const Notification = {

   async sendNotification(req, res, next) {
    logger.info("Send Notifications");
    const { title, body, token } = req.body;

    const decodedKey = Buffer.from(process.env.FIREBASE_KEY_BASE64, 'base64').toString('utf8');
    const serviceAccount = JSON.parse(decodedKey);

    if (!title || !body || !token) {
      return res.status(400).send({ message: "Title, body and token are required" });
    }

    try {
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
      });

      const message = {
        notification: {
          title: title,
          body: body,
        },
        token: token,
      };

      const response = await admin.messaging().send(message);
      logger.info("Notification sent successfully:", response);
      res.status(200).send({ message: "Notification sent successfully", response });
    } catch (error) {
      logger.error("Error sending notification:", error);
      res.status(500).send({ message: "Error sending notification", error });
    }
  },

  async insertNotification(req, res, next) {
    logger.info("Insert Notifications");
    const data = req.body;

    let params = {
      table: "notifications",
      data: [data],
    };
    return Insert(params)
      .then(async (resp) => {
        this.sendNotification(data.title, data.content, data.token);
        res.status(200).send({
          message: "Notification Inserted Successfully",
          data: resp,
        });
      })
      .catch((error) => {
        res.status(400).send(error);
      });
  },

 

};

module.exports = Notification;
