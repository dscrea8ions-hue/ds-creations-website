import "server-only";

import { del, head, put, type PutBlobResult } from "@vercel/blob";

type BlobFailure = {
  name?: unknown;
  message?: unknown;
  status?: unknown;
  statusCode?: unknown;
  code?: unknown;
};

export class BlobStorageError extends Error {
  constructor(public readonly reason: "TOKEN_MISSING" | "UPLOAD_REJECTED" | "DELETE_REJECTED") {
    super(reason);
    this.name = "BlobStorageError";
  }
}

const getToken = () => {
  const token = process.env.BLOB_READ_WRITE_TOKEN?.trim();
  if (!token) throw new BlobStorageError("TOKEN_MISSING");
  return token;
};

const logBlobFailure = (error: unknown) => {
  const failure = error as BlobFailure;
  console.error("Blob error name:", String(failure?.name ?? "Error"));
  console.error("Blob error message:", String(failure?.message ?? "Unknown Blob error"));
  console.error("Blob HTTP status/code:", String(failure?.statusCode ?? failure?.status ?? failure?.code ?? "unavailable"));
};

export const blobTokenPresent = () => Boolean(process.env.BLOB_READ_WRITE_TOKEN?.trim());

export async function uploadPublicBlob(pathname: string, file: File): Promise<PutBlobResult> {
  const token = getToken();
  try {
    return await put(pathname, file, {
      access: "public",
      addRandomSuffix: true,
      token,
    });
  } catch (error) {
    logBlobFailure(error);
    throw new BlobStorageError("UPLOAD_REJECTED");
  }
}

export async function deletePublicBlob(urlOrPathname: string) {
  const token = getToken();
  try {
    const blob = await head(urlOrPathname, { token });
    const hostname = new URL(blob.url).hostname;
    if (!hostname.endsWith(".public.blob.vercel-storage.com")) throw new Error("Blob does not belong to an approved public store hostname.");
    await del(urlOrPathname, { token });
  } catch (error) {
    logBlobFailure(error);
    throw new BlobStorageError("DELETE_REJECTED");
  }
}
