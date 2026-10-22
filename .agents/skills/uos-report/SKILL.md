---
name: uos-report
description: Use when producing a formal report, summary or analysis document for Universität Osnabrück that must follow the institutional format. Produces DOCX and PDF.
---

# UOS Report Format

Produce reports that follow the university's house format. Always generate
**both** a `.docx` and a `.pdf` into `/mnt/data` (or `./reports/` / current working directory if `/mnt/data` is not available), then tell the user both are available for download.

## Structure

Every report has these sections, in order:

1. **Titel** — report title, the reporting period, and the current date
2. **Zusammenfassung** — at most 5 bullet points, the findings only
3. **Datengrundlage** — what data was used, how many records, known limitations
4. **Ergebnisse** — the analysis, one subsection per question, each with a chart
5. **Methodik** — how the numbers were produced, enough to reproduce them
6. **Anhang** — tables of the underlying figures

## Visual conventions

- Primary colour `#ad1034` (UOS crimson), darker variant `#8f2133`, neutral text `#3e3e3f`, light panel background `#f3f3f3`
- These are the university's actual corporate colours, taken from the uni-osnabrueck.de stylesheet. Do not substitute blue or any other palette.
- Headings in the primary colour; body text in the neutral
- Charts: no gridlines except a light horizontal `#E0E0E0`, no chart borders,
  no 3D effects, no pie charts with more than 5 slices
- Every figure gets a caption `Abb. N: <description>`
- Every table gets a caption `Tab. N: <description>`

## Rules

- German for all headings and captions; body text follows the user's language
- Never invent figures — every number must trace to the supplied data
- State the record count and any exclusions in **Datengrundlage**
- If data is missing for a section, say so explicitly rather than omitting it

## Implementation

Available in the sandbox: `python-docx`, `reportlab`, `matplotlib`, `pandas`,
`openpyxl`, `xlsxwriter`, `pillow`.
There is **no network access** — never fetch fonts or logos.

### Path Resolution Helper

```python
import os
from pathlib import Path

def get_output_dir():
    mnt = Path("/mnt/data")
    if mnt.exists() and os.access(str(mnt), os.W_OK):
        return mnt
    out = Path("./reports")
    out.mkdir(parents=True, exist_ok=True)
    return out
```

### DOCX Helper

Build the DOCX with this helper, adapting the content:

```python
from docx import Document
from docx.shared import Pt, RGBColor, Inches

PRIMARY = RGBColor(0xAD, 0x10, 0x34)
NEUTRAL = RGBColor(0x3E, 0x3E, 0x3F)

def heading(doc, text, size=16):
    p = doc.add_paragraph()
    run = p.add_run(text)
    run.font.size = Pt(size)
    run.font.bold = True
    run.font.color.rgb = PRIMARY
    return p

def body(doc, text):
    p = doc.add_paragraph()
    run = p.add_run(text)
    run.font.size = Pt(11)
    run.font.color.rgb = NEUTRAL
    return p

def figure(doc, png_path, caption):
    doc.add_picture(png_path, width=Inches(6))
    cap = doc.add_paragraph()
    run = cap.add_run(caption)
    run.font.size = Pt(9)
    run.font.italic = True
    run.font.color.rgb = NEUTRAL

doc = Document()
heading(doc, "Titel des Berichts", size=20)
# ... build the six sections in order ...
out_dir = get_output_dir()
doc.save(str(out_dir / "bericht.docx"))
```

### PDF Helper

For the PDF use `reportlab.platypus` with the same section order, the same
colours, and the same captions. Save to `bericht.pdf`.

### Chart Styling

Style charts to match before saving them as PNG:

```python
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt

fig, ax = plt.subplots(figsize=(8, 4.5))
# ... plot ...
ax.grid(axis="y", color="#E0E0E0", linewidth=0.8)
ax.set_axisbelow(True)
for side in ("top", "right", "left"):
    ax.spines[side].set_visible(False)
fig.tight_layout()
out_dir = get_output_dir()
fig.savefig(str(out_dir / "abb1.png"), dpi=150)
```

