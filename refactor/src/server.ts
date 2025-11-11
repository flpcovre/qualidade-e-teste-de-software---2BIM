import { fastify } from 'fastify';
import { fastifyCors } from '@fastify/cors';
import { validatorCompiler, serializerCompiler } from 'fastify-type-provider-zod';
import { itemsRoute } from '@refactor/src/routes/items.route';
import { ZodTypeProvider } from 'fastify-type-provider-zod';

export const app = fastify().withTypeProvider<ZodTypeProvider>();

app.setValidatorCompiler(validatorCompiler);
app.setSerializerCompiler(serializerCompiler);

app.register(fastifyCors, { origin: '*' });

app.register(itemsRoute);

app.listen({ port: 3333 }).then(() => {
  console.log('HTTP Server is Running');
});
