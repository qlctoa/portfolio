"""
층간소음(inter-floor noise) 오디오 샘플에서 특징을 추출합니다.
- 분류용 특징: MFCC, 스펙트럴 특성, ZCR 등 (통계 요약)
- 데시벨(dB): RMS 기반 dBFS 계산 (실제 SPL 보정은 별도 캘리브레이션 필요)
"""
import glob
import os
import re
import numpy as np
import librosa
import pandas as pd

SR = 22050          # 분석용 샘플레이트 (다운샘플링해서 속도 확보)
N_MFCC = 13

# zip 파일명 -> 사람이 읽기 쉬운 라벨 매핑 (대분류_소분류_설명)
LABEL_MAP = {
    "VS_A.층간소음_1.중량충격음_a.어른발걸음소리": "heavy_adult_footstep",
    "VS_A.층간소음_1.중량충격음_b.아이들발걸음소리": "heavy_child_footstep",
    "VS_A.층간소음_1.중량충격음_c.망치질소리": "heavy_hammering",
    "VS_A.층간소음_2.경량충격음_a.가구끄는소리": "light_furniture_drag",
    "VS_A.층간소음_2.경량충격음_b.문여닫는소리": "light_door",
    "VS_A.층간소음_2.경량충격음_c.런닝머신에서뛰는소리": "light_treadmill",
    "VS_A.층간소음_2.경량충격음_d.골프퍼팅(골굴리는소리)": "light_golf_putting",
    "VS_A.층간소음_3.생활소음_a.화장실물내리는소리": "daily_toilet_flush",
    "VS_A.층간소음_3.생활소음_b.샤워할때물소리": "daily_shower",
    "VS_A.층간소음_3.생활소음_c.드럼세탁기소리": "daily_drum_washer",
    "VS_A.층간소음_3.생활소음_d.통돌이세탁기소리": "daily_top_washer",
    "VS_A.층간소음_3.생활소음_e.진공청소기소리": "daily_vacuum",
    "VS_A.층간소음_3.생활소음_f.식기세척기소리": "daily_dishwasher",
    "VS_A.층간소음_4.악기_a.바이올린연주소리": "instrument_violin",
    "VS_A.층간소음_4.악기_b.피아노연주소리": "instrument_piano",
    "VS_A.층간소음_5.애완동물_a.강아지짓는소리": "pet_dog_bark",
    "VS_A.층간소음_5.애완동물_b.고양이우는소리": "pet_cat_cry",
}


def rms_to_dbfs(rms, eps=1e-10):
    """RMS 진폭(0~1 정규화 기준) -> dBFS. 0 dBFS = 풀스케일."""
    return 20 * np.log10(np.maximum(rms, eps))


def extract_features(path):
    y, sr = librosa.load(path, sr=SR, mono=True)

    # --- 데시벨 관련 (RMS 기반 dBFS) ---
    rms = librosa.feature.rms(y=y)[0]
    dbfs = rms_to_dbfs(rms)
    dbfs_mean, dbfs_max, dbfs_std = float(np.mean(dbfs)), float(np.max(dbfs)), float(np.std(dbfs))

    # --- 분류용 특징 ---
    mfcc = librosa.feature.mfcc(y=y, sr=sr, n_mfcc=N_MFCC)
    centroid = librosa.feature.spectral_centroid(y=y, sr=sr)[0]
    bandwidth = librosa.feature.spectral_bandwidth(y=y, sr=sr)[0]
    rolloff = librosa.feature.spectral_rolloff(y=y, sr=sr)[0]
    zcr = librosa.feature.zero_crossing_rate(y)[0]
    contrast = librosa.feature.spectral_contrast(y=y, sr=sr)

    feat = {}
    for i in range(N_MFCC):
        feat[f"mfcc{i}_mean"] = float(np.mean(mfcc[i]))
        feat[f"mfcc{i}_std"] = float(np.std(mfcc[i]))
    for i in range(contrast.shape[0]):
        feat[f"contrast{i}_mean"] = float(np.mean(contrast[i]))

    feat.update({
        "centroid_mean": float(np.mean(centroid)),
        "centroid_std": float(np.std(centroid)),
        "bandwidth_mean": float(np.mean(bandwidth)),
        "rolloff_mean": float(np.mean(rolloff)),
        "zcr_mean": float(np.mean(zcr)),
        "rms_mean": float(np.mean(rms)),
        "rms_max": float(np.max(rms)),
        "dbfs_mean": dbfs_mean,
        "dbfs_max": dbfs_max,
        "dbfs_std": dbfs_std,
    })
    return feat


def main():
    rows = []
    folders = sorted(glob.glob("data_raw/*"))
    for folder in folders:
        base = os.path.basename(folder)
        label = LABEL_MAP.get(base)
        if label is None:
            print("WARN: no label mapping for", base)
            continue
        wavs = sorted(glob.glob(os.path.join(folder, "*.wav")))
        for w in wavs:
            try:
                feat = extract_features(w)
            except Exception as e:
                print("skip", w, e)
                continue
            feat["label"] = label
            feat["file"] = os.path.basename(w)
            rows.append(feat)
        print(f"{label}: {len(wavs)} files processed")

    df = pd.DataFrame(rows)
    df.to_csv("features.csv", index=False)
    print("\nSaved features.csv:", df.shape)
    print(df["label"].value_counts())


if __name__ == "__main__":
    main()
