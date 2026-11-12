import app from "../server/_core/vercelApp.bundle.mjs";

export default function handler(req: any, res: any) {
  return app(req, res);
}
