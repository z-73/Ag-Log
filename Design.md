Organic Certification Record-Keeping App
System Architecture & Technical Specification

1. Executive Summary & Objective
   This application provides a streamlined, fast, offline-first record-keeping system tailored for market gardening, biointensive, and regenerative farming operations at Mt Cotton Organic Fruit & Veg (T & A Palmer).

The primary goal is achieving full organic certification compliance under Southern Cross Certified (SXC) standards while maintaining minimal operational friction for daily on-farm logging. By replacing paper logbooks with an optimized digital interface, the platform ensures complete, audit-ready data capture across nursery operations, field planting, soil management, and harvest sales. 2. Key Architectural & UX Principles
Extreme Simplicity: Features minimal text input, large touch targets (48px minimum), rapid dropdowns, auto-fill smart defaults, and 1-2 tap confirmation flows specifically engineered for mobile and tablet field use.
Local-First Architecture: Complete offline capability implemented via local storage and client-side caching (IndexedDB/PWA). The app seamlessly caches all logs locally and automatically synchronizes with the central database whenever cellular or Wi-Fi network connectivity is detected.
Lightweight Profile Switching: A persistent, single-tap operator quick-selector (e.g., Toby, Ashley, Hannah, Staff) stored in local storage. Every recorded action, field application, and status modification is automatically tagged with the active operator's identity without requiring repetitive password authentication prompts during field operations.
Traceability Chain: End-to-end forward and backward trace capability linking customer sales and shed harvest batches directly to field plantings, seedling nursery propagation trays, seed lot purchases, and input/spray application logs. 3. Administrative & Farm Configuration (Settings)
The administrative hub configures underlying operational parameters, field layouts, and compliance catalogs required for dropdown populations across the application.
Patch & Row Mapping
Property Structure: Allows defining named patches, fields, and zones across the property (e.g., Patch A, Hillside Plot, Tunnel House 1).
Bed Configuration: Divides patches into individual rows or permanent beds with unique numerical identifiers, cardinal directional alignment (e.g., N-S, E-W), and physical dimensions (length in meters, width).
Real-time Status Display: Interactive spatial overview indicating current active crop status, rotation history, and withholding status per bed.
Master Lists & Catalogues
Crop Varieties Catalogue: Comprehensive inventory of all active species and cultivars (e.g., Lacinato Kale, Provider Bush Bean, Marathon Broccoli, Salanova Lettuce).
Approved Inputs Inventory: Approved registry of commercial chemical sprays, bio-fertilisers, composts, and soil additives. Each entry includes:
Manufacturer and brand name
Batch number and Date of Manufacture (DOM)
Supplier details
Organic Certification Acceptance Evidence (e.g., SXC, BFA, ACO approval reference numbers)
Verification status (Pass / Hold / Pending Review)
Suppliers Registry: Approved seed companies, nursery stock vendors, and organic input distributors. 4. Operational Modules & Certification Registers
A. Nursery & Seedling Register
Tracks the origin and propagation of all plant material prior to field placement.

Seed Tray Sowing Log:
Crop and specific cultivar variety
Sowing date
Seed source/supplier, invoice reference, and seed lot/batch number
Organic status verification reference of purchased seed
Quantity sown (number of trays and cell-count density)
Active operator profile tag
System Action: Automatically generates a unique Nursery Batch ID for downstream transplant tracking.
B. Planting Register (Transplant & Direct Sowing)
Logs all field planting events to establish spatial location and bed occupancy.

Field Planting Record:
Planting Method: Direct Field Sowing vs. Seedling Tray Transplant
If Seedling Transplant: Select Nursery Batch ID (automatically populates crop species, variety, and organic seed source metadata)
If Direct Sowing: Select crop/variety, enter seed supplier, seed lot number, and organic approval reference
Location Assignment: Patch selection and target Row ID(s)
Planting date
Quantity planted (bed meters or total plant count)
Active operator profile tag
System Action: Generates an assigned Planting Reference ID for ongoing bed management and harvest tracking.
C. Chemical, Fertiliser & Soil Additive Input Register
Provides complete, audit-ready tracking of all inputs applied to farm soil or crops, explicitly compliant with SXC and FSQ4.2 food safety standards.

Field Name
Description
Compliance Requirement
Date & Time
Timestamp of application start and completion
SXC / FSQ4.2 Mandatory
Target Location
Patch, specific Row ID(s), and active crop
Spatial Traceability
Input Product
Selected from Approved Inputs Inventory
SXC Organic Standard
Batch Details
Auto-linked batch number, DOM, supplier, and cert #
Input Verification
Application Rate
Total quantity and rate with explicit units (kg, L, g/m²)
Dosage Verification
Purpose
Pest control, weed management, deficiency, fertilisation
Agronomic Justification
Method / Equipment
Foliar spray, fertigation, soil incorporation, backpack
Equipment Audit
Weather Conditions
Wind speed (km/h), direction, temp, ambient moisture
Spray Drift Protocol
Withholding Period
Auto-calculates earliest permissible harvest date
FSQ4.2 / Harvest Lockout
Operator Verification
Digital signature / Active operator profile tag
Accountability

