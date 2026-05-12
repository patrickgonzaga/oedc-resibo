export enum UtilityType {
  ELECTRIC = 'electric',
  WATER = 'water'
}

export interface Receipt {
  id: string;
  user_id: string;
  total_amount: number;
  consumption_kwh: number;
  billing_date: string;
  utility_type: UtilityType;
  image_url?: string | null;
  created_at?: string;
}

export interface ExtractedData {
  total: number;
  consumption: number;
  date: string;
  utilityType?: UtilityType;
}
