# Avaliações Magda Santos — Deploy no Render (Gratuito)

## Porquê o Render?
- Plano gratuito permanente (sem cartão de crédito obrigatório)
- PostgreSQL gratuito incluído
- Deploy automático a cada push para o GitHub
- O único "custo" é que o servidor adormece após 15min sem uso
  → O primeiro acesso depois de inactivo demora ~30 segundos

---

## Estrutura do projecto

```
magda-render/
├── render.yaml          ← Diz ao Render o que criar (app + BD)
├── render-build.sh      ← Script de build (frontend + backend)
├── frontend/            ← React + Vite
└── backend/             ← Spring Boot
    └── src/main/resources/
        ├── application.properties       ← dev local (H2)
        └── application-prod.properties  ← produção (PostgreSQL Render)
```

---

## Deploy — Passo a Passo

### Passo 1 — Código no GitHub
1. Cria conta em https://github.com
2. Instala GitHub Desktop: https://desktop.github.com/
3. Cria repositório privado chamado magda-fitness
4. Arrasta a pasta magda-render/ para o GitHub Desktop
5. Commit to main → Push origin

### Passo 2 — Conta no Render
1. Vai a https://render.com → Get Started for Free
2. Regista com conta GitHub

### Passo 3 — Blueprint (cria app + BD de uma vez)
1. Dashboard Render → New → Blueprint
2. Liga o repositório magda-fitness
3. O Render lê o render.yaml e mostra o que vai criar
4. Clica Apply — primeiro build demora 5-10 minutos

### Passo 4 — Confirmar variável de ambiente
No serviço magda-fitness → Environment → confirmar:
  SPRING_PROFILES_ACTIVE = prod
Se não existir, adiciona manualmente e clica Save Changes.

### Passo 5 — URL público
Quando o deploy ficar verde, o URL aparece no topo do serviço:
  https://magda-fitness.onrender.com

---

## Desenvolvimento local (Windows)

```powershell
# Terminal 1
cd magda-render\backend
mvn spring-boot:run

# Terminal 2
cd magda-render\frontend
npm install
npm run dev
```

Abre: http://localhost:5173

---

Desenvolvido por Simão Santos — LEI, NOVA FCT
