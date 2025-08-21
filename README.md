LayR (Fork of Text-Behind-Image)
<p align="center">
  <img src="https://github.com/user-attachments/assets/d8b08a49-faea-4cbe-af57-59537ac0ced0" width="400" />
  <img src="https://github.com/user-attachments/assets/5958247d-ab69-4b31-9ef5-caf7c0d6b2ad" width="400" />
</p>
<hr>
LayR is a free and open-source tool for creating text-behind-image designs, with additional editing features.
This project is a modified fork of Text Behind Image
by [RexanWONG](https://github.com/RexanWONG), which is licensed under the AGPL-3.0 License.
<hr>
Features

Compared to the original project, this fork adds:

Layer sorting → bring text forward or send it behind objects.

Width & height scaling → compress or stretch text at different angles.

Blend modes → experiment with overlays & creative effects.

3D text effects (previously paywalled in other tools).

Basic image adjustments → brightness, contrast, rotation, aspect ratio.

Sleek, improved UI with smoother workflow.
<hr>
Demo
<hr>
 https://layr.usef.world/
<hr>
 Installation
<hr>
Clone this repo and install dependencies:

git clone https://github.com/notyourcfo/LayR.git
cd LayR
npm install
npm run dev
<hr>
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
<hr>
Environment Variables
<hr>
Create `.env.local` for local dev and set in Vercel (Preview + Production):
<hr>
NEXT_PUBLIC_CLOUD_RUN_URL=https://<your-cloud-run-service>.a.run.app
<hr>
Local Development

- Start the Next.js app: `npm run dev`
- By default, the inline editor can use either:
  - Local API Route proxy (`/api/remove-bg`) which forwards to Cloud Run, or
  - Direct Cloud Run (UI setting: Settings → Processing Mode → Server (Cloud Run))
<hr>
Deploy your own Cloud Run processor
<hr>
Prerequisites: Google Cloud project, `gcloud` CLI, and billing enabled.
<hr>
1. Build container (from repo root):
   ```bash
   gcloud builds submit cloud-run/processor \
     --tag gcr.io/<PROJECT_ID>/layr-processor:latest
   ```
<hr>
2. Deploy to Cloud Run (replace region):
   ```bash
   gcloud run deploy layr-processor \
     --image gcr.io/<PROJECT_ID>/layr-processor:latest \
     --region <REGION> --platform managed --allow-unauthenticated
   ```
<hr>
3. Copy the service URL from the deploy output and set it as `NEXT_PUBLIC_CLOUD_RUN_URL`.
<hr>
4. Test endpoints:
   - Health: `GET $CLOUD_RUN_URL/healthz` → `ok`
   - Process: `POST $CLOUD_RUN_URL/process` with `multipart/form-data` field `file`
<hr>
License
<hr>
This project is licensed under the GNU Affero General Public License v3.0 (AGPL-3.0).
See the LICENSE
 file for full details.
<hr>
 Credits
<hr>
Original project: [Text Behind Image](https://github.com/RexanWONG/text-behind-image)
 by [RexanWONG](https://github.com/RexanWONG)
