// src/global.d.ts

interface QortalRequestOptions {
  action: string;
  name?: string;
  service?: string;
  data64?: string;
  title?: string;
  description?: string;
  category?: string;
  tags?: string[] | string;
  identifier?: string;
  address?: string;
  metaData?: string;
  encoding?: string;
  includeMetadata?: boolean;
  limit?: number;
  offset?: number;
  reverse?: boolean;
  resources?: any[];
  filename?: string;
  list_name?: string;
  item?: string;
  items?: string[];
  tag1?: string;
  tag2?: string;
  tag3?: string;
  tag4?: string;
  tag5?: string;
  coin?: string;
  destinationAddress?: string;
  amount?: number | Number;
  recipient?: string;
  fee?: number | any;
  blob?: Blob;
  mimeType?: string;
  file?: File;
  encryptedData?: string;
  mode?: string;
  query?: string;
  excludeBlocked?: boolean;
  exactMatchNames?: boolean;
  creationBytes?: string;
  type?: string;
  host?: string;
  port?: number;
  assetId?: number;
  txType?: TransactionType[];
  confirmationStatus?: string;
  startBlock?: number;
  blockLimit?: number;
  txGroupId?: number;
  memo?: string;
}

declare function qortalRequest(
  options: QortalRequestOptions
): Promise<any>;

declare function qortalRequestWithTimeout(
  options: QortalRequestOptions,
  time: number
): Promise<any>;

declare global {
  interface Window {
    _qdnBase: any;
    _qdnTheme: string;
  }
}

declare global {
  interface Window {
    showSaveFilePicker: (
      options?: SaveFilePickerOptions
    ) => Promise<FileSystemFileHandle>;
  }
}