D. Harvest & Shed Batch Register
Captures all yield data coming off the field and validates safety clearances before packing.

Harvest Logging Interface:
Date and time of harvest.
Patch and Row ID selection.
System Safety Check: Automatically checks selected location against active Withholding Periods (WHP) from recent input logs. Prevents batch creation if WHP is active.
Crop and variety identification.
Selective continuous harvest support (e.g., multi-pick crops like perpetual kale, zucchini, or staggered broccoli pickings over extended periods).
Quantity harvested and measurement unit (kg, count, bunches, field bins).
Quality grading, cull notes, or recorded field losses.
Active operator profile tag.
Automated Batch Generation: System generates a unique Harvest Lot / Batch Number encoding date, patch, row, and crop code (e.g., HB-20241024-PA02-R05-KAL).
Traceback Linkage: Creates an immutable record linking Harvest Lot -> Planting Reference -> Seed/Nursery Lot -> Input Application History.
E. Output & Mass Balance Summary
Traceback Query Engine: Allows farm managers or SXC auditors to search any Harvest Lot ID or date to instantly render a complete audit-ready chain of custody report.

[Seed Supplier / Lot Info]

       │

       ▼

[Nursery Sowing Batch ID]

       │

       ▼

[Field Planting Ref & Row ID] ◄─── [Input Logs & WHP Verification]

       │

       ▼

[Harvest Lot / Batch Number]

       │

       ▼

[Shed Sales / Wholesale / REKO Mt Cotton Dispatch]

Output Ledger: Tracks distribution and sales allocation across farm gate sales, wholesale orders, and local market dispatches (including REKO Mt Cotton), facilitating real-time mass balance calculations to verify that sold volumes do not exceed harvested yields. 5. Implementation Roadmap
Phase
Milestone Name
Core Deliverables
Target Timeline
Phase 1
Core Database Schema & Local Engine
Setup IndexedDB offline schema for Profiles, Patches, Rows, Planting Batches, Input Logs, and Harvests. Establish local-to-remote sync logic.
Weeks 1–3
Phase 2
Fast-Action Mobile UI
Develop mobile-optimized, high-contrast, large-target user interfaces for rapid field picking, nursery logs, and input tracking.
Weeks 4–6
Phase 3
Settings & Farm Mapping
Implement administrative setup tools including visual patch/row builder, master crop catalog, and approved inputs registry.
Weeks 7–9
Phase 4
Audit & SXC Traceback Export
Build mass balance reporting tools and direct PDF/Doc export engine matching official Southern Cross Certified inspection templates.
Weeks 10–12

Organic Certification Record-Keeping App
System Architecture & Technical Specification

1. Executive Summary & Objective
   This application provides a streamlined, fast, offline-first record-keeping system tailored for market gardening, biointensive, and regenerative farming operations at Mt Cotton Organic Fruit & Veg (T & A Palmer).

The primary goal is achieving full organic certification compliance under Southern Cross Certified (SXC) standards while maintaining minimal operational friction for daily on-farm logging. By replacing paper logbooks with an optimized digital interface, the platform ensures complete, audit-ready data capture across nursery operations, field planting, soil management, and harvest sales. 2. Key Architectural & UX Principles
Extreme Simplicity: Features minimal text input, large touch targets (48px minimum), rapid dropdowns, auto-fill smart defaults, and 1-2 tap confirmation flows specifically engineered for mobile and tablet field use.
Local-First Architecture: Complete offline capability implemented via local storage and client-side caching (IndexedDB/PWA). The app seamlessly caches all logs locally and automatically synchronizes with the central database whenever cellular or Wi-Fi network connectivity is detected.
Lightweight Profile Switching: A persistent, single-tap operator quick-selector (e.g., Toby, Ashley, Hannah, Staff) stored in local storage. Every recorded action, field application, and status modification is automatically tagged with the active operator's identity without requiring repetitive password authentication prompts during field operations.
Traceability Chain: End-to-end forward and backward trace capability linking customer sales and shed harvest batches directly to field plantings, seedling nursery propagation trays, seed lot purchases, and input/spray application logs. 3. Administrative & Farm Configuration (Settings)
The administrative hub configures underlying operational parameters, field layouts, and compliance catalogs required for dropdown populations across the application.
Patch & Row Mapping
Property Structure: Allows defining named patches, fields, and zones across the property (e.g., Patch A, Hillside Plot, Tunnel House 1).
Bed Configuration: Divides patches into individual rows or permanent beds with unique numerical identifiers, cardinal directional alignment (e.g., N-S, E-W), and physical dimensions (length in meters, width).
Real-time Status Display: Interactive spatial overview indicating current active crop status, rotation history, and withholding status per bed.
Master Lists & Catalogues
Crop Varieties Catalogue: Comprehensive inventory of all active species and cultivars (e.g., Lacinato Kale, Provider Bush Bean, Marathon Broccoli, Salanova Lettuce).
Approved Inputs Inventory: Approved registry of commercial chemical sprays, bio-fertilisers, composts, and soil additives. Each entry includes:
Manufacturer and brand name
Batch number and Date of Manufacture (DOM)
Supplier details
Organic Certification Acceptance Evidence (e.g., SXC, BFA, ACO approval reference numbers)
Verification status (Pass / Hold / Pending Review)
Suppliers Registry: Approved seed companies, nursery stock vendors, and organic input distributors. 4. Operational Modules & Certification Registers
A. Nursery & Seedling Register
Tracks the origin and propagation of all plant material prior to field placement.

