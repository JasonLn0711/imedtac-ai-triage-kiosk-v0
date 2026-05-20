# 2026-05-15 慧誠 AI Triage 可行性討論預期 Q&A（台灣繁中版）

日期：`2026-05-15`
用途：會議中回答慧誠智醫可能提出的問題
定位：會議用問答稿；不是臨床指引、不是產品規格、不是法規送審文件
主資料包：`handoff/2026-05-15-complete-meeting-packet-zh-TW.md`

## 使用方式

這份 Q&A 的目的不是逐字照念，而是讓會議中回答一致：

- 先回答慧誠真正問的產品 / 技術可行性；
- 再補充安全邊界；
- 最後把缺口轉成需要慧誠或臨床 owner 確認的決策。

回答時的固定邊界：

```text
demo-only vital-aware intake
-> source-governed question routing
-> staff / clinician review summary
-> no diagnosis
-> no autonomous triage
-> no FDA-cleared claim
```

## A. 會議總目標

### Q1. 這場會議我們最想解決什麼？

**短答：**

我們想確認六月是否要做一個 controlled capability demo：用 iMVS
量測到的生命徵象，加上英文症狀問診，產出可追溯來源的
clinician-review summary。

**較完整回答：**

這場會議不是要直接定義正式醫療產品，也不是要承諾臨床分流已完成。
我們要先確認三件事：

1. 慧誠希望六月展示的是 memo、clickable demo，還是 kiosk-adjacent demo；
2. iMVS 量測資料要怎麼進入問診流程；
3. 第一個臨床 frame 要用 `家醫科 / 一般內科`、urgent-care /
   emergency-style triage support，還是只先展示 all-specialty modular
   roadmap。

**不能說：**

```text
我們週五可以直接定產品規格或臨床分流規則。
```

### Q2. 你們目前對六月 demo 的建議是什麼？

**短答：**

建議做一個 demo-only 的英文 vital-aware intake workflow：使用 synthetic
或 API-shaped iMVS vital payload，透過 source-governed question routing，
最後產出 staff / clinician review summary。

**較完整回答：**

六月 demo 的價值應該是證明慧誠的 kiosk 不只是量測設備，而是可以變成
AI-assisted triage workflow 的入口。第一版不需要碰真實病人資料、不需要
寫回 HIS / EMR，也不需要宣稱 final triage level。重點是展示：

- iMVS 量測完成後，生命徵象如何進入 AI layer；
- vital signs 如何改變下一題優先順序；
- 系統如何把病人的回答與 measured vitals 組成醫護可讀摘要；
- 每個 clinical signal 有來源或等待臨床 sign-off。

**會議中要反問慧誠：**

```text
六月對你們最有幫助的是 memo / slide、可點擊 demo，還是要接近 kiosk
操作流程的 demo？
```

## B. 全科別與模組化

### Q3. 這套方法能不能涵蓋全科別？

**短答：**

架構上可以設計成 all-specialty-capable，但臨床上不能在第一版就宣稱已完成
全科別分流。合理做法是 shared core 加 specialty modules。

**較完整回答：**

我們不建議把全科別做成一個巨大 prompt 或一個不可追溯的資料庫。比較安全的
架構是：

- shared intake layer：收集主訴、時間、嚴重度、回答狀態；
- vital-sign adapter：解析 iMVS 的 BP、SpO2、HR、Temp 等欄位；
- question router：根據症狀與 vital context 決定下一題；
- source registry：記錄問題來源、版本、臨床目的、review owner；
- specialty modules：心血管、呼吸 / 發燒、泌尿、糖尿病 / 血糖等逐步增加；
- clinician-review summary：把 vitals、回答、red flags、來源整理給醫護檢視。

**安全說法：**

```text
這是 all-specialty-capable architecture，不是 completed all-specialty
clinical coverage。
```

### Q4. 第一版應該先做哪一科或哪一類？

**短答：**

目前假設 `家醫科 / 一般內科` 或 urgent-care-style internal medicine 比
直接宣稱全科別更可行，但這需要多寶醫師在會議中校準。

