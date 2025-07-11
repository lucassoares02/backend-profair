const Insert = require("@insert");
const logger = require("@logger");
const admin = require("firebase-admin");
const { connection } = require("@server");
const util = require("util");
const { getMonth } = require("date-fns");
const { image } = require("pdfkit");
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
    logger.info("Get Notifications Per User");

    const user = parseInt(req.headers["user-id"], 10);

    if (isNaN(user)) {
      return res.status(400).json({ error: "Invalid user-id" });
    }

    const query = `
    SELECT
      a.codUsuario,
      n.*,
      COALESCE(un.viewed, 0) AS viewed,
      DATE_SUB(NOW(), INTERVAL 3 HOUR) AS data_atual_menos_3h
    FROM notifications n
    LEFT JOIN acesso a
      ON (a.direcAcesso = n.target OR n.target = 0)
     AND a.codAcesso = ?
    LEFT JOIN user_notifications un
      ON un.notification = n.id
     AND un.user = a.codUsuario
    WHERE
      (a.codAcesso = ? OR n.target = 0)
    AND (
      n.method = 1 OR (
        n.method = 2 AND
        STR_TO_DATE(
          CONCAT(
            YEAR(NOW()), '-', LPAD(n.month, 2, '0'), '-', LPAD(n.day, 2, '0'), ' ',
            LPAD(n.hour, 2, '0'), ':', LPAD(n.minute, 2, '0'), ':00'
          ), '%Y-%m-%d %H:%i:%s'
        ) < DATE_SUB(NOW(), INTERVAL 3 HOUR)
      )
    )
    ORDER BY n.created_at DESC
  `;

    const values = [user, user];

    connection.query(query, values, (error, results) => {
      if (error) {
        logger.error("DB error", error);
        return res.status(500).send(error);
      }

      res.json(results);
    });
  },

  async deleteNotifications(req, res) {
    const { id } = req.params;
    if (!id) return res.status(400).send({ message: "Notification ID is required" });

    // Inicia transação
    connection.beginTransaction(err => {
      if (err) return res.status(500).send({ message: "Transaction error", err });

      // 1) Deleta as referências em user_notifications
      connection.query(
        'DELETE FROM user_notifications WHERE notification = ?',
        [id],
        (err) => {
          if (err) {
            return connection.rollback(() => {
              res.status(400).send({ message: "Erro ao deletar relações", err });
            });
          }

          // 2) Deleta a notificação
          connection.query(
            'DELETE FROM notifications WHERE id = ?',
            [id],
            (err, results) => {
              if (err) {
                return connection.rollback(() => {
                  res.status(400).send({ message: "Erro ao deletar notificação", err });
                });
              }

              // Commit se tudo certo
              connection.commit(commitErr => {
                if (commitErr) {
                  return connection.rollback(() => {
                    res.status(500).send({ message: "Erro ao confirmar transação", commitErr });
                  });
                }
                res.status(200).send({ message: "Notification deleted successfully" });
              });
            }
          );
        }
      );
    });
  },

  async getNotificationDetails(req, res) {
    logger.info("Get Details Notification");

    const { id } = req.params;

    const query = "SELECT n.*, CASE WHEN n.provider != 0 THEN f.nomeForn ELSE NULL END AS nomeForn, CASE WHEN n.provider != 0 THEN f.color ELSE NULL END AS color, CASE WHEN n.provider != 0 THEN f.image ELSE NULL END AS image FROM notifications n LEFT JOIN fornecedor f ON n.provider = f.codForn WHERE n.id = ?;";
    const values = [id];

    connection.query(query, values, (error, results, fields) => {
      if (error) {
        return res.status(400).send(error);
      } else {
        return res.json(results);
      }
    });
  },

  async getPendingNotificationPerUser(req, res) {
    logger.info("Get Notifications");

    const user = req.headers["user-id"];

    const query = "select un.* from user_notifications un join acesso a on a.codUsuario = un.user where a.codAcesso = ? and un.viewed = 0";
    const values = [user];

    connection.query(query, values, (error, results, fields) => {
      if (error) {
        return res.status(400).send(error);
      } else {
        return res.json(results);
      }
    });
  },

  async checkNotificationPerUser(req, res) {
    logger.info("Get Notifications");

    const user = req.headers["user-id"];

    const query = "update user_notifications un join acesso a on a.codUsuario = un.user set un.viewed = 1 where a.codAcesso = ? and un.viewed = 0";
    const values = [user];

    connection.query(query, values, (error, results, fields) => {
      if (error) {
        return res.status(400).send(error);
      } else {
        return res.json(results);
      }
    });
  },

  async getNotificationsAll(req, res) {
    logger.info("Get Notifications");

    const query = 'select * from notifications order by id desc';

    connection.query(query, (error, results, fields) => {
      if (error) {
        return res.status(400).send(error);
      } else {
        return res.json(results);
      }
    });
  },

  async getTargetsNotifications(req, res) {
    logger.info("Get Targets Notifications");

    const { notification } = req.params;

    console.log(`Notificação: ${notification}`)

    const query = 'select un.*, c.codConsult, c.nomeConsult  from user_notifications un join consultor c on c.codConsult = un.user where un.notification = ?';
    const values = [notification];

    connection.query(query, values, (error, results, fields) => {
      if (error) {
        return res.status(400).send(error);
      } else {
        console.log("Results:", results);
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

    const query = `UPDATE acesso SET token = ? WHERE codUsuario = ?`;
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
        result = await Notification.sendNotification(data.title, data.content, data.redirect, data.target, data.provider, resp[1][0]["LAST_INSERT_ID()"]);
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
    logger.info("Update Notifications");
    const { title, content, redirect, target, day, month, hour, minute, method, id } = req.body;

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

    if (!notificationId || !tokenFcm) {
      return res.status(400).send({ message: "notificationId e tokenFcm são obrigatórios" });
    }

    // 1) Busca o usuário pelo token
    const userQuery = 'SELECT codUsuario FROM acesso WHERE token = ? LIMIT 1';
    connection.query(userQuery, [tokenFcm], (userErr, userRows) => {
      if (userErr) {
        logger.error("Erro ao buscar usuário:", userErr);
        return res.status(500).send({ message: "Erro ao buscar usuário", error: userErr });
      }
      if (userRows.length === 0) {
        return res.status(404).send({ message: "Usuário não encontrado para esse token" });
      }

      const userId = userRows[0].codUsuario;

      // 2) Tenta dar UPDATE
      const updateQuery = `
      UPDATE user_notifications
      SET viewed = 1
      WHERE notification = ? AND user = ?
    `;
      connection.query(updateQuery, [notificationId, userId], (updateErr, updateRes) => {
        if (updateErr) {
          logger.error("Erro ao atualizar notificação:", updateErr);
          return res.status(500).send({ message: "Erro ao atualizar notificação", error: updateErr });
        }

        if (updateRes.affectedRows === 0) {
          // 3) Se não atualizou ninguém, insere novo registro
          const insertQuery = `
          INSERT INTO user_notifications
            (user, notification, success, viewed, reason)
          VALUES
            (?, ?, 1, 1, 'Notification opened')
        `;
          connection.query(insertQuery, [userId, notificationId], (insertErr, insertRes) => {
            if (insertErr) {
              logger.error("Erro ao inserir notificação:", insertErr);
              return res.status(500).send({ message: "Erro ao inserir notificação", error: insertErr });
            }
            return res.status(200).send({ message: "Notification inserted successfully" });
          });
        } else {
          // 4) Se atualizou, devolve sucesso de atualização
          return res.status(200).send({ message: "Notification updated successfully" });
        }
      });
    });
  },


  async sendNotification(title, content, redirect, target, provider, notificationId) {
    logger.info("Send Notifications");

    if (!title || !content) {
      return { success: false, message: "Title and content are required" };
    }

    initializeFirebase();

    let queryStr = `SELECT token, codUsuario AS user_id FROM acesso WHERE token IS NOT NULL AND token != ''`;

    if ([1, 2, 3].includes(Number(target))) {
      queryStr += ` AND direcAcesso = ${Number(target)}`;
    }

    console.log("Query String:", queryStr);

    try {
      const results = await query(queryStr);

      if (!results.length) {
        logger.warn("No tokens found for the specified redirect.");
        return { success: false, message: "No tokens found." };
      }

      console.log("Results:", results);

      const tokens = results.map(row => row.token);
      const users = results.map(row => row.user_id);

      console.log("Provider:", provider);


      let imageUrlString = 'https://play-lh.googleusercontent.com/6FINLIOgGm5UN2MuqBIYnqhydb71JlO55aOG1ox_S7WtSGvo-72p5pWkL2OufnIjBbY=w240-h480-rw';
      if (provider != null || provider != undefined || provider != '' || provider != 0 || provider != '0') {
        let queryProviders = `select image from fornecedor where codForn = ${provider}`;
        const resultProvider = await query(queryProviders);
        if (resultProvider.length > 0) {
          imageUrlString = resultProvider[0].image;
        } else {
          logger.warn("No provider token found, using default image URL.");
        }
      }

      const message = {
        notification: {
          title,
          body: content,
          image: imageUrlString,
        },
        data: {
          notificationId: notificationId.toString(),
          direct: redirect.toString(),
          provider: provider.toString(),
          imageUrl: imageUrlString,
          title,
          body: content,
        },
        tokens,
        android: {
          notification: {
            imageUrl: imageUrlString,
          },
        },
        apns: {
          payload: {
            aps: {
              'mutable-content': 1,
              'content-available': 1,
            },
          },
          fcm_options: {
            image: imageUrlString,
          },
        },
      };

      console.log("Message:", message);


      const response = await admin.messaging().sendEachForMulticast(message);


      const updateNotifications = `update notifications set sent = 1 where id = ${notificationId}`;

      await query(updateNotifications);


      const insertValues = results.map((row, index) => {
        const res = response.responses[index];
        console.log("Response:", res);
        return `(${users[index]}, ${notificationId}, ${res.success ? 1 : 0}, 0, '${res.success ? "Sent" : res.error.message}')`;
      }).join(', ');

      console.log("Insert Values:", insertValues);

      const insertQuery = `
      INSERT INTO user_notifications (user, notification, success, viewed, reason)
      VALUES ${insertValues}
    `;

      console.log("Insert Query:", insertQuery);

      await query(insertQuery);

      if (response.failureCount > 0) {
        const failedTokens = response.responses
          .map((res, idx) => !res.success ? tokens[idx] : null)
          .filter(t => t !== null);

        logger.error("Failed to send notifications to tokens:", failedTokens);
        return {
          success: false,
          message: "Some notifications failed to send",
          failedTokens,
        };
      }

      logger.info("Notification sent successfully", { successCount: response.successCount });
      return { success: true, message: "Notification sent", response };

    } catch (error) {
      logger.info("Error sending notification:", error);
      return { success: false, message: "Error sending notification", error };
    }
  }

};

module.exports = Notification;
