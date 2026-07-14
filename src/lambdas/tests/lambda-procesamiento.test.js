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
const { handler } = require('../lambda-procesamiento/index');

beforeEach(() => {
  jest.clearAllMocks();
  process.env.SNS_TOPIC_NOTIFICATIONS = 'arn:aws:sns:notifications';
});

function sqsRecord(messageId, body) {
  return { messageId, body: JSON.stringify(body) };
}

describe('lambda-procesamiento', () => {
  it('procesa un reclamo valido: lo pasa a EN_PROCESO y publica en SNS', async () => {
    query
      .mockResolvedValueOnce([{ id: 1, folio_referencia: 'F-001', estado_ticket: 'ABIERTO' }]) // SELECT
      .mockResolvedValueOnce({ affectedRows: 1 }); // UPDATE

    const event = {
      Records: [sqsRecord('msg-1', { reclamoId: 1, prioridad: 'ALTA' })],
    };

    const result = await handler(event);

    expect(result.batchItemFailures).toHaveLength(0);
    expect(mockSend).toHaveBeenCalledTimes(1);
    const publicado = JSON.parse(mockSend.mock.calls[0][0].Message);
    expect(publicado.slaHoras).toBe(24);
  });

  it('usa el SLA por defecto (MEDIA) si la prioridad no viene en el mensaje', async () => {
    query.mockResolvedValueOnce([{ id: 2, folio_referencia: 'F-002', estado_ticket: 'ABIERTO' }]).mockResolvedValueOnce({ affectedRows: 1 });

    const event = { Records: [sqsRecord('msg-2', { reclamoId: 2 })] };
    await handler(event);

    const publicado = JSON.parse(mockSend.mock.calls[0][0].Message);
    expect(publicado.slaHoras).toBe(72);
  });

  it('reporta el mensaje como fallido (batchItemFailures) si el reclamo no existe', async () => {
    query.mockResolvedValueOnce([]); // SELECT no encuentra nada

    const event = { Records: [sqsRecord('msg-3', { reclamoId: 999, prioridad: 'BAJA' })] };
    const result = await handler(event);

    expect(result.batchItemFailures).toEqual([{ itemIdentifier: 'msg-3' }]);
    expect(mockSend).not.toHaveBeenCalled();
  });

  it('procesa el resto del batch aunque un mensaje individual falle', async () => {
    query
      .mockResolvedValueOnce([]) // primer mensaje: reclamo no encontrado
      .mockResolvedValueOnce([{ id: 5, folio_referencia: 'F-005', estado_ticket: 'ABIERTO' }]) // segundo: SELECT ok
      .mockResolvedValueOnce({ affectedRows: 1 }); // segundo: UPDATE ok

    const event = {
      Records: [sqsRecord('msg-fail', { reclamoId: 404 }), sqsRecord('msg-ok', { reclamoId: 5, prioridad: 'MEDIA' })],
    };

    const result = await handler(event);

    expect(result.batchItemFailures).toEqual([{ itemIdentifier: 'msg-fail' }]);
    expect(mockSend).toHaveBeenCalledTimes(1);
  });
});
