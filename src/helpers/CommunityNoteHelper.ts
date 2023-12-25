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