**較完整回答：**

因為 iMVS 量測的是一般生命徵象，例如血壓、血氧、體溫、心跳、身高、
體重、BMI，第一版比較適合放在 general intake / family medicine /
general internal medicine / urgent-care-style triage support，而不是從高度
專科化疾病開始。

吳老師 GPT 文件提出 `家醫科 / 一般內科` 是合理的 design hypothesis；多寶
醫師先前也提醒 vital signs 最強的場景偏 emergency / internal-medicine-style
triage。會議中應該請多寶醫師判斷：

- 家醫科 / 一般內科是否最適合第一版；
- 或 urgent-care / emergency-style support 是否更準確；
- 全科別是否應該先講成 roadmap，而不是第一版 claim。

**不能說：**

```text
家醫科方案已經臨床驗證。
```

### Q5. 如果慧誠希望 long-term 做全科別，roadmap 怎麼講？

**短答：**

先做 shared core，再逐步增加 specialty modules；每個 module 都要有 source
rows、review owner、threshold / wording sign-off。

**較完整回答：**

全科別 roadmap 可以分三層：

1. 共用能力：vital adapter、intake state、question router、summary format；
2. 高價值示範 module：家醫 / 一般內科、呼吸 / 發燒、胸痛 / 心血管、
   diabetes / glucose；
3. 後續 specialty modules：泌尿、腸胃、神經、婦兒等，需要各自來源與臨床
   owner。

第一版只示範一到兩個高價值場景，避免「全科別已完成」的過度宣稱。

## C. 生理數據 / 生命徵象

### Q6. 生理數據到底如何改變 AI triage？

**短答：**

生命徵象在 v0 應該改變三件事：下一題優先順序、醫護摘要重點、是否提示
staff review。它不應該單獨產生診斷或 final triage level。

**較完整回答：**

同樣的主訴，在不同 vital context 下應該問不同的下一題。例如：

- 高血壓加胸痛或神經症狀，應優先問心血管 / 神經紅旗問題；
- 低 SpO2 加喘或胸痛，應優先問呼吸窘迫、胸痛、發紺、持續時間；
- 發燒加心跳快或尿量變少，應優先問感染、脫水、泌尿或呼吸症狀；
- glucose 若可用，才進入糖尿病 / 低血糖 / 高血糖 branch。

**邊界：**

```text
生命徵象是 context 和 review signal，不是 autonomous decision。
```

### Q7. 哪些生命徵象最重要？

**短答：**

第一版最重要的是 BP、SpO2、HR、Temp；BMI / height / weight 做 context；
Glucose 如果設備有才做 optional branch。

**較完整回答：**

| 生命徵象 | 第一版用途 | 注意 |
| --- | --- | --- |
| BP | 心血管 / 神經 red-flag 問題優先 | 不能單獨診斷 hypertensive emergency |
| SpO2 | 呼吸 / 心肺 red-flag 問題優先 | threshold 需臨床 sign-off |
| HR | physiological instability context | 不建議單獨作為決策規則 |
| Temp | 發燒、感染、脫水、呼吸、泌尿分支 | fever threshold 需確認 |
| BMI / height / weight | 慢病 / 代謝 context | v0 不作 urgent trigger |
| Glucose | optional diabetes / metabolic branch | 需確認設備是否有此欄位 |

### Q8. 如果某個 vital sign 異常，系統是否直接叫病人去急診？

**短答：**

不建議 v0 這樣做。比較安全的說法是「建議 staff / clinician review」。

**較完整回答：**

v0 不應該讓 AI 直接對病人下達急診指示。比較安全的 workflow 是：

```text
異常 vital + red-flag answer
-> source-governed review signal
-> staff / clinician review summary
-> 由醫護或現場流程決定下一步
```

如果慧誠希望 patient-facing wording 更強，需要先有 clinical owner 與 local
protocol sign-off。

### Q9. 是否可以直接使用吳老師 GPT 文件裡的 threshold？

