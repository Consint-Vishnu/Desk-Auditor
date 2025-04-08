
import { SetStateAction } from 'react';
import apiClient from './apiClient';

export interface DeskAuditParams {
  start_date: string;
  end_date: string;
  trigger_type: string;
  page_no?: number;
  page_size?: number;
}

export interface DeskAuditItem {
  Id: any;
  TriggerType: any;
  ClaimIntimationAging: string;
  TatCompliance: string;
  DeskAuditReferralDate: string;
  ClaimStatus: string;
  FraudInvestigationDate: string;
  DateOfDischarge: any;
  FraudTrigger: any;
  DateOfAdmission: any;
  HitpaLocation: string;
  HospitalId: any;
  ClaimedDate: any;
  ClaimId: any;
  id: string;
  claim_number: string;
  member_id: string;
  member_name: string;
  hospital_name: string;
  admission_date: string;
  discharge_date: string;
  claim_amount: number;
  status: string;
  trigger_type: string;
  created_at: string;
  updated_at: string;
  // Add other fields based on actual API response
}

export interface DeskAuditResponse {
  total_rec: SetStateAction<number>;
  data: DeskAuditItem[];
  total: number;
  page: number;
  page_size: number;
  message: string;
  status: boolean;
}

export const fetchDeskAudits = async (params: DeskAuditParams): Promise<DeskAuditResponse> => {
  try {
    const response = await apiClient.get<DeskAuditResponse>('/desk-audit/', { 
      params: {
        start_date: params.start_date,
        end_date: params.end_date,
        // trigger_type: params.trigger_type,
        page_no: params.page_no || 1,
        page_size: params.page_size || 10
      } 
    });
    return response.data;
  } catch (error: any) {
    console.error('Error fetching desk audits:', error);
    throw new Error(error.response?.data?.message || 'Failed to fetch audit data');
  }
};
