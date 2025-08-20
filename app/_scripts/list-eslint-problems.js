import fs from 'fs';
import path from 'path';
const raw = fs.readFileSync('./eslint-report.json', 'utf8');
const results = JSON.parse(raw);

const filesWithProblems = results
  .filter((f) => {
    // エラーまたは警告が1件以上あり、かつ未抑制のメッセージが存在するファイルを抽出
    const hasErrorsOrWarnings = f.errorCount > 0 || f.warningCount > 0;
    const hasUnSuppressedMessages = f.messages && f.messages.length > 0;
    return hasErrorsOrWarnings && hasUnSuppressedMessages;
  })
  .map((f) => path.relative(process.cwd(), f.filePath));

if (filesWithProblems.length === 0) {
  console.log('✅ エラーや警告のあるファイルはありません');
} else {
  console.log('⚠️ エラー・警告のあるファイル一覧:');
  filesWithProblems.forEach((file) => console.log(` - ${file}`));
}
