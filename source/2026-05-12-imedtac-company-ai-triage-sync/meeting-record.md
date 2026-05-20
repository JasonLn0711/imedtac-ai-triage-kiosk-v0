---
id: 2026-05-12-imedtac-company-ai-triage-sync-meeting-record
title: "2026-05-12 Meeting Record - imedtac Company AI Triage Sync"
date: 2026-05-12
time: "13:00 Asia/Taipei"
topic: personal
subtopic: sources
type: meeting-record
source: user-provided-transcript
course: ""
keywords: [imedtac, imedtac, ai-triage, urgent-care, vital-sign-kiosk, asr, llm, fhir, his, emr, product-demo]
status: active
---

# AI-Triage 合作會議記錄（慧誠智醫 × NYCU 吳老師團隊）

**會議日期：** 2026/05/12
**會議時間：** 13:00 Asia/Taipei
**會議主題：** AI Triage（AI 檢傷／分流）合作討論
**紀錄性質：** 會後整理版，依據逐字稿、會後 follow-up email、產品/API 文件與使用者補充摘要整合。不是逐字稿原文。

**參與人員：**

- 慧誠智醫（iMedtac）
  - Jason Miao（業務）
  - Johnny Fang（PM）
  - Ken Yu（余金樹）
- NYCU 團隊
  - 吳育德團隊
  - Jason Lin（阿聖）

**相關材料：**

- Cleaned transcript: `source/2026-05-12-imedtac-company-ai-triage-sync/transcript-cleaned.md`
- Polished interpretation brief: `source/2026-05-12-imedtac-company-ai-triage-sync/demo-brief.md`
- Company follow-up package: `source/2026-05-12-imedtac-company-ai-triage-sync/assets/`
- Extracted follow-up text: `source/2026-05-12-imedtac-company-ai-triage-sync/extracted/`
- Detailed materials analysis: `docs/2026-05-12-imedtac-materials-analysis.md`

## 一、會議核心背景

慧誠智醫目前已有：

- 生理量測 Kiosk 系統
- Vital Sign 自助量測設備
- Middleware 架構
- HIS / EMR 串接能力
- FHIR Standard 資料交換能力

目前希望：

> 在既有 Vital Sign 系統上，整合 AI-Triage 能力。

也就是：

- 病患先量測：
  - 血壓
  - 血氧
  - 體溫
  - 身高
  - 體重
- 接著進行：
  - 問答式 symptom assessment
  - 語音輸入（ASR）
  - AI 問題引導
  - 主訴整理
  - 分流／檢傷建議

最後：

- 提供醫師與護理端參考
- 加速門診／urgent care 流程
- 降低人力負擔
- 建立可產品化方案

這場會議接續 `2026-05-11` 吳老師與 Jason、林駿亦討論的 慧誠 ER triage / EKG / ASR / vital sign 合作線。此專案應保留在慧誠 AI triage kiosk lane，不應直接併入泌尿科 previsit demo lane。

## 二、慧誠智醫目前系統架構

### 1. 現有產品能力

目前系統屬於：

- 自助式生理量測 Kiosk
- Windows-based All-in-One device
- Web Service UI
- Touch screen 操作

可量測：

- 血壓
- 血氧
- 體溫
- 身高
- 體重

部分客戶曾要求：

- ECG
- Ultrasound

但目前不屬於 triage 核心範圍。會議中可先把 ECG / ultrasound 視為未來可擴充項，不納入週五 feasibility artifact 的核心範圍。

產品文件補充：

- All-in-one / AIO SKU 可支援血壓、血氧、體溫、體重、身高等量測。
- Desktop / DKP SKU 至少涵蓋血壓、血氧、額溫等量測。
- 會議口頭描述偏向 Windows-based all-in-one；產品規格另列 `21.5" Tablet` 與 `Android 8.1`，因此後續 demo 前必須確認目標展示設備與 OS。

### 2. 系統架構

系統分成三層：

