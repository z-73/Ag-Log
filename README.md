# Ag-Log | Mt Cotton Organic Fruit & Veg

Mobile & Web UX prototype for the **Southern Cross Certified (SXC) Organic Record-Keeping System** at Mt Cotton Organic Fruit & Veg (T & A Palmer).

## Key Prototype Features
- **Single-Tap Operator Quick-Selector**: Instant switching between `Toby`, `Ashley`, `Hannah`, and `Staff` in the persistent top header.
- **48px+ Field-Ready Quick Actions**:
  - **Harvest & Shed Batch Log**: Live WHP lockout check, 1-tap quantity steppers, and automated batch ID generation (`HB-YYYYMMDD-PA01-R02-KAL`).
  - **Spray & Soil Input Log (FSQ4.2 / SXC)**: Auto-populates approved input batch, DOM, SXC/ACO certification reference, WHP lockout days, and 1-tap spray drift weather presets.
  - **Field Planting Log**: Toggle between *Seedling Tray Transplant* (auto-links Nursery Batch ID & organic seed lot) and *Direct Field Sowing*.
  - **Nursery Tray Sowing Log**: Generates unique `NB-YYYYMMDD-XXX` propagation batch IDs.
- **Interactive Patch & Permanent Bed Map**: Real-time spatial overview of `Patch A — North Flat`, `Patch B — Hillside Terrace`, and `Tunnel House 1` with WHP lockout badges, crop rotation history, and 1-tap bed actions.
- **End-to-End SXC Traceback & Mass Balance Engine**: Visual chain-of-custody explorer from certified seed lot through to **REKO Mt Cotton** & **Farm Gate Shed** sales dispatches.

## Local Development & Netlify Deployment
```bash
npm install
npm run dev      # Starts local dev server (accessible on mobile via LAN IP)
npm run build    # Builds production bundle to dist/ (pre-configured via netlify.toml)
```
