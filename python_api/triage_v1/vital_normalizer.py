from __future__ import annotations

from typing import Any

from .models import NormalizedVital


FIELD_UNITS = {
    "temperature_c": "C",
    "spo2_percent": "%",
    "heart_rate_bpm": "bpm",
    "blood_pressure_systolic_mm_hg": "mmHg",
    "blood_pressure_diastolic_mm_hg": "mmHg",
    "glucose_mg_dl": "mg/dL",
    "weight_kg": "kg",
    "height_cm": "cm",
    "respiratory_rate_per_min": "/min",
}

IMVS_MAP = {
    "heart_rate_bpm": ("HR", "BP_Value"),
    "blood_pressure_systolic_mm_hg": ("NBP", "SYS_Value"),
    "blood_pressure_diastolic_mm_hg": ("NBP", "DIA_Value"),
    "spo2_percent": ("SPO2", "Value"),
    "temperature_c": ("Temp", "Value"),
    "glucose_mg_dl": ("Glucose", "Value"),
    "weight_kg": ("Weight", "Value"),
    "height_cm": ("Height", "Value"),
}


def parse_number(value: Any) -> float | int | None:
    if value is None or value == "":
        return None
    if isinstance(value, bool):
        return None
    if isinstance(value, int | float):
        return value
    if isinstance(value, str):
        try:
            parsed = float(value.strip())
        except ValueError:
            return None
        return int(parsed) if parsed.is_integer() else parsed
    return None


def _normalized_object(name: str, raw: Any) -> NormalizedVital:
    unit = FIELD_UNITS[name]
    if isinstance(raw, dict):
        value = parse_number(raw.get("value"))
        return NormalizedVital(
            name=name,
            value=value,
            unit=str(raw.get("unit") or unit),
            measurement_status=str(raw.get("measurement_status") or ("measured" if value is not None else "missing")),
            quality_flag=str(raw.get("quality_flag") or "unknown"),
            missing_reason=raw.get("missing_reason"),
        )

    value = parse_number(raw)
    return NormalizedVital(
        name=name,
        value=value,
        unit=unit,
        measurement_status="measured" if value is not None else "missing",
        quality_flag="unknown",
        missing_reason=None if value is not None else "not_provided",
    )


def _imvs_object(name: str, raw_vitals: dict[str, Any]) -> NormalizedVital:
    object_name, value_key = IMVS_MAP[name]
    source = raw_vitals.get(object_name)
    unit = FIELD_UNITS[name]
    if not isinstance(source, dict):
        return NormalizedVital(name, None, unit, "missing", "unknown", "not_provided")

    value = parse_number(source.get(value_key))
    return NormalizedVital(
        name=name,
        value=value,
        unit=str(source.get("Unit") or source.get("unit") or unit),
        measurement_status="measured" if value is not None else "missing",
        quality_flag=str(source.get("quality_flag") or source.get("QualityFlag") or "unknown"),
        missing_reason=None if value is not None else str(source.get("missing_reason") or "not_provided"),
    )


def normalize_vitals(raw_vitals: dict[str, Any] | None) -> dict[str, NormalizedVital]:
    raw_vitals = raw_vitals or {}
    normalized: dict[str, NormalizedVital] = {}
    for name in FIELD_UNITS:
        if name in raw_vitals:
            normalized[name] = _normalized_object(name, raw_vitals[name])
        elif name in IMVS_MAP:
            normalized[name] = _imvs_object(name, raw_vitals)
        else:
            normalized[name] = NormalizedVital(name, None, FIELD_UNITS[name], "missing", "unknown", "not_provided")
    return normalized
