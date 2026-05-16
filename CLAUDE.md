# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 概要

**Prod Frame** は Chrome 拡張機能（Manifest V3）。URLパターンと枠線の設定を事前定義しておき、マッチするWebページに枠線を表示することで、開発者が本番環境と検証環境を取り違えるのを防ぐ。

## コマンド

```bash
pnpm dev          # ウォッチモードでビルド（拡張機能開発時）
pnpm build        # プロダクションビルド → dist/
pnpm typecheck    # 型チェック（noEmit）
```

ビルド成果物は `dist/` に出力される。Chrome の拡張機能管理画面（`chrome://extensions`）でこのディレクトリを読み込む。

## アーキテクチャ

`@crxjs/vite-plugin` が `manifest.json` を読み込み、Chrome拡張機能の3コンテキストをViteでビルドする。

| コンテキスト | ファイル | 役割 |
|---|---|---|
| Background | `src/background/index.ts` | Service Worker。インストール時の初期化やストレージ管理 |
| Content Script | `src/content/index.ts` | 全URLにインジェクト。URLマッチ判定・枠線DOM操作を担当 |
| Popup | `src/popup/` | React製のUI。URLパターンと枠線設定の管理画面 |

設定の永続化には `chrome.storage` API（`permissions: ["storage"]`）を使用する。Content ScriptとPopupの間のデータ共有は `chrome.storage.sync` または `chrome.storage.local` 経由で行う（直接メッセージングではなくストレージ経由が自然な設計）。

## 型・コード規約

- TypeScriptのstrict modeが有効（`noUnusedLocals`, `noUnusedParameters` も有効）
- Chrome Extension APIの型定義は `@types/chrome` パッケージを使用
- Content Scriptとbackground scriptの先頭に `/// <reference types="chrome" />` を記述する
