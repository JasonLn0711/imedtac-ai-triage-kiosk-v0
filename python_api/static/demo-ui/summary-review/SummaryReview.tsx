import React, { Component, type ReactNode } from "react";
import {
  Activity,
  AlertTriangle,
  Check,
  ClipboardList,
  Heart,
  Info,
  Lock,
  ShieldCheck,
  Stethoscope,
  Thermometer,
  UserRound,
} from "lucide-react";

const FORCE_SCREENSHOT_FALLBACK = false;
const FALLBACK_IMAGE_SRC = "./assets/review-your-information-fallback.svg";

type SummaryReviewProps = {
  fallbackImageSrc?: string;
  forceFallback?: boolean;
  summaryPayload?: SummaryReviewPayload | null;
};

type SummaryReviewPayload = {
  status?: string;
  handoff_reason_codes?: string[];
  staff_review_summary?: {
    subjective?: string[];
    objective?: string[];
    review_basis?: string[];
    review_action?: string[];
  };
};

type MeasurementModel = {
  heartRate: string;
  oxygen: string;
  bloodPressure: string;
  temperature: string;
  heartRateStatus: string;
  heartRateTone: "orange" | "green";
};

type SymptomModel = {
  title: string;
  text: string;
  tone: "orange" | "green";
};

type ReviewModel = {
  primaryMessage: string;
  staffLine: string;
  urgencyLine: string;
  measurements: MeasurementModel;
  symptoms: SymptomModel[];
  confirmationTitle: string;
  confirmationBody: string;
};

const DEFAULT_REVIEW_MODEL: ReviewModel = {
  primaryMessage: "Your heart rate was higher than expected.",
  staffLine: "A staff member may review your symptoms and measurements.",
  urgencyLine: "If you feel worse, tell a staff member right away.",
  measurements: {
    heartRate: "130",
    oxygen: "98",
    bloodPressure: "102/68",
    temperature: "36.5",
    heartRateStatus: "High",
    heartRateTone: "orange",
  },
  symptoms: [
    {
      title: "Palpitations",
      text: "Feeling your heart racing or pounding",
      tone: "orange",
    },
    {
      title: "Chest tightness",
      text: "Pressure or tightness in the chest",
      tone: "orange",
    },
    {
      title: "No shortness of breath",
      text: "You reported no shortness of breath",
      tone: "green",
    },
    {
      title: "No dizziness",
      text: "You reported no dizziness",
      tone: "green",
    },
    {
      title: "No fainting",
      text: "You reported no fainting",
      tone: "green",
    },
  ],
  confirmationTitle: "Please confirm your information with staff.",
  confirmationBody: "This summary will help our care team understand your condition and decide the best next steps for you.",
};

type FallbackBoundaryProps = {
  fallback: ReactNode;
  children: ReactNode;
};

type FallbackBoundaryState = {
  hasError: boolean;
};

class FallbackBoundary extends Component<FallbackBoundaryProps, FallbackBoundaryState> {
  state: FallbackBoundaryState = { hasError: false };

  static getDerivedStateFromError(): FallbackBoundaryState {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) return this.props.fallback;
    return this.props.children;
  }
}

function FallbackImage({ src }: { src: string }) {
  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-[#F5F7FA]">
      <img
        src={src}
        alt="Review Your Information fallback screen"
        className="block h-auto w-full max-w-[1400px] object-contain"
        style={{ aspectRatio: "4 / 3" }}
      />
    </div>
  );
}

