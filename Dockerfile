# ── Stage 1: Build do Frontend React ─────────────────────────────────────────
FROM node:20-alpine AS frontend-build

WORKDIR /frontend
COPY frontend/package*.json ./
RUN npm install
COPY frontend/ .
RUN npm run build
# Resultado em /frontend/dist


# ── Stage 2: Build do Backend Spring Boot ────────────────────────────────────
FROM maven:3.9-eclipse-temurin-17 AS backend-build

WORKDIR /backend
COPY backend/pom.xml .
# Download das dependências primeiro (cache mais eficiente)
RUN mvn dependency:go-offline -q
COPY backend/src ./src

# Copiar o frontend compilado para dentro do Spring Boot (pasta static)
COPY --from=frontend-build /frontend/dist ./src/main/resources/static

RUN mvn clean package -DskipTests -q
# Resultado em /backend/target/fitness-api-3.0.0.jar


# ── Stage 3: Imagem final (só o JRE, mais leve) ───────────────────────────────
FROM eclipse-temurin:17-jre-alpine

WORKDIR /app
COPY --from=backend-build /backend/target/fitness-api-3.0.0.jar app.jar

# Railway injeta PORT e DATABASE_URL automaticamente
ENV SPRING_PROFILES_ACTIVE=prod

EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
