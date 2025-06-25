const Insert = require("@insert");
const logger = require("@logger");
const admin = require("firebase-admin");
const { connection } = require("@server");
const util = require("util");
const query = util.promisify(connection.query).bind(connection);

// Firebase Initialization (seguro e único)
function initializeFirebase() {
  if (!admin.apps.length) {
    const decodedKey = Buffer.from(process.env.FIREBASE_KEY_BASE64, "base64").toString("utf8");
    const serviceAccount = JSON.parse(decodedKey);

    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
  }
}

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

      let result = { success: true, message: "" };
      if (data.method == 1) {
        result = await Notification.sendNotification(data.title, data.content, data.redirect, data.target);
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

    initializeFirebase();

    let queryStr = `SELECT token FROM acesso WHERE token IS NOT NULL AND token != ''`;
    if ([1, 2, 3].includes(Number(target))) {
      queryStr += ` AND direcAcesso = ${Number(target)}`;
    }


    console.log("=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=");
    console.log("Query:");
    console.log(query);
    console.log("=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=");


    try {
      const results = await query(queryStr);

      if (!results.length) {
        logger.warn("No tokens found for the specified redirect.");
        return { success: false, message: "No tokens found." };
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
      
      const response = await admin.messaging().sendEachForMulticast(message);
      logger.info("Notification sent successfully", { successCount: response.successCount });
      return { success: true, message: "Notification sent", response };

    } catch (error) {
      logger.error("Error sending notification:", error);
      return { success: false, message: "Error sending notification", error };
    }
  },

};

module.exports = Notification;