function NurseIllustration() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 188 176"
      className="absolute bottom-[-1px] right-[210px] h-[176px] w-[188px]"
    >
      <path d="M114 18c16 1 31 17 29 35-2 19-21 32-42 31-20-1-37-15-36-35 2-20 24-32 49-31Z" fill="#5B2C13" />
      <path d="M139 7c10 0 18 8 18 18s-8 18-18 18-18-8-18-18 8-18 18-18Z" fill="#633611" />
      <path d="M108 44c25 0 45 19 45 49 0 32-21 51-45 51S63 125 63 93c0-30 20-49 45-49Z" fill="#F6B27F" />
      <path d="M70 73c-8 0-13 8-11 18 2 9 9 15 17 13l-6-31Z" fill="#F6B27F" />
      <path d="M146 73c8 0 13 8 11 18-2 9-9 15-17 13l6-31Z" fill="#F6B27F" />
      <path d="M79 61c10-24 59-30 72 5-22-2-32-13-40-24-7 16-17 22-32 19Z" fill="#5B2C13" />
      <circle cx="91" cy="83" r="3" fill="#13223C" />
      <circle cx="124" cy="83" r="3" fill="#13223C" />
      <path d="M105 83c-3 10-4 18 5 18" fill="none" stroke="#B65D32" strokeWidth="3" strokeLinecap="round" />
      <path d="M94 112c9 7 22 6 30-1" fill="none" stroke="#A34F31" strokeWidth="3" strokeLinecap="round" />
      <path d="M45 176c4-45 24-70 63-70s59 25 63 70H45Z" fill="#80BDE8" />
      <path d="M83 116 108 154l25-38c-16-10-34-10-50 0Z" fill="#F6B27F" />
      <path d="M36 176c4-38 20-58 48-67l22 67H36Z" fill="#86C6F0" />
      <path d="M180 176c-4-38-20-58-48-67l-22 67h70Z" fill="#79B8E5" />
      <path d="M69 131c-5 16-8 31-8 45" fill="none" stroke="#2F7AAD" strokeWidth="3" strokeLinecap="round" />
      <path d="M148 131c5 16 8 31 8 45" fill="none" stroke="#2F7AAD" strokeWidth="3" strokeLinecap="round" />
      <rect x="120" y="135" width="42" height="28" rx="3" fill="#F7FBFF" />
      <path d="M136 135v-7h10v7" fill="none" stroke="#367CB5" strokeWidth="3" strokeLinecap="round" />
      <circle cx="141" cy="147" r="3" fill="#367CB5" />
      <path d="M130 156h24" stroke="#9BC7E4" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}

