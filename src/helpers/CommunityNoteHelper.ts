import { ITag } from "models/CommunityNote";

export const helpfulTag: ITag[] = [
  { label: "Cites high-quality sources", key: "helpful_good_sources" },
  { label: "Easy to understand", key: "helpful_clear" },
  {
    label: "Directly addresses the post’s claim",
    key: "helpful_addresses_claim",
  },
  { label: "Provides important context", key: "helpful_important_context" },
  { label: "Neutral or unbiased language", key: "helpful_unbiased_language" },
  { label: "Other", key: "helpful_other" },
];

export const unhelpfulTag: ITag[] = [
  {
    label: "Sources not included or unreliable",
    key: "not_helpful_sources_missing_or_unreliable",
  },
  {
    label: "Sources do not support note",
    key: "not_helpful_irrelevant_sources",
  },
  { label: "Incorrect information", key: "not_helpful_incorrect" },
  { label: "Opinion or speculation", key: "not_helpful_opinion_speculation" },
  { label: "Typos or unclear language", key: "not_helpful_hard_to_understand" },
  {
    label: "Misses key points or irrelevant",
    key: "not_helpful_missing_key_points",
  },
  {
    label: "Argumentative or biased language",
    key: "not_helpful_argumentative_or_biased",
  },
  { label: "Note not needed on this post", key: "not_helpful_note_not_needed" },
  { label: "Harassment or abuse", key: "not_helpful_spam_harassment_or_abuse" },
  { label: "Other", key: "not_helpful_other" },
];

export const emptyRating = {
  agree: 0,
  disagree: 0,
  helpful_other: 0,
  helpful_clear: 0,
  helpful_good_sources: 0,
  helpful_addresses_claim: 0,
  helpful_important_context: 0,
  helpful_unbiased_language: 0,
  not_helpful_other: 0,
  not_helpful_incorrect: 0,
  not_helpful_sources_missing_or_unreliable: 0,
  not_helpful_missing_key_points: 0,
  not_helpful_hard_to_understand: 0,
  not_helpful_argumentative_or_biased: 0,
  not_helpful_spam_harassment_or_abuse: 0,
  not_helpful_irrelevant_sources: 0,
  not_helpful_opinion_speculation: 0,
  not_helpful_note_not_needed: 0,
};

export const reportTypes: ITag[] = [
  { label: "Misinformation", key: "misinformation" },
  { label: "Phishing or Malware", key: "phishing_or_malware" },
  { label: "Exploits or Hacked", key: "exploits_or_hacked" },
  { label: "Impersonation", key: "impersonation" },
  { label: "Abuse or Violation", key: "abuse_or_violation" },
];

export const notMisleadingTags: ITag[] = [
  {
    label: "It expresses a personal opinion",
    key: "not_misleading_personal_opinion",
  },
  {
    label: "It is clearly satirical/joking",
    key: "not_misleading_clearly_satire",
  },
  {
    label: "This Tweet was correct when written, but is out of date now",
    key: "not_misleading_outdated_but_not_when_written",
  },
  {
    label: "It expresses a factually correct claim",
    key: "not_misleading_factually_correct",
  },
  {
    label: "Other",
    key: "not_misleading_other",
  },
];

export const misleadingTags: ITag[] = [
  {
    label: "It is a joke or satire that might be misinterpreted as a fact",
    key: "misleading_satire",
  },
  {
    label: "It presents an unverified claim as a fact",
    key: "misleading_unverified_claim_as_fact",
  },
  {
    label: "It is a misrepresentation or missing important context",
    key: "misleading_missing_important_context",
  },
  {
    label: "It contains outdated information that may be misleading",
    key: "misleading_outdated_information",
  },
  {
    label: "It contains a digitally altered photo or video",
    key: "misleading_manipulated_media",
  },
  {
    label: "It contains a factual error",
    key: "misleading_factual_error",
  },
  {
    label: "Other",
    key: "misleading_other",
  },
];

export const otherTags: ITag[] = [
  {
    label:
      "Did you link to sources you believe most people would consider trustworthy",
    key: "trustworthy_sources",
  },
];
