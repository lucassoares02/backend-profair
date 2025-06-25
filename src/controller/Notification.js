const Insert = require("@insert");
const logger = require("@logger");
const admin = require("firebase-admin");
const { connection } = require("@server");
const util = require("util");
const query = util.promisify(connection.query).bind(connection);

const Notification = {
  async insertNotification(req, res) {
    logger.info("Insert Notifications");
    const data = req.body;

    const params = {
      table: "notifications",
      data: [data],
    };

    try {
      const resp = await Insert(params);

      let result;
      if (data.method == 1) {
        result = await Notification.sendNotification(data.title, data.content, data.redirect, data.target);
      } else if (data.method == 2) {
        const { day, month, hour, minute } = data;
        result = await Notification.scheduleNotification(data.title, data.content, data.redirect, data.target, day, month, hour, minute);
      }

      return res.status(200).send({
        message: "Notification Inserted Successfully",
        insertData: resp,
        result,
      });

    } catch (error) {
      logger.error("Insert Notification failed:", error);
      return res.status(400).send({ message: "Error inserting notification", error });
    }
  },

  async sendNotification(title, content, redirect, target) {
    logger.info("Send Notifications");

    if (!title || !content) {
      return { success: false, message: "Title and content are required" };
    }

    const decodedKey = Buffer.from(process.env.FIREBASE_KEY_BASE64, "base64").toString("utf8");
    const serviceAccount = JSON.parse(decodedKey);

    if (!admin.apps.length) {
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
      });
    }

    let queryStr = `SELECT token FROM acesso WHERE token IS NOT NULL AND token != ''`;
    if ([1, 2, 3].includes(redirect)) {
      queryStr += ` AND direcAcesso = ${redirect}`;
    }

    
      console.log("=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=");
      console.log("QueryStr:");
      console.log(queryStr);
      console.log("=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=");



    try {
      const results = await query(queryStr);

      if (!results.length) {
        return { success: false, message: "No tokens found for the specified redirect." };
      }

      const tokens = results.map(row => row.token);

      console.log("=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=");
      console.log("Tokens:");
      console.log(tokens);
      console.log("=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=");



      const message = {
        notification: { title, body: content },
        tokens,
      };


      console.log("=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=");
      console.log("Message:");
      console.log(message);
      console.log("=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=");



      const response = await admin.messaging().sendMulticast(message);
      logger.info("Notification sent:", response);
      return { success: true, message: "Notification sent", response };

    } catch (error) {
      logger.error("Error sending notification:", error);
      return { success: false, message: "Error sending notification", error };
    }
  },

  async scheduleNotification(title, content, redirect, target, day, month, hour, minute) {
    logger.info("Schedule Notifications");

    if (!title || !content || !day || !month || !hour || !minute) {
      return { success: false, message: "Missing scheduling parameters" };
    }

    const scheduleTime = `${day}-${month} ${hour}:${minute}:00`;
    return {
      success: true,
      message: "Notification scheduled",
      data: { title, content, redirect, target, scheduleTime },
    };
  },
};

module.exports = Notification;
