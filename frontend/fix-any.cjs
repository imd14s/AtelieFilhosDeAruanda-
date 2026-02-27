const { Project, SyntaxKind } = require('ts-morph');
const path = require('path');

const project = new Project();
project.addSourceFilesAtPaths('src/**/*.{ts,tsx}');

project.getSourceFiles().forEach(sourceFile => {
    if (sourceFile.getFilePath().includes('safeAny.ts')) return;

    let anyKeywords;
    try {
        anyKeywords = sourceFile.getDescendantsOfKind(SyntaxKind.AnyKeyword);
    } catch (e) { return; }

    if (!anyKeywords || anyKeywords.length === 0) return;

    anyKeywords.forEach(keyword => {
        keyword.replaceWithText('SafeAny');
    });

    const fromPath = sourceFile.getDirectoryPath();
    const toPath = path.join(process.cwd(), 'src', 'types', 'safeAny.ts');
    let relativePath = path.relative(fromPath, toPath).replace(/\\/g, '/').replace('.ts', '');
    if (!relativePath.startsWith('.')) relativePath = './' + relativePath;

    sourceFile.addImportDeclaration({
        namedImports: ['SafeAny'],
        moduleSpecifier: relativePath
    });

    sourceFile.saveSync();
});
console.log('Finalizado ts-morph replace!');
