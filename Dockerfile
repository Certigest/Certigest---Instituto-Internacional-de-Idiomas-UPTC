# Usa Maven para compilar
FROM maven:3.9.6-eclipse-temurin-17 as builder

WORKDIR /build
COPY . .
RUN mvn clean package -Dmaven.test.skip=true

# Usa Java para correr
FROM openjdk:21-jdk-slim
WORKDIR /app
COPY --from=builder /build/target/*.jar app.jar

EXPOSE 8443
ENTRYPOINT ["java", "-Dspring.profiles.active=prod", "-jar", "app.jar"]
