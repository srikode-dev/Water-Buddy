export type ActiveTab = 'landing' | 'architecture' | 'pricing' | 'contact' | 'design-system';

export type WorkspaceRoutine = 'desk' | 'moderate' | 'athletic';

export interface BiometricState {
  massKg: number;
  terminalHours: number;
  temperatureC: number;
  humidityPct: number;
}

export interface IntakeLog {
  id: string;
  amountMl: number;
  timestamp: Date;
  label: string;
}

export interface ProformaData {
  companyName: string;
  gstin: string;
  address: string;
  seats: number;
  unitPrice: number;
  discountPct: number;
  subtotal: number;
  gstAmount: number;
  total: number;
  invoiceNumber: string;
  invoiceDate: string;
}
