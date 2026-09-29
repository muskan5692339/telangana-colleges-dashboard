# Telangana Colleges Dashboard

Staff monitoring for She for STEM Telangana college cohorts:

- **3rd Year : Old Batch** — Inc 10 monitoring, 53 colleges / 1,784 students from `Inc10.0_Student_Facing_Monitoring.xlsx`
- **2nd Year : New Batch** — Inc 13 tablet enrollment, 56 colleges / 2,331 students from `Inc13_Student Enrollment.xlsx`

Visual language follows the existing CURIE / She for STEM product: navy `#2C4869`, green `#69AB4A`, yellow `#FFCC29`, cream page background. Fonts use the system stack, so dev and build do not depend on reaching Google Fonts.

## Where the app lives

| Place | What it is |
| --- | --- |
| GitHub `muskan5692339/telangana-colleges-dashboard`, branch `main` | Source that Vercel deploys. `package.json` sits at the repo root. |
| Vercel `telangana-colleges-dashboard` | Production site. **Settings → General → Root Directory must be empty.** |
| Laptop folder with `package.json` | Local copy for `npm run dev`. |

Vercel only builds what is on GitHub `main`. Excel uploads on Vercel are kept in `/tmp` and are wiped on the next deploy or cold start, so the 53-college roster ships inside the code (`src/lib/inc10-colleges.json` and `src/lib/inc10-source-overlay.json`).

## Publish to GitHub and Vercel

1. In Vercel, open **Settings → General → Root Directory**, clear it so the field is empty, and save. If it still says `telangana-colleges-dashboard`, the build fails with "Root Directory does not exist".
2. Save **`telangana_dashboard_53_colleges.zip`** to **Downloads**. It has `package.json` at the top level, with no nested folder.
3. Paste this block in **PowerShell**. Sign in to GitHub as **muskan5692339** if Git Credential Manager asks.

```powershell
$ErrorActionPreference = "Stop"
$zip = "$env:USERPROFILE\Downloads\telangana_dashboard_53_colleges.zip"
$repo = "C:\Users\muska\tcd-github"
if (-not (Test-Path $zip)) { throw "Save telangana_dashboard_53_colleges.zip to Downloads first." }
if (Test-Path $repo) { Remove-Item -LiteralPath $repo -Recurse -Force }
git clone https://github.com/muskan5692339/telangana-colleges-dashboard.git $repo
Set-Location $repo
Get-ChildItem -Force | Where-Object { $_.Name -ne ".git" } | Remove-Item -Recurse -Force
Expand-Archive -LiteralPath $zip -DestinationPath $repo -Force
if (-not (Test-Path "$repo\src\lib\inc10-colleges.json")) { throw "Wrong zip: 53-college files missing." }
git add -A
git commit -m "Old batch: 53 colleges from Inc10.0_Student_Facing_Monitoring.xlsx"
git push origin main
```

The same steps are in `scripts/publish-to-github.ps1`.

4. Wait for the Vercel deploy to show **Ready**, then hard-refresh (Ctrl+Shift+R) [https://telangana-colleges-dashboard.vercel.app/student-view](https://telangana-colleges-dashboard.vercel.app/student-view). The **3rd Year : Old Batch** card should say **53 colleges in this cohort**.

## Run on the laptop

In PowerShell, inside the folder that contains `package.json`:

```powershell
npm install
npm run dev
```

Leave that window open until it prints `Ready`, then open **http://127.0.0.1:43147/student-view** in Chrome on the same laptop. Use port `43147`, not 3000. `127.0.0.1` avoids a Windows problem where `localhost` goes to IPv6 and the page never loads.

- Node 22 or newer works. Node 24 is fine.
- The `allow-scripts` and `1 high severity vulnerability` lines from `npm install` are warnings. They do not stop the app.
- `localhost` always means "this computer". The Cloud Agent runs on a remote machine, so laptop Chrome cannot reach it, and the agent cannot reach the laptop.

## Sign in

Student view needs no login. Staff pages use:

- Email: `staff@vigyanshaala.com`
- Password: `Kalpana@2026`

This password always works, even when Vercel env vars `STAFF_EMAIL` / `STAFF_PASSWORD` are blank or set to something else.

## Links

- Student view (no login): [https://telangana-colleges-dashboard.vercel.app/student-view](https://telangana-colleges-dashboard.vercel.app/student-view)
- 3rd Year : Old Batch: [https://telangana-colleges-dashboard.vercel.app/student-view/3rd-year-old-batch](https://telangana-colleges-dashboard.vercel.app/student-view/3rd-year-old-batch)
- 2nd Year : New Batch: [https://telangana-colleges-dashboard.vercel.app/student-view/2nd-year-new-batch](https://telangana-colleges-dashboard.vercel.app/student-view/2nd-year-new-batch)
- Staff dashboard (login): [https://telangana-colleges-dashboard.vercel.app](https://telangana-colleges-dashboard.vercel.app)

The full per-college link list is on **Share** after sign-in.

## Navigation

1. **Cohorts** — pick 3rd Year : Old Batch or 2nd Year : New Batch.
2. **Colleges** — search and choose a college. The college table opens on the next page. **College-wise selection** / **College-wise enrollment** (top right) opens the summary.
3. **Upload** — staff replace live data from the source Excel workbook.
4. **Requests** — admin approves student rename, add, and delete requests.
5. **Share** — copy responder links for each college.

## Excel upload

- **3rd Year : Old Batch** — `Inc10.0_Student_Facing_Monitoring.xlsx`, tabs `College-wise selection` and `Student Wise - Phase 2`. This is not the Overall Monitoring Mastersheet.
- **2nd Year : New Batch** — `Inc13_Student Enrollment.xlsx`. Names are `NAME_STREAM`, dummy email is `[code]@sfsvigyanshaala.com`, and the password is `VS@123` for [mytribe.vigyanshaala.com](https://mytribe.vigyanshaala.com). MJPTBC Adilabad has 45 students (codes 19850–19894). Test names such as `TEST STUDENT ONE` are stripped.

Only sheets with a colored Excel tab are imported. Upload replaces one cohort and leaves the other unchanged. An upload never shrinks the college list below the roster that ships in code. On Vercel an upload lasts only until the next deploy, so change the roster permanently by updating the code on GitHub.

College staff request a student name in **capital letters** and a subject area. Admin enrolls from the backend and allots the dummy email and password. Renames and deletes stay pending until approved on **Requests**.

## Stack

Next.js 16 (App Router, Turbopack), TypeScript, Tailwind CSS, shadcn/ui, Node 22+.
