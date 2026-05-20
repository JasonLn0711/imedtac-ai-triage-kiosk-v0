# Project

## Identity

- Project name: 2026-05 慧誠急診分流 EKG / ASR / 問答協作
- Trigger date: 2026-05-11
- Sponsor / requester: Prof. Wu
- External party: 慧誠智醫 / imedtac Co., Ltd.
- Official website: `https://www.imedtac.com/`
- Upstream thread: follow-up to the 吳老師 / 余總 project discussion; the earlier 余總 `triage` remark refers to this lane.
- Internal contact window: 林駿亦 and Jason, pending Prof. Wu / company confirmation
- Status: standalone execution repo created; company follow-up package analyzed; Friday `2026-05-15` research artifact is the next bounded deliverable; implementation remains gated on integration mode, target device, clinical-source confirmation, and the sales-pressure boundary from the `2026-05-11` LINE update
- Canonical execution repo: `../ai-triage-kiosk-demo/`
- Repo operating contract: `../ai-triage-kiosk-demo/AGENTS.md`
- Repo relationship note: `../ai-triage-kiosk-demo/docs/repo-relationships.md`
- Repo project brief: `../ai-triage-kiosk-demo/docs/project-brief.md`
- Core architecture note: `../ai-triage-kiosk-demo/docs/architecture-insertion-and-clinical-grounding.md`
- Thursday vital-sign research gate: `../ai-triage-kiosk-demo/workstreams/05-thursday-vital-sign-research-gate.md`
- First-principles must-do gates: `../ai-triage-kiosk-demo/workstreams/06-first-principles-must-do-gates.md`
- Source index: `../ai-triage-kiosk-demo/docs/source-index.md`
- Prof. Wu instruction register: `../ai-triage-kiosk-demo/docs/wu-instruction-register.md`
- Repo organization: `../ai-triage-kiosk-demo/docs/repo-organization.md`
- Friday source-governance handoff: `../ai-triage-kiosk-demo/handoff/2026-05-15-vital-aware-triage-feasibility-source-governance.md`
- Source registry and example flows: `../ai-triage-kiosk-demo/handoff/2026-05-15-source-registry-and-example-flows.md`
- Friday discussion brief: `../ai-triage-kiosk-demo/handoff/2026-05-15-friday-discussion-brief.md`
- First-principles gap audit: `../ai-triage-kiosk-demo/handoff/2026-05-15-first-principles-gap-audit-and-action-plan.md`
- Reviewer packet: `../ai-triage-kiosk-demo/handoff/reviewer-packet/`
- Governance registries: `../ai-triage-kiosk-demo/data/`
- Synthetic demo fixtures: `../ai-triage-kiosk-demo/demo/fixtures/`
- Registry validation script: `../ai-triage-kiosk-demo/scripts/check_governance_registries.py`
- Source bundle: `data/knowledge/personal/sources/2026-05-11-wu-imedtac-er-triage-ekg-asr/source.md`
- Meeting record: `data/knowledge/personal/sources/2026-05-11-wu-imedtac-er-triage-ekg-asr/meeting-record.md`
- Company-sync source bundle: `data/knowledge/personal/sources/2026-05-12-imedtac-company-ai-triage-sync/source.md`
- Company-sync meeting record: `data/knowledge/personal/sources/2026-05-12-imedtac-company-ai-triage-sync/meeting-record.md`
- Company-sync demo brief: `data/knowledge/personal/sources/2026-05-12-imedtac-company-ai-triage-sync/demo-brief.md`
- Company-sync cleaned transcript: `data/knowledge/personal/sources/2026-05-12-imedtac-company-ai-triage-sync/transcript-cleaned.md`
- Company follow-up materials analysis: `../ai-triage-kiosk-demo/docs/2026-05-12-imedtac-materials-analysis.md`
- LINE-group context source: `data/knowledge/personal/sources/2026-05-02-12-imedtac-zhidewan-line-thread/source.md`
- Prof. Wu LINE demo request source: `data/knowledge/personal/sources/2026-05-12-wu-line-lianyi-asr-llm-demo/source.md`
- Prof. Wu Google Meet 510(k) direction source:
  `data/knowledge/personal/sources/2026-05-12-wu-google-meet-ai-triage-510k/source.md`