```text
Medical Devices
    ↓
Middleware
    ↓
FHIR Standard
    ↓
HIS / EMR
```

特點：

- 可與醫院 HIS / EMR 整合
- 台灣醫院多為私有雲
- 美國醫院常用 AWS / Google Cloud 或第三方醫療平台
- Oracle Cerner / Epic 為主要醫療平台
- 後端已有 gateway / middleware 讀取設備資料
- RESTful API 可以支援後續資料交換

會議與產品文件目前支持的 v0 integration hypothesis：

```text
Patient identity / login
    ↓
Vital sign measurement
    ↓
iMVS / middleware / API-shaped payload
    ↓
AI triage demo receives vital context
    ↓
Symptom intake + dynamic follow-up
    ↓
Clinician-facing triage-support summary
```

API 文件中可見的欄位方向包括：

- `CHART_NO`
- `SAVE_DATETIME`
- `UPLOAD_DATETIME`
- `STATION_NAME`
- `Payload`
- `SPO2`
- `HR`
- `Temp`
- `Glucose`
- `NBP`
- `Height`
- `Weight`

這些欄位可作為 demo mock payload 或 adapter mapping 的起點，但不代表目前已允許接入真實病人資料或正式 HIS / EMR 寫入。

## 三、慧誠智醫對 AI-Triage 的期待

### 長期願景

希望建立：

### 「English-based AI Triage System」

具備：

- 全科別
- ASR 語音輸入
- 結合 Vital Sign
- AI 問題推進
- Dynamic symptom assessment
- 地端部署能力
- 低硬體需求
- 可產品化

### 特別強調

慧誠智醫認為：

> 外部市面上的 AI-Triage 幾乎都沒有結合 Vital Sign。

但他們認為：

> Vital sign 必須對 triage 產生影響。

這是他們想做出的差異化。

換句話說，慧誠不是只要一個通用 symptom chatbot，而是希望把既有生理量測設備的價值轉成 AI-assisted triage workflow 的產品差異。

## 四、目前觀察到的國外 AI-Triage 系統

慧誠智醫展示了國外 Web-based AI Triage 系統，例如：

- symptom assessment
- 問答式流程
- 6 到 8 題內收斂
- pain score（1-10）
- chest pain screening
- emergency recommendation

但目前問題如下。

### 缺點 1：沒有 Vital Sign

外部系統多半只有文字／口述 symptom，沒有使用現場量測的 BP、SpO2、temperature、height、weight 等生理資料。

### 缺點 2：可能描述不精確

例如：

- 頭痛
- 胸痛
- 呼吸不順

病患主訴可能模糊，也可能使用非醫學詞彙。這使 symptom wording、自然語言對應標準醫學概念、以及追問策略變成產品核心，而不是單純 UI 問題。

### 缺點 3：多半只是樹狀流程

外部示範看起來更接近固定問答或樹狀流程，不像真正結合語意、狀態與生理資料的 dynamic assessment。

## 五、Jason 目前展示的 AI 系統（泌尿科 Demo）

Jason 展示的是：

## 「門診前 AI 問診系統」

目前：

- 以泌尿科為例
- 資料來源：
  - 台灣泌尿科醫學會
  - 美國泌尿科醫學會
- 目標：
  - 門診前預問診
  - 減少醫師問診時間
  - 整理主訴
  - 提供護理端摘要

這個 demo 是 workflow reference，不是 urgent-care triage implementation。它可以證明 structured intake、dynamic question selection、nurse / clinician summary 的互動模式，但不能直接被說成已完成全科別 AI triage。

### 1. Dynamic Questioning

不是固定樹狀問答。

而是：

- embedding model
- vector similarity
- 問題空間
- semantic proximity

去決定：

> 下一題要問什麼。

Jason 特別說明：

- 問題並非固定路徑
- 而是根據目前病患狀態動態接近下一題
- 同一套架構可以透過替換 specialty module / question pool 來重用

這個方向對慧誠的價值在於：它可以把 urology module 擴充成 cardiology、ENT、neurology、GI、urgent-care lite 等模組，而不是硬寫一棵無法維護的大樹。

