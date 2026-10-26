# Prod Frame

URLパターンにマッチしたWebページに枠線を表示するChrome拡張機能。本番環境と検証環境の取り違えを防ぐ。

## スクリーンショット

![スクリーンショット](screenshot.png)

## 機能

- URLパターン（グロブ形式）を登録し、マッチしたページに枠線を表示
- 枠線の色・太さ・不透明度を自由に設定
- ルールごとの有効/無効切り替え
- SPA対応（`popstate` + `MutationObserver` でURLの変化を検知）
- ルール変更をリアルタイム反映（ページリロード不要）

## 開発

```bash
pnpm dev        # ウォッチモードでビルド（ファイル変更を自動検知）
pnpm build      # プロダクションビルド → dist/
pnpm typecheck  # 型チェック（noEmit）
```

`pnpm dev` 実行中は、ソースを変更するとすぐに `dist/` が更新される。Chrome の拡張機能管理画面で「更新」ボタンを押すと最新のビルドが反映される。

## リリース

1. `package.json` の `version` を新しいバージョンに更新し、変更を `master` にマージする。
2. GitHub の Actions で Release workflow を開き、「Run workflow」で `master` ブランチを選択して実行する。

Release workflow は `master` ブランチでのみ実行できる。本番ビルド後、`dist/manifest.json` の `version`（`package.json` から生成）からタグを作成し、配布 ZIP を GitHub Release に添付する。例えば `version` が `1.0.2` なら、タグは `v1.0.2`、添付ファイルは `prod-frame-v1.0.2.zip` になる。同名タグが既に存在する場合は workflow が失敗し、Release の公開には進まない。

### 配布 ZIP のインストール

1. [GitHub Releases](https://github.com/aktnb/prod-frame/releases) から `prod-frame-vX.Y.Z.zip` をダウンロードして解凍する。
2. Chrome で `chrome://extensions/` を開き、デベロッパーモードを有効にする。
3. 「パッケージ化されていない拡張機能を読み込む」から、`manifest.json` がある解凍先フォルダを選択する。

## 使い方

1. ツールバーの Prod Frame アイコンをクリックしてポップアップを開く
2. URLパターン（例: `https://example.com/*`）と枠線スタイルを設定してルールを追加
3. マッチするページを開くと枠線が表示される

### URLパターン

グロブ形式で指定する。`*` は任意の文字列にマッチする。

| パターン | マッチ例 |
|---|---|
| `https://example.com/*` | `https://example.com/any/path` |
| `https://*.example.com/*` | `https://staging.example.com/` |
| `https://example.com/admin*` | `https://example.com/admin/users` |

## 技術スタック

- TypeScript (strict mode)
- React 18
- Vite + @crxjs/vite-plugin
- Chrome Extension Manifest V3

## ライセンス

[LICENSE](LICENSE) を参照。
