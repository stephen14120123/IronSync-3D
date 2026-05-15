#!/bin/bash
set -e

PROJECT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
REPORTS_DIR="${PROJECT_DIR}/deploy/test-reports"
LATEST_DIR="${REPORTS_DIR}/latest"

echo "=== IronSync-3D E2E Test Runner ==="
echo "Project dir: ${PROJECT_DIR}"
echo ""

# Step 1: Ensure output directory exists
echo "Step 1: Ensure report directory exists"
mkdir -p "${LATEST_DIR}"
echo "  Report dir: ${LATEST_DIR}"
echo ""

# Step 2: Install dependencies
echo "Step 2: Install Playwright dependencies"
cd "${PROJECT_DIR}/test/e2e"

if [ ! -f "package.json" ]; then
    echo "ERROR: package.json not found in test/e2e"
    exit 1
fi

echo "  Running npm install..."
npm install --silent
echo "  npm install complete."

echo "  Installing Playwright browsers (chromium)..."
npx playwright install chromium 2>/dev/null || npx playwright install --with-deps chromium 2>/dev/null || true
echo ""

# Step 3: Run tests
echo "Step 3: Run Playwright tests"
set +e
npx playwright test --reporter=html
EXIT_CODE=$?
set -e
echo "  Playwright exit code: ${EXIT_CODE}"
echo ""

# Step 4: Copy report to deploy/test-reports/latest
echo "Step 4: Copy report artifacts"
if [ -d "playwright-report" ] && [ "$(ls -A playwright-report 2>/dev/null)" ]; then
    # Remove previous artifacts before copying new ones
    rm -rf "${LATEST_DIR:?}/"*
    cp -r playwright-report/* "${LATEST_DIR}/"
    echo "  Copied $(find playwright-report -type f | wc -l) files to ${LATEST_DIR}"
else
    echo "  WARNING: playwright-report directory not found or empty — tests may have failed before report generation."
fi
echo ""

# Step 5: Generate report-meta.json
echo "Step 5: Generate report metadata"
REPORT_TIMESTAMP=$(date -u +"%Y-%m-%dT%H:%M:%SZ")

# Try to parse Playwright JSON report, fall back to defaults
TOTAL=0
PASSED=0
FAILED=0

if [ -f "playwright-report/.report-metadata.json" ]; then
    # Playwright 1.49+ stores structured data here
    TOTAL=$(python3 -c "import json; d=json.load(open('playwright-report/.report-metadata.json')); print(d.get('total',0))" 2>/dev/null || echo "0")
    PASSED=$(python3 -c "import json; d=json.load(open('playwright-report/.report-metadata.json')); print(d.get('passed',0))" 2>/dev/null || echo "0")
    FAILED=$(python3 -c "import json; d=json.load(open('playwright-report/.report-metadata.json')); print(d.get('failed',0))" 2>/dev/null || echo "0")
fi

# If the structured report wasn't available, try parsing CLI output
if [ "$TOTAL" -eq 0 ] && [ "$EXIT_CODE" -ne 0 ]; then
    FAILED=1
fi

cat > "${LATEST_DIR}/report-meta.json" << EOF
{
  "timestamp": "${REPORT_TIMESTAMP}",
  "total": ${TOTAL},
  "passed": ${PASSED},
  "failed": ${FAILED}
}
EOF

echo "  report-meta.json written"
echo "  Timestamp: ${REPORT_TIMESTAMP}"
echo "  Total: ${TOTAL}, Passed: ${PASSED}, Failed: ${FAILED}"
echo ""

echo "=== E2E Test Run Complete ==="
echo "Report: ${LATEST_DIR}/index.html"
echo "Meta:   ${LATEST_DIR}/report-meta.json"
exit ${EXIT_CODE}
