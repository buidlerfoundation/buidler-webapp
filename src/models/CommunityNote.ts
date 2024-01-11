import { IFCUser, IMetadataUrl } from "./FC";

export interface INote {
  id: string;
  participant_id: string;
  url: string;
  classification?: string;
  misleading_other: number;
  misleading_factual_error: number;
  misleading_manipulated_media: number;
  misleading_outdated_information: number;
  misleading_missing_important_context: number;
  misleading_unverified_claim_as_fact: number;
  misleading_satire: number;
  not_misleading_other: number;
  not_misleading_factually_correct: number;
  not_misleading_outdated_but_not_when_written: number;
  not_misleading_clearly_satire: number;
  not_misleading_personal_opinion: number;
  trustworthy_sources: number;
  summary?: string;
  is_media_note?: number;
  final_rating_status?: string;
  created_at: string;
  updated_at: string;
  rating?: IRating;
}

export interface IRating {
  note_id: string;
  participant_id: string;
  agree: number;
  disagree: number;
  helpfulness_level?: string;
  helpful_other: number;
  helpful_clear: number;
  helpful_good_sources: number;
  helpful_addresses_claim: number;
  helpful_important_context: number;
  helpful_unbiased_language: number;
  not_helpful_other: number;
  not_helpful_incorrect: number;
  not_helpful_sources_missing_or_unreliable: number;
  not_helpful_missing_key_points: number;
  not_helpful_hard_to_understand: number;
  not_helpful_argumentative_or_biased: number;
  not_helpful_spam_harassment_or_abuse: number;
  not_helpful_irrelevant_sources: number;
  not_helpful_opinion_speculation: number;
  not_helpful_note_not_needed: number;
  created_at: string;
  updated_at: string;
}

export interface ITag {
  label: string;
  key: string;
}

export interface IReportCategory {
  id: string;
  name: string;
  code: string;
}

export interface ILinkMetadata {
  metadata_id: string;
  url: string;
  domain: string;
  hostname: string;
  data: IMetadataUrl;
}

export interface IReport {
  id: string;
  url: string;
  content?: string;
  created_at: string;
  updated_at: string;
  metadata: ILinkMetadata;
  relation_categories: IReportCategory[];
}

export interface IDashboardLink {
  url: string;
  metadata: ILinkMetadata;
  note?: INote;
  report_categories?: IReportCategory[];
  total_notes?: number;
  total_reports?: number;
}