function StaffIllustration() {
  return (
    <svg aria-hidden="true" viewBox="0 0 132 132" className="h-[132px] w-[132px]">
      <circle cx="66" cy="66" r="66" fill="#DDECF8" />
      <path d="M30 127c2-27 13-42 34-48 15 9 24 26 28 48H30Z" fill="#8FB9D6" />
      <path d="M20 127c2-26 13-42 34-48l20 48H20Z" fill="#9EC2DA" />
      <circle cx="53" cy="50" r="22" fill="#F3BE95" />
      <path d="M32 45c5-19 28-27 42-10-16 0-26 7-36 18l-6-8Z" fill="#B9BEC4" />
      <path d="M69 53c6 0 10 6 8 12-2 6-7 9-13 7l5-19Z" fill="#F3BE95" />
      <circle cx="59" cy="52" r="2.5" fill="#14213D" />
      <path d="M52 67c6 4 12 4 18 0" fill="none" stroke="#8D4C35" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M83 127c3-30 18-49 41-55 10 16 12 34 9 55H83Z" fill="#5EA4E3" />
      <path d="M79 127c2-28 14-47 37-55l11 55H79Z" fill="#7DBAE7" />
      <circle cx="107" cy="44" r="23" fill="#FFD0AE" />
      <path d="M85 38c6-18 27-28 45-10 5 6 8 14 6 24-14-17-35-20-51-14Z" fill="#193C63" />
      <circle cx="100" cy="47" r="2.5" fill="#14213D" />
      <path d="M94 62c6 5 14 5 21 0" fill="none" stroke="#A45036" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M61 99c14 10 30 9 45-2" fill="none" stroke="#576579" strokeWidth="3" strokeLinecap="round" />
      <path d="M54 92c-1 14 1 25 5 35" fill="none" stroke="#52657D" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}

function HeartLogo() {
  return (
    <svg aria-hidden="true" viewBox="0 0 72 72" className="h-[68px] w-[68px]">
      <defs>
        <linearGradient id="heartLogoGradient" x1="10" x2="62" y1="6" y2="67" gradientUnits="userSpaceOnUse">
          <stop stopColor="#0B687A" />
          <stop offset="1" stopColor="#2A889A" />
        </linearGradient>
      </defs>
      <path
        d="M36 65C19 52 7 41 7 25 7 13 15 6 26 6c6 0 10 3 14 8 4-5 8-8 14-8 11 0 18 7 18 19 0 16-19 31-36 40Z"
        fill="url(#heartLogoGradient)"
      />
      <path
        d="M7 37h19l7-16 9 31 8-21 6 6h10"
        fill="none"
        stroke="#FFFFFF"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="5"
      />
    </svg>
  );
}

function WarningHeart() {
  return (
    <div className="relative flex h-[128px] w-[128px] items-center justify-center rounded-full bg-[#FBE4C8]">
      <div className="flex h-[76px] w-[76px] items-center justify-center rounded-[25px] bg-gradient-to-br from-[#E25B15] to-[#F39439]">
        <Heart className="h-[54px] w-[54px] fill-white/25 text-white" strokeWidth={2.7} />
      </div>
      <div className="absolute bottom-[28px] right-[24px] flex h-9 w-9 items-center justify-center rounded-full border-[4px] border-[#FBE4C8] bg-[#E87523]">
        <AlertTriangle className="h-5 w-5 text-white" strokeWidth={2.5} />
      </div>
    </div>
  );
}

function SpeechBubble() {
  return (
    <div className="absolute right-[64px] top-[36px] h-[120px] w-[150px] rounded-[18px] bg-[#FFF0DC] px-6 py-5">
      <div className="absolute left-[-20px] top-[55px] h-0 w-0 border-y-[17px] border-r-[22px] border-y-transparent border-r-[#FFF0DC]" />
      <p className="text-[18px] font-semibold leading-[28px] text-[#0E1729]">
        We&apos;re here
        <br />
        to help.
      </p>
      <Heart className="mt-4 h-8 w-8 fill-[#4AA4DF] text-[#4AA4DF]" strokeWidth={2.2} />
    </div>
  );
}

function flattenSummaryText(payload?: SummaryReviewPayload | null) {
  const summary = payload?.staff_review_summary;
  return [
    ...(summary?.subjective || []),
    ...(summary?.objective || []),
    ...(summary?.review_basis || []),
    ...(summary?.review_action || []),
    ...(payload?.handoff_reason_codes || []),
  ].join(" ");
}

function matchFirst(text: string, pattern: RegExp, fallback: string) {
  const match = text.match(pattern);
  return match?.[1] || fallback;
}

function buildReviewModel(payload?: SummaryReviewPayload | null): ReviewModel {
  if (!payload || payload.status !== "summary") return DEFAULT_REVIEW_MODEL;

  const text = flattenSummaryText(payload);
  const lower = text.toLowerCase();
  const heartRate = matchFirst(text, /\bHR\s+(\d{2,3})\s*bpm/i, DEFAULT_REVIEW_MODEL.measurements.heartRate);
  const oxygen = matchFirst(text, /\bSpO2\s+(\d{2,3})\s*%/i, DEFAULT_REVIEW_MODEL.measurements.oxygen);
  const bloodPressure = matchFirst(text, /\bBP\s+(\d{2,3}\/\d{2,3})\s*mmHg/i, DEFAULT_REVIEW_MODEL.measurements.bloodPressure);
  const temperature = matchFirst(text, /temperature\s+(\d{2}(?:\.\d)?)\s*C/i, DEFAULT_REVIEW_MODEL.measurements.temperature);
  const heartRateNumber = Number(heartRate);
  const heartRateHigh = Number.isFinite(heartRateNumber) && heartRateNumber > 100;

  const symptoms: SymptomModel[] = [
    lower.includes("palpitation") || lower.includes("heart-racing") || lower.includes("heart racing")
      ? {
          title: "Palpitations",
          text: "Feeling your heart racing or pounding",
          tone: "orange",
        }
      : {
          title: "No palpitations",
          text: "You reported no palpitations",
          tone: "green",
        },
    lower.includes("chest tightness") || lower.includes("chest-tightness") || lower.includes("chest pressure")
      ? {
          title: "Chest tightness",
          text: "Pressure or tightness in the chest",
          tone: "orange",
        }
      : {
          title: "No chest tightness",
          text: "You reported no chest tightness",
          tone: "green",
        },
    lower.includes("shortness of breath") && !lower.includes("none of the listed shortness of breath")
      ? {
          title: "Shortness of breath",
          text: "You reported shortness of breath",
          tone: "orange",
        }
      : {
          title: "No shortness of breath",
          text: "You reported no shortness of breath",
          tone: "green",
        },
    lower.includes("dizziness") && !lower.includes("none of the listed") && !lower.includes("no dizziness")
      ? {
          title: "Dizziness",
          text: "You reported dizziness",
          tone: "orange",
        }
      : {
          title: "No dizziness",
          text: "You reported no dizziness",
          tone: "green",
        },
    lower.includes("fainting") && !lower.includes("none of the listed") && !lower.includes("no fainting")
      ? {
          title: "Fainting",
          text: "You reported fainting",
          tone: "orange",
        }
      : {
          title: "No fainting",
          text: "You reported no fainting",
          tone: "green",
        },
  ];

  return {
    ...DEFAULT_REVIEW_MODEL,
    primaryMessage: heartRateHigh
      ? "Your heart rate was higher than expected."
      : "Please review your information with staff.",
    measurements: {
      heartRate,
      oxygen,
      bloodPressure,
      temperature,
      heartRateStatus: heartRateHigh ? "High" : "Review",
      heartRateTone: heartRateHigh ? "orange" : "green",
    },
    symptoms,
  };
}

function MeasurementCards({ measurements }: { measurements: MeasurementModel }) {
  return (
    <div className="absolute left-10 top-[404px] grid w-[1320px] grid-cols-4 gap-5">
      <article className={`h-[216px] rounded-3xl border p-8 shadow-[0_16px_42px_rgba(16,42,94,0.045)] ${
        measurements.heartRateTone === "orange" ? "border-[#F06D19] bg-[#FFF8EC]" : "border-[#96CFC2] bg-[#F5FCFA]"
      }`}>
        <div className="flex items-start justify-between">
          <h3 className={`text-[21px] font-bold leading-7 ${measurements.heartRateTone === "orange" ? "text-[#B83E10]" : "text-[#147A61]"}`}>Heart Rate</h3>
          <span className={`rounded-lg px-3 py-1 text-[15px] font-bold leading-6 ${
            measurements.heartRateTone === "orange" ? "bg-[#FCE0C8] text-[#B83E10]" : "bg-[#DDF4EC] text-[#147A61]"
          }`}>
            {measurements.heartRateStatus}
          </span>
        </div>
        <div className="mt-6 flex items-center gap-6">
          <Heart className={`h-10 w-10 ${measurements.heartRateTone === "orange" ? "text-[#D65B16]" : "text-[#178A69]"}`} strokeWidth={2.5} />
          <div className="flex items-end gap-2">
            <span className={`text-[74px] font-[820] leading-[0.88] ${measurements.heartRateTone === "orange" ? "text-[#C74F12]" : "text-[#178A69]"}`}>{measurements.heartRate}</span>
            <span className={`pb-2 text-[23px] font-extrabold leading-8 ${measurements.heartRateTone === "orange" ? "text-[#C74F12]" : "text-[#178A69]"}`}>bpm</span>
          </div>
        </div>
        <p className="mt-7 text-[15px] font-medium leading-6 text-[#5E6A7E]">Normal range: 60-100 bpm</p>
      </article>

      <article className="h-[216px] rounded-3xl border border-[#A8C6ED] bg-[#F7FBFF] p-8 shadow-[0_16px_42px_rgba(16,42,94,0.04)]">
        <h3 className="text-[21px] font-bold leading-7 text-[#1454B8]">
          Oxygen (SpO<sub className="text-[13px] leading-none">2</sub>)
        </h3>
        <div className="mt-7 flex items-center gap-6">
          <div className="relative flex h-14 w-12 items-center justify-center">
            <div className="absolute h-12 w-10 rotate-45 rounded-[15px] border-[3px] border-[#185AC4]" />
            <span className="relative text-[16px] font-extrabold leading-none text-[#185AC4]">
              O<sub className="text-[10px]">2</sub>
            </span>
          </div>
          <div className="flex items-end gap-2">
            <span className="text-[74px] font-[820] leading-[0.88] text-[#2962D9]">{measurements.oxygen}</span>
            <span className="pb-2 text-[26px] font-extrabold leading-8 text-[#2962D9]">%</span>
          </div>
        </div>
        <p className="mt-8 text-[15px] font-medium leading-6 text-[#5E6A7E]">Normal range: 95-100%</p>
      </article>

      <article className="h-[216px] rounded-3xl border border-[#96CFC2] bg-[#F5FCFA] p-8 shadow-[0_16px_42px_rgba(16,42,94,0.04)]">
        <h3 className="text-[21px] font-bold leading-7 text-[#147A61]">Blood Pressure</h3>
        <div className="mt-7 flex items-center gap-6">
          <Stethoscope className="h-12 w-12 text-[#178A69]" strokeWidth={2.4} />
          <span className="text-[46px] font-[820] leading-none text-[#178A69]">{measurements.bloodPressure}</span>
        </div>
        <p className="mt-1 pl-[108px] text-[18px] font-bold leading-7 text-[#178A69]">mmHg</p>
        <p className="mt-6 text-[15px] font-medium leading-6 text-[#5E6A7E]">Normal range: &lt; 120/80 mmHg</p>
      </article>

      <article className="h-[216px] rounded-3xl border border-[#BFB1E8] bg-[#FAF8FF] p-8 shadow-[0_16px_42px_rgba(16,42,94,0.04)]">
        <h3 className="text-[21px] font-bold leading-7 text-[#6650B7]">Temperature</h3>
        <div className="mt-7 flex items-center gap-6">
          <Thermometer className="h-12 w-12 text-[#6650B7]" strokeWidth={2.6} />
          <div className="flex items-end gap-2">
            <span className="text-[74px] font-[820] leading-[0.88] text-[#6650B7]">{measurements.temperature}</span>
            <span className="pb-2 text-[26px] font-extrabold leading-8 text-[#6650B7]">°C</span>
          </div>
        </div>
        <p className="mt-8 text-[15px] font-medium leading-6 text-[#5E6A7E]">Normal range: 36.0-37.5 °C</p>
      </article>
    </div>
  );
}

function SymptomsSection({ symptoms }: { symptoms: SymptomModel[] }) {
  return (
    <section className="absolute left-10 top-[644px] h-[192px] w-[1320px] rounded-3xl border border-[rgba(0,0,0,0.08)] bg-white/80 p-5 shadow-[0_16px_42px_rgba(16,42,94,0.045)]">
      <div className="mb-4 flex items-center gap-5">
        <ClipboardList className="h-8 w-8 text-[#1C7A8E]" strokeWidth={2.4} />
        <h2 className="text-[17px] font-[850] leading-7 tracking-[0.02em] text-[#101935]">
          YOUR REPORTED SYMPTOMS
        </h2>
      </div>

      <div className="grid grid-cols-5 gap-5">
        {symptoms.map((symptom) => {
          const isOrange = symptom.tone === "orange";
          return (
            <article
              key={symptom.title}
              className={`h-[124px] rounded-2xl px-5 py-5 ${isOrange ? "bg-[#FFF5E8]" : "bg-[#F2FAF8]"}`}
            >
              <div className="flex gap-4">
                <span
                  className={`mt-[2px] flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
                    isOrange ? "bg-[#D95C15]" : "bg-[#178A69]"
                  }`}
                >
                  <Check className="h-5 w-5 text-white" strokeWidth={3} />
                </span>
                <div>
                  <h3
                    className={`text-[16px] font-bold leading-[23px] ${
                      isOrange ? "text-[#B73D0F]" : "text-[#0E6255]"
                    }`}
                  >
                    {symptom.title}
                  </h3>
                  <p className="mt-2 text-[14px] font-medium leading-[22px] text-[#30384B]">{symptom.text}</p>
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}

function MobileMeasurementCards({ measurements }: { measurements: MeasurementModel }) {
  const heartRateClass = measurements.heartRateTone === "orange" ? "is-warning" : "is-ok";
  return (
    <section className="mobile-panel" aria-labelledby="mobile-measurements-title">
      <div className="mobile-section-title">
        <Activity aria-hidden="true" />
        <h2 id="mobile-measurements-title">Your measurements</h2>
      </div>
      <div className="mobile-measurement-grid">
        <article className={`mobile-measure-card ${heartRateClass}`}>
          <div className="mobile-card-label">
            <span>Heart Rate</span>
            <strong>{measurements.heartRateStatus}</strong>
          </div>
          <div className="mobile-value-row">
            <Heart aria-hidden="true" />
            <span className="mobile-value">{measurements.heartRate}</span>
            <span className="mobile-unit">bpm</span>
          </div>
          <p>Normal range: 60-100 bpm</p>
        </article>

        <article className="mobile-measure-card is-blue">
          <div className="mobile-card-label">
            <span>Oxygen</span>
            <strong>SpO2</strong>
          </div>
          <div className="mobile-value-row">
            <Activity aria-hidden="true" />
            <span className="mobile-value">{measurements.oxygen}</span>
            <span className="mobile-unit">%</span>
          </div>
          <p>Normal range: 95-100%</p>
        </article>

        <article className="mobile-measure-card is-ok">
          <div className="mobile-card-label">
            <span>Blood Pressure</span>
          </div>
          <div className="mobile-value-row">
            <Stethoscope aria-hidden="true" />
            <span className="mobile-value mobile-value-sm">{measurements.bloodPressure}</span>
            <span className="mobile-unit">mmHg</span>
          </div>
          <p>Normal range: &lt; 120/80 mmHg</p>
        </article>

        <article className="mobile-measure-card is-purple">
          <div className="mobile-card-label">
            <span>Temperature</span>
          </div>
          <div className="mobile-value-row">
            <Thermometer aria-hidden="true" />
            <span className="mobile-value">{measurements.temperature}</span>
            <span className="mobile-unit">°C</span>
          </div>
          <p>Normal range: 36.0-37.5 °C</p>
        </article>
      </div>
    </section>
  );
}

function MobileSymptomsSection({ symptoms }: { symptoms: SymptomModel[] }) {
  return (
    <section className="mobile-panel" aria-labelledby="mobile-symptoms-title">
      <div className="mobile-section-title">
        <ClipboardList aria-hidden="true" />
        <h2 id="mobile-symptoms-title">Your reported symptoms</h2>
      </div>
      <div className="mobile-symptom-list">
        {symptoms.map((symptom) => (
          <article key={symptom.title} className={`mobile-symptom-card ${symptom.tone === "orange" ? "is-warning" : "is-ok"}`}>
            <span className="mobile-check">
              <Check aria-hidden="true" />
            </span>
            <div>
              <h3>{symptom.title}</h3>
              <p>{symptom.text}</p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

function MobileReviewCanvas({ model }: { model: ReviewModel }) {
  return (
    <section className="summary-review-mobile" aria-label="Review Your Information">
      <header className="mobile-header">
        <div className="mobile-brand-row">
          <HeartLogo />
          <div>
            <h1>Review Your Information</h1>
            <p>Please review your symptoms and measurements.</p>
          </div>
        </div>
        <div className="mobile-secure-note">
          <ShieldCheck aria-hidden="true" />
          <span>Your information is secure</span>
        </div>
      </header>

      <section className="mobile-alert-card">
        <WarningHeart />
        <div>
          <h2>{model.primaryMessage}</h2>
          <p>{model.staffLine}</p>
          <p>{model.urgencyLine}</p>
        </div>
      </section>

      <MobileMeasurementCards measurements={model.measurements} />
      <MobileSymptomsSection symptoms={model.symptoms} />

      <section className="mobile-confirm-card">
        <StaffIllustration />
        <div className="mobile-confirm-copy">
          <h2>{model.confirmationTitle}</h2>
          <p>{model.confirmationBody}</p>
        </div>
        <button type="button" aria-label="I will speak with staff">
          <UserRound aria-hidden="true" />
          <span>I will speak with staff</span>
        </button>
        <p className="mobile-assist-note">Tell staff if anything is incorrect or if you feel worse.</p>
      </section>

      <footer className="mobile-safety-note">
        <Lock aria-hidden="true" />
        <p>
          This is not a diagnosis. If you feel severe chest pain, trouble breathing, or feel like you may faint, tell a staff
          member immediately.
        </p>
      </footer>
    </section>
  );
}

function ReviewCanvas({ model }: { model: ReviewModel }) {
  return (
    <main
      className="summary-review-shell bg-[#F5F7FA] text-[#101935]"
      style={{ fontFamily: "Inter, system-ui, -apple-system, BlinkMacSystemFont, sans-serif" }}
    >
      <div className="summary-review-desktop">
      <section className="relative h-[1050px] w-[1400px] overflow-hidden bg-[#F5F7FA]" aria-label="Review Your Information">
        <header>
          <div className="absolute left-10 top-9">
            <HeartLogo />
          </div>
          <div className="absolute left-[142px] top-[30px]">
            <h1 className="m-0 text-[46px] font-[850] leading-[1.04] tracking-[0] text-[#102A5E]">
              Review Your Information
            </h1>
            <p className="mt-3 text-[22px] font-medium leading-8 text-[#3E4A64]">
              Please review your symptoms and measurements.
            </p>
          </div>
          <div className="absolute right-[78px] top-[34px] flex w-[260px] items-start gap-4">
            <ShieldCheck className="mt-1 h-7 w-7 shrink-0 text-[#1E4FAB]" strokeWidth={2.4} />
            <div>
              <p className="m-0 text-[14px] font-bold leading-6 text-[#0D1633]">Your information is secure</p>
              <p className="mt-1 text-[14px] font-medium leading-[22px] text-[#38445E]">
                This summary will be shared with our care team.
              </p>
            </div>
          </div>
        </header>

        <section className="absolute left-10 top-[148px] h-[184px] w-[1320px] overflow-hidden rounded-3xl border border-[#F1B382] bg-[#FFF9F1] shadow-[0_18px_48px_rgba(16,42,94,0.045)]">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_6%_15%,rgba(255,255,255,0.92),transparent_36%),linear-gradient(90deg,rgba(255,247,236,0.98),rgba(255,251,246,0.86))]" />
          <div className="absolute left-8 top-7">
            <WarningHeart />
          </div>
          <div className="absolute left-[196px] top-[37px] w-[760px]">
            <h2 className="m-0 text-[27px] font-[800] leading-9 text-[#B43B11]">
              {model.primaryMessage}
            </h2>
            <p className="mt-4 text-[21px] font-medium leading-8 text-[#121C36]">
              {model.staffLine}
            </p>
            <p className="mt-2 text-[21px] font-medium leading-8 text-[#121C36]">
              {model.urgencyLine}
            </p>
          </div>
          <NurseIllustration />
          <SpeechBubble />
        </section>

        <div className="absolute left-10 top-[363px] flex items-center gap-4">
          <Activity className="h-9 w-9 text-[#137284]" strokeWidth={3} />
          <h2 className="m-0 text-[17px] font-[850] leading-7 tracking-[0.02em] text-[#101935]">YOUR MEASUREMENTS</h2>
        </div>
        <MeasurementCards measurements={model.measurements} />

        <SymptomsSection symptoms={model.symptoms} />

        <section className="absolute left-10 top-[858px] flex h-[162px] w-[1320px] items-center rounded-3xl border border-[#BAD5F4] bg-[#F7FBFF] px-10 shadow-[0_16px_42px_rgba(16,42,94,0.045)]">
          <div className="mr-12 shrink-0">
            <StaffIllustration />
          </div>
          <div className="w-[585px]">
            <h2 className="m-0 text-[22px] font-[820] leading-8 text-[#101935]">
              {model.confirmationTitle}
            </h2>
            <p className="mt-3 text-[17px] font-medium leading-[29px] text-[#34405C]">
              {model.confirmationBody}
            </p>
          </div>
          <div className="mx-14 h-[116px] w-px bg-[#BCD0E8]" />
          <div className="flex flex-1 flex-col items-center">
            <button
              type="button"
              className="flex h-[58px] w-[380px] items-center justify-center gap-4 rounded-xl bg-[#1763D1] text-[21px] font-[800] leading-7 text-white shadow-[0_12px_24px_rgba(23,99,209,0.22)] focus:outline-none focus:ring-4 focus:ring-[#95BDF4]"
              aria-label="I will speak with staff"
            >
              <UserRound className="h-8 w-8" strokeWidth={2.3} />
              I will speak with staff
            </button>
            <div className="mt-4 flex w-[330px] items-start gap-3 text-[#1055BF]">
              <Info className="mt-1 h-5 w-5 shrink-0" strokeWidth={2.6} />
              <p className="m-0 text-[15px] font-medium leading-[22px]">
                Tell staff if anything is incorrect
                <br />
                or if you feel worse.
              </p>
            </div>
          </div>
        </section>

        <footer className="absolute bottom-3 left-10 flex h-11 w-[1320px] items-center rounded-2xl bg-[#EAF0F8] px-7 text-[#4B5870]">
          <Lock className="mr-5 h-5 w-5 shrink-0 text-[#20375F]" strokeWidth={2.6} />
          <p className="m-0 text-[12px] font-medium leading-5">
            This is not a diagnosis. If you feel severe chest pain, trouble breathing, or feel like you may faint, tell a staff
            member immediately.
          </p>
        </footer>
      </section>
      </div>
      <MobileReviewCanvas model={model} />
    </main>
  );
}

export default function SummaryReview({
  fallbackImageSrc = FALLBACK_IMAGE_SRC,
  forceFallback = FORCE_SCREENSHOT_FALLBACK,
  summaryPayload = null,
}: SummaryReviewProps) {
  const fallback = <FallbackImage src={fallbackImageSrc} />;
  const model = buildReviewModel(summaryPayload);

  if (forceFallback) return fallback;

  return (
    <FallbackBoundary fallback={fallback}>
      <ReviewCanvas model={model} />
    </FallbackBoundary>
  );
}
