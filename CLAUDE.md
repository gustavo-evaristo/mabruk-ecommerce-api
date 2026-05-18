# Mabruk API — Guia para Claude

API monolítica NestJS que serve **dois mundos** num único deploy:

- **B2C** (`/b2c/*`) — loja pública (catálogo, carrinho, checkout, conta do cliente, pedidos)
- **B2B** (`/b2b/*`) — painel do dono (CRUD de catálogo, gestão de pedidos/estoque/banners, dashboard)

Inspirada no projeto `../bot/bot-api` — mesma stack e convenções de Clean Architecture.

## Stack

- **Runtime**: Node 24, pnpm
- **Framework**: NestJS 11
- **ORM**: Prisma 7 + PostgreSQL (Supabase)
- **Auth**: passport-jwt — **duas strategies** (`customer-jwt` e `admin-jwt`)
- **Validação**: class-validator + class-transformer (auto via `ValidationPipe`)
- **Docs**: Swagger em `/api`
- **Testes**: Vitest

## Arquitetura

```
src/
├── domain/                       # framework-agnostic
│   ├── entities/                 # *.entity.ts + vos/ (UUID, Password, Email, Money…)
│   ├── repositories/             # I*Repository (abstract class)
│   ├── services/                 # adapter interfaces (PaymentGateway, ShippingCalculator, MailSender, ImageStorage)
│   └── use-cases/                # operação de negócio = uma classe + execute()
└── infra/                        # NestJS / Prisma
    ├── controllers/{b2c,b2b}/    # rotas, agrupadas por contexto e por feature
    ├── database/                 # PrismaService + impls dos repositories + DatabaseModule
    ├── dtos/                     # request DTOs (class-validator)
    ├── responses/                # response DTOs (Swagger @ApiProperty)
    ├── authentication/           # 2 strategies + 2 guards
    ├── payment/                  # impl mock do PaymentGateway
    ├── shipping/                 # impl mock do ShippingCalculator
    ├── mail/                     # impl console do MailSender
    ├── storage/                  # impl local do ImageStorage
    └── middlewares/              # exception filter global
```

## Convenções de código

1. **Domain nunca importa NestJS direto** (exceto `@Injectable` em use cases — necessário para DI).
2. **Repository é abstract class** (não interface) — Nest precisa de classe para `provide`.
3. **Use case**: 1 classe = 1 operação, método `execute()` com `interface Input` / `interface Output`.
4. **Use case throws `Error` plain**, não `HttpException`. O `CustomExceptionFilter` converte para 400 (status code default). Para 401/404 use `UnauthorizedException`/`NotFoundException` do Nest.
5. **Controller é thin**: chama use case, formata response. Nada de regra de negócio.
6. **DTO em request, response class em resposta** — ambos com decorators Swagger.
7. **Mapper Prisma → Entity** dentro do método do repository impl. Nunca expõe shape Prisma fora do `infra/database`.
8. **Money em centavos (Int)** no banco; nunca float em valores monetários.

## Adapters externos (estão **mockados** no MVP)

| Interface (`src/domain/services/`) | Impl atual (`src/infra/`) | Substituir por (futuro) |
|---|---|---|
| `PaymentGateway` | `payment/fake-payment.gateway.ts` | Mercado Pago |
| `ShippingCalculator` | `shipping/fixed-shipping.calculator.ts` | Melhor Envio |
| `MailSender` | `mail/console-mail.sender.ts` | SendGrid |
| `ImageStorage` | `storage/local-image.storage.ts` | Supabase Storage |

Trocar uma implementação = mudar o `useClass` no Module — zero impacto em use cases / controllers.

## Comandos

```bash
pnpm install
cp .env.example .env       # preencher DATABASE_URL com Supabase
pnpm prisma:generate
pnpm prisma:migrate        # cria/aplica migrations
pnpm dev                   # http://localhost:3000  (Swagger em /api)
pnpm test
pnpm lint
```

## Autenticação

- `POST /b2c/customers/login` → JWT (customer)
- `POST /b2b/auth/login` → JWT (admin)
- Header: `Authorization: Bearer <token>`
- Rotas B2B usam `@UseGuards(AdminJwtGuard)`; rotas B2C autenticadas usam `@UseGuards(CustomerJwtGuard)`.
- **Guest cart**: o cliente cria carrinho sem login. Resposta contém `guestToken` (UUID). Os requests subsequentes ao cart enviam esse token (header `X-Cart-Token`) para validar posse.

### Criar o primeiro admin

Não há seed automática. Para criar o admin inicial, insira direto no banco via Prisma Studio (`pnpm prisma studio`) ou SQL — hashear a senha com bcrypt (10 rounds). Exemplo Node:

```js
const bcrypt = require('bcrypt');
const hash = await bcrypt.hash('SuaSenhaForte', 10);
// INSERT INTO admins (id, name, email, password, role) VALUES (...)
```

## Estoque

Estoque **só decrementa quando pagamento é aprovado** (`ProcessPaymentWebhookUseCase`), num único `prisma.$transaction` que atualiza Order, Payment, decrementa estoque das variants e grava StockMovement de auditoria. Não há reserva no carrinho — risco de oversell aceitável no MVP.

## Padrão de variações

Um `Product` tem **N `ProductVariant`** — cada variant é a combinação `banho × size` com SKU/preço/estoque próprio. Constraint `@@unique([productId, banho, size])`. O front renderiza seletor de banho e seletor de tamanho separados e busca a variant correspondente. Ver `domain/entities/product-variant.entity.ts`.

## Money

Tudo em centavos (Int). O VO `Money` ajuda a formatar/operar sem perder precisão. Nunca usar `Float` para preços.

## Não está no MVP

Cupons, reviews, wishlist, NF-e automática, WhatsApp, login social, RBAC granular, busca textual avançada, reserva de estoque no carrinho. Estruturado para evoluir sem refactor: adicionar cupom = nova entity + use case `ApplyCouponUseCase` no checkout.
