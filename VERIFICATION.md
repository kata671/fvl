# FAEM — Verification notes

**Project:** Fractal Vibration Lab  
**Focus:** Nodal domain scaling on Chladni plate images  
**Date:** August 2026  

---

## Goal

Check whether the number of domains between nodal lines on real Chladni plate photographs scales with driving frequency in line with classical theory (Chladni / Rayleigh: geometric complexity ~ √f, i.e. exponent ≈ 0.5).

---

## Method

1. Eight photographs of a real **square** metal plate at measured frequencies 155–6800 Hz  
   (source: [skullsinthestars.com](https://skullsinthestars.com/2013/05/02/physics-demonstrations-chladni-patterns/)).
2. Automatic plate border detection and crop.
3. Otsu thresholding (no manual threshold).
4. Morphological closing with scale **proportional to image width** (0.8%), so results stay consistent across different resolutions.
5. Connected-component count of background domains; discard regions smaller than 0.3% of plate area.
6. Ordinary least-squares regression: log(N_domains) vs log(frequency).

---

## Results

| Frequency (Hz) | Domain count |
|----------------|--------------|
| 155            | 3            |
| 467.5          | 8            |
| 1146           | 8            |
| 2250           | 13           |
| 2593           | 16           |
| 4930           | 16           |
| 6197           | 24           |
| 6800           | 28           |

**Fit:** N ∝ f^{0.521 ± 0.054}  
**R² = 0.94** · **n = 8**  
**Classical expectation (circular plates):** exponent **0.5**

Plot: `report_assets/chladni_law_test_plot.png`

---

## Limitations

- Sample size n = 8 is small by publication standards.
- Single plate, single image series — no independent replication yet.
- Classical theory is derived for **circular** plates; the tested plate is **square**. Agreement of the exponent is encouraging but not a full theoretical match for this geometry.
- Closing scale (0.8% of width) was fixed after calibration on one frame and applied uniformly; other choices remain possible.

---

## Reproducibility

Minimal pipeline:

1. Metal plate + function generator + speaker or contact driver.  
2. Fixed lighting and camera; dark background under the plate.  
3. One photo per frequency (PNG / lightly compressed).  
4. Optional: parallel audio or accelerometer recording.  
5. Crop → Otsu → resolution-scaled closing → domain count.  
6. log–log regression; report n, R², slope uncertainty and geometry.

Open tools on the site: interactive pattern generator (`faem_generator.html`) for synthetic exploration; this document for the experimental count procedure.

---

## Status

FAEM is a **research pipeline** (pattern → measures → comparison with theory), not a claim of a new universal law. The present result is a **preliminary recovery** of classical nodal scaling on a small real-image set.
