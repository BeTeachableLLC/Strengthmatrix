# Agents

## Review gate

All agent work in this repository follows the **three-LLM review gate** and usage routing in [`.cursor/rules/review-gate.mdc`](.cursor/rules/review-gate.mdc) (MOE APPROVED 2026-11-20). Tier 0 documentation changes use CI plus one Grok round; code and Tier 2 areas use the full gate described there.

Composer is Author and Reviewer A only; Reviewer B is grok-4.7-medium only (second model family). Under the kill switch only, for the affected area, the retired seats are re-enabled (Seat 4 grok-4.7-high, Seat 5 cursor-grok-4.6-medium) with the full five-seat roster and packet in moe-os `templates/FIVE_LLM_CODE_VERIFICATION.md` (Kill-switch use only section); outside the kill switch they stay retired. A fix commit made under the round rules is re-verified by the delta-only fix review on that new head; any other new commit voids prior reviews and needs the full two-reviewer gate.