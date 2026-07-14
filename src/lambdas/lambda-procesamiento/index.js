'use strict';
//Lambda para procesar los reclamos recibidos desde SQS y enviar notificaciones a SNS
const { SNSClient, PublishCommand } = require('@aws-sdk/client-sns');
const { query } = require('../shared/db');
const { logInfo, logError } = require('../shared/http');

const sns = new SNSClient({});

const SLA_HORAS_POR_PRIORIDAD = { ALTA: 24, MEDIA: 72, BAJA: 120 };

exports.handler = async (event) => {
  const resultados = { procesados: 0, fallidos: 0 };
  const batchItemFailures = [];

  for (const record of event.Records) {
    try {
      await procesarMensaje(record);
      resultados.procesados += 1;
    } catch (err) {
      resultados.fallidos += 1;
      logError('PROCESAMIENTO_FALLIDO', err, { messageId: record.messageId });
      // Se reporta solo el mensaje fallido para reintento parcial del batch (SQS partial batch response)
      batchItemFailures.push({ itemIdentifier: record.messageId });
    }
  }

  logInfo('BATCH_PROCESADO', resultados);
  return { batchItemFailures };
};

async function procesarMensaje(record) {
  const payload = JSON.parse(record.body);
  const { reclamoId, prioridad } = payload;

  const rows = await query('SELECT * FROM reclamos WHERE id = ?', [reclamoId]);
  if (!rows.length) {
    throw new Error(`Reclamo ${reclamoId} no encontrado durante procesamiento`);
  }
  const reclamo = rows[0];

  const slaHoras = SLA_HORAS_POR_PRIORIDAD[prioridad] || SLA_HORAS_POR_PRIORIDAD.MEDIA;

  await query('UPDATE reclamos SET estado_ticket = ? WHERE id = ? AND estado_ticket = ?', [
    'EN_PROCESO',
    reclamoId,
    'ABIERTO',
  ]);

  await sns.send(
    new PublishCommand({
      TopicArn: process.env.SNS_TOPIC_NOTIFICATIONS,
      Subject: `Reclamo #${reclamoId} en proceso`,
      Message: JSON.stringify({
        reclamoId,
        folioReferencia: reclamo.folio_referencia,
        estadoTicket: 'EN_PROCESO',
        slaHoras,
        mensaje: `Tu reclamo ${reclamo.folio_referencia} fue recibido y esta en proceso. Tiempo estimado de respuesta: ${slaHoras}h.`,
      }),
    })
  );

  logInfo('RECLAMO_PROCESADO', { reclamoId, prioridad, slaHoras });
}
