type RecoveryUiHint = 'silent' | 'inline' | 'toast' | 'redirect';

type RecoverableResult<TData, TReason extends string = string> =
  | {data: TData; kind: 'ok'}
  | {kind: 'empty'}
  | {
      defaultUiHint: RecoveryUiHint;
      kind: 'recoverable';
      message?: string;
      reason: TReason;
    };

export type {RecoverableResult, RecoveryUiHint};
