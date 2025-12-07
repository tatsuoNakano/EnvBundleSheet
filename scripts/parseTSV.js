/**
 * TSV ファイルをパースして環境変数を抽出し、複数の .env ファイルを生成するスクリプト
 * 使用方法: node parseTSV.js <tsvファイルパス> [出力ディレクトリ]
 */

const fs = require('fs');
const path = require('path');

/**
 * TSV ファイルをパースする
 * @param {string} filePath - TSV ファイルのパス
 * @returns {Array<Object>} パースされたデータ
 */
function parseTSV(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  // 改行コードを統一（CRLF -> LF）
  const normalizedContent = content.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
  const lines = normalizedContent.trim().split('\n');
  
  if (lines.length === 0) {
    throw new Error('TSV ファイルが空です');
  }

  // BOM を削除
  let firstLine = lines[0];
  if (firstLine.charCodeAt(0) === 0xFEFF) {
    firstLine = firstLine.slice(1);
  }

  // 区切り文字を判定（タブまたは複数スペース）
  let delimiter = '\t';
  if (!firstLine.includes('\t')) {
    delimiter = /\s{2,}/; // 2つ以上のスペース
  }

  // ヘッダー行を取得
  const headers = firstLine.split(delimiter).map(h => h.trim());
  
  // 必要な列のインデックスを取得
  const fileIndex = headers.indexOf('file');
  const keyIndex = headers.indexOf('key');
  const valueIndex = headers.indexOf('value');

  if (fileIndex === -1 || keyIndex === -1 || valueIndex === -1) {
    console.error('ヘッダー:', headers);
    throw new Error('必要な列（file, key, value）が見つかりません');
  }

  const data = [];
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];
    if (!line.trim()) continue;

    const columns = line.split(delimiter);
    const file = columns[fileIndex] ? columns[fileIndex].trim() : '';
    const key = columns[keyIndex] ? columns[keyIndex].trim() : '';
    const value = columns[valueIndex] ? columns[valueIndex].trim() : '';

    // file または key が空の場合はスキップ
    if (!file || !key) continue;

    data.push({ file, key, value: value || '' });
  }

  return data;
}

/**
 * パースされたデータをファイル名ごとにグループ化する
 * @param {Array<Object>} data - パースされたデータ
 * @returns {Object} ファイル名をキーとしたグループ化されたデータ
 */
function groupByFile(data) {
  const grouped = {};
  
  for (const item of data) {
    if (!grouped[item.file]) {
      grouped[item.file] = [];
    }
    grouped[item.file].push({ key: item.key, value: item.value });
  }

  return grouped;
}

/**
 * グループ化されたデータから .env ファイルを生成する
 * @param {Object} grouped - グループ化されたデータ
 * @param {string} outputDir - 出力ディレクトリ
 */
function generateEnvFiles(grouped, outputDir) {
  // 出力ディレクトリが存在しない場合は作成
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  // .env ファイルの環境変数を基盤として取得
  const baseEnv = grouped['.env'] || [];
  const baseMap = new Map(baseEnv.map(({ key, value }) => [key, value]));

  for (const [fileName, variables] of Object.entries(grouped)) {
    // 基盤となる環境変数をコピー
    const envMap = new Map(baseMap);

    // 環境ファイル固有の環境変数で上書き
    for (const { key, value } of variables) {
      envMap.set(key, value);
    }

    // マップを KEY=VALUE 形式に変換
    const content = Array.from(envMap.entries())
      .map(([key, value]) => `${key}=${value}`)
      .join('\n');

    const filePath = path.join(outputDir, fileName);
    fs.writeFileSync(filePath, content + '\n', 'utf-8');
    console.log(`✓ 生成完了: ${filePath}`);
  }
}

/**
 * メイン処理
 */
function main() {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.error('使用方法: node parseTSV.js <tsvファイルパス> [出力ディレクトリ]');
    process.exit(1);
  }

  const tsvFilePath = args[0];
  const outputDir = args[1] || '.';

  try {
    console.log(`TSV ファイルをパース中: ${tsvFilePath}`);
    const data = parseTSV(tsvFilePath);
    console.log(`✓ ${data.length} 個の環境変数を抽出しました`);

    const grouped = groupByFile(data);
    console.log(`✓ ${Object.keys(grouped).length} 個のファイルにグループ化しました`);

    generateEnvFiles(grouped, outputDir);
    console.log(`\n✓ すべての .env ファイルを生成しました`);
  } catch (error) {
    console.error(`エラー: ${error.message}`);
    process.exit(1);
  }
}

main();
