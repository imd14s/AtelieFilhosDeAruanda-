# Etapa de Build (Compilação)
FROM maven:3.9.6-eclipse-temurin-17-alpine AS builder
WORKDIR /build
COPY pom.xml .
COPY src ./src
RUN mvn clean package -DskipTests

# Etapa de Execução (Imagem Final Leve)
FROM eclipse-temurin:17-jre-alpine
WORKDIR /app
COPY --from=builder /build/target/ecommerce-core-0.0.1-SNAPSHOT.jar app.jar

# Garante que a pasta de uploads exista
RUN mkdir -p /app/uploads

# Declara volume para persistir imagens
VOLUME /app/uploads

# Expõe a porta
EXPOSE 8080

# Comando de entrada
ENTRYPOINT ["java", "-jar", "app.jar"]
