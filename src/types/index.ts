export interface UserProfile {
  id: string;
  email?: string;
  full_name?: string;
  created_at: string;
}

export enum UtilityType {
  ELECTRIC = 'electric',
  WATER = 'water'
}

export interface Receipt {
  id: string;
  user_id: string;
  image_url: string | null;
  total_amount: number;
  consumption_kwh: number;
  billing_date: string;
  utility_type: UtilityType;
  created_at: string;
}

export interface ExtractedData {
  total: number;
  consumption: number;
  date: string;
  utilityType?: UtilityType;
}
