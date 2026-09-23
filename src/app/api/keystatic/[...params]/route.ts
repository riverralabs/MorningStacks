import { makeRouteHandler } from '@keystatic/next/route-handler';
import config from '../../../../../keystatic.config';

export const dynamic = 'force-dynamic';

function handler() {
  return makeRouteHandler({ config });
}

export function GET(request: Request) {
  return handler().GET(request);
}

export function POST(request: Request) {
  return handler().POST(request);
}
