# Avaliações Magda Santos v3 — Deploy no Railway

## Como funciona em produção

```
Internet
    ↓
Railway (URL público ex: magda-fitness.up.railway.app)
    ↓
Spring Boot (serve frontend + API)
    ├── GET /          → React app (frontend compilado)
    ├── POST /api/evaluate
    ├── GET  /api/history/{nome}
    ├── GET  /api/clients
    └── DELETE /api/evaluation/{id}
    ↓
PostgreSQL (gerido pelo Railway)
```

Tudo num só serviço — mais simples e mais barato.

---

## Passo 1 — Criar conta no GitHub (se não tiveres)

O Railway faz deploy directamente a partir de um repositório Git.

1. Vai a https://github.com e cria uma conta gratuita
2. Instala o GitHub Desktop (mais fácil): https://desktop.github.com/
3. Cria um repositório novo chamado `magda-fitness` (privado)
4. Arrasta a pasta `magda-v3/` para dentro do repositório
5. Clica **Commit to main** → **Push origin**

---

## Passo 2 — Criar conta no Railway

1. Vai a https://railway.app
2. Clica **Login** → **Login with GitHub** (usa a conta que acabaste de criar)
3. Autoriza o Railway a aceder ao GitHub

O plano gratuito inclui $5/mês de créditos — suficiente para uso leve.

---

## Passo 3 — Criar o projecto no Railway

1. No dashboard do Railway clica **New Project**
2. Selecciona **Deploy from GitHub repo**
3. Escolhe o repositório `magda-fitness`
4. O Railway detecta o `Dockerfile` automaticamente e começa o build

---

## Passo 4 — Adicionar a base de dados PostgreSQL

1. No projecto Railway clica **+ New** → **Database** → **PostgreSQL**
2. O Railway cria a BD e injeta a variável `DATABASE_URL` automaticamente
3. Não precisas de fazer mais nada — o Spring Boot liga-se sozinho

---

## Passo 5 — Activar o perfil de produção

1. No serviço da app (não na BD) clica em **Variables**
2. Adiciona a variável:
   ```
   SPRING_PROFILES_ACTIVE = prod
   ```
3. O Railway faz redeploy automaticamente

---

## Passo 6 — Obter o URL público

1. No serviço clica em **Settings** → **Networking** → **Generate Domain**
2. O Railway gera um URL do tipo: `magda-fitness.up.railway.app`
3. Partilha esse URL com a Magda — é tudo!

---

## Desenvolvimento local (Windows ou Mac)

Continua exactamente igual à v2 — dois terminais:

```powershell
# Terminal 1 — Backend (usa H2 local, não o PostgreSQL do Railway)
cd magda-v3\backend
mvn spring-boot:run

# Terminal 2 — Frontend
cd magda-v3\frontend
npm install    # só na primeira vez
npm run dev
```

Abre: http://localhost:5173

Em desenvolvimento usa H2 (base de dados em ficheiro local `magda-dev.db`).
Em produção usa PostgreSQL do Railway.
Não há risco de baralhar os dados.

---

## Actualizar o site depois de fazer alterações

Sempre que fizeres alterações ao código:

1. No GitHub Desktop: **Commit** → **Push**
2. O Railway detecta o push e faz redeploy automaticamente (~2-3 minutos)
3. O URL mantém-se o mesmo

---

## Inspecionar a base de dados em desenvolvimento

Em desenvolvimento podes ver os dados directamente em:
http://localhost:8080/h2-console
- JDBC URL: `jdbc:h2:file:./magda-dev.db`
- User: `sa`
- Password: (vazio)

---

## Estrutura do projecto

```
magda-v3/
├── Dockerfile                  ← Build multi-stage (frontend + backend)
├── frontend/                   ← React + Vite (igual à v2)
│   ├── package.json
│   ├── vite.config.js
│   └── src/
└── backend/                    ← Spring Boot
    ├── pom.xml                 ← PostgreSQL + H2
    └── src/main/
        ├── java/com/magda/
        │   ├── FitnessApplication.java
        │   ├── controller/
        │   │   ├── ClientController.java
        │   │   └── SpaController.java  ← serve o React em produção
        │   ├── model/
        │   ├── repository/
        │   └── service/
        └── resources/
            ├── application.properties       ← dev (H2)
            └── application-prod.properties  ← prod (PostgreSQL Railway)
```

---

*Desenvolvido por Simão Santos — LEI, NOVA FCT*
