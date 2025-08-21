LayR (Fork of Text-Behind-Image)
<p align="center">
  <img src="https://github.com/user-attachments/assets/d8b08a49-faea-4cbe-af57-59537ac0ced0" width="400" />
  <img src="https://github.com/user-attachments/assets/5958247d-ab69-4b31-9ef5-caf7c0d6b2ad" width="400" />
</p>


LayR is a free and open-source tool for creating text-behind-image designs, with additional editing features.
This project is a modified fork of Text Behind Image
 by [RexanWONG](https://github.com/RexanWONG), which is licensed under the AGPL-3.0 License.

Features

Compared to the original project, this fork adds:

Layer sorting → bring text forward or send it behind objects.

Width & height scaling → compress or stretch text at different angles.

Blend modes → experiment with overlays & creative effects.

3D text effects (previously paywalled in other tools).

Basic image adjustments → brightness, contrast, rotation, aspect ratio.

Sleek, improved UI with smoother workflow.

Demo

 https://layr.usef.world/

 Installation

Clone this repo and install dependencies:

git clone https://github.com/notyourcfo/LayR.git
cd LayR
npm install
npm run dev

Architecture

The app now performs heavy background removal on a separate server:

- Client (Next.js, Vercel)
  - UI only. Calls a thin API proxy at `POST /api/remove-bg`.
- API proxy (Next.js route `app/api/remove-bg/route.ts`)
  - Forwards uploads (multipart/form-data) to the processor.
  - Returns the processed PNG back to the client.
- Processor (Cloud Run: `cloud-run/processor/`)
  - Native Node service using `@imgly/background-removal-node`.
  - Endpoints: `GET /healthz`, `POST /process` (multipart `file`).

This avoids bundling heavy native ML deps inside Vercel Serverless Functions (stays under the 250 MB unzipped limit).

Environment Variables

Create `.env.local` for local dev and set in Vercel (Preview + Production):

```
# Base URL of YOUR Cloud Run processor (no trailing slash)
# Example: https://<service-name>-<hash>-<region>.a.run.app
CLOUD_RUN_URL=https://<your-cloud-run-service>.a.run.app
# Optional: used by the client UI to enable the "Server (Cloud Run)" mode
NEXT_PUBLIC_CLOUD_RUN_URL=${CLOUD_RUN_URL}
```

Local Development

- Start the Next.js app: `npm run dev`
- By default, the inline editor can use either:
  - Local API Route proxy (`/api/remove-bg`) which forwards to Cloud Run, or
  - Direct Cloud Run (UI setting: Settings → Processing Mode → Server (Cloud Run))

Deployment

- Vercel: push to GitHub, ensure env var `CLOUD_RUN_URL` is set in the Vercel project.
- Cloud Run processor:
  - Source at `cloud-run/processor/` (Node on port 8080).
  - Exposes `POST /process` and `GET /healthz`.
  - Uses `@imgly/background-removal-node@1.4.5`.

Deploy your own Cloud Run processor

Prerequisites: Google Cloud project, `gcloud` CLI, and billing enabled.

1. Build container (from repo root):
   ```bash
   gcloud builds submit cloud-run/processor \
     --tag gcr.io/<PROJECT_ID>/layr-processor:latest
   ```
2. Deploy to Cloud Run (replace region):
   ```bash
   gcloud run deploy layr-processor \
     --image gcr.io/<PROJECT_ID>/layr-processor:latest \
     --region <REGION> --platform managed --allow-unauthenticated
   ```
3. Copy the service URL from the deploy output and set it as `CLOUD_RUN_URL`.
4. Test endpoints:
   - Health: `GET $CLOUD_RUN_URL/healthz` → `ok`
   - Process: `POST $CLOUD_RUN_URL/process` with `multipart/form-data` field `file`

Security notes (if exposing public demo):
- Restrict CORS to your frontend origin.
- Add auth (e.g., Bearer token) or place behind API Gateway/Cloud Armor with rate limits.
- Enforce max file size/timeouts in the processor service.

Why the Proxy?

- Importing ML packages in Next API routes can exceed Vercel's 250 MB unzipped limit.
- The route `app/api/remove-bg/route.ts` now forwards uploads to Cloud Run and streams the PNG back.
- Root `package.json` excludes heavy ML deps; only the Cloud Run service includes them.

Troubleshooting

- 500 from `/api/remove-bg`: verify `CLOUD_RUN_URL` is set and reachable.
- 404 from Cloud Run: ensure you are using the full service URL (ends with `.a.run.app`).
- Function size errors on Vercel: confirm heavy deps are not in the root `package.json`.
- Slow processing: expect ~5–10 seconds per image; larger images can take longer.

 License

This project is licensed under the GNU Affero General Public License v3.0 (AGPL-3.0).
See the LICENSE
 file for full details.

 Credits

Original project: [Text Behind Image](https://github.com/RexanWONG/text-behind-image)
 by [RexanWONG](https://github.com/RexanWONG)
