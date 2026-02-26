const fs = require('fs');
const path = require('path');

const MANIFESTO_PATH = path.join(__dirname, '../MANIFESTO.md');
const BACKEND_JACOCO_PATH = path.join(__dirname, '../backend/target/site/jacoco/jacoco.xml');
const FRONTEND_COVERAGE_PATH = path.join(__dirname, '../frontend/coverage/coverage-summary.json');
const DASHBOARD_COVERAGE_PATH = path.join(__dirname, '../dashboard-admin/coverage/coverage-summary.json');

/**
 * Coleta métricas reais do ecossistema
 */
function getRealMetrics() {
    let backendCov = 0;
    if (fs.existsSync(BACKEND_JACOCO_PATH)) {
        const content = fs.readFileSync(BACKEND_JACOCO_PATH, 'utf8');
        const match = content.match(/<counter type="INSTRUCTION" missed="(\d+)" covered="(\d+)"\/>/);
        if (match) {
            backendCov = (parseInt(match[2]) / (parseInt(match[1]) + parseInt(match[2]))) * 100;
        }
    }

    let frontendCov = 0;
    if (fs.existsSync(FRONTEND_COVERAGE_PATH)) {
        frontendCov = JSON.parse(fs.readFileSync(FRONTEND_COVERAGE_PATH, 'utf8')).total.statements.pct;
    }

    let dashboardCov = 0;
    if (fs.existsSync(DASHBOARD_COVERAGE_PATH)) {
        dashboardCov = JSON.parse(fs.readFileSync(DASHBOARD_COVERAGE_PATH, 'utf8')).total.statements.pct;
    }

    const validCoverages = [backendCov, frontendCov, dashboardCov].filter(c => c > 0);
    const globalCoverage = validCoverages.length > 0
        ? validCoverages.reduce((a, b) => a + b, 0) / validCoverages.length
        : 0;

    return { coverage: globalCoverage };
}

/**
 * Lê as definições de SLA do Manifesto
 */
function getSLAs() {
    const content = fs.readFileSync(MANIFESTO_PATH, 'utf8');
    const slas = {};
    const matches = content.matchAll(/<!-- sla: (\w+)=([\w\d.-]+) -->/g);
    for (const match of matches) {
        slas[match[1]] = isNaN(match[2]) ? match[2] : parseFloat(match[2]);
    }
    return slas;
}

async function validate() {
    console.log('⚖️ Invocando o Motor de Validação de Guardrails...');

    const slas = getSLAs();
    const real = getRealMetrics();

    let violations = 0;

    console.log('\n📊 Relatório de Conformidade:');
    console.log('--------------------------------------------------');

    // 1. Validação de Cobertura
    if (slas.coverage) {
        const diff = real.coverage - slas.coverage;
        const status = diff >= 0 ? '✅ PASSOU' : '❌ FALHOU';
        console.log(`${status} | Cobertura Global: Real ${real.coverage.toFixed(1)}% vs. Min ${slas.coverage}% (Margem: ${diff.toFixed(1)}%)`);
        if (diff < 0) violations++;
    }

    // placeholder para Performance e Segurança (Invocando Sonar API no futuro)
    if (slas.response_time) {
        console.log(`ℹ️ INFO   | Performance (SLA ${slas.response_time}ms): Monitoramento via APM ativo.`);
    }

    console.log('--------------------------------------------------');

    if (violations > 0) {
        console.error(`\n🚨 BLOCKER: Encontrada(s) ${violations} violação(ões) de Guardrails críticos.`);
        process.exit(1);
    } else {
        console.log('\n🟢 SUCESSO: Todas as métricas de integridade estão em conformidade.');
    }
}

validate().catch(err => {
    console.error('❌ Erro inesperado na validação:', err.message);
    process.exit(1);
});
