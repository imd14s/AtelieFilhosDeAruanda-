FROM maven:3.9.6-eclipse-temurin-21-alpine AS builder
WORKDIR /build
COPY pom.xml .
RUN mvn dependency:go-offline -B
COPY src ./src
RUN mvn clean package -DskipTests

FROM eclipse-temurin:21-jre-alpine
WORKDIR /app

# Cria grupo e usuário não-root
RUN addgroup -S spring && adduser -S spring -G spring

# Cria pasta de uploads e ajusta permissões
RUN mkdir -p /app/uploads && chown -R spring:spring /app

COPY --from=builder /build/target/ecommerce-core-0.0.1-SNAPSHOT.jar app.jar

# Troca para o usuário seguro
USER spring

VOLUME /app/uploads
EXPOSE 8080
ENTRYPOINT ["java", "-Duser.timezone=UTC", "-jar", "app.jar"]
