import { fs } from 'src/core/libs/file-system-manipulate';

export async function ensureDirectoryExists(directoryPath: string): Promise<void> {
  try {
    await fs.access(directoryPath);
  } catch (error) {
    await fs.mkdir(directoryPath, { recursive: true });
  }
}
