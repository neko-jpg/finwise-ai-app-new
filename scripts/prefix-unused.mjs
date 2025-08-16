// scripts/prefix-unused.mjs
import { Project, SyntaxKind } from "ts-morph";
import { join } from "node:path";
import { readdirSync, statSync } from "node:fs";

const targetDir = process.argv[2] ?? "src/components/finwise";

function walk(dir) {
  const out = [];
  for (const e of readdirSync(dir)) {
    const p = join(dir, e);
    const st = statSync(p);
    if (st.isDirectory()) out.push(...walk(p));
    else if (/\.(ts|tsx)$/.test(p)) out.push(p);
  }
  return out;
}

const files = walk(targetDir);
const project = new Project({
  skipAddingFilesFromTsConfig: true,
  compilerOptions: { allowJs: false },
});
project.addSourceFilesAtPaths(files);

let changed = 0;

for (const sf of project.getSourceFiles()) {
  let localChanged = 0;

  // 1) 関数パラメータ（未使用なら _ を付与）
  const fnLike = [
    ...sf.getFunctions(),
    ...sf.getVariableDeclarations()
      .filter(v => v.getInitializer()?.getKind() === SyntaxKind.ArrowFunction)
      .map(v => v.getInitializer()),
    ...sf.getClasses().flatMap(c => c.getMethods()),
  ].filter(Boolean);

  for (const fn of fnLike) {
    const params = fn.getParameters?.() ?? [];
    for (const p of params) {
      const name = p.getName();
      if (name.startsWith("_")) continue;
      // 参照が自分の定義のみ（=未使用）なら prefix
      const refs = p.findReferences();
      const totalRefs = refs.reduce((a, r) => a + r.getReferences().length, 0);
      if (totalRefs <= 1) {
        p.rename(`_${name}`);
        localChanged++;
      }
    }
  }

  // 2) 変数宣言（未使用なら _ を付与）
  for (const v of sf.getVariableDeclarations()) {
    const id = v.getNameNode();
    if (!id || id.getKindName() !== "Identifier") continue;
    const name = id.getText();
    if (name.startsWith("_")) continue;

    // for-of 等のパターンバインディングは除外（保守的に）
    if (v.getNameNode().getKind() !== SyntaxKind.Identifier) continue;

    const refs = v.findReferences();
    const totalRefs = refs.reduce((a, r) => a + r.getReferences().length, 0);
    if (totalRefs <= 1) {
      v.rename(`_${name}`);
      localChanged++;
    }
  }

  if (localChanged) {
    changed += localChanged;
  }
}

await project.save();
console.log(`prefixed ${changed} unused identifiers with '_'`);
