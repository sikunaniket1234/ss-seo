import fs from 'fs-extra';
import path from 'path';

export class SnapshotService {
    private static snapshotDir = path.resolve('snapshots');

    public static async createSnapshot(siteId: string, filePath: string): Promise<string> {
        await fs.ensureDir(this.snapshotDir);
        const fileName = path.basename(filePath);
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const snapshotPath = path.join(this.snapshotDir, `${siteId}_${timestamp}_${fileName}.bak`);

        await fs.copy(filePath, snapshotPath);
        return snapshotPath;
    }

    public static async restoreSnapshot(snapshotPath: string, targetPath: string): Promise<void> {
        if (await fs.pathExists(snapshotPath)) {
            await fs.copy(snapshotPath, targetPath, { overwrite: true });
        } else {
            throw new Error('Snapshot not found');
        }
    }
}
