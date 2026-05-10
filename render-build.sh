#!/usr/bin/env bash
set -e  # Para imediatamente se algum comando falhar

echo "=== [1/3] A instalar Node.js dependencies ==="
cd frontend
npm install

echo "=== [2/3] A compilar o frontend React ==="
npm run build
# Resultado em frontend/dist/

echo "=== [3/3] A compilar o backend Spring Boot ==="
cd ../backend

# Copiar o frontend compilado para dentro do JAR
mkdir -p src/main/resources/static
cp -r ../frontend/dist/* src/main/resources/static/

mvn clean package -DskipTests -q
# Resultado em backend/target/fitness-api.jar

echo "=== Build concluído com sucesso! ==="
