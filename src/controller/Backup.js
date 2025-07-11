const axios = require('axios');
const logger = require('@logger');

const Backup = {
  async InsertSell(req, res, next) {
    logger.info('Insert Backups – enviando payload para API remota');

    const backupUrl = process.env.API_BACKUP;
    if (backupUrl) {
      try {
        const response = await axios.post(`${backupUrl}/insertrequestnew`, req.body);
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
  },

  async deleteAll(req, res, next) {
    logger.info('Delete all – apagando dados API remota');

    const backupUrl = process.env.API_BACKUP;
    if (backupUrl) {
      try {
        const response = await axios.get(`${backupUrl}/deleteallinformations`);
        logger.info('Exclusão bem-sucedido:', {
          status: response.status,
          data: response.data
        });
      } catch (error) {
        logger.error('Falha ao enviar backup remoto:', error.message);
      }
    } else {
      logger.warn('API_BACKUP não definida. Pulando exclusão remoto.');
    }

    next();
  },

  async getNegotiations(req, res, next) {
    logger.info('Get Negotiation – pegando dados API remota');

    const backupUrl = process.env.API_BACKUP;
    if (backupUrl) {
      try {
        const response = await axios.post(`${backupUrl}/multishow/negotiation`, req.body);
        logger.info('Negociaçao bem-sucedido:', {
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
