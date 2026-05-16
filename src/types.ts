export type FrameStyle = {
  color: string;
  width: number;
  opacity: number;
};

export type FrameRule = {
  id: string;
  urlPattern: string;
  style: FrameStyle;
  enabled: boolean;
};

export type StorageData = {
  rules: FrameRule[];
};
