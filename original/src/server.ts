import { fastify } from 'fastify';
import { addItem, getItems } from '@original/src/items';

/**
 * Ausência total de validação e tipagens (público aceita qualquer payload).
 * Uso de any, variáveis globais mutáveis e estado não encapsulado.
 * Rota POST retorna 200 mesmo quando deveria retornar 201 ou 400.
 * Não há tratamento de erros nem mensagens úteis (usabilidade ruim).
 * Código monolítico sem separação de camadas (controller/service/schema).
*/

export const app = fastify();

app.post('/items', async(req, res) => {
  const body: any = req.body;

  const item = addItem(body);

  return res.code(200).send(item);
});

app.get('/items', async(req, res) => {
  return res.send(getItems());
});

app.listen({ port: 3333 }).then(() => {
  console.log('Server is running on http://localhost:3333');
});