**短答：**

不能直接用作產品規則。可以當作候選討論稿，但每個 threshold 都要對應來源與
臨床 sign-off。

**較完整回答：**

GPT 文件對產品設計很有幫助，尤其是 family medicine / general internal
medicine 的 frame、十題問診與分級概念。但 threshold 是 clinical logic，
不能只因為 GPT 產出就放進 rule engine。

正確流程應該是：

```text
GPT threshold candidate
-> source row
-> exact support text
-> clinical purpose
-> output effect
-> review owner
-> clinician-signoff-needed
```

## D. AI model / workflow 整合

### Q10. AI layer 應該插在 iMVS 流程哪裡？

**短答：**

建議插在 iMVS 量測完成後，使用 API-shaped vital payload 進入 AI triage
demo adapter。

**較完整回答：**

iMVS 本身已經有清楚的 measurement-centered workflow：

```text
登入 / 識別
-> 量測生命徵象
-> 產生報告 / 上傳
```

AI triage v0 最自然的插入點是量測完成後：

```text
iMVS measurement complete
-> API-shaped vital payload
-> symptom intake
-> question router
-> clinician-review summary
```

第一版不建議碰 hospital authentication、不建議使用真實病人資料、不建議寫回
HIS / EMR。

### Q11. 這需要 LLM 直接做 triage decision 嗎？

**短答：**

不需要。v0 可以讓 deterministic routing / source-governed question bank
負責 clinical-sensitive 邏輯，LLM 只做摘要或語言整理，甚至可以先不進 runtime。

**較完整回答：**

比較安全的角色分工是：

- ASR：可選，用於語音輸入；
- symptom normalization：把病人語句轉成可追蹤狀態；
- question router：根據 source registry 和 vital context 選下一題；
- rules / source rows：管理 clinical-sensitive trigger；
- LLM：若使用，主要做摘要、語言轉換、可讀性整理；
- human review：最終解讀與行動仍由 staff / clinician / local protocol 控制。

**不能說：**

```text
LLM 會決定病人需不需要急診。
```

### Q12. 是否能在基本硬體、低雲端成本下運作？

**短答：**

可以朝這個方向設計，因為 v0 不需要大型 generative model 來決定 clinical
routing。核心可以是 deterministic adapter + question router + summary
template。

**較完整回答：**

低成本 v0 可以這樣做：

- touch input first，ASR optional；
- synthetic / API-shaped vital payload；
- local deterministic routing；
- source registry 驅動問題；
- summary template 產出；
- LLM 若使用，放在可替換、非決策核心的位置。

但實際部署仍需慧誠確認：

- 目標設備是 Windows / Android / browser；
- 是否能開外部 web page；
- 是否有本機或內網服務；
- 是否允許雲端；
- demo 是否必須在 kiosk device 上跑。

## E. FDA / 510(k) / 醫學會來源

### Q13. FDA 在這個案子裡能幫什麼？

**短答：**

FDA 主要幫我們控制 intended use、CDS 邊界、software risk、可解釋性與產品
宣稱，不是用來決定症狀問診內容。

**較完整回答：**

FDA / 510(k) 對 Friday 有三個用途：

1. 幫助定義這個 demo 不能宣稱什麼；
2. 幫助拆分 kiosk measurement、AI question routing、summary generation
   這些不同 software functions；
3. 如果慧誠提供 comparator product 或 510(k) number，我們可以抽出 indications
   for use、function、limitations、safe wording。

**不能說：**

```text
FDA 支持我們這套 symptom questionnaire。
```

### Q14. 醫學會或臨床來源要怎麼用？

**短答：**

FDA 管 product boundary；症狀與 vital sign trigger 要靠 ESI、AHA、CDC、
ADA、AUA、local protocol 或 clinician-authored content。

**較完整回答：**

目前可用的 source family：

