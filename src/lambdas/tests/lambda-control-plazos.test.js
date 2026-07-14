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
const { handler } = require('../lambda-control-plazos/index');

beforeEach(() => {
  jest.clearAllMocks();
  process.env.SNS_TOPIC_ALERTS = 'arn:aws:sns:alerts';
  process.env.SNS_TOPIC_URGENT = 'arn:aws:sns:urgent';
});

function horasAtras(horas) {
  return new Date(Date.now() - horas * 3600 * 1000).toISOString().slice(0, 19).replace('T', ' ');
}

describe('lambda-control-plazos', () => {
  it('publica alerta urgente cuando un reclamo ALTA supera el SLA (24h)', async () => {
    query.mockResolvedValueOnce([
      { id: 1, folio_referencia: 'F-001', prioridad: 'ALTA', fecha_registro: horasAtras(30) },
    ]);

    const result = await handler();

    expect(result.vencidos).toBe(1);
    expect(mockSend).toHaveBeenCalledTimes(1);
    const publicado = mockSend.mock.calls[0][0];
    expect(publicado.TopicArn).toBe('arn:aws:sns:urgent');
  });

  it('no publica nada si todos los reclamos estan dentro de su SLA', async () => {
    query.mockResolvedValueOnce([
      { id: 2, folio_referencia: 'F-002', prioridad: 'BAJA', fecha_registro: horasAtras(1) },
    ]);

    const result = await handler();

    expect(result.vencidos).toBe(0);
    expect(result.porVencer).toBe(0);
    expect(mockSend).not.toHaveBeenCalled();
  });
});
