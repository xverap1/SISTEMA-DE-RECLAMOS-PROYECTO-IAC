'use strict';

const mockSend = jest.fn().mockResolvedValue({});
jest.mock('@aws-sdk/client-ses', () => ({
  SESClient: jest.fn().mockImplementation(() => ({ send: mockSend })),
  SendEmailCommand: jest.fn().mockImplementation((input) => input),
}));

const { handler } = require('../lambda-notificaciones/index');

beforeEach(() => {
  jest.clearAllMocks();
  process.env.FROM_EMAIL = 'no-reply@reclamos.test';
  process.env.SES_CONFIG_SET = 'reclamos-config-set';
});

function snsRecord(messageId, subject, message) {
  return { Sns: { MessageId: messageId, Subject: subject, Message: typeof message === 'string' ? message : JSON.stringify(message), TopicArn: 'arn:aws:sns:x' } };
}

describe('lambda-notificaciones', () => {
  it('envia un correo con el contenido de un mensaje SNS en formato JSON', async () => {
    const event = { Records: [snsRecord('1', 'Reclamo en proceso', { mensaje: 'Tu reclamo fue recibido' })] };

    const result = await handler(event);

    expect(mockSend).toHaveBeenCalledTimes(1);
    expect(result[0].estado).toBe('ENVIADO');
    const enviado = mockSend.mock.calls[0][0];
    expect(enviado.Source).toBe('no-reply@reclamos.test');
    expect(enviado.Message.Body.Text.Data).toContain('Tu reclamo fue recibido');
  });

  it('usa el texto plano tal cual si el mensaje SNS no es JSON valido', async () => {
    const event = { Records: [snsRecord('2', 'Alerta', 'esto no es JSON')] };

    await handler(event);

    const enviado = mockSend.mock.calls[0][0];
    expect(enviado.Message.Body.Text.Data).toBe('esto no es JSON');
  });

  it('procesa varios mensajes del mismo batch, uno por cada registro SNS', async () => {
    const event = {
      Records: [snsRecord('a', 'Uno', { mensaje: 'primero' }), snsRecord('b', 'Dos', { mensaje: 'segundo' })],
    };

    const result = await handler(event);

    expect(mockSend).toHaveBeenCalledTimes(2);
    expect(result).toHaveLength(2);
  });

  it('relanza el error si SES falla, para que SNS reintente la entrega', async () => {
    mockSend.mockRejectedValueOnce(new Error('SES no disponible'));
    const event = { Records: [snsRecord('3', 'Falla', { mensaje: 'x' })] };

    await expect(handler(event)).rejects.toThrow('SES no disponible');
  });
});
