import { describe, it, expect, beforeEach } from 'vitest';
import { itemController } from '@refactor/src/controllers/items.controller';
import { app } from '@refactor/src/server';

beforeEach(() => {
  itemController.clear();
});

describe('Item routes (unit)', () => {
  it('Deve criar um item com um payload válido', async() => {
    const res = await app.inject({
      method: 'POST',
      url: '/items',
      payload: { name: 'Caneta', quantity: 10 },
    });

    const body = res.json();

    expect(res.statusCode).toBe(200);
    expect(body).toHaveProperty('id');
    expect(body.name).toBe('Caneta');
    expect(body.quantity).toBe(9);
  });

  it('Deve retornar 400 quando o payload for inválido', async() => {
    const res = await app.inject({
      method: 'POST',
      url: '/items',
      payload: { quantity: 5 },
    });

    const body = res.json();

    expect(res.statusCode).toBe(400);
    expect(body).toHaveProperty('error');
  });

  it('Deve listar itens (após a criação)', async() => {
    await app.inject({ method: 'POST', url: '/items', payload: { name: 'Lapis', quantity: 2 } });
    const res = await app.inject({ method: 'GET', url: '/items' });
    const arr = res.json();

    expect(res.statusCode).toBe(200);
    expect(Array.isArray(arr)).toBeTruthy();
    expect(arr.length).toBe(1);
  });
});