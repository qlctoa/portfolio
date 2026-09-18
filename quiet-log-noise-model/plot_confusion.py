import pandas as pd
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
import numpy as np

cm = pd.read_csv("confusion_matrix.csv", index_col=0)
labels = cm.columns.tolist()

fig, ax = plt.subplots(figsize=(11, 9))
im = ax.imshow(cm.values, cmap="Purples", vmin=0)

ax.set_xticks(range(len(labels)))
ax.set_yticks(range(len(labels)))
ax.set_xticklabels(labels, rotation=90, fontsize=8)
ax.set_yticklabels(labels, fontsize=8)
ax.set_xlabel("Predicted", fontsize=11, fontweight="bold")
ax.set_ylabel("Actual", fontsize=11, fontweight="bold")
ax.set_title("Floor-noise Classification — Confusion Matrix (4-Fold CV)", fontsize=13, fontweight="bold", pad=14)

# annotate counts, switching text color for readability on dark cells
vmax = cm.values.max()
for i in range(len(labels)):
    for j in range(len(labels)):
        v = cm.values[i, j]
        if v == 0:
            continue
        color = "white" if v > vmax * 0.55 else "#3b0764"
        ax.text(j, i, str(v), ha="center", va="center", fontsize=7, color=color)

cbar = fig.colorbar(im, ax=ax, fraction=0.04, pad=0.02)
cbar.set_label("count", fontsize=9)

plt.tight_layout()
plt.savefig("confusion_matrix.png", dpi=150)
print("saved confusion_matrix.png")
