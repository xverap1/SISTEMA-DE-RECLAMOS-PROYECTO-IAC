'use strict';

/**
 * Lambda: Reportes
 */
const { SNSClient, PublishCommand } = require('@aws-sdk/client-sns');
const { query } = require('../shared/db');
const { ok, serverError, logInfo } = require('../shared/http');

const sns = new SNSClient({});
const BACKLOG_ALERT_THRESHOLD = Number(process.env.BACKLOG_ALERT_THRESHOLD || 50);

exports.handler = async (event) => {
  try {
    const params = (event.queryStringParameters) || {};
    const desde = params.desde || fechaHaceDias(30);
    const hasta = params.hasta || fechaHaceDias(0);

    const porEstado = await query(
      'SELECT estado_ticket AS estado, COUNT(*) AS total FROM reclamos WHERE fecha_registro BETWEEN ? AND ? GROUP BY estado_ticket',
      [desde, hasta]
    );
    const porPrioridad = await query(
      'SELECT prioridad, COUNT(*) AS total FROM reclamos WHERE fecha_registro BETWEEN ? AND ? GROUP BY prioridad',
      [desde, hasta]
    );
    const tiempoPromedioResolucion = await query(
      `SELECT AVG(TIMESTAMPDIFF(HOUR, fecha_registro, fecha_resolucion)) AS horas_promedio
       FROM reclamos WHERE fecha_resolucion IS NOT NULL AND fecha_registro BETWEEN ? AND ?`,
      [desde, hasta]
    );

    const abiertos = (porEstado.find((r) => r.estado === 'ABIERTO') || {}).total || 0;
    if (abiertos > BACKLOG_ALERT_THRESHOLD) {
      await sns.send(
        new PublishCommand({
          TopicArn: process.env.SNS_TOPIC_REPORTES,
          Subject: 'Alerta: backlog de reclamos elevado',
          Message: `Hay ${abiertos} reclamos abiertos, superando el umbral de ${BACKLOG_ALERT_THRESHOLD}.`,
        })
      );
      logInfo('ALERTA_BACKLOG', { abiertos, umbral: BACKLOG_ALERT_THRESHOLD });
    }

    return ok({
      periodo: { desde, hasta },
      porEstado,
      porPrioridad,
      horasPromedioResolucion: tiempoPromedioResolucion[0].horas_promedio,
    });
  } catch (err) {
    return serverError(err);
  }
};

function fechaHaceDias(dias) {
  const d = new Date();
  d.setDate(d.getDate() - dias);
  return d.toISOString().slice(0, 19).replace('T', ' ');
}