- ESI / emergency medicine：說明 vital signs 會影響 acuity / review concern；
- AHA：高血壓加胸痛、喘、神經症狀等 red-flag family；
- CDC：發燒 / 呼吸道 warning signs；
- ADA：低血糖 / 高血糖症狀；
- AUA：泌尿症狀與 fever / flank pain 的 source-family boundary；
- local protocol：最終 threshold、wording、workflow。

**注意：**

這些來源可以支持 question family，但不能直接取代臨床 sign-off。

### Q15. 目前有沒有找到 510(k) comparator？

**短答：**

目前有 scan template，但還沒有可安全引用的指定 comparator。需要慧誠提供 US
partner product、競品或 510(k) number。

**較完整回答：**

我們可以掃描並抽取：

- device name；
- applicant；
- product code；
- decision date；
- indications for use；
- device functions；
- limitations；
- performance evidence category；
- safe wording。

但如果沒有指定產品或 FDA number，不能自行宣稱 predicate similarity。

**會議中要問：**

```text
慧誠是否有指定的 US partner product、competitor、或 510(k) number？
CareRoute 是只作為 UX/commercial reference，還是要找另一個臨床 triage
comparator？
```

## F. 六月 demo 與商務展示

### Q16. 六月 demo 可以做什麼層級？

**短答：**

有三個層級：memo / slide、clickable demo、kiosk-adjacent demo。建議若時間
允許，以 clickable demo 或 kiosk-adjacent demo 最能展示慧誠的產品價值。

**較完整回答：**

| 選項 | 適合情境 | 風險 |
| --- | --- | --- |
| memo / slide | 快速對齊內部方向 | 不夠像 customer demo |
| clickable demo | 展示 question flow、vital-aware logic、summary | 需 UI / wording review |
| kiosk-adjacent demo | 最接近慧誠產品故事 | 需 target device、integration mode、測試時間 |

第一版建議先用 synthetic iMVS-shaped payload，避免真實資料與整合風險。

### Q17. Demo 需要跑在 kiosk 上嗎？

**短答：**

這要由慧誠決定。如果六月主要是 capability story，web / clickable mock 可能
足夠；如果是 product integration story，才需要 kiosk-adjacent demo。

**較完整回答：**

會議中要確認：

- demo 是給內部看、給美國客戶看，還是給工程團隊判斷整合？
- 是否必須在 iMVS device 上操作？
- 是否可用外部 link / embedded webview / browser？
- 是否需要模擬 API handoff？

不要先承諾上 kiosk，除非慧誠確認 target device 與 integration mode。

### Q18. Demo 的輸出應該長什麼樣？

**短答：**

輸出應該是 structured clinician-review summary，不是 diagnosis 或 final
triage level。

**建議格式：**

```text
Measured context
- BP: ...
- SpO2: ...
- HR: ...
- Temperature: ...

Patient-reported concern
- Chief concern: ...
- Duration: ...
- Key positive answers: ...
- Key negative answers: ...

Review signals
- Vital-sign context: ...
- Symptom/vital combinations requiring review: ...
- Source family used for question routing: ...

Suggested workflow
- Staff review suggested / routine review / insufficient information.
- Demo only; not diagnosis or treatment advice.
```

**避免：**

```text
Diagnosis: ...
Treatment: ...
ESI level: ...
Patient should go to ED because AI says so.
```

## G. 安全邊界與風險

### Q19. 這個 demo 是否是醫療診斷產品？

**短答：**

不是。現在應該定位為 market / product capability demo 和 triage-support
workflow feasibility。

**較完整回答：**

目前安全定位是：

```text
synthetic-data demo
-> vital-aware intake
-> source-governed question routing
-> staff / clinician review summary
```

不是：

- diagnosis；
- treatment advice；
- autonomous triage；
- final ESI level；
- emergency order；
- production HIS / EMR integration；
- FDA-cleared medical device。

### Q20. 目前最大的 hallucination 或 overclaim 風險是什麼？

**短答：**

最大風險是把「架構上可行」講成「臨床上已驗證」，或把 GPT / source-family
內容講成正式 clinical rule。

**具體風險：**

