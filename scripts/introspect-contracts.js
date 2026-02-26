const fs = require('fs');
const path = require('path');

const MANIFESTO_PATH = path.join(__dirname, '../MANIFESTO.md');
const BACKEND_BASE_DIR = path.join(__dirname, '../backend/src/main/java/com/atelie/ecommerce/api');
const FRONTEND_SERVICES_DIR = path.join(__dirname, '../frontend/src/services');

/**
 * Escaneia recursivamente arquivos em um diretório
 */
function walk(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(file => {
        file = path.resolve(dir, file);
        const stat = fs.statSync(file);
        if (stat && stat.isDirectory()) {
            results = results.concat(walk(file));
        } else {
            results.push(file);
        }
    });
    return results;
}

/**
 * Parseia controladores Spring Boot para encontrar endpoints
 */
function introspectBackend() {
    const files = walk(BACKEND_BASE_DIR).filter(f => f.endsWith('Controller.java'));
    const endpoints = [];

    files.forEach(file => {
        const content = fs.readFileSync(file, 'utf8');

        // Find base path
        const baseMappingMatch = content.match(/@RequestMapping\("([^"]+)"\)/);
        const basePath = baseMappingMatch ? baseMappingMatch[1] : '';

        // Find methods
        const methods = content.matchAll(/@(Get|Post|Put|Delete)Mapping(\("([^"]*)"\))?[\s\S]*?public\s+\S+\s+(\w+)\s*\(/g);

        for (const match of methods) {
            const verb = match[1].toUpperCase();
            const subPath = match[3] || '';
            const fullPath = (basePath + subPath).replace(/\/+/g, '/');
            const functionName = match[4];

            // Look for @api-status in comments above the method
            const methodIndex = content.indexOf(match[0]);
            const header = content.substring(Math.max(0, methodIndex - 200), methodIndex);
            const statusMatch = header.match(/\/\/ @api-status:\s*(\w+)/);
            const statusType = statusMatch ? statusMatch[1].toLowerCase() : 'stable';

            const statusIcon = {
                stable: '🟢',
                alpha: '🟡',
                beta: '🟡',
                deprecated: '🔴'
            }[statusType] || '🟢';

            endpoints.push({
                name: functionName.replace(/([A-Z])/g, ' $1').trim().replace(/^\w/, c => c.toUpperCase()),
                route: `${verb} ${fullPath}`,
                io: `In: @RequestBody / Out: ResponseEntity`, // Simplified for now
                status: statusIcon
            });
        }
    });

    return endpoints;
}

/**
 * Mapeia componentes frontend que usam os serviços
 */
function introspectFrontend() {
    // This is a simplified version that just lists the core features we know exist
    // In a real scenario, we'd scan for api.get/post calls in services
    return [
        { name: 'Identificação Fiscal', comp: 'DocumentInput', rule: 'Valida CPF/CNPJ via Módulo 11', status: '🟢' },
        { name: 'Cálculo de Impostos', comp: 'CheckoutSummary', rule: 'Alíquota por Origem', status: '🟡' },
        { name: 'Busca de Endereço', comp: 'ZipCodeInput', rule: 'Integração API CEP', status: '🟢' }
    ];
}

async function run() {
    console.log('🔍 Iniciando Introspecção de Contratos...');

    const backendEndpoints = introspectBackend();
    const storefrontFeatures = introspectFrontend();

    let manifesto = fs.readFileSync(MANIFESTO_PATH, 'utf8');

    // Update Backend Catalog
    const backendRows = backendEndpoints.map(e => `${e.name},${e.route},${e.io},${e.status}`).join('\n');
    const backendRegex = /<!-- START_CATALOG_BACKEND -->[\s\S]*<!-- END_CATALOG_BACKEND -->/;
    manifesto = manifesto.replace(backendRegex, `<!-- START_CATALOG_BACKEND -->\nFuncionalidade,Rota/Método,Expectativa (Input/Output),Status\n${backendRows}\n<!-- END_CATALOG_BACKEND -->`);

    // Update Storefront Catalog
    const storefrontRows = storefrontFeatures.map(f => `${f.name},${f.comp},${f.rule},${f.status}`).join('\n');
    const storefrontRegex = /<!-- START_CATALOG_STOREFRONT -->[\s\S]*<!-- END_CATALOG_STOREFRONT -->/;
    manifesto = manifesto.replace(storefrontRegex, `<!-- START_CATALOG_STOREFRONT -->\nFuncionalidade,Componente,Validação/Regra,Status\n${storefrontRows}\n<!-- END_CATALOG_STOREFRONT -->`);

    fs.writeFileSync(MANIFESTO_PATH, manifesto);
    console.log(`✅ Catálogo Funcional atualizado com ${backendEndpoints.length} endpoints descobertos.`);
}

run().catch(err => {
    console.error('❌ Falha na introspecção:', err);
    process.exit(1);
});
