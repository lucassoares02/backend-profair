const axios = require('axios');
const logger = require('@logger');

const Backup = {
  async InsertSell(req, res, next) {
    logger.info('Insert Backups – enviando payload para API remota');

    const backupUrl = process.env.API_BACKUP;
    if (backupUrl) {
      try {
        const response = await axios.post(backupUrl, req.body);
        logger.info('Backup remoto bem-sucedido:', {
          status: response.status,
          data: response.data
        });
      } catch (error) {
        logger.error('Falha ao enviar backup remoto:', error.message);
      }
    } else {
      logger.warn('API_BACKUP não definida. Pulando backup remoto.');
    }

    next();
  }
};

module.exports = Backup;
