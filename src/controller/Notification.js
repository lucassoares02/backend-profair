const Insert = require("@insert");
const logger = require("@logger");
const admin = require("firebase-admin");
const { connection } = require("@server");
const util = require("util");
const { getMonth } = require("date-fns");
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

  async getNotifications(req, res) {
    logger.info("Get Notifications");

    const query = `select * from notifications order by id desc`;

    connection.query({ sql: query, timeout: 15000 }, (error, results, fields) => {
      if (error) {
        return res.status(400).send(error);
      } else {
        return res.json(results);
      }
    });
  },

  async saveTokenNotification(req, res) {
    logger.info("Save Token Notification");
    const { tokenFcm, userId } = req.body;

    if (!tokenFcm || !userId) {
      return res.status(400).send({ message: "Token and User ID are required" });
    }

    const query = `UPDATE acesso SET token = ? WHERE codAcesso = ?`;
    const values = [tokenFcm, userId];
    connection.query(query, values, (error, results) => {
      if (error) {
        logger.error("Error saving token:", error);
        return res.status(400).send({ message: "Error saving token", error });
      } else {
        logger.info("Token saved successfully");
        return res.status(200).send({ message: "Token saved successfully" });
      }
    });
  },

  async insertNotification(req, res) {
    logger.info("Insert Notifications");
    const data = req.body;

    const params = {
      table: "notifications",
      data: [data],
    };

    try {
      const resp = await Insert(params);

      console.log(resp[1][0]["LAST_INSERT_ID()"])

      let result = { success: true, message: "" };
      if (data.method == 1) {
        result = await Notification.sendNotification(data.title, data.content, data.redirect, data.target);
      }

      return res.status(200).send({
        message: "Notification Inserted Successfully",
        insertData: resp[0],
        result,
      });

    } catch (error) {
      logger.error("Insert Notification failed:", error);
      return res.status(400).send({ message: "Error inserting notification", error });
    }
  },

  async updateNotification(req, res) {
    logger.info("Insert Notifications");
    const { title, content, redirect, target, day, month, hour, minute, method, id } = req.body.data;

    try {

      const query = `UPDATE notifications SET title = ?, content = ?, redirect = ?, target = ?, day = ?, month = ?, hour = ?, minute = ?, method = ? WHERE id = ?`;
      const values = [title, content, redirect, target, day, month, hour, minute, method, id];

      connection.query(query, values, (error, results) => {
        if (error) {
          return res.status(400).send(error);
        } else {
          return res.status(200).send({
            message: "Notification Updated Successfully",
          });
        }
      });

    } catch (error) {
      logger.error("Update Notification:", error);
      return res.status(400).send({ message: "Error update notification", error });
    }
  },

  async openedNotification(req, res) {
    logger.info("Opened Notifications");
    const { notificationId, tokenFcm } = req.body;

    console.log("=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=");
    console.log("notificationId:");
    console.log(notificationId);
    console.log("=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=");

    console.log("=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=");
    console.log("tokenFcm:");
    console.log(tokenFcm);
    console.log("=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=");

    try {

      const query = `UPDATE notifications SET method = ? WHERE id = ?`;
      const values = [id, id];

      connection.query(query, values, (error, results) => {
        if (error) {
          return res.status(400).send(error);
        } else {
          return res.status(200).send({
            message: "Notification Updated Successfully",
          });
        }
      });

    } catch (error) {
      logger.error("Update Notification:", error);
      return res.status(400).send({ message: "Error update notification", error });
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

    try {
      const results = await query(queryStr);


      if (!results.length) {
        logger.warn("No tokens found for the specified redirect.");
        return { success: false, message: "No tokens found." };
      }

      const tokens = results.map(row => row.token);


      const message = {
        notification: { title, body: content },
        data: { notificationId: "12", userId: "1" },
        tokens,
      };

      const response = await admin.messaging().sendEachForMulticast(message);

      // verify if the response contains errors
      if (response.failureCount > 0) {
        const failedTokens = response.responses
          .map((resp, idx) => resp.error ? tokens[idx] : resp.error)
          .filter(token => token !== null);

        logger.error("Failed to send notifications to tokens:", failedTokens);
        return { success: false, message: "Some notifications failed to send", failedTokens };
      }



      logger.info("Notification sent successfully", { successCount: response.successCount });
      return { success: true, message: "Notification sent", response };

    } catch (error) {
      logger.error("Error sending notification:", error);
      return { success: false, message: "Error sending notification", error };
    }
  },

};

module.exports = Notification;
