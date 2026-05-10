# Avaliações Fitness — Deploy no Render

## Render?
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
http://localhost:5173

---

Desenvolvido por Simão Santos — LEI, NOVA FCT com Claude AI
