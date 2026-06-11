from __future__ import annotations

from .models import NormalizedVital, ReviewFlag


def _value(vitals: dict[str, NormalizedVital], name: str) -> float | int | None:
    vital = vitals.get(name)
    return vital.value if vital else None


def evaluate_vitals(vitals: dict[str, NormalizedVital]) -> list[ReviewFlag]:
    flags: list[ReviewFlag] = []
    heart_rate = _value(vitals, "heart_rate_bpm")
    spo2 = _value(vitals, "spo2_percent")
    temperature = _value(vitals, "temperature_c")
    systolic = _value(vitals, "blood_pressure_systolic_mm_hg")
    respiratory_rate = _value(vitals, "respiratory_rate_per_min")

    if temperature is not None and temperature <= 35.0:
        flags.append(ReviewFlag("staff_notify_hypothermia"))
    elif temperature is not None and temperature >= 39.0:
        flags.append(ReviewFlag("staff_notify_high_fever"))
    elif temperature is not None and temperature >= 38.0:
        flags.append(ReviewFlag("measured_fever_context"))

    if spo2 is not None and spo2 <= 91:
        flags.append(ReviewFlag("staff_notify_low_spo2"))
    elif spo2 is not None and spo2 < 94:
        flags.append(ReviewFlag("low_spo2_review"))

    if heart_rate is not None and heart_rate <= 40:
        flags.append(ReviewFlag("staff_notify_severe_bradycardia"))
    elif heart_rate is not None and 41 <= heart_rate <= 50:
        flags.append(ReviewFlag("bradycardia_module"))
    elif heart_rate is not None and heart_rate >= 131:
        flags.append(ReviewFlag("staff_notify_severe_tachycardia"))
    elif heart_rate is not None and heart_rate > 120:
        flags.append(ReviewFlag("tachycardia_module"))

    if systolic is not None and systolic <= 90:
        flags.append(ReviewFlag("staff_notify_low_bp"))
    elif systolic is not None and systolic >= 220:
        flags.append(ReviewFlag("staff_notify_severe_hypertension"))
    elif systolic is not None and systolic >= 180:
        flags.append(ReviewFlag("hypertension_module"))

    if respiratory_rate is not None and respiratory_rate <= 8:
        flags.append(ReviewFlag("staff_notify_low_rr"))
    elif respiratory_rate is not None and 9 <= respiratory_rate <= 11:
        flags.append(ReviewFlag("respiratory_depression_module"))
    elif respiratory_rate is not None and respiratory_rate >= 25:
        flags.append(ReviewFlag("staff_notify_high_rr"))
    elif respiratory_rate is not None and 21 <= respiratory_rate <= 24:
        flags.append(ReviewFlag("respiratory_module"))

    return flags


def has_staff_notify_flag(flags: list[ReviewFlag]) -> bool:
    return any(flag.code.startswith("staff_notify_") for flag in flags)
