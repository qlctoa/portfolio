"""
quiet_log 연동용 소음 분류 API (FastAPI)
----------------------------------------
Expo 앱에서 녹음한 오디오(wav)를 업로드하면
1) RMS 기반 dBFS(데시벨) 값
2) 소음 종류 분류 결과(top-3, 확률 포함)
를 반환합니다.

실행:
    pip install fastapi uvicorn python-multipart librosa soundfile scikit-learn joblib numpy pandas
    uvicorn api:app --host 0.0.0.0 --port 8000

quiet_log(Expo) 쪽에서는 녹음 파일을 FormData로 이 엔드포인트에 POST하면 됩니다.
현재 데모 데이터를 쓰는 부분을, 이 API 응답으로 교체하는 방식으로 연동합니다.
"""
import io
import tempfile

import joblib
import numpy as np
from fastapi import FastAPI, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware

from extract_features import extract_features, LABEL_MAP

MODEL_PATH = "noise_classifier.joblib"

app = FastAPI(title="quiet_log noise classifier")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

_bundle = joblib.load(MODEL_PATH)
_model = _bundle["model"]
_label_encoder = _bundle["label_encoder"]
_feature_cols = _bundle["feature_cols"]

# 사람이 읽는 한글 라벨로 다시 매핑 (label -> 한글 표시명)
DISPLAY_NAME = {v: k.split(".")[-1] for k, v in LABEL_MAP.items()}


@app.get("/health")
def health():
    return {"status": "ok", "classes": list(_label_encoder.classes_)}


@app.post("/classify")
async def classify(file: UploadFile = File(...)):
    raw = await file.read()

    with tempfile.NamedTemporaryFile(suffix=".wav") as tmp:
        tmp.write(raw)
        tmp.flush()
        feat = extract_features(tmp.name)

    x = np.array([[feat[c] for c in _feature_cols]])
    proba = _model.predict_proba(x)[0]
    order = np.argsort(proba)[::-1][:3]

    top3 = [
        {
            "label": _label_encoder.classes_[i],
            "label_ko": DISPLAY_NAME.get(_label_encoder.classes_[i], _label_encoder.classes_[i]),
            "confidence": round(float(proba[i]), 4),
        }
        for i in order
    ]

    return {
        "decibel": {
            "dbfs_mean": round(feat["dbfs_mean"], 2),
            "dbfs_max": round(feat["dbfs_max"], 2),
            "note": "dBFS(풀스케일 대비 상대값)입니다. 실제 SPL(dB(A))로 쓰려면 "
                    "레퍼런스 소음계로 보정 상수를 구해 오프셋을 더해야 합니다.",
        },
        "classification": {
            "top1": top3[0],
            "top3": top3,
        },
    }
