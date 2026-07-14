import { deleteUserData } from './api';
import { runPostDeletionReset, wipeLocalAppData } from './dataDeletion';
import { getAppUserID, logOutPurchases } from './purchases';
import { clearRenderCache } from './renderCache';

export async function deleteAllUserData(): Promise<{ serverOk: boolean }> {
  const appUserId = await getAppUserID();
  let serverOk = true;
  if (appUserId) {
    const result = await deleteUserData(appUserId);
    serverOk = result.ok;
  }
  await clearRenderCache();
  await wipeLocalAppData();
  await logOutPurchases();
  runPostDeletionReset();
  return { serverOk };
}