Seed Tray Sowing Log:
Crop and specific cultivar variety
Sowing date
Seed source/supplier, invoice reference, and seed lot/batch number
Organic status verification reference of purchased seed
Quantity sown (number of trays and cell-count density)
Active operator profile tag
System Action: Automatically generates a unique Nursery Batch ID for downstream transplant tracking.
B. Planting Register (Transplant & Direct Sowing)
Logs all field planting events to establish spatial location and bed occupancy.

Field Planting Record:
Planting Method: Direct Field Sowing vs. Seedling Tray Transplant
If Seedling Transplant: Select Nursery Batch ID (automatically populates crop species, variety, and organic seed source metadata)
If Direct Sowing: Select crop/variety, enter seed supplier, seed lot number, and organic approval reference
Location Assignment: Patch selection and target Row ID(s)
Planting date
Quantity planted (bed meters or total plant count)
Active operator profile tag
System Action: Generates an assigned Planting Reference ID for ongoing bed management and harvest tracking.
C. Chemical, Fertiliser & Soil Additive Input Register
Provides complete, audit-ready tracking of all inputs applied to farm soil or crops, explicitly compliant with SXC and FSQ4.2 food safety standards.

Field Name
Description
Compliance Requirement
Date & Time
Timestamp of application start and completion
SXC / FSQ4.2 Mandatory
Target Location
Patch, specific Row ID(s), and active crop
Spatial Traceability
Input Product
Selected from Approved Inputs Inventory
SXC Organic Standard
Batch Details
Auto-linked batch number, DOM, supplier, and cert #
Input Verification
Application Rate
Total quantity and rate with explicit units (kg, L, g/m²)
Dosage Verification
Purpose
Pest control, weed management, deficiency, fertilisation
Agronomic Justification
Method / Equipment
Foliar spray, fertigation, soil incorporation, backpack
Equipment Audit
Weather Conditions
Wind speed (km/h), direction, temp, ambient moisture
Spray Drift Protocol
Withholding Period
Auto-calculates earliest permissible harvest date
FSQ4.2 / Harvest Lockout
Operator Verification
Digital signature / Active operator profile tag
Accountability

D. Harvest & Shed Batch Register
Captures all yield data coming off the field and validates safety clearances before packing.

Harvest Logging Interface:
Date and time of harvest.
Patch and Row ID selection.
System Safety Check: Automatically checks selected location against active Withholding Periods (WHP) from recent input logs. Prevents batch creation if WHP is active.
Crop and variety identification.
Selective continuous harvest support (e.g., multi-pick crops like perpetual kale, zucchini, or staggered broccoli pickings over extended periods).
Quantity harvested and measurement unit (kg, count, bunches, field bins).
Quality grading, cull notes, or recorded field losses.
Active operator profile tag.
Automated Batch Generation: System generates a unique Harvest Lot / Batch Number encoding date, patch, row, and crop code (e.g., HB-20241024-PA02-R05-KAL).
Traceback Linkage: Creates an immutable record linking Harvest Lot -> Planting Reference -> Seed/Nursery Lot -> Input Application History.
E. Output & Mass Balance Summary
Traceback Query Engine: Allows farm managers or SXC auditors to search any Harvest Lot ID or date to instantly render a complete audit-ready chain of custody report.

[Seed Supplier / Lot Info]

       │

       ▼

[Nursery Sowing Batch ID]

       │

       ▼

[Field Planting Ref & Row ID] ◄─── [Input Logs & WHP Verification]

       │

       ▼

[Harvest Lot / Batch Number]

       │

       ▼

[Shed Sales / Wholesale / REKO Mt Cotton Dispatch]

Output Ledger: Tracks distribution and sales allocation across farm gate sales, wholesale orders, and local market dispatches (including REKO Mt Cotton), facilitating real-time mass balance calculations to verify that sold volumes do not exceed harvested yields. 5. Implementation Roadmap
Phase
Milestone Name
Core Deliverables
Target Timeline
Phase 1
Core Database Schema & Local Engine
Setup IndexedDB offline schema for Profiles, Patches, Rows, Planting Batches, Input Logs, and Harvests. Establish local-to-remote sync logic.
Weeks 1–3
Phase 2
Fast-Action Mobile UI
Develop mobile-optimized, high-contrast, large-target user interfaces for rapid field picking, nursery logs, and input tracking.
Weeks 4–6
Phase 3
Settings & Farm Mapping
Implement administrative setup tools including visual patch/row builder, master crop catalog, and approved inputs registry.
Weeks 7–9
Phase 4
Audit & SXC Traceback Export
Build mass balance reporting tools and direct PDF/Doc export engine matching official Southern Cross Certified inspection templates.
Weeks 10–12
