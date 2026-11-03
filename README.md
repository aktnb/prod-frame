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
- ルールを選択してJSONファイル・クリップボードへエクスポート、検証・確認後にインポート

## 開発

```bash
pnpm dev        # ウォッチモードでビルド（ファイル変更を自動検知）
pnpm build      # プロダクションビルド → dist/
pnpm typecheck  # 型チェック（noEmit）
pnpm test       # インポート・エクスポートの検証テスト
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

### インポート／エクスポート

ポップアップの「インポート／エクスポート」リンクから、拡張機能に同梱された設定ページをタブで開く。ルールの追加・編集は引き続きポップアップで行う。

- エクスポート：初期状態では全ルールが選択される。チェックボックスや「全選択」「全解除」で対象を選び、「JSONファイルを保存」または「JSONをコピー」を押す。
- インポート：JSONファイルを選ぶか、JSONテキストを貼り付けて「内容を検証」を押す。「追加○件・重複スキップ○件」を確認し、「インポート」を押すと確定する。確認中は設定を変更しない。
- 既存ルールを残して追加する。URLパターンの文字列が完全一致する場合は既存ルールを優先する。入力内の重複は先勝ちでスキップする。URL範囲が重なる別パターンは追加できる。
- スキップ対象を含む全ルールを検証する。不正なJSON・設定値・未対応の形式バージョンがあれば全件中止し、エラー箇所と理由を表示する。保存に失敗した場合もエラーを表示する。
- 有効／無効はそのまま復元され、有効なルールは保存後すぐにページへ反映される。ファイル入出力・コピーを含めて処理はブラウザ内で完結する。

ファイルとコピーは共通のJSON形式を使う。`version` はアプリのバージョンとは独立した形式バージョンで、数値の `1` のみ対応する。内部のルールIDは含めず、インポート時に新しく生成する。

```json
{
  "version": 1,
  "rules": [
    {
      "urlPattern": "https://example.com/*",
      "style": { "color": "#ff0000", "width": 4, "opacity": 1 },
      "enabled": true
    }
  ]
}
```

各ルールの必須項目は、空白のみでない256文字以内の `urlPattern`、真偽値の `enabled`、`style`。色は `#rrggbb`、太さは1〜20の数値、不透明度は0〜1の数値で指定する。URLパターンは前後の空白や大文字・小文字も含め、入力文字列のまま比較・保存する。

## 技術スタック

- TypeScript (strict mode)
- React 18
- Vite + @crxjs/vite-plugin
- Chrome Extension Manifest V3

## ライセンス

[LICENSE](LICENSE) を参照。
