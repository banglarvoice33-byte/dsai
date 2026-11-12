import type { IncomingHttpHeaders } from "node:http";

declare module "express-serve-static-core" {
  interface Request {
    protocol: string;
    headers: IncomingHttpHeaders;
    body: unknown;
    ip?: string;
    header(name: string): string | undefined;
  }
  interface Response {
    locals: Record<string, unknown>;
    setHeader(name: string, value: number | string | readonly string[]): this;
    status(code: number): this;
    json(body: unknown): this;
  }
}
