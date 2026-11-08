# 共用治理關聯檢查

治理入口保留本專案的簽核、合成資料及 Markdown 來源引用規則，將六組
CSV／JSON 參照關係交給私人 [kairos-rust-tools](https://github.com/JasonLn0711/kairos-rust-tools)。
[設定](../governance-relations.json)持有表格、欄位、fixture 路徑欄位與關聯；
[來源版本](../kairos-tools-source.json)固定完整 SHA。

依[跨電腦安裝](https://github.com/JasonLn0711/kairos-rust-tools/blob/main/docs/installation.md)
取得有權讀取的來源、checkout 固定 SHA 並執行 scripts/install.sh 後，執行：

```sh
python3 JS/scripts/check_governance_registries.py
```

可用 WORKSPACE_VERIFY_BIN 指定獨立安裝版本的完整路徑。缺少工具或回報格式
無效時退出 2，不退回另一份 Python 關聯實作。關聯／領域錯誤退出 1，全部
通過退出 0。此命令是本機治理檢查；沒有更改應用 API、Render/Vercel 流程或
取得私人來源的 CI 權限。只 pull 使用端不會自動安裝 Rust 工具。

一般關聯錯誤使用穩定 rule ID、不回印來源值；結構錯誤會先停止，避免領域
程式繼續解析無效輸入。空表、重複表頭、欄位數不一致、非字串引用陣列及
越界 fixture 路徑的失敗政策，由[共用契約](https://github.com/JasonLn0711/kairos-rust-tools/blob/main/docs/csv-relations.md)
明列。缺少 question_ids/source_ids 仍可視為空陣列；null 不算缺少欄位。

2026-11-08 的 18 組合成案例對照兩份原治理程式，完整 adapter 均維持預期
接受／拒絕，包含四項領域違規。缺少 binary 另確認退出 2。現有資料回報
sources=42、questions=27、api_questions=15、flows=4。這不代表臨床內容或
正式服務已驗收；完整測試工具與兩個使用端整合由
[整合契約](https://github.com/JasonLn0711/kairos-rust-tools/blob/main/docs/triage-governance-consolidation.md)
及[使用端總表](https://github.com/JasonLn0711/kairos-rust-tools/blob/main/docs/integrations.md)接續。
升級／回復一併核對 pin、設定與合成測試，保留領域規則及原始資料。


## v0 路徑修正

整合時發現四筆 fixture_path 仍指向舊 demo/fixtures，實際檔案位於
JS/fixtures；舊、新驗證器皆會拒絕缺檔。已單獨提交四個定位修正，fixture
內容不變。針對修正後同一份資料，原程式與新 adapter 均回報上述 42/27/15/4
成功結果。原工作目錄未提交的套件與文件調整保留於原位；本整合由獨立
worktree 發布，應用 API 與正式服務驗收各維持原責任。

## 完整流程量測

2026-11-08 修正後相同資料、相同 Python 載入方式，3 組暖機／30 組交替
配對：舊流程中位數 44.203 ms、新流程 52.343 ms；配對中位數約慢 8.502 ms，
95% bootstrap 區間為慢 7.198–9.123 ms。共用化消除六組關聯演算法的重複維護，
但保留 Python 領域讀取並新增子程序；本次沒有加速證據。一次暖快取本機
量測不推論 CI、能源、維護工時或 LLM token 節省，原始樣本留工具庫 .local。
