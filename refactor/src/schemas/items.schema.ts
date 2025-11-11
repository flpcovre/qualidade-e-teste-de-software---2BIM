import { z } from 'zod';

export const createItemSchema = z.object({
  name: z.string().min(1),
  quantity: z.number().int().nonnegative(),
});

export const createItemResponseSchema = z.object({
  id: z.number().int(),
  name: z.string(),
  quantity: z.number().int().nonnegative(),
}).describe('Customer created successfully');

export const getItemsResponseSchema = z.array(
  z.object({
    id: z.number().int(),
    name: z.string(),
    quantity: z.number().int().nonnegative(),
  }),
);

export type CreateItemInput = z.infer<typeof createItemSchema>;