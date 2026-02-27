const { Project, SyntaxKind } = require('ts-morph');
const path = require('path');

const project = new Project();
project.addSourceFilesAtPaths('src/**/*.{ts,tsx}');

project.getSourceFiles().forEach(sourceFile => {
    if (sourceFile.getFilePath().includes('safeAny.ts')) return;

    const anyKeywords = sourceFile.getDescendantsOfKind(SyntaxKind.AnyKeyword);
    if (anyKeywords.length === 0) return;

    anyKeywords.forEach(keyword => {
        keyword.replaceWithText('SafeAny');
    });

    // Calcula path relativo para src/types/safeAny
    const fromPath = sourceFile.getDirectoryPath();
    const toPath = project.getFileSystem().join(process.cwd(), 'src', 'types', 'safeAny.ts');
    let relativePath = path.relative(fromPath, toPath).replace(/\\/g, '/').replace('.ts', '');
    if (!relativePath.startsWith('.')) relativePath = './' + relativePath;

    sourceFile.addImportDeclaration({
        namedImports: ['SafeAny'],
        moduleSpecifier: relativePath
    });

    sourceFile.saveSync();
});
console.log('Finalizado ts-morph replace!');
