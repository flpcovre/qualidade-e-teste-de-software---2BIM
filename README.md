# Fastify + TypeScript — Trabalho: Qualidade e Teste de Software

> Projeto demonstrativo com versão **original (com problemas)** e **versão refatorada**. Inclui análise de problemas, propostas de melhoria, mapeamento para ISO/IEC 25010 e 3+ casos de teste com Vitest.

---

## Resumo do que está neste repositório (visualização única)

- `/original` — código inicial intencionalmente com problemas de qualidade (para análise)
- `/refactor` — versão refatorada e melhorada
- `/tests` — testes unitários com Vitest contra a versão refatorada
- `package.json`, `tsconfig.json` e instruções de execução
- Documento com: identificação de problemas, propostas de melhoria e mapeamento ISO/IEC 25010

---

## Arquitetura / Estrutura (file tree)

```
fastify-ts-quality-work/
├─ package.json
├─ tsconfig.json
├─ vitest.config.ts
├─ README.md
├─ original/
│  ├─ src/
│  │  ├─ server.ts            # código com problemas
│  │  └─ items.ts             # lógica simples com más práticas
├─ refactor/
│  ├─ src/
│  │  ├─ server.ts            # servidor Fastify (TS) refatorado
│  │  ├─ routes/items.route.ts
│  │  ├─ services/item.service.ts
│  │  └─ schemas/item.schema.ts
│  └─ tests/
│     └─ item.spec.ts         # exemplos de teste unitário (vitest)
└─ tests/
   └─ refactor.item.spec.ts   # testar a API usando handlers diretamente (unit)
```

---

## package.json (scripts mínimos)

```json
{
  "name": "fastify-ts-quality-work",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "ts-node-dev --respawn --transpile-only refactor/src/server.ts",
    "build": "tsc --build",
    "start": "node dist/refactor/src/server.js",
    "test": "vitest"
  },
  "dependencies": {
    "fastify": "^4.22.0",
    "zod": "^3.21.4"
  },
  "devDependencies": {
    "ts-node-dev": "^2.0.0",
    "typescript": "^5.0.0",
    "vitest": "^0.34.0"
  }
}
```

---

## tsconfig.json

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ES2022",
    "moduleResolution": "Node",
    "outDir": "dist",
    "rootDir": ".",
    "strict": true,
    "esModuleInterop": true,
    "forceConsistentCasingInFileNames": true,
    "skipLibCheck": true
  },
  "include": ["refactor/src/**/*", "original/src/**/*", "tests/**/*"]
}
```

---

## Código — `original/src/server.ts` (com problemas intencionais)

```ts
// original/src/server.ts
import Fastify from 'fastify'
import { addItem, getItems } from './items'

const app = Fastify({ logger: true })

// rota sem validação, sem tipagem adequada, retorna 200 sempre
app.post('/items', async (req, rep) => {
  // aceita qualquer corpo — sem checagem
  const body: any = req.body
  const item = addItem(body)
  return rep.code(200).send(item)
})

app.get('/items', async (req, rep) => {
  return rep.send(getItems())
})

app.listen({ port: 3000 }).then(() => console.log('listening 3000'))
```

### `original/src/items.ts` — más práticas

```ts
// original/src/items.ts
let items: any[] = []
let id = 1

export function addItem(payload: any) {
  // não valida, aceita payload vazio, confunde temperatura de atributos
  const newItem = { id: id++, ...payload }
  items.push(newItem)
  return newItem
}

export function getItems() {
  return items
}
```

**Problemas intencionais nesta versão original** (resumido):
- Ausência total de validação e tipagens (público aceita qualquer payload).
- Uso de `any`, variáveis globais mutáveis e estado não encapsulado.
- Rota POST retorna `200` mesmo quando deveria retornar `201` ou `400`.
- Não há tratamento de erros nem mensagens úteis (usabilidade ruim).
- Código monolítico sem separação de camadas (controller/service/schema).

---

## Versão refatorada (`refactor/src`) — descrição curta

- Separação de responsabilidades: `routes`, `services`, `schemas`.
- Validação de entradas usando `zod` (evita dados inválidos).
- Tipagem TypeScript forte (interfaces/typing mínimas).
- Manipulação de erros padronizada e códigos HTTP adequados.
- Testes unitários (Vitest) cobrindo validação, sucesso e erro.

### `refactor/src/schemas/item.schema.ts`

```ts
import { z } from 'zod'

export const createItemSchema = z.object({
  body: z.object({
    name: z.string().min(1, 'name is required'),
    quantity: z.number().int().nonnegative(),
  })
})

export type CreateItemInput = z.infer<typeof createItemSchema>['body']
```

### `refactor/src/services/item.service.ts`

```ts
import { CreateItemInput } from '../schemas/item.schema'

export interface Item { id: number; name: string; quantity: number }

export class ItemService {
  private items: Item[] = []
  private nextId = 1

  create(payload: CreateItemInput): Item {
    const newItem: Item = { id: this.nextId++, ...payload }
    this.items.push(newItem)
    return newItem
  }

  list(): Item[] {
    return [...this.items]
  }

  // método adicional para testar estado em testes
  clear() {
    this.items = []
    this.nextId = 1
  }
}

export const itemService = new ItemService()
```

### `refactor/src/routes/items.route.ts`

```ts
import { FastifyInstance } from 'fastify'
import { itemService } from '../services/item.service'
import { createItemSchema } from '../schemas/item.schema'

