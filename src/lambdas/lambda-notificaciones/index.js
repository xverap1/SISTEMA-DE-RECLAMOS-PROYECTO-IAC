  'use strict';

/**
 * Lambda: Notificaciones
 *
 * Se suscribe a los topicos SNS de reclamos, control-plazos y reportes
 * (ver iac/lambda.tf) y envia un correo por SES por cada mensaje recibido.
 */
const { SESClient, SendEmailCommand } = require('@aws-sdk/client-ses');
const { logInfo, logError } = require('../shared/http');

const ses = new SESClient({});

exports.handler = async (event) => {
  const records = (event && event.Records) || [];
  const resultados = [];

  for (const record of records) {
    const sns = record.Sns;
    const texto = extraerTexto(sns.Message);

    try {
      await ses.send(
        new SendEmailCommand({
          Source: process.env.FROM_EMAIL,
          Destination: { ToAddresses: [process.env.FROM_EMAIL] },
          Message: {
            Subject: { Data: sns.Subject || 'Notificacion del sistema de reclamos' },
            Body: { Text: { Data: texto } },
          },
          ConfigurationSetName: process.env.SES_CONFIG_SET,
        })
      );

      logInfo('NOTIFICACION_ENVIADA', { messageId: sns.MessageId, topicArn: sns.TopicArn });
      resultados.push({ messageId: sns.MessageId, estado: 'ENVIADO' });
    } catch (err) {
      logError('ENVIO_NOTIFICACION_FALLIDO', err, { messageId: sns.MessageId, topicArn: sns.TopicArn });
      throw err;
    }
  }

  return resultados;
};

function extraerTexto(mensaje) {
  try {
    const data = JSON.parse(mensaje);
    if (data && typeof data === 'object' && typeof data.mensaje === 'string') {
      return data.mensaje;
    }
    return mensaje;
  } catch (err) {
    return mensaje;
  }
}