### 2. 為什麼不用 ChatGPT 對話式 UI

Jason 觀察到：

### 老年病患不適合複雜對話 UI

因此改成：

- 點擊式 UI
- 大按鈕
- Guided interaction

原因：

- 降低學習成本
- 降低醫護協助負擔
- 提升實際可落地性

這個觀察非常重要，因為：

> 醫療產品不是比 AI 多強，而是比 workflow friction 多低。

對慧誠 kiosk 情境而言，v0 不應預設 full chat UI。更合理的是 touch-guided intake 為主、ASR 作為補充或可選輸入，等 kiosk 麥克風、場域噪音、口音、醫療詞彙辨識都測過後再擴大語音比例。

### 3. ASR 的角色

目前：

- 主流程仍為點擊式
- ASR 作為補充輸入

例如：

- 補充病史
- 慢性病描述
- 醫師備註
- 主訴自由敘述

但未來：

- 可以變成 full voice interface
- 可以支援 English-first urgent-care intake
- 可以和 embedding / symptom mapping 搭配，把 everyday wording 對應到標準 symptom concepts

仍需注意：

- kiosk 麥克風品質
- 現場噪音
- 口音
- medical vocabulary
- 錯字與轉錄錯誤如何被 clinician review 捕捉

## 六、會議中最重要的幾個問題

## 問題 1：如何從「單科別」變成「全科別」？

慧誠智醫 PM 提出：

目前泌尿科 symptom scope 比較窄。

但未來：

- urgent care
- 全科別 triage
- general symptom routing

會複雜很多。

### Jason 的回答

Jason 提出：

### 「模組化科別架構」

例如：

```text
Cardiology/
Urology/
ENT/
Neurology/
GI/
```

每科：

- symptom database
- question pool
- embedding space
- triage logic
- source registry
- clinical reviewer

獨立管理。

需要時：

- 單科部署
- 全科部署

都可以。

這個方向合理，但必須補上治理層：每個 module 都要知道問題來源、版本、臨床目的、vital trigger、review owner 與 demo / production status。

## 問題 2：symptom wording 要怎麼建立？

這是整場會議最關鍵的問題之一。

慧誠智醫問：

> 這些 symptom wording 是怎麼來的？

因為醫療產品：

- 不能亂寫
- 不能憑感覺
- 必須有 guideline 依據

### Jason 目前的回答

目前：

- 使用醫學會 guideline
- 美國泌尿科醫學會
- 台灣泌尿科醫學會

作為 symptom source。

但 Jason 也坦承：

> 目前中文 wording 還未完全 medical-standardized。

這是正確的誠實回答。

後續要把 symptom wording 分成三層：

| 層級 | 目的 | 來源與治理 |
| --- | --- | --- |
| Patient wording | 病患看得懂、說得出來 | 使用者測試、ASR 測試、clinician review |
| Clinical concept | 對應標準 symptom / concern | ESI、醫學會、專科 guideline、院方 protocol |
| AI routing feature | embedding / classifier / rule engine 使用 | source-governed registry，不直接對外宣稱診斷 |

## 問題 3：Vital Sign 進入後，AI 要怎麼改變？

這是會議真正的核心。

慧誠智醫真正想知道的是：

```text
如果：
SpO2 = 88%
BP = 180/110
Temp = 39.5
HR = 130

那 AI 的問題流程會怎麼改變？
```

Jason 當下的回答方向正確：

## Jason 說：

Jason 不是醫療背景。

因此：

- 必須依據 FDA / guideline
- 必須與醫師合作
- 必須建立 medical mapping

這比現場亂回答專業很多，因為：

> AI triage 最大風險不是模型不準，而是 medical reasoning 沒有 regulatory basis。

後續需要更精確地改寫這句話：

- FDA 不應被當成 symptom questionnaire 的主要來源。
- FDA 應用來定義 intended use、software risk、validation、transparency、independent review、cybersecurity、claim boundary。
- 真的支撐「vital sign 加入後如何改變問題或風險分流」的來源，應該來自 ESI、AHA / ACC、CDC、ACEP、AUA / EAU、其他專科醫學會、院方 protocol 或 clinician / company sign-off。

## 七、慧誠智醫目前真正的短期目標

這段非常重要。

因為他們其實不是要 Jason 立刻做完整 AI triage。

他們真正想要的是：

# 「6 月美國客戶來台時，有一個可以展示的 demo」

所以：

## 他們真正需求是：

### 第一階段

```text
Existing Vital Sign Kiosk
    +
Jason 的 AI 問診 Demo
    =
可展示的 AI-Triage 情境
```

重點：

- 可 demo
- 可 marketing
- 可 imagine future
- 可對外展示

不是：

- 完整 FDA-grade 醫療產品
- production clinical triage
- autonomous diagnosis
- live HIS / EMR writeback
- 未驗證 threshold 驅動的醫療建議

短期 demo 的 safer wording 應維持：

- AI-assisted triage workflow demo
- triage support, not diagnosis
- symptom collection
- vital-aware workflow
- structured clinician summary
- workflow acceleration
- kiosk integration capability

## 八、目前雙方已經對齊的方向（Alignment）

目前已對齊：

### 1. 英文為主

短期 demo 與海外市場溝通以英文為主。

### 2. ASR 為未來方向

語音輸入是長期方向，但 v0 可以 touch-guided + optional ASR，避免被 kiosk noise / microphone / accent testing 卡住。

### 3. 全科別為長期目標

短期不需要完成 full all-specialty triage。合理路徑是 modular specialty / symptom category expansion。

### 4. Vital Sign 必須整合

這是慧誠差異化核心。vital signs 不能只是 summary display，必須至少能改變：

- question priority
- red-flag routing
- clinician summary emphasis
- next-step review urgency wording

但所有臨床意義必須 source-governed。

### 5. 低硬體需求

現有 kiosk 無 GPU，因此 v0 應優先設計 CPU-friendly 架構。完整 LLM 不是必要條件。

### 6. 盡量地端

醫院情境與隱私需求會偏好 local / private cloud / hospital-controlled deployment。美國或海外市場可能另有 AWS / Google Cloud / Epic / Oracle Cerner 環境。

### 7. 避免高 GPU / 高 token cost

產品化時應避免把核心工作流綁死在高成本 public cloud LLM token model 上。

### 8. 先做 demo，再逐步產品化

先用 mock / synthetic payload、有限 symptom categories、source-governed wording、clinician-review summary 建立可信 demo，再進入產品化與臨床驗證。

## 九、會議後 Follow-up 與 Action Items

慧誠智醫寄出的 follow-up email 中，對 NYCU / Jason 端的 action item 包含：

### 1. 研究

- 全科別 triage
- Vital Sign integration
- AI model integration
- modular architecture

Email wording 對應：

> 進行研究涵蓋全科別並能整合生理數據的檢傷分類系統之 AI 模型整合方法（將各科別設計為模組化結構）並完成初步探勘。

### 2. 研究

- FDA
- 醫學會 guideline
- 生理數據如何影響 triage

Email wording 對應：

> 以 FDA 或醫學會指引資料為例，理解特定生理數據加入分析後的影響，期望這周五有初步研究結果後我們可以進行討論。

### 3. 週五前提出初步研究結果

週五 `2026-05-15` 前，應準備的不是 prototype，也不是 FDA memo，而是：

- feasibility / source-governance artifact
- vital-aware triage architecture
- source registry / question registry 初稿
- ASR + embedding + LLM 角色切分
- kiosk integration insertion point
- demo boundary / no-go boundary
- Friday decision questions

### 慧誠端待提供或需確認

- 目標展示設備與 OS
- v0 demo 是 iframe / link / same web app / API handoff / mocked flow
- 是否允許 synthetic vital-sign payload
- 最小必要 vital fields
- output wording
- clinical sign-off owner
- 是否有 US partner / customer 的 product reference 或 510(k) reference

## 十、這場會議真正的本質

這不是：

> AI model 技術展示會議。

而是：

# 「醫療 workflow integration 會議」

核心其實是：

```text
Vital Sign
    ↓
Medical Workflow
    ↓
Question Flow
    ↓
Triage
    ↓
Clinical Efficiency
```

而不是：

```text
LLM 很強
```

這是接下來最需要轉換的思維。

對外溝通時，應把模型能力放在 workflow 裡描述：

- ASR：把病患口述轉成可處理文字。
- Embedding / retrieval：把 everyday wording 對應到 source-governed symptom concepts 與下一題候選。
- Lightweight logic / routing layer：根據 symptom state + vital context 調整 question priority。
- LLM：只用於摘要、語句整理、clinician-facing narrative，不作為未驗證的醫療決策核心。
- Clinician review：保留最終判斷與修正權限。

## 十一、接下來最重要的事情

現在最重要的不是：

- 繼續改 UI
- 繼續玩模型
- 繼續加 fancy AI

而是：

# 先建立「Medical Decision Mapping」

也就是：

```text
哪個 vital signal
→ 對應哪種風險
→ 影響哪類問題
→ 導向哪種 triage priority
```

例如：

| Vital Sign | 可能意義 | 問題方向 |
| --- | --- | --- |
| 高血壓 | cardiovascular risk | chest pain / stroke |
| 低血氧 | respiratory distress | breathing questions |
| 高體溫 | infection | URI / sepsis |
| 高 BMI | metabolic syndrome | diabetes / sleep apnea |

這才是真正的 AI triage 核心。

但這張表目前只能作為 feasibility sketch，不能當作 clinical rule。下一步必須為每一列補上：

| 欄位 | 說明 |
| --- | --- |
| `vital_signal` | BP / SpO2 / Temp / HR / BMI 等 |
| `condition_or_range` | source-backed 或 demo-only condition |
| `clinical_concern` | 可能關注方向，不直接宣稱診斷 |
| `question_impact` | 影響哪些追問類別 |
| `routing_impact` | 是否提高 review priority 或縮短低風險問答 |
| `source_family` | ESI / AHA-ACC / CDC / ACEP / AUA / hospital protocol 等 |
| `source_status` | draft / source-verified / clinician-reviewed / demo-only |
| `review_owner` | 慧誠、醫師、吳老師團隊或其他 reviewer |

## 十二、開放問題與工作假設

### 開放問題

- What data shape does the kiosk expose after measurement: JSON, FHIR resource, REST endpoint, database row, file export, or internal event?
- Is demo integration expected to be iframe/link, same web app, API handoff, or mocked flow?
- What minimum vital-sign fields must influence the demo result?
- Can the v0 demo use simulated vital-sign values, or must it read from a real kiosk?
- What source should define all-specialty urgent-care symptom modules: ESI, FDA, medical societies, customer-provided protocol, commercial database, or clinician-authored content?
- Is English the real first market language, or just the first demo language?
- How should ASR be tested for kiosk noise, microphone quality, accents, and medical vocabulary?
- Does the output say "recommended care level", "needs clinician review", "call emergency services", or another safer wording?
- Who signs off on any vital-sign threshold or red-flag rule?
- What exact Friday deliverable does 慧誠 expect: architecture memo, source-governance artifact, clickable demo, or all three?

### 工作假設

- Treat the urology previsit demo as a technical and workflow reference only.
- Do not merge the urology previsit repo into this product lane.
- Keep "triage support, not diagnosis" as the safety boundary.
- Do not invent vital-sign clinical rules without authoritative sources and clinician/company validation.
- Keep implementation gated on target device / OS, integration mode, sample or mock payload permission, guaranteed vital fields, output wording, and clinical sign-off owner.
- Keep patent-sensitive, core-flow, and detailed ASR + LLM architecture material private unless Prof. Wu / the project owner explicitly approves disclosure.
