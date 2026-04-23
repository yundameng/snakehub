export type ResourceType = "skills" | "hooks" | "agents" | "commands";

export type OperationType = "import" | "link" | "rollback";

export interface FingerprintFile {
  relativePath: string;
  hash: string;
  size: number;
}

export interface FingerprintResult {
  fingerprint: string;
  files: FingerprintFile[];
}

export interface ResourceRecord {
  id: string;
  type: ResourceType;
  name: string;
  fingerprint: string;
  storePath: string;
  sourcePath: string;
  createdAt: string;
}

export interface MappingRecord {
  id: string;
  resourceId: string;
  toolId: string;
  linkPath: string;
  targetPath: string;
  active: boolean;
  createdAt: string;
}

export interface OperationRecord {
  id: string;
  type: OperationType;
  createdAt: string;
  details: Record<string, string | boolean | number | null | undefined>;
}

export interface State {
  version: number;
  resources: ResourceRecord[];
  mappings: MappingRecord[];
  operations: OperationRecord[];
}

export interface ToolAdapter {
  id: string;
  name: string;
  configDirName: string;
  supports: ResourceType[];
  defaultEnabledTypes?: ResourceType[];
  detect: () => Promise<boolean>;
  targetDir: (type: ResourceType) => string;
}

export interface ScanAsset {
  toolId: string;
  type: ResourceType;
  path: string;
  name: string;
  fingerprint: string;
  duplicateResourceId?: string;
  mtimeMs?: number;
  birthtimeMs?: number;
}
