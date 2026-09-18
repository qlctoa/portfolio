"""
층간소음 분류 모델 학습 (POC)
- RandomForest 분류기 + StratifiedKFold 교차검증 (샘플이 클래스당 12개로 적어서
  단일 train/test split보다 신뢰도 높은 교차검증으로 성능을 확인)
- 최종적으로 전체 데이터로 재학습한 모델을 저장
"""
import numpy as np
import pandas as pd
import joblib
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import StratifiedKFold, cross_val_predict
from sklearn.metrics import classification_report, confusion_matrix, accuracy_score
from sklearn.preprocessing import LabelEncoder

df = pd.read_csv("features.csv")
feature_cols = [c for c in df.columns if c not in ("label", "file")]

X = df[feature_cols].values
y_raw = df["label"].values

le = LabelEncoder()
y = le.fit_transform(y_raw)

clf = RandomForestClassifier(
    n_estimators=300,
    max_depth=None,
    random_state=42,
    class_weight="balanced",
)

# 클래스당 12개 샘플 -> 4-fold (fold당 클래스별 3개)
cv = StratifiedKFold(n_splits=4, shuffle=True, random_state=42)
y_pred = cross_val_predict(clf, X, y, cv=cv)

acc = accuracy_score(y, y_pred)
print(f"4-Fold CV Accuracy: {acc:.3f}\n")
print(classification_report(y, y_pred, target_names=le.classes_, digits=3, zero_division=0))

cm = confusion_matrix(y, y_pred)
cm_df = pd.DataFrame(cm, index=le.classes_, columns=le.classes_)
cm_df.to_csv("confusion_matrix.csv")

# feature importance (전체 데이터로 재학습한 모델 기준)
clf.fit(X, y)
importances = pd.Series(clf.feature_importances_, index=feature_cols).sort_values(ascending=False)
print("\nTop 10 important features:")
print(importances.head(10))

joblib.dump({"model": clf, "label_encoder": le, "feature_cols": feature_cols}, "noise_classifier.joblib")
print("\nSaved model -> noise_classifier.joblib")

with open("cv_report.txt", "w") as f:
    f.write(f"4-Fold CV Accuracy: {acc:.3f}\n\n")
    f.write(classification_report(y, y_pred, target_names=le.classes_, digits=3, zero_division=0))
    f.write("\n\nTop 15 important features:\n")
    f.write(importances.head(15).to_string())
