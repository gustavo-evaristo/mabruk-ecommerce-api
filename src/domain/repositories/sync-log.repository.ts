export interface CreateSyncLogInput {
  type: string;
  direction: 'pull' | 'push';
  status: 'success' | 'error';
  itemsAffected?: number;
  errorMessage?: string;
  payload?: Record<string, unknown>;
}

export abstract class ISyncLogRepository {
  abstract create(input: CreateSyncLogInput): Promise<void>;
  abstract findLatestByType(type: string): Promise<{ createdAt: Date } | null>;
}
