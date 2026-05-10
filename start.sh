#!/bin/sh
# Converte postgresql:// para jdbc:postgresql:// e garante que tem porto 5432
if [ -n "$DATABASE_URL" ]; then
  # Substitui postgresql:// por jdbc:postgresql://
  JDBC_URL=$(echo "$DATABASE_URL" | sed 's|postgresql://|jdbc:postgresql://|')
  
  # Se não tiver porto (não tem :5432 antes do /), adiciona-o antes do nome da BD
  if ! echo "$JDBC_URL" | grep -q ":[0-9]*/"; then
    JDBC_URL=$(echo "$JDBC_URL" | sed 's|\.com/|.com:5432/|')
  fi
  
  export SPRING_DATASOURCE_URL="$JDBC_URL"
fi

exec java -Dspring.profiles.active=prod -Dserver.address=0.0.0.0 -Dserver.port=$PORT -jar app.jar