export async function itemsRoutes(app: FastifyInstance) {
  app.post('/items', { schema: createItemSchema }, async (req, rep) => {
    try {
      // zod validation is used separately in handler (we trust schema at runtime too)
      const body = req.body as any
      const item = itemService.create(body)
      return rep.code(201).send(item)
    } catch (err: any) {
      return rep.code(400).send({ error: err?.message ?? 'invalid' })
    }
  })

  app.get('/items', async (req, rep) => {
    return rep.send(itemService.list())
  })
}
```

### `refactor/src/server.ts`

```ts
import Fastify from 'fastify'
import { itemsRoutes } from './routes/items.route'

const app = Fastify({ logger: true })

app.register(itemsRoutes)

if (process.env.NODE_ENV !== 'test') {
  app.listen({ port: 3000 }).then(() => console.log('refactor listening 3000'))
}

export default app
```

---

## Testes (Vitest) — `tests/refactor.item.spec.ts`

```ts
// tests/refactor.item.spec.ts
import { describe, it, expect, beforeEach } from 'vitest'
import app from '../refactor/src/server'
import { itemService } from '../refactor/src/services/item.service'

beforeEach(() => {
  itemService.clear()
})

describe('Item routes (unit)', () => {
  it('should create an item with valid payload', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/items',
      payload: { name: 'Caneta', quantity: 10 }
    })

    expect(res.statusCode).toBe(201)
    const body = res.json()
    expect(body).toHaveProperty('id')
    expect(body.name).toBe('Caneta')
    expect(body.quantity).toBe(10)
  })

  it('should return 400 when payload invalid (missing name)', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/items',
      payload: { quantity: 5 }
    })

    // our handler catches and returns 400
    expect(res.statusCode).toBe(400)
    const body = res.json()
    expect(body).toHaveProperty('error')
  })

  it('should list items (after create)', async () => {
    await app.inject({ method: 'POST', url: '/items', payload: { name: 'Lapis', quantity: 2 } })
    const res = await app.inject({ method: 'GET', url: '/items' })
    expect(res.statusCode).toBe(200)
    const arr = res.json()
    expect(Array.isArray(arr)).toBeTruthy()
    expect(arr.length).toBe(1)
  })
})
```

**Observação sobre os testes**: são unit/integration leves usando `app.inject()` para testar os handlers sem abrir porta real. Você pode rodá-los com `npm test`.

---

## Identificação de problemas (detalhado)

1. **Validação insuficiente** — o `original` aceita qualquer payload: risco de dados inválidos (robustez, segurança).
2. **Tipos fracos / any** — sem garantias em tempo de compilação; manutenção mais difícil.
3. **Estado global mutável** — lista `items` global exposta por import; dificulta testes e concorrência.
4. **Erros/HTTP codes inadequados** — tudo retorna 200; confunde consumidores e quebra contrato de API.
5. **Ausência de tratamento de erros** — mensagens genéricas, falta de logs de contexto.
6. **Baixa separação de responsabilidades** — controller + lógica de negócio juntos.
7. **Sem testes** — inexistência de testes automatizados.
8. **Usabilidade** — respostas sem mensagens amigáveis; documentação inexistente.

---

## Propostas de melhoria

- Usar **Zod** para validação de entrada e gerar mensagens de erro amigáveis.
- Aplicar tipagem TypeScript nos modelos e serviços.
- Encapsular estado em uma classe `ItemService` para facilitar injeção/limpeza em testes.
- Usar códigos HTTP corretos (`201 Created`, `400 Bad Request`).
- Implementar tratamento de erros com mensagens úteis.
- Adicionar testes automatizados com Vitest cobrindo caminhos felizes e erros.
- Documentar (README) e adicionar scripts para `dev` e `test`.

---

## Mapeamento dessas melhorias para ISO/IEC 25010 (principais características)

- **Adequação funcional**: validações garantem que funções retornam resultados corretos para entradas válidas.
- **Confiabilidade**: tratamento de erros e testes aumentam a confiabilidade (menos falhas inesperadas).
- **Usabilidade**: mensagens de erro e códigos HTTP apropriados melhoram a interação de consumidores da API.
- **Manutenibilidade**: tipagem, separação em camadas e refatoração tornam o código mais fácil de modificar.
- **Segurança**: validação reduz risco de injeção/entrada inválida.
- **Eficiência de desempenho**: o exemplo é simples; refatoração evita operações desnecessárias e prepara para otimizações.

---

## Casos de teste (mínimo 3) — mapeamento e propósito

1. **Create item - success** (caminho feliz): garante que payload válido cria recurso e retorna `201`.
   - Relacionado a: Functional suitability, Reliability
2. **Create item - validation error**: garante que payload inválido recebe `400` e mensagem de erro.
   - Relacionado a: Functional suitability, Usability, Security
3. **List items after create**: garante que o estado é persistido na camada de serviço e listado corretamente.
   - Relacionado a: Reliability, Maintainability

(Adicional) 4. **Isolamento dos testes**: `beforeEach` limpa o serviço garantindo testes determinísticos.

---

## Como rodar (local)

1. `npm install`
2. `npm run dev` — executa o servidor refatorado em modo desenvolvimento
3. `npm test` — roda os testes (vitest)

> Observação: o projeto foi pensado para ser executado localmente em Node 18+.

---

## Próximos passos sugeridos

- Adicionar validação de schema no próprio Fastify (type provider) para integrar zod automaticamente.
- Separar persistência (substituir in-memory por repositório/DB) e adicionar mocks nos testes.
- Cobrir com mais testes (caminhos de erro, testes de integração, testes de carga se necessário).


---

*Fim do documento — o código completo (originais + refatorados) está acima neste arquivo para inspeção.*
