export enum PreferenceType {
  textfield = "textfield",
  password = "password",
  checkbox = "checkbox",
  dropdown = "dropdown",
  appPicker = "appPicker",
}

export interface Command {
  name?: string;
  title?: string;
  subtitle?: string;
  description?: string;
  mode?: string;
  icon?: string;
}

export interface PreferenceData {
  title?: string;
  value?: string;
}

export interface Preference {
  name?: string;
  description?: string;
  type?: string;
  required?: boolean;
  title?: string;
  placeholder?: string;
  default?: string | boolean;
  data?: PreferenceData[];
  label?: string;
}

export interface Manifest {
  name?: string;
  title?: string;
  description?: string;
  commands?: Command[];
  preferences?: Preference[];
}
