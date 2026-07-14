'use strict';

jest.mock('../shared/db', () => ({
  query: jest.fn(),
}));

const mockSend = jest.fn().mockResolvedValue({});
jest.mock('@aws-sdk/client-sqs', () => ({
  SQSClient: jest.fn().mockImplementation(() => ({ send: mockSend })),
  SendMessageCommand: jest.fn().mockImplementation((input) => input),
}));

const { query } = require('../shared/db');
const { handler } = require('../lambda-reclamos/index');

beforeEach(() => {
  jest.clearAllMocks();
  process.env.SQS_QUEUE_URL = 'https://sqs.fake/queue';
});

describe('lambda-reclamos', () => {
  it('crea un reclamo valido y encola el evento en SQS', async () => {
    query.mockResolvedValueOnce({ insertId: 42 });

    const event = {
      httpMethod: 'POST',
      path: '/reclamos',
      body: JSON.stringify({
        tipoReclamo: 'FACTURACION',
        folioReferencia: 'F-001',
        asunto: 'Cobro duplicado',
        descripcion: 'Se me cobro dos veces el mismo servicio',
        prioridad: 'ALTA',
        ubigeoIncidente: '150101',
        direccionIncidente: 'Av. Siempre Viva 123',
      }),
    };

    const res = await handler(event);

    expect(res.statusCode).toBe(201);
    expect(JSON.parse(res.body).id).toBe(42);
    expect(mockSend).toHaveBeenCalledTimes(1);
  });

  it('rechaza un reclamo con campos obligatorios faltantes', async () => {
    const event = {
      httpMethod: 'POST',
      path: '/reclamos',
      body: JSON.stringify({ tipoReclamo: 'FACTURACION' }),
    };

    const res = await handler(event);

    expect(res.statusCode).toBe(400);
    expect(query).not.toHaveBeenCalled();
  });

  it('rechaza una prioridad invalida', async () => {
    const event = {
      httpMethod: 'POST',
      path: '/reclamos',
      body: JSON.stringify({
        tipoReclamo: 'FACTURACION',
        folioReferencia: 'F-001',
        asunto: 'Cobro duplicado',
        descripcion: 'desc',
        prioridad: 'CRITICA',
        ubigeoIncidente: '150101',
        direccionIncidente: 'Av. Siempre Viva 123',
      }),
    };

    const res = await handler(event);
    expect(res.statusCode).toBe(400);
  });

  it('retorna 404 si el reclamo no existe', async () => {
    query.mockResolvedValueOnce([]);
    const event = { httpMethod: 'GET', path: '/reclamos/999', pathParameters: { id: '999' } };

    const res = await handler(event);
    expect(res.statusCode).toBe(404);
  });
});
