# Fractal Vibration Lab — FAEM

**https://fractalvibrationlab.com**

Fractal Acoustic–Energy Mapping: open pipeline for mapping the complexity of vibration
patterns — nodal domain scaling on Chladni plates, an interactive pattern generator, and a
lab calculator for designing experiments before touching a function generator.

## Highlight

On 8 real square-plate photos (155–6800 Hz):

**N_domains ∝ f^{0.521 ± 0.054}** · R² = 0.94

Classical Chladni / Rayleigh expectation: **0.5**

## Structure

Everything lives flat in the repo root — **no subfolders**. This is intentional: it makes
uploading through the GitHub web UI foolproof (no risk of a folder's structure getting lost
or flattened during drag-and-drop).

| Path | Description |
|------|-------------|
| `index.html` | Homepage — FAEM overview (PL/EN) |
| `kalkulator.html` | Lab calculator: plate resonant frequencies (rectangular & circular, via Bessel-function eigenvalues), wave speed/frequency/wavelength converter (incl. dispersive flexural plate waves + air-coincidence frequency), and ring-down/Q damping calculator. Shareable via URL permalinks. |
| `faem_generator.html` | Interactive pattern generator — eigenmode superposition, box-counting Df, domain count, live log–log regression, CSV export |
| `chladni-skalowanie-nodalne.html` | Full Chladni scaling analysis: method, plot, frequency atlas (with in-browser audio playback), limitations |
| `struktura-jako-programowalna-czestotliwosc.html` | Concept note: fractal geometry as a programmable frequency degree of freedom |
| `optyka-ograniczenia-i-nowoczesne-rozwiazania.html` | Survey note: limits of optics and modern workarounds |
| `dziennik.html` | Lab journal / changelog (not yet linked in navigation) |
| `chladni_law_test_plot.png` | Scaling plot, used by the homepage and the Chladni note |
| `VERIFICATION.md` | Method, data, limitations behind the scaling result |
| `404.html` | Custom not-found page |

## Deploy (GitHub Pages)

1. Create a new repository (must be **public** for a custom domain on a free plan)
2. Upload **every file from this archive directly to the repo root** — select all files
   at once and drag them in. There are no subfolders to worry about.
3. Settings → Pages → Source: Deploy from branch `main` → folder `/ (root)`
4. Settings → Pages → Custom domain: `fractalvibrationlab.com` → Save, wait for the DNS
   check to pass, then enable **Enforce HTTPS**

The `CNAME` file in this repo already contains the domain, so step 4 may pick it up
automatically — just confirm the field is filled in and saved.

## License

- Site content: **CC BY 4.0**
- Generator & calculator code: **MIT**

## Cite

Astro_Katt (2026). FAEM — Fractal Vibration Lab. https://fractalvibrationlab.com

## Contact

fractalvibrationlab@gmail.com
