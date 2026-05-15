# ============================================================
# Stage 1: Build
# ============================================================
FROM maven:3.9-eclipse-temurin-17 AS builder

WORKDIR /build

# Leverage Docker cache: only re-download deps when pom.xml changes
COPY pom.xml .
RUN mvn dependency:go-offline -B

# Copy sources and build
COPY src ./src
RUN mvn clean package -DskipTests -B

# ============================================================
# Stage 2: Runtime
# ============================================================
FROM eclipse-temurin:17-jre AS runtime

WORKDIR /app

# Copy built JAR and startup script
COPY --from=builder /build/target/ironsync-3d.jar ./ironsync-3d.jar
COPY deploy/docker-entrypoint.sh /docker-entrypoint.sh

# Create data directories for volume mounts
RUN mkdir -p /app/data/notes /app/test-reports && \
    chmod +x /docker-entrypoint.sh

EXPOSE 8080

ENTRYPOINT ["/docker-entrypoint.sh"]
CMD ["java", "-jar", "ironsync-3d.jar"]
