const Insert = require("@insert");
const logger = require("@logger");

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
