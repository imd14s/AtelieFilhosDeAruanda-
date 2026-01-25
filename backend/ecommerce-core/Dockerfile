# ======================================
# STAGE 1 - BUILD (MAVEN)
# ======================================
FROM maven:3.9.6-eclipse-temurin-17 AS builder

WORKDIR /build

# Copia apenas o pom primeiro (cache)
COPY pom.xml .

# Download das dependências
RUN mvn -B -e -C dependency:go-offline

# Copia o código fonte
COPY src ./src

# Build do jar
RUN mvn clean package -DskipTests


# ======================================
# STAGE 2 - RUNTIME (JVM LIMPA)
# ======================================
FROM eclipse-temurin:17-jre-jammy

WORKDIR /app

# Copia o jar do stage anterior
COPY --from=builder /build/target/*.jar app.jar

# Porta da aplicação
EXPOSE 8080

# Start
ENTRYPOINT ["java", "-jar", "app.jar"]
