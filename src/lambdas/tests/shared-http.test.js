'use strict';

const { ok, created, badRequest, notFound, parseBody } = require('../shared/http');

describe('shared/http', () => {
  it('ok() arma una respuesta 200 con headers CORS y el body en JSON', () => {
    const res = ok({ mensaje: 'todo bien' });

    expect(res.statusCode).toBe(200);
    expect(res.headers['Access-Control-Allow-Origin']).toBe('*');
    expect(JSON.parse(res.body)).toEqual({ mensaje: 'todo bien' });
  });

  it('created() arma una respuesta 201', () => {
    const res = created({ id: 42 });
    expect(res.statusCode).toBe(201);
  });

  it('badRequest() y notFound() devuelven los codigos y mensajes correctos', () => {
    const bad = badRequest('falta un campo');
    const notF = notFound('no existe');

    expect(bad.statusCode).toBe(400);
    expect(JSON.parse(bad.body).error).toBe('falta un campo');
    expect(notF.statusCode).toBe(404);
    expect(JSON.parse(notF.body).error).toBe('no existe');
  });

  it('parseBody() parsea un body JSON valido', () => {
    const evt = { body: JSON.stringify({ a: 1 }) };
    expect(parseBody(evt)).toEqual({ a: 1 });
  });

  it('parseBody() devuelve un objeto vacio si no hay body', () => {
    expect(parseBody({})).toEqual({});
    expect(parseBody(undefined)).toEqual({});
  });

  it('parseBody() lanza un error con statusCode 400 si el body no es JSON valido', () => {
    const evt = { body: '{esto no es json' };
    expect(() => parseBody(evt)).toThrow('El cuerpo de la peticion no es un JSON valido');
  });
});
