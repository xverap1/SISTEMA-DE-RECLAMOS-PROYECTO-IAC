'use strict';

const CORS_HEADERS = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token',
  'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS',
};

function response(statusCode, body) {
  return {
    statusCode,
    headers: CORS_HEADERS,
    body: JSON.stringify(body),
  };
}

const ok = (body) => response(200, body);
const created = (body) => response(201, body);
const badRequest = (message) => response(400, { error: message });
const notFound = (message = 'Recurso no encontrado') => response(404, { error: message });
const serverError = (err) => {
  logError('UNHANDLED_ERROR', err);
  return response(500, { error: 'Error interno del servidor' });
};

/**
 * Logging estructurado en JSON. CloudWatch Logs indexa estos campos y
 * permite consultarlos luego con CloudWatch Logs Insights
 * (ver iac/cloudwatch.tf -> aws_cloudwatch_query_definition.lambda_errors,
 * que filtra por el literal "ERROR").
 */
function logInfo(event, data = {}) {
  console.log(JSON.stringify({ level: 'INFO', event, ...data, timestamp: new Date().toISOString() }));
}

function logError(event, err, data = {}) {
  console.error(
    JSON.stringify({
      level: 'ERROR',
      event,
      message: err && err.message ? err.message : String(err),
      stack: err && err.stack ? err.stack : undefined,
      ...data,
      timestamp: new Date().toISOString(),
    })
  );
}

function parseBody(evt) {
  if (!evt || !evt.body) return {};
  try {
    return typeof evt.body === 'string' ? JSON.parse(evt.body) : evt.body;
  } catch (err) {
    throw Object.assign(new Error('El cuerpo de la peticion no es un JSON valido'), { statusCode: 400 });
  }
}

module.exports = { ok, created, badRequest, notFound, serverError, logInfo, logError, parseBody };
