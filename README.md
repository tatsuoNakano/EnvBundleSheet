# EnvBundleSheet

 # EnvBundleSheet

表計算ソフト（CSV/TSV形式）で環境変数を一元管理し、複数の `.env` ファイルを自動生成するツールです。

## 目的

スプレッドシートで環境変数を定義することで、複数の環境（開発、テスト、本番など）に対応した `.env` ファイルを効率的に生成できます。
envファイルを公開してますが、重要な情報は何も入ってないので心配いりません

## 対応ファイル形式

- CSV（カンマ区切り）
- TSV（タブ区切り）

## 使用方法

### インストール

```bash
npm install
```

### 実行

CSV ファイルから `.env` ファイルを生成：

```bash
npm run gen
```

または詳細に指定：

```bash
npm run gen:csv
```

TSV ファイルから生成：

```bash
npm run gen:tsv
```

## ファイル形式

### 入力ファイル（CSV/TSV）

| file | key | value | sample | explanation |
|------|-----|-------|--------|-------------|
| .env | EXPO_PUBLIC_APP_NAME | base-app-name  | base-app-name | 基本アプリ名 |
| env.development | EXPO_PUBLIC_APP_NAME | dev-app-name | dev-app-name | 開発環境アプリ名 |

**列の説明：**
- `file`: 生成対象の `.env` ファイル名
- `key`: 環境変数のキー
- `value`: 環境変数の値（環境識別情報を含める）
- `sample`: サンプル値（ドキュメント用、処理時に無視）
- `explanation`: 説明（ドキュメント用、処理時に無視）

### 出力ファイル

生成される `.env` ファイル：
- `.env` - 基本環境設定
- `env.development` - 開発環境設定
- `env.test` - テスト環境設定
- `env.production` - 本番環境設定

## 動作

1. `.env` ファイルの環境変数を基盤として取得
2. 各環境ファイル（`env.development` など）の環境変数で上書き
3. 基本環境にない環境固有の変数を追加
4. `KEY=VALUE` 形式で `.env` ファイルを生成






## 言語設定

- 回答言語：日本語
- プログラミング言語：JavaScript

## ライセンス

MIT



