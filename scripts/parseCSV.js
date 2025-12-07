/**
 * CSV ファイルをパースして環境変数を抽出し、複数の .env ファイルを生成するスクリプト
 * 使用方法: node parseCSV.js <csvファイルパス> [出力ディレクトリ]
 */

const fs = require('fs');
const path = require('path');

/**
 * CSV ファイルをパースする
 * @param {string} filePath - CSV ファイルのパス
 * @returns {Array<Object>} パースされたデータ
 */
function parseCSV(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.trim().split('\n');
  
  if (lines.length === 0) {
    throw new Error('CSV ファイルが空です');
  }

  // ヘッダー行を取得
  const headers = lines[0].split(',').map(h => h.trim());
  
  // 必要な列のインデックスを取得
  const fileIndex = headers.indexOf('file');
  const keyIndex = headers.indexOf('key');
  const valueIndex = headers.indexOf('value');

  if (fileIndex === -1 || keyIndex === -1 || valueIndex === -1) {
    throw new Error('必要な列（file, key, value）が見つかりません');
  }

  const data = [];
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    const columns = line.split(',').map(c => c.trim());
    const file = columns[fileIndex];
    const key = columns[keyIndex];
    const value = columns[valueIndex];

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
    console.error('使用方法: node parseCSV.js <csvファイルパス> [出力ディレクトリ]');
    process.exit(1);
  }

  const csvFilePath = args[0];
  const outputDir = args[1] || '.';

  try {
    console.log(`CSV ファイルをパース中: ${csvFilePath}`);
    const data = parseCSV(csvFilePath);
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
