// scheduler.js
const cron = require('node-cron');
const logger = require('@logger');
const Notification = require('./src/controller/Notification');
const { connection } = require("@server");
const util = require("util");
const query = util.promisify(connection.query).bind(connection);


cron.schedule('* * * * *', async () => {
    logger.info('🔔 Init cronjob...');
    try {
        const now = new Date();
        const day = now.getDate();
        const month = now.getMonth() + 1;
        const hour = now.getHours() - 3;
        const minute = now.getMinutes();

        console.log(`SELECT * FROM notifications WHERE method = 2 AND day = ${day} AND month = ${month} AND hour = ${hour} AND minute = ${minute}`);

        const rows = await query(`SELECT * FROM notifications WHERE method = 2 AND day = ? AND month = ? AND hour = ? AND minute = ?`, [day, month, hour, minute]);


        console.log('Notificações agendadas:', rows);

        for (const n of rows) {
            const result = await Notification.sendNotification(n.title, n.content, n.redirect, n.target);

            // marca como enviada
            await query(`UPDATE notifications SET sent = 1 WHERE id = ?`, [n.id]);

            logger.info(`🔔 Notificação enviada (ID ${n.id})`, result);
        }
    } catch (error) {
        logger.error('❌ Erro no cronjob de notificações:', error);
    }
});
