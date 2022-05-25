import * as fs from "fs";

export async function getAssetsFromFolder(folder: string): Promise<string[]> {
  try {
    const files = await fs.promises.readdir(folder);
    return files;
  } catch (error) {}
  return [];
}

export async function getImageAssetsFromFolder(folder: string): Promise<string[]> {
  const files = (await getAssetsFromFolder(folder)).filter((f) => f.endsWith(".png"));
  return files;
}
