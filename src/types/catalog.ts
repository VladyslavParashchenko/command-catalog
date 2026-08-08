export type TemplateOption = {
  key?: string;
  example?: string;
  optional: boolean;
  defaultValue?: string | number | boolean;
  type: 'string' | 'number' | 'boolean' | 'enum' | 'timecode';
  restrictions?: {
    min?: number;
    max?: number;
    enum?: string[];
  };
};

export type Command = {
  id: string;
  name: string;
  description: string;
  template: string;
  options: Record<string, TemplateOption>;
};

export type Category = {
  id: string;
  name: string;
  commands: Command[];
};
