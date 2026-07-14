'use strict';

jest.mock('../shared/db', () => ({
  query: jest.fn(),
}));

const mockSend = jest.fn().mockResolvedValue({});
jest.mock('@aws-sdk/client-sns', () => ({
  SNSClient: jest.fn().mockImplementation(() => ({ send: mockSend })),
  PublishCommand: jest.fn().mockImplementation((input) => input),
}));

const { query } = require('../shared/db');
const { handler } = require('../lambda-reportes/index');

beforeEach(() => {
  jest.clearAllMocks();
  process.env.SNS_TOPIC_REPORTES = 'arn:aws:sns:reportes';
  process.env.BACKLOG_ALERT_THRESHOLD = '50';
});

describe('lambda-reportes', () => {
  it('devuelve las metricas agregadas sin disparar alerta si el backlog es bajo', async () => {
    query
      .mockResolvedValueOnce([{ estado: 'ABIERTO', total: 10 }]) // porEstado
      .mockResolvedValueOnce([{ prioridad: 'ALTA', total: 4 }]) // porPrioridad
      .mockResolvedValueOnce([{ horas_promedio: 12.5 }]); // tiempo promedio

    const event = { httpMethod: 'GET', path: '/reportes', queryStringParameters: null };
    const res = await handler(event);
    const body = JSON.parse(res.body);

    expect(res.statusCode).toBe(200);
    expect(body.horasPromedioResolucion).toBe(12.5);
    expect(mockSend).not.toHaveBeenCalled();
  });

  it('publica una alerta en SNS si el backlog de reclamos abiertos supera el umbral', async () => {
    query
      .mockResolvedValueOnce([{ estado: 'ABIERTO', total: 80 }])
      .mockResolvedValueOnce([{ prioridad: 'ALTA', total: 30 }])
      .mockResolvedValueOnce([{ horas_promedio: 40 }]);

    const event = { httpMethod: 'GET', path: '/reportes', queryStringParameters: null };
    await handler(event);

    expect(mockSend).toHaveBeenCalledTimes(1);
    expect(mockSend.mock.calls[0][0].Subject).toMatch(/backlog/i);
  });

  it('respeta el rango de fechas recibido por query string', async () => {
    query
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([{ horas_promedio: null }]);

    const event = {
      httpMethod: 'GET',
      path: '/reportes',
      queryStringParameters: { desde: '2026-01-01 00:00:00', hasta: '2026-01-31 23:59:59' },
    };
    const res = await handler(event);
    const body = JSON.parse(res.body);

    expect(body.periodo.desde).toBe('2026-01-01 00:00:00');
    expect(body.periodo.hasta).toBe('2026-01-31 23:59:59');
  });

  it('devuelve 500 si la base de datos falla', async () => {
    query.mockRejectedValueOnce(new Error('conexion perdida'));

    const event = { httpMethod: 'GET', path: '/reportes', queryStringParameters: null };
    const res = await handler(event);

    expect(res.statusCode).toBe(500);
  });
});
