# Portal Local E Portas

## Regra Principal

A porta `3000` e reservada para o portal local das aplicacoes.

Nenhuma aplicacao de produto deve usar `localhost:3000` diretamente no desenvolvimento. A porta 3000 deve funcionar como um indice navegavel para abrir os outros servicos do monorepo.

## Mapa Inicial

| App | Workspace | Porta local | URL local | Deploy |
| --- | --- | ---: | --- | --- |
| Portal local | `apps/portal` | 3000 | `http://localhost:3000` | Opcional |
| LipeCare Web | `apps/web` | 3003 | `http://localhost:3003` | CapRover app separado |
| LipeCare API | `apps/api` | 4000 | `http://localhost:4000` | CapRover app separado |
| PostgreSQL | Docker service | 5432 | `localhost:5432` | Banco gerenciado ou servico separado |
| Redis | Docker service | 6379 | `localhost:6379` | Servico separado |

## Como Adicionar Uma Nova Aplicacao

1. Criar a aplicacao em `apps/<nome>`.
2. Escolher uma porta local fixa e documentada.
3. Adicionar scripts `dev`, `build`, `start`, `lint` e `test` no `package.json` da aplicacao.
4. Adicionar um link no registro do portal em `apps/portal/src/app/app-registry.ts`.
5. Atualizar a tabela deste documento.
6. Criar `Dockerfile` proprio quando a aplicacao for deployavel no CapRover.
7. No CapRover, criar um app separado para cada aplicacao deployavel.

## Faixas De Portas

Use as faixas abaixo para evitar conflito:

| Faixa | Uso |
| --- | --- |
| 3000 | Portal local |
| 3001-3999 | Aplicacoes locais sequenciais |
| 4000-4099 | APIs e backends |
| 5000-5999 | Workers, webhooks locais e automacoes |
| 5432 | PostgreSQL local |
| 6379 | Redis local |

## GitHub E CapRover

O repositorio continua sendo um monorepo. Cada aplicacao deployavel deve ter Dockerfile proprio, por exemplo:

```text
apps/portal/Dockerfile
apps/web/Dockerfile
apps/api/Dockerfile
```

No CapRover, prefira um app por servico:

```text
lipecare-web
lipecare-api
lipecare-portal
```

O portal local e principalmente uma ferramenta de desenvolvimento. Se for publicado, ele deve apontar para URLs publicas de staging/producao, nunca para `localhost`.

## Regra Para IA/Codex

Ao criar, alterar ou revisar aplicacoes neste repositorio, sempre preservar:

- `apps/portal` como dono da porta local `3000`;
- portas locais fixas e documentadas;
- link de cada aplicacao no portal;
- Dockerfile separado por aplicacao deployavel;
- documentacao atualizada quando houver nova porta, app ou servico.
