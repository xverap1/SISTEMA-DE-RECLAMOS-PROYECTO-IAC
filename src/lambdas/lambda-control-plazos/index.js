'use strict';
//LAMBDA CONTROL DE PLAZOS
const { SNSClient, PublishCommand } = require('@aws-sdk/client-sns');
const { query } = require('../shared/db');
const { logInfo, logError } = require('../shared/http');

const sns = new SNSClient({});

const SLA_HORAS_POR_PRIORIDAD = { ALTA: 24, MEDIA: 72, BAJA: 120 };

exports.handler = async () => {
  try {
    const reclamosActivos = await query(
      `SELECT id, folio_referencia, prioridad, fecha_registro
       FROM reclamos
       WHERE estado_ticket IN ('ABIERTO', 'EN_PROCESO')`
    );

    const vencidos = [];
    const porVencer = [];
    const ahora = Date.now();

    for (const r of reclamosActivos) {
      const slaHoras = SLA_HORAS_POR_PRIORIDAD[r.prioridad] || SLA_HORAS_POR_PRIORIDAD.MEDIA;
      const limiteMs = new Date(r.fecha_registro).getTime() + slaHoras * 3600 * 1000;
      const horasRestantes = (limiteMs - ahora) / 3600000;

      if (horasRestantes < 0) {
        vencidos.push({ ...r, horasRestantes });
      } else if (horasRestantes <= 4) {
        porVencer.push({ ...r, horasRestantes });
      }
    }

    if (porVencer.length) {
      await sns.send(
        new PublishCommand({
          TopicArn: process.env.SNS_TOPIC_ALERTS,
          Subject: `${porVencer.length} reclamo(s) por vencer su SLA`,
          Message: JSON.stringify(porVencer.map((r) => ({ id: r.id, folio: r.folio_referencia, horasRestantes: r.horasRestantes.toFixed(1) }))),
        })
      );
    }

    const vencidosAlta = vencidos.filter((r) => r.prioridad === 'ALTA');
    if (vencidosAlta.length) {
      await sns.send(
        new PublishCommand({
          TopicArn: process.env.SNS_TOPIC_URGENT,
          Subject: `URGENTE: ${vencidosAlta.length} reclamo(s) de ALTA prioridad con SLA vencido`,
          Message: JSON.stringify(vencidosAlta.map((r) => ({ id: r.id, folio: r.folio_referencia }))),
        })
      );
    }

    logInfo('CONTROL_PLAZOS_EJECUTADO', {
      total: reclamosActivos.length,
      vencidos: vencidos.length,
      porVencer: porVencer.length,
      vencidosAlta: vencidosAlta.length,
    });

    return { vencidos: vencidos.length, porVencer: porVencer.length };
  } catch (err) {
    logError('CONTROL_PLAZOS_ERROR', err);
    throw err; // deja que Lambda marque la invocacion como fallida para la alarma de CloudWatch
  }
};
