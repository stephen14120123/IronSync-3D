#!/bin/bash
set -e

PROJECT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
JAR_NAME="ironsync-3d.jar"

echo "=== IronSync-3D Build Script ==="
echo "Project dir: ${PROJECT_DIR}"

cd "${PROJECT_DIR}"

if [ ! -x "./mvnw" ]; then
    echo "mvnw not found or not executable, attempting to fix..."
    chmod +x ./mvnw 2>/dev/null || true
fi

if [ -x "./mvnw" ]; then
    MVN_CMD="./mvnw"
    echo "Using project Maven wrapper: ${MVN_CMD}"
else
    if command -v mvn &> /dev/null; then
        MVN_CMD="mvn"
        echo "mvnw not available, falling back to system Maven: ${MVN_CMD}"
    else
        echo "ERROR: No Maven found (mvnw missing and mvn not in PATH)"
        exit 1
    fi
fi

echo ""
echo "Step 1: Maven clean package"
${MVN_CMD} clean package -DskipTests
echo ""

echo "Step 2: Verify artifact"
if [ ! -f "target/${JAR_NAME}" ]; then
    echo "ERROR: target/${JAR_NAME} not found!"
    exit 1
fi

echo "Step 3: Copy artifact to deploy/"
cp "target/${JAR_NAME}" "deploy/${JAR_NAME}"
echo ""

echo "=== Build Complete ==="
echo "Artifact: deploy/${JAR_NAME}"
ls -lh "deploy/${JAR_NAME}"
