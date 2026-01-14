export interface Suggest {
  mnemonic: string;
  list: SuggestItem[];
  isEdit?: boolean;
}

export interface SuggestItem {
  value: string;
  mnemonic: string;
  hints?: Hint[];
}

export interface Hint {
  value: string;
  mnemonic: string;
}
