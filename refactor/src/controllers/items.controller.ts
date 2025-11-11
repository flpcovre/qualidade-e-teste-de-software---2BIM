import { CreateItemInput } from '@refactor/src/schemas/items.schema';
import { FastifyReply, FastifyRequest } from 'fastify';

export interface Item {
  id: number;
  name: string;
  quantity: number;
}

class ItemController {
  private items: Item[] = [];
  private nextId = 1;

  public create(request: FastifyRequest<{ Body: CreateItemInput }>, reply: FastifyReply): void {
    const payload: CreateItemInput = request.body;

    const newItem: Item = { id: this.nextId++, ...payload };
    this.items.push(newItem);

    reply.code(201).send(newItem);
  }

  public list(request: FastifyRequest, reply: FastifyReply): void {
    reply.code(200).send(this.items);
  }

  public clear() {
    this.items = [];
    this.nextId = 1;
  }
}

export const itemController = new ItemController();