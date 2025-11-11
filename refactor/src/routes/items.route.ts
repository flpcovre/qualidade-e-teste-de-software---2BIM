import { itemController } from '@refactor/src/controllers/items.controller';
import { createItemResponseSchema, createItemSchema, getItemsResponseSchema } from '@refactor/src/schemas/items.schema';
import { FastifyTypedInstance } from '@refactor/src/types';

export async function itemsRoute(app: FastifyTypedInstance) {
  app.get('/items', {
    schema: {
      tags: ['items'],
      description: 'Lista os items do estoque',
      response: {
        200: getItemsResponseSchema,
      },
    },
  }, itemController.list.bind(itemController));

  app.post('/items', {
    schema: {
      tags: ['items'],
      description: 'Cria um novo Item no estoque',
      body: createItemSchema,
      response: {
        201: createItemResponseSchema,
      },
    },
  }, itemController.create.bind(itemController));
}