- Prof. Wu Google Meet 510(k) meeting record:
  `data/knowledge/personal/sources/2026-05-12-wu-google-meet-ai-triage-510k/meeting-record.md`
- Execution-repo source copies:
  - `../ai-triage-kiosk-demo/source/2026-05-11-wu-imedtac-er-triage-ekg-asr/`
  - `../ai-triage-kiosk-demo/source/2026-05-12-imedtac-company-ai-triage-sync/`
  - `../ai-triage-kiosk-demo/source/2026-05-12-wu-google-meet-ai-triage-510k/`
  - `../ai-triage-kiosk-demo/source/upstream-wu-context/2026-04-16-wu-yute-tomi-meeting/`
  - `../ai-triage-kiosk-demo/source/upstream-wu-context/2026-04-20-cde-prof-wu-clinical-medical-device-it-cybersecurity-speech/`

## FIRST PRINCIPLE Scope

- Scarce resource: execution bandwidth and clinical evidence.
- Canonical execution home: `../ai-triage-kiosk-demo/`.
- Planning owns status, capacity, open questions, and routing only.
- Execution repo owns copied source bundles, demo-specific briefs, architecture notes, implementation materials, and future deliverables.
- Do not merge with `泌尿預診導航`: that lane is urology previsit workflow with synthetic local review. This lane is emergency triage support with EKG / SpO2 / vital signs and possible ASR / LLM interaction.
- Do not merge with TFDA/FDA advisor: regulatory/cybersecurity questions are dependencies, but the advisor lane remains a checked-memory system, not the product repo.
- Resolved referent: prior planning questions about what 余總 meant by `triage` should now route to this project unless later notes identify another triage effort.
- Identity lesson: Jason's useful role is not just model building. It is high-risk AI workflow / trust / safety systems thinking: mapping incomplete clinical information, workflow ownership, cybersecurity, evidence trace, accountability, and maintenance into an explicit system boundary.

## 2026-05-11 Evening LINE Update

- Jason Miao reported that a Middle East customer has already asked about adding `AI Triage` to the `Vital Sign Kiosk`.
- He also noted that US and Malaysia cases are active at the same time.
- Prof. Wu added JYLin to the LINE group and said 林駿亦博士 and 林家聖 should participate in the AI triage discussion.
- Jason Miao proposed scheduling a separate discussion the next day with 林博 and 家聖.

Planning interpretation:

- This is now a near-term coordination lane, not only a background idea.
- The next useful deliverable is still scope clarification: product surface, clinical label, workflow owner, data availability, market/customer context, role split, and safety/regulatory boundary.
- Do not promise an AI model, LLM workflow, autonomous triage function, or emergency medical advice based only on the LINE sales signal.

## Working Product Hypothesis

The proposed system may collect:

- about 10 questionnaire answers,
- EKG for a defined duration,
- SpO2,
- heart rate and possibly other vital signs,
- potentially ASR input or touch/tablet interaction.

The current company-facing product surface may be the Vital Sign Kiosk. The output may be a triage / ED-referral support report, such as whether the patient should be sent to the emergency department. The current safety boundary is triage support, not diagnosis.

## Current Architecture Focus

The most urgent thinking layer is now the AI triage product architecture:

- find the insertion point inside 慧誠's existing measurement workflow;
- prefer the post-measurement path: vital-sign measurement -> AI triage -> dynamic questioning -> structured summary -> nurse / physician review;
- treat the differentiator as vital-aware dynamic questioning, not a generic symptom chatbot;
- build clinical evidence mapping before product claims;
- distinguish FDA as software/risk/validation boundary from specialty guidelines and clinical protocols as likely sources for question logic.

Canonical note: `../ai-triage-kiosk-demo/docs/architecture-insertion-and-clinical-grounding.md`.

Planning implication: do not schedule broad coding, UI polish, ASR expansion, or all-specialty scope until the insertion workflow, vital-to-question impact table, API boundary, and question provenance template are stable.

## Execution Repo Created

The standalone repo `../ai-triage-kiosk-demo/` was created as a sibling of
`planning-everything-track` to keep this lane from overloading planning notes.

Initial repo contents:

- copied `2026-05-11` Prof. Wu kickoff source bundle;
- copied `2026-05-12` company-sync source bundle, meeting record, cleaned transcript, and demo brief;
- copied upstream Prof. Wu context: `2026-04-16` Wu/Tomi meeting and `2026-04-20` CDE medical-device cybersecurity speech source;
- copied related planning locator snapshots for 慧誠, urology previsit, TFDA/FDA advisor, and medical cybersecurity;
- copied a planning-bridge snapshot of this locator;
- added `README.md`, `AGENTS.md`, `docs/project-brief.md`, `docs/repo-relationships.md`, `docs/source-index.md`, `docs/repo-organization.md`, `docs/wu-instruction-register.md`, workstream notes, handoff folder, and decision log.

Routing rule from now on: add execution detail in `../ai-triage-kiosk-demo/`
first, then mirror only status, blockers, capacity impact, and locator updates
back into this planning file.

## 2026-05-12 Company Sync Update

Jason met with 慧誠智醫 business / PM contacts at `13:00` on `2026-05-12`.

Current best interpretation:

> 慧誠智醫短期希望在六月前，基於我們現有的 triage prototype，快速做出英文版 demo，能被放進他們既有 Kiosk / web service 產品流程中，展示「慧誠智醫 + 智德萬 / 吳老師團隊已具備 AI triage capability」。這個 demo 主要用途是 go-to-market 與美國客戶展示，還不是正式醫療決策產品。

The full polished version, including Mermaid diagrams and the reusable writing format, is preserved in `data/knowledge/personal/sources/2026-05-12-imedtac-company-ai-triage-sync/demo-brief.md`.

Updated concrete product context:

- 慧誠's base product is a self-service physiological-measurement kiosk for outpatient / urgent-care style intake.
- Default device data are blood pressure, SpO2, temperature, and for the all-in-one SKU height/weight.
- The kiosk runs on a Windows-based fanless all-in-one computer with no onboard GPU.
- The product can connect through networked architecture; company context includes middleware, RESTful API, FHIR, HIS, and EMR integration.
- Existing foreign symptom-assessment tools shown by the company appear mostly question/text based and do not use vital-sign data; 慧誠's business value depends on making vital signs useful in the workflow.

Aligned long-term target:

- English-first,
- voice input,
- broad/all-specialty symptom triage,
- vital-sign-aware triage result,
- low-cost deployment when possible,
- urgent-care style workflow rather than autonomous diagnosis.

Near-term possible artifact:

- A presentable demo that adapts Jason's existing local structured-question / urology-previsit workflow into an English triage-facing flow and connects it at demo level to 慧誠's kiosk UI / web-service flow.
- Short-term framing from the post-meeting summary: an English AI-triage reference demo before the June US customer visit, showing symptom collection, structured summary, workflow acceleration, and kiosk integration without diagnosis or autonomous medical decision-making.
- Demo positioning: market demo / product capability demo, not production clinical triage, autonomous diagnosis, or formal HIS / EMR integration.
- Urology reference status: the `../urology-ai-previsit-demo/app/patient-short/` route was hardened after the company sync so it can serve as a clearer reference for short structured intake. This improves demo credibility only; it does not convert the urology repo into the 慧誠 triage implementation.
- UX lesson to reuse in the future English kiosk demo: when a topic has multiple judgment points, the active sub-question must become the main visual object and show explicit group/sub-question progress, otherwise users may think the screen has frozen.

Current blocker after the company follow-up package:

- Product and API materials exist, but implementation still needs target
  SKU / OS, integration mode, sample or mock payload permission, guaranteed
  vital fields, output wording, and clinical sign-off owner.
- Vital-sign-to-triage logic requires authoritative criteria and
  clinician/company validation; engineering should not invent clinical
  thresholds.
- Patent-sensitive / core ASR + LLM workflow and architecture details should
  remain private until disclosure is explicitly approved.

## 2026-05-12 Company Follow-Up Package Analysis

Johnny Fang's company-side follow-up email and two attachments were moved out
of `~/Downloads` and into the execution repo:

- `../ai-triage-kiosk-demo/source/2026-05-12-imedtac-company-ai-triage-sync/assets/2026-05-12-imedtac-ai-triage-followup-email.pdf`
- `../ai-triage-kiosk-demo/source/2026-05-12-imedtac-company-ai-triage-sync/assets/2026-05-12-imvs-product-spec-v2.0.4.docx`
- `../ai-triage-kiosk-demo/source/2026-05-12-imedtac-company-ai-triage-sync/assets/2026-05-12-imvs-api-v1.4-eng.pdf`

Searchable text extracts are preserved under:

- `../ai-triage-kiosk-demo/source/2026-05-12-imedtac-company-ai-triage-sync/extracted/`

Detailed analysis:

- `../ai-triage-kiosk-demo/docs/2026-05-12-imedtac-materials-analysis.md`

Main update:

- The company follow-up mostly confirms the existing interpretation, but adds a
  concrete Friday `2026-05-15` research gate: 阿聖 should prepare initial
  findings on all-specialty modular AI-triage model integration and how
  physiological data can affect triage analysis.
- Product spec confirms iMVS is a measurement-centered workflow:
  identify/login -> measure -> finish/report, with voice/text guidance, normal
  / abnormal reference display, re-measure / next actions, QR/report output,
  and AIO / DKP / MOB device lines.
- API doc defines optional hospital-side authentication and post-measurement
  vital-sign upload fields, including `SPO2`, `HR`, `Temp`, `Glucose`, `NBP`,
  `Height`, and `Weight`.
- The current v0 architecture should consume a synthetic or API-shaped
  post-measurement vital payload and return a triage-support summary for demo
  display, without real patient IDs or HIS / EMR writeback.
- Clarify before implementation: target SKU / OS, Windows-vs-Android device
  ambiguity, link/iframe/same-app/API integration mode, guaranteed vital fields,
  and who signs off on vital-threshold clinical meaning.

Planning implication:

- The blocker is no longer "waiting for product/API materials" in general.
  The blocker is now a bounded Friday feasibility artifact plus unresolved
  company clarifications. Do not open a full product sprint from this alone.

## 2026-05-12 Internal Thursday Plan - Vital-Sign Research Gate

Because the company asked to discuss initial research results on Friday
`2026-05-15`, the internal deadline is Thursday `2026-05-14 11:30`, before the
Rao consultation at `13:00`.

Canonical workplan:

- `../ai-triage-kiosk-demo/workstreams/05-thursday-vital-sign-research-gate.md`

Planning interpretation:

- This is now a W20 must-output, but it stays bounded to feasibility research:
  architecture insertion, modular method map, vital-to-question impact matrix,
  clinical-source governance, open questions, and demo wording boundary.
- FDA should be used for intended-use / CDS / software-risk / transparency
  boundaries; medical-society, emergency-medicine, public-health, hospital, or
  clinician-approved sources should drive symptom/question logic.
- The answer should show how BP, SpO2, temperature, HR, BMI/height/weight, and
  optional glucose can influence question priority, escalation framing, and
  clinician-review summary without claiming autonomous diagnosis or production
  triage.
- Capacity rule: execute most of this on Wednesday `2026-05-13`, final-pass it
  Thursday morning, and do not let it displace the Thursday `13:00` Rao meeting
  or the Pikachu demo capture.

## 2026-05-12 22:20 Prof. Wu Google Meet - 510(k) Direction

Jason met Prof. Wu through Google Meet around `22:20` after the company sync.
The complete transcript and structured analysis are preserved at:

- `data/knowledge/personal/sources/2026-05-12-wu-google-meet-ai-triage-510k/transcript-full.md`
- `data/knowledge/personal/sources/2026-05-12-wu-google-meet-ai-triage-510k/meeting-record.md`
- `data/knowledge/personal/sources/2026-05-12-wu-google-meet-ai-triage-510k/user-provided-summary.md`
- `data/knowledge/personal/sources/2026-05-12-wu-google-meet-ai-triage-510k/user-provided-extended-analysis.md`

Execution-repo copy:

- `../ai-triage-kiosk-demo/source/2026-05-12-wu-google-meet-ai-triage-510k/`

Main decision:

- Do not start by building full AI triage or inventing vital-sign rules.
- First find comparable FDA `510(k)` summaries and extract the `indication for
  use`, predicate/comparable devices, product functions, inputs, outputs,
  limitations, and related publications.
- Use the `510(k)` / product-scope scan to decide how to frame the Friday
  discussion, the June English demo, and the later 聯醫 deep-cultivation plan.

Updated Friday artifact:

- title shape: `AI Triage Kiosk Demo - 510(k) Product-Scope Scan And Friday
  Discussion Brief`;
- include English demo scope, no-GPU compute boundary, comparable-product
  table, intended-use options, what can safely be shown in June, and questions
  for 慧誠;
- short-term positioning should be closer to `AI-assisted pre-visit intake and
  screening support for clinician review`, not `AI determines triage urgency`.

Staffing / help route:

- Ask 苗先生 for the US partner/customer product name or `510(k)` reference.
- Ask 多寶 for medical interpretation if GPT / documents remain unclear; invite
  多寶 to the Friday meeting if needed.
- Ask 冠廷 for medical/signal interpretation.
- Treat 俊逸 as possible later signal-side owner if signal processing becomes a
  real implementation lane.

## 2026-05-12 Prof. Wu LINE - 聯醫 ASR + LLM Demo

Prof. Wu separately asked Jason by LINE whether he is available next Tuesday
morning at `10:00` for a meeting at 北門站中興醫院旁的院本部大樓地下室會議室 with 聯醫主管. The requested
artifact is an `ASR + LLM` demo connected to a deep-cultivation-plan discussion;
if Jason could not attend, Prof. Wu asked for a recorded video to play. Jason
replied that he will attend and prepare. Prof. Wu later added that he will be at
院本部 from `08:00` that day.

Planning interpretation:

- Fixed meeting: `2026-05-19 10:00`, 北門站中興醫院旁的院本部大樓地下室會議室.
- Arrival / contact note: Prof. Wu will be at 院本部 from `08:00`.
- Internal freeze: runnable demo and backup video ready by `2026-05-15 17:00`.
- Demo direction: evolve the existing local demo into ASR-assisted intake plus
  `LLM` or preferably `embedding / RAG` question routing and summary generation.
- Fallback requirement: typed-input path plus recorded video, so the meeting is
  not blocked by microphone, ASR, network, or live-LLM instability.
- Boundary: this remains a synthetic / demo workflow until explicit clinical,
  data, regulatory, and hospital-integration decisions are made.
- Resume route: preserve the final demo and video as evidence for healthcare AI
  product prototyping, ASR / RAG system design, hospital stakeholder demo
  delivery, and claim-boundary discipline.

## 2026-05-02 to 2026-05-12 LINE Group Context

The broader 智德萬 / 慧誠智醫 LINE-group thread is preserved as a private source note:

- `data/knowledge/personal/sources/2026-05-02-12-imedtac-zhidewan-line-thread/source.md`

Planning interpretation from the LINE thread:

- The AI-triage lane developed from Ken Yu's urgent-care kiosk / physician-intake framing, customer demand around Vital Sign Kiosk AI triage, and Prof. Wu's assignment of 林駿亦博士 + 林家聖 to participate.
- The near-term AI-triage ask is still a reference/demo path: convert the existing ASR + LLM urology-question demo into an English version that can help customers imagine a concrete kiosk workflow before larger development investment.
- The vital-sign classifier path is data-gated: Prof. Wu explicitly noted the need for normal and abnormal vital-sign data collected from the Vital Sign Kiosk before training a binary classifier.
- 藥瓶 / 藥品影像辨識 is a separate but relationship-adjacent support lane. It has short-notice demo/show-room pressure from Iris / Ken Yu / Thai-team training, but should be tracked lightly here unless Jason or the core team receives a direct deliverable.
- MOU / NDA, 彰基 AI workshop / Thailand hospital contacts, MRI / Piti education-training opportunities, and external benchmark links are cooperation context only; do not let them become W20 technical tasks unless a concrete action is assigned.

Current action split:

- Detailed tracking: AI triage / kiosk, ASR + LLM English reference demo, vital-sign-aware workflow, and any Jason-owned follow-up from the `2026-05-12` sync.
- Light tracking: medication-recognition show-room deployment, MOU / NDA, Thailand workshop, product-marketing materials, competitor/market references.
- Boundary: do not copy contract text, raw media, customer-specific details, phone numbers, or patent-sensitive ASR + LLM internals into public-facing planning notes.

## Company Context

慧誠智醫 / imedtac is not best understood as a pure AI-model startup. Based on its official website and service pages, it is closer to a smart-hospital / medical-AIoT system company and healthcare system integrator.

Current official positioning:

- Taiwanese smart healthcare / AIoT company, established in `2016`.
- Focus areas include smart hospitals, smart care, health promotion, telemedicine / vital-sign measurement, smart wards, smart operating rooms, medication safety, and healthcare robotics / clinical logistics.
- Technical emphasis includes AIoT, IoMT data integration, HIS / EMR integration, hardware-software platforms, and workflow deployment in real clinical settings.
- Geographic footprint includes Taiwan plus Thailand / Southeast Asia, which matches Prof. Wu's comment that this product may start in Taiwan and Southeast Asia before the US.

Planning implication: the collaboration should be framed around clinical workflow, device data, integration, safety, cybersecurity, and deployment constraints, not just "build an LLM" or "train a classifier."

## Deeper Bottlenecks To Understand

The next useful research layer is not more feature brainstorming. It is understanding where smart-healthcare deployments usually break.

### Workflow

- What exact clinical workflow is this supposed to change?
- Whose workload is being reduced: nurse, physician, EMT, registration desk, family caregiver, or patient?
- Where does the triage recommendation enter the existing workflow?
- Who can override it, and how is the override recorded?
- What happens when the patient cannot answer, answers inconsistently, or needs help from family?

### Data Quality

- What fields are missing, noisy, delayed, hand-entered, or inconsistently coded?
- Are EKG, SpO2, vital signs, questionnaire answers, and outcome labels time-synchronized?
- Are labels based on physician triage, ED admission, later diagnosis, abnormal EKG, or a business-defined target?
- What cleaning / normalization / ETL layer exists before any model work?

### Interoperability

- What existing hospital systems must the device talk to: HIS, EMR/EHR, PACS, LIS, registration, triage desk, or vendor cloud?
- Which standards matter for this product: HL7, FHIR, DICOM, CDA, proprietary API, CSV export, or manual PDF/report?
- Is the first version read-only, report-only, or does it write back to any clinical system?

### Cybersecurity

- What is the threat model for device, edge node, cloud platform, hospital network, and API integration?
- What patch / SBOM / vulnerability-disclosure expectations apply if this becomes a medical or hospital-connected device?
- What happens if the device is offline, compromised, or sending stale / corrupted signals?
- Are US FDA cybersecurity expectations relevant now, or only for later expansion?

### Traceability / Explainability

- Can every triage output show its input basis: question answers, signal summaries, thresholds, model outputs, and missing data?
- What evidence must be visible to a clinician before trusting or overriding the suggestion?
- What audit log is retained for later review, incident analysis, or regulatory questions?

### Platform / Operations

- Is this a one-product classifier, or part of 慧誠智醫's broader smart-hospital / remote-monitoring / IoMT platform?
- Who manages accounts, device fleet, model versions, rules, thresholds, hospital-specific configuration, and support?
- Is the long-term value an EKG classifier, or an orchestration layer that connects patient interaction, vital signs, triage criteria, and clinical handoff?

### Agent Role

- Is AI acting as a decision-maker, assistant, workflow coordinator, or documentation helper?
- If an LLM is used, is it for free-form conversation, structured intake repair, explanation generation, or staff-facing summary?
- Can v0 avoid LLM risk by using structured questionnaire + signal classifier + evidence-visible report?

### Trust / Business

- Who pays: hospital, clinic, government program, insurer, long-term-care operator, or device program?
- What purchasing evidence matters: labor saving, throughput, safety, reduced callbacks, reduced ED burden, or remote-care expansion?
- What support / accountability expectation would 慧誠智醫 carry after deployment?
- What clinical risk is acceptable for triage support, and what claims must be avoided?

## Industry Survival / Adoption Questions

The deeper industry question is not just whether the system can work technically. It is whether it can survive hospital adoption, maintenance, trust, and scaling pressure.

### Hospital Buying Reality

- Hospitals are not ordinary SaaS customers: decisions are slow, political, safety-sensitive, and procurement-heavy.
- Stakeholders may include physicians, nurses, information office, legal, procurement, hospital leadership, infection control, quality/safety, and external regulators.
- A technically good system can fail if stakeholder alignment breaks or if one department owns the pain while another pays the cost.

### ROI / Evidence

- What measurable result would justify adoption: fewer nurse minutes, shorter triage time, fewer errors, better throughput, lower readmission, reduced legal risk, reduced burnout, or remote-care expansion?
- What baseline exists today, and how would 慧誠 prove improvement after deployment?
- Does the buyer care more about model accuracy, operational throughput, staffing pressure, risk reduction, or strategic smart-hospital positioning?

### Human Factors

- Will this add one more screen, login, alert, or interruption to an already overloaded clinical workflow?
- What is the risk of alert fatigue, false positives, false reassurance, or staff ignoring the output?
- Where should the system interrupt, stay silent, summarize, or escalate?
- What level of UI / interaction evidence is needed before asking clinicians to trust the workflow?

### Long-Term Maintenance

- Who maintains models, rules, thresholds, device calibration, OS updates, security patches, hospital-specific workflow changes, and regulatory changes?
- What monitoring detects model drift, sensor drift, workflow drift, or label drift?
- How does the system roll back after a bad model/rule update?
- What uptime / support commitment would the hospital expect?

### Liability / Accountability

- If the system says low risk and the patient deteriorates, who is responsible: clinician, hospital, 慧誠智醫, model supplier, data supplier, or integration partner?
- Is the system legally and operationally framed as decision support, workflow support, documentation support, or autonomous triage?
- What claims must be avoided in sales, UI text, reports, and clinical handoff?

### Data Ownership / Privacy

- Who owns and can reuse the collected data: patient, hospital, 慧誠智醫, academic team, insurer, or government program?
- Can the data be used for model training, product improvement, publication, regulatory evidence, or only care delivery?
- Are privacy-preserving methods needed later: federated learning, synthetic data, differential privacy, secure pipeline, or hospital-local training?

### Infrastructure Strategy

- Is 慧誠's durable advantage the single triage function, or the infrastructure layer: data layer, workflow layer, interoperability layer, orchestration layer, audit layer, and security layer?
- Does this project plug into a broader smart-hospital operating layer, remote-care platform, or IoMT ecosystem?
- What future capability becomes reusable across products: device integration, triage logic, evidence trace, human approval, cybersecurity, or deployment playbook?

### AI Governance / Agentic AI

- If AI becomes a workflow actor, how are actions observed, controlled, approved, rolled back, and audited?
- What should AI replace first: paperwork, summarization, coordination, repeated checking, risk flagging, or actual clinical judgment?
- What human judgment must remain non-delegable?
- How much decision authority are clinicians, hospitals, patients, and regulators willing to give a machine?

## Research Reading Queue

Keep this as a question map, not a W20 research sprint:

- Medical interoperability: HL7, FHIR, DICOM, PACS, CDA, HIS / EMR integration.
- Medical AI pipeline: ETL, normalization, streaming signals, clinical decision support, human-in-the-loop review.
- Medical cybersecurity: FDA 524B, SBOM, hospital ransomware, connected medical-device security, vulnerability disclosure.
- Workflow / agent systems: orchestration, audit trail, escalation, exception handling, staff handoff.
- Healthcare business: hospital procurement, payer / reimbursement, implementation support, maintenance responsibility, why AI startups fail to enter hospitals.
- Human factors: alert fatigue, cognitive load, trust calibration, clinician override, workflow psychology.
- AI governance: liability, accountability, audit trail, evidence chain, human approval, rollback, policy drift.
- Infrastructure thinking: distributed systems, streaming systems, event-driven architecture, observability, reliability engineering.

## Role Split From The Discussion

- Company / clinical side owns hardware, device operation, data collection, clinical criteria, and case accrual.
- Engineering side may help with data processing, EKG normal/abnormal classification, ASR / interaction design feasibility, and software decision logic after criteria are known.
- 林駿亦 likely fits the signal-classification / EKG side.
- Jason likely fits the questionnaire / ASR / LLM / workflow / safety-boundary side.

## Current Constraints

- Main blocker: enough labeled cases. Prof. Wu estimated training is at least about half a year after case opening because case collection comes first.
- Protocol unknowns: EKG duration, SpO2 handling, vital-sign list, question set, clinical label, and triage criteria.
- Workflow unknowns: patient self-service, family help, nurse-led questioning, touch UI, ASR, or mixed workflow.
- LLM necessity is unresolved; do not assume LLM is required.
- Edge computing may be needed if EKG classification runs near the device.
- Initial market may be Taiwan and Southeast Asia; US path may be delayed by cybersecurity requirements.

## Safety / Regulatory Boundary

- Do not call this diagnostic until clinical and regulatory review says so.
- Do not promise autonomous emergency medical advice.
- Do not prototype with real patient data in planning.
- Treat EKG classification, triage support, ASR, LLM use, device integration, cybersecurity, consent, de-identification, and data retention as review gates.

## Next Questions

- What is the exact product / device name inside 慧誠智醫?
- Is the immediate product surface the Vital Sign Kiosk, a broader vital-sign station, or another device?
- What exactly did the Middle East customer request under the phrase `AI Triage`?
- Are the US and Malaysia cases the same workflow, separate deployments, or only sales opportunities?
- What is the expected first deliverable from 林駿亦 and Jason?
- What is 林家聖's expected role in the first discussion?
- What is the expected first deliverable after the `2026-05-12` company sync: English demo, API feasibility note, architecture sketch, or question list?
- What exact API / data format can the kiosk expose to the demo?
- Can the first demo use simulated vital signs, or must it read from a real kiosk?
- What architecture diagram is safe to share externally without exposing patent-sensitive or core-flow details?
- Does the company already have the 10 questions and clinical criteria?
- What EKG format, lead, sampling rate, and duration will be collected?
- What is the label source: physician triage, ED admission, abnormal EKG, later diagnosis, or another outcome?
- What data export can the academic team receive, and under what consent / IRB / de-identification constraints?
- Is ASR required for accessibility / labor saving, or is touch / nurse-assisted entry acceptable for v0?
- What is the target deployment context: hospital ED, clinic, ambulance, community station, or home?
- Does Prof. Wu want a one-page technical-question list before the first company sync?
- What is the one bottleneck 慧誠 actually needs help with first: workflow definition, collection protocol, data cleaning, signal model, interaction mode, cybersecurity, or clinical evidence?
- What business evidence would make a hospital keep paying for this after pilot: ROI, safety, throughput, staffing, legal-risk reduction, or strategic smart-hospital value?
- Who is the real internal buyer and who are the veto stakeholders?
- Who owns long-term maintenance, liability, data rights, model/rule updates, and incident response?
- Is the long-term play a point solution or reusable medical-AI infrastructure?

## W20 Capacity Decision

W20 is already committed to FSI:DI submission, Prof. Wu CDE medical-cybersecurity handoff, Pikachu demo capture, Threads source-arm decision, and KBS reviewer duty.

Allowed this week:

- capture source,
- create locator,
- write open-question list,
- frame the deeper unknowns without researching all of them,
- preserve industry-survival questions for the first real sync,
- wait for Prof. Wu / company to define the next meeting.
- if asked, prepare a one-page meeting question list only.

Not allowed this week:

- full product requirements document,
- EKG model research sprint,
- ASR / LLM prototype,
- regulatory classification memo,
- cybersecurity architecture,
- new repo unless Prof. Wu requests an immediate company deliverable.
- any customer-facing claim that the team can deliver AI triage before product scope, clinical criteria, data path, and regulatory responsibility are defined.

## Separate Follow-Up: EEG / LORETA

Prof. Wu briefly mentioned a separate EEG / LORETA commercialization issue. Keep that separate from this project. Current note: LORETA is low-resolution tomography from EEG signals, an inverse problem, and the original Matlab implementation cannot be used commercially as-is.
