# Fractal Vibration Lab — FAEM

**https://fractalvibrationlab.com**

Fractal Acoustic–Energy Mapping: open pipeline for mapping the complexity of vibration
patterns — nodal domain scaling on Chladni plates, an interactive pattern generator, and a
lab calculator for designing experiments before touching a function generator.

## Highlight

On 8 real square-plate photos (155–6800 Hz):

**N_domains ∝ f^{0.521 ± 0.054}** · R² = 0.94

Classical Chladni / Rayleigh expectation: **0.5**

## What's new in the generator

- **Square + circle** geometry
- **Web Audio** tone playback tied to mode set
- **High-quality PNG export** with caption (parameters + Df + domains)
- **Image upload** → automatic Df + domain count (Otsu + box-counting)
- **Presets** + **URL share** of configuration
- Full **PL / EN** UI

## Structure

Everything lives flat in the repo root — **no subfolders**. This is intentional: it makes
uploading through the GitHub web UI foolproof.

| Path | Description |
| --- | --- |
| index.html | Homepage — FAEM overview (PL/EN) |
| kalkulator.html | Lab calculator: plate resonant frequencies (rectangular & circular), wave converter, Q damping. Shareable URL permalinks. |
| faem_generator.html | Interactive pattern generator — eigenmode superposition (square/circle), box-counting Df, domains, sound, image upload, presets, PNG/CSV export, live regression |
| chladni-skalowanie-nodalne.html | Full Chladni scaling analysis |
| struktura-jako-programowalna-czestotliwosc.html | Concept note: fractal geometry as programmable frequency |
| optyka-ograniczenia-i-nowoczesne-rozwiazania.html | Survey note: limits of optics |
| dziennik.html | Lab journal / changelog |
| VERIFICATION.md | Method, data, limitations behind the scaling result |

## Deploy (GitHub Pages)

1. Create a new repository (must be **public** for a custom domain on a free plan)
2. Upload **every file from this archive directly to the repo root**
3. Settings → Pages → Source: Deploy from branch main → folder / (root)
4. Settings → Pages → Custom domain: fractalvibrationlab.com → Enforce HTTPS

## License

- Site content: **CC BY 4.0**
- Generator & calculator code: **MIT**

## Cite

Astro_Katt (2026). FAEM — Fractal Vibration Lab. https://fractalvibrationlab.com

## Contact

fractalvibrationlab@gmail.com
