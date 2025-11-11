import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { app } from '@original/src/server';

describe('Original API Items', () => {

  it('deve retornar 400 ao criar item sem payload válido', async() => {
    const response = await request(app.server)
      .post('/items')
      .send({}); // Enviando payload vazio

    // Teste espera status 400, mas API retorna 200
    expect(response.status).toBe(400);
  });

  it('deve retornar status 201 ao criar item corretamente', async() => {
    const response = await request(app.server)
      .post('/items')
      .send({ name: 'Item 1' });

    // Teste espera status 201, mas API retorna 200
    expect(response.status).toBe(201);
  });

  it('não deve permitir atributos inesperados no payload', async() => {
    const response = await request(app.server)
      .post('/items')
      .send({ name: 'Item 3', quantity: 20, foo: 'bar' });

    // Espera que API recuse atributos extras → mas ela aceita tudo
    expect(response.status).toBe(400);
  });

});