1. 全科別：只能說 architecture roadmap，不能說已完成 clinical coverage。
2. GPT thresholds：只能說候選，不可直接放 rule engine。
3. ESI：可作 source family，不可說 kiosk 會計算 ESI。
4. 510(k)：沒有 comparator 前不可說 predicate-style similarity。
5. patient-facing wording：需要 clinical/product owner sign-off。

### Q21. 多寶醫師在風險控制上的角色是什麼？

**短答：**

多寶醫師協助做 clinical feasibility calibration，不是正式 sign-off。

**較完整回答：**

請多寶醫師協助判斷：

- `家醫科 / 一般內科` 是否比 all-specialty claim 更合理；
- urgent-care / emergency-style framing 是否更符合 vital signs 的價值；
- 哪些 clinical gates 不能在 Friday 後被視為已解決；
- 哪些 wording 可能會讓人誤解為診斷或自動分流。

Formal sign-off 仍需要慧誠或指定 clinical/product owner。

## H. 會議收斂問題

### Q22. 會議最後我們要請慧誠回答哪些最小決策？

**短答：**

至少要拿到七個答案。

**決策清單：**

1. 六月 artifact：memo、clickable demo、或 kiosk-adjacent demo？
2. 目標設備 / OS：AIO、DKP、MOB？Windows、Android、browser？
3. 必要欄位：BP、SpO2、HR、Temp、Height、Weight、BMI、Glucose 哪些有？
4. synthetic payload：v0 是否可用合成 iMVS-shaped values？
5. 第一個 clinical frame：家醫科 / 一般內科、urgent-care / emergency-style，
   或只講 modular roadmap？
6. output label：triage-support summary、staff-review suggestion、
   clinician-review summary，或其他 wording？
7. source / threshold / wording owner：誰負責 sign-off？

### Q23. 如果慧誠問「下一步你們可以做什麼？」怎麼回答？

**短答：**

下一步取決於他們選的六月 artifact。最小可交付是 clickable demo plan；
若要進一步，才做 kiosk-adjacent integration spec。

**依決策分流：**

| 慧誠決定 | 我們下一步 |
| --- | --- |
| 只要研究對齊 | 整理 Friday memo / meeting summary |
| 要 clickable demo | 做 synthetic payload、兩個流程、safe wording 的 demo plan |
| 要 kiosk-adjacent demo | 做 target SKU、OS/browser、link/webview/API handoff spec |
| 要 FDA / US positioning | 補 510(k) comparator scan |
| 要採 GPT threshold | 將每個 threshold 轉 registry row 並標 `clinician-signoff-needed` |
| 要全科別 | 做 module roadmap，但第一版只承諾 1-2 個 demo modules |

## I. 一句話回答庫

### 一句話回答：全科別

```text
架構上可以設計成全科別可擴充，但第一版不應該宣稱已完成全科別臨床分流；
比較安全的是 shared core 加 specialty modules。
```

### 一句話回答：生命徵象

```text
生命徵象在 v0 主要改變下一題優先順序、review signal、和醫護摘要重點，
不直接產生診斷、治療建議或 final triage level。
```

### 一句話回答：家醫科方案

```text
家醫科 / 一般內科看起來是較可行的第一版 frame，因為它符合 kiosk 的一般
生命徵象量測情境，但需要多寶醫師和臨床 owner 校準。
```

### 一句話回答：FDA / 510(k)

```text
FDA / 510(k) 主要幫我們控制 intended use、software boundary 和宣稱邊界；
症狀問題與 vital-trigger 邏輯仍需要醫學會、ESI、public-health source 或
local protocol 支持。
```

### 一句話回答：六月 demo

```text
六月最可行的是 controlled capability demo：英文症狀問診、synthetic 或
API-shaped iMVS vital data、source-governed question routing、以及
clinician-review summary。
```

### 一句話回答：安全邊界

```text
這是 triage-support workflow demo，不是診斷、不是治療建議、不是
autonomous triage，也不是 FDA-cleared product。
```
