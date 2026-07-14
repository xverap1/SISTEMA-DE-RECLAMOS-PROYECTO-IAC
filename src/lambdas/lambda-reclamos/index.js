'use strict';

/**
 * Lambda: Reclamos
 */
const { SQSClient, SendMessageCommand } = require('@aws-sdk/client-sqs');
const { query } = require('../shared/db');
const { ok, created, badRequest, notFound, serverError, logInfo, parseBody } = require('../shared/http');

const sqs = new SQSClient({});

const PRIORIDADES_VALIDAS = ['BAJA', 'MEDIA', 'ALTA'];

exports.handler = async (event) => {
  logInfo('REQUEST_RECEIVED', { path: event.path, method: event.httpMethod });

  try {
    const method = event.httpMethod;
    const id = event.pathParameters && event.pathParameters.id;

    if (method === 'POST' && !id) return await crearReclamo(event);
    if (method === 'GET' && id) return await obtenerReclamo(id);
    if (method === 'GET' && !id) return await listarReclamos(event);
    if (method === 'PUT' && id) return await actualizarReclamo(id, event);

    return badRequest(`Ruta/metodo no soportado: ${method} ${event.path}`);
  } catch (err) {
    if (err.statusCode === 400) return badRequest(err.message);
    return serverError(err);
  }
};

async function crearReclamo(event) {
  const body = parseBody(event);
  const usuarioCreo = usuarioDesdeClaims(event) || body.usuarioCreo || 'anonimo';

  const requeridos = ['tipoReclamo', 'folioReferencia', 'asunto', 'descripcion', 'prioridad', 'ubigeoIncidente', 'direccionIncidente'];
  const faltantes = requeridos.filter((campo) => !body[campo]);
  if (faltantes.length) {
    return badRequest(`Campos obligatorios faltantes: ${faltantes.join(', ')}`);
  }
  if (!PRIORIDADES_VALIDAS.includes(body.prioridad)) {
    return badRequest(`Prioridad invalida. Valores permitidos: ${PRIORIDADES_VALIDAS.join(', ')}`);
  }

  const sql = `
    INSERT INTO reclamos
      (tipo_reclamo, folio_referencia, asunto, descripcion, prioridad,
       fecha_registro, estado_ticket, ubigeo_incidente, direccion_incidente, usuario_creo)
    VALUES (?, ?, ?, ?, ?, NOW(), 'ABIERTO', ?, ?, ?)
  `;
  const params = [
    body.tipoReclamo,
    body.folioReferencia,
    body.asunto,
    body.descripcion,
    body.prioridad,
    body.ubigeoIncidente,
    body.direccionIncidente,
    usuarioCreo,
  ];

  const result = await query(sql, params);
  const reclamoId = result.insertId;

  await sqs.send(
    new SendMessageCommand({
      QueueUrl: process.env.SQS_QUEUE_URL,
      MessageBody: JSON.stringify({
        reclamoId,
        tipoReclamo: body.tipoReclamo,
        prioridad: body.prioridad,
        accion: 'RECLAMO_CREADO',
      }),
      MessageAttributes: {
        prioridad: { DataType: 'String', StringValue: body.prioridad },
      },
    })
  );

  logInfo('RECLAMO_CREADO', { reclamoId, prioridad: body.prioridad });

  return created({ id: reclamoId, estadoTicket: 'ABIERTO', mensaje: 'Reclamo registrado correctamente' });
}

async function obtenerReclamo(id) {
  const rows = await query('SELECT * FROM reclamos WHERE id = ?', [id]);
  if (!rows.length) return notFound(`No existe el reclamo con id ${id}`);
  return ok(mapReclamo(rows[0]));
}

async function listarReclamos(event) {
  const params = (event.queryStringParameters) || {};
  const limit = Math.min(Number(params.limit) || 50, 200);
  const offset = Number(params.offset) || 0;

  let sql = 'SELECT * FROM reclamos';
  const args = [];
  if (params.estado) {
    sql += ' WHERE estado_ticket = ?';
    args.push(params.estado);
  }
  sql += ' ORDER BY fecha_registro DESC LIMIT ? OFFSET ?';
  args.push(limit, offset);

  const rows = await query(sql, args);
  return ok({ items: rows.map(mapReclamo), count: rows.length });
}

async function actualizarReclamo(id, event) {
  const body = parseBody(event);
  const campos = [];
  const valores = [];

  if (body.estadoTicket) {
    campos.push('estado_ticket = ?');
    valores.push(body.estadoTicket);
  }
  if (body.respuestaSoporte) {
    campos.push('respuesta_soporte = ?');
    valores.push(body.respuestaSoporte);
  }
  if (body.usuarioResolvio) {
    campos.push('usuario_resolvio = ?');
    valores.push(body.usuarioResolvio);
  }
  if (body.estadoTicket === 'RESUELTO') {
    campos.push('fecha_resolucion = NOW()');
  }

  if (!campos.length) return badRequest('No se enviaron campos para actualizar');

  valores.push(id);
  const result = await query(`UPDATE reclamos SET ${campos.join(', ')} WHERE id = ?`, valores);
  if (!result.affectedRows) return notFound(`No existe el reclamo con id ${id}`);

  logInfo('RECLAMO_ACTUALIZADO', { id, campos: Object.keys(body) });
  return ok({ id, mensaje: 'Reclamo actualizado correctamente' });
}

function usuarioDesdeClaims(event) {
  const claims = event.requestContext && event.requestContext.authorizer && event.requestContext.authorizer.claims;
  return claims && (claims['cognito:username'] || claims.email);
}

function mapReclamo(row) {
  return {
    id: row.id,
    tipoReclamo: row.tipo_reclamo,
    folioReferencia: row.folio_referencia,
    asunto: row.asunto,
    descripcion: row.descripcion,
    prioridad: row.prioridad,
    fechaRegistro: row.fecha_registro,
    estadoTicket: row.estado_ticket,
    ubigeoIncidente: row.ubigeo_incidente,
    direccionIncidente: row.direccion_incidente,
    respuestaSoporte: row.respuesta_soporte,
    usuarioResolvio: row.usuario_resolvio,
    fechaResolucion: row.fecha_resolucion,
    usuarioCreo: row.usuario_creo,
  };
}
