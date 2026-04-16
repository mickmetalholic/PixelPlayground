import { appRouter } from '@pixel-playground/api';
import { createFrontendTrpcContext } from './context';

export async function createServerCaller() {
  return appRouter.createCaller(await createFrontendTrpcContext());
}
