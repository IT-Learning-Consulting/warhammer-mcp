# Resilience & Resolve Testing Guide

## Overview

This document outlines the test cases for the Resilience/Resolve system (Tests 4.6-4.10), which mirrors the Fortune/Fate system (Tests 4.1-4.5) in WFRP 4e.

## System Comparison

| Fortune/Fate System | Resilience/Resolve System |
|---------------------|---------------------------|
| **Fortune** = Daily refreshing points (luck) | **Resolve** = Daily refreshing points (determination) |
| **Fate** = Permanent points (destiny) | **Resilience** = Permanent points (inner strength) |
| Fortune max = Fate value | Resolve max = Resilience value |
| Visual: ●○ (Fortune), ★☆ (Fate) | Visual: ●○ (Resolve), ■□ (Resilience) |

## Test Case Mapping

### Fortune/Fate Tests → Resilience/Resolve Tests

| Test ID | Fortune/Fate Test | → | Test ID | Resilience/Resolve Test |
|---------|-------------------|---|---------|-------------------------|
| 4.1 | Add Fortune Point | → | 4.6 | Add Resolve Point |
| 4.2 | Spend Fortune Point | → | 4.7 | Spend Resolve Point |
| 4.3 | Add Fate Point (Rare) | → | 4.8 | Add Resilience Point (Rare) |
| 4.4 | Burn Fate Point | → | 4.9 | Spend Resilience Point |
| 4.5 | Refresh Fortune Points | → | 4.10 | Refresh Resolve Points |

---

## Test Case 4.6: Add Resolve Point

**Tool**: `foundry-add-resolve-point`

**Purpose**: Award bonus Resolve points for overcoming mental challenges or demonstrating exceptional willpower.

**Test Prompt**:
```
"Give Test Character 1 resolve point"
```

**Expected Results**:
- ✅ Resolve increased by 1
- ✅ Cannot exceed Resilience value
- ✅ Confirmation message with before/after values
- ✅ Guidance on when to award Resolve

**Success Criteria**: Resolve visible on character sheet and increased by 1

**Technical Details**:
- Updates: `system.status.resolve.value`
- Bounds check: `resolve.value <= resilience.value`
- Similar to: Test 4.1 (Add Fortune Point)

**Example Response**:
```
✨ Resolve Increased!
Test Character gains +1 Resolve point.

📊 Updated Status:
Previous: 2 Resolve (out of 3 max)
Current: 3 / 3 Resolve ●●●

🎯 When to Award Resolve:
- Overcoming psychological trauma
- Successfully resisting intimidation/manipulation
- Demonstrating exceptional self-control
- Acting courageously despite fear
```

---

## Test Case 4.7: Spend Resolve Point

**Tool**: `spend-resolve`

**Purpose**: Spend Resolve to ignore Psychology, ignore Critical Wounds, or remove Conditions.

**Test Prompt**:
```
"Test Character spends a resolve point to ignore Psychology effects from Fear"
```

**Expected Results**:
- ✅ Resolve decreased by 1
- ✅ Cannot go below 0
- ✅ Usage type logged (ignore-psychology, ignore-criticals, or remove-condition)
- ✅ Mechanical guidance provided

**Success Criteria**: Resolve reduced by 1

**Technical Details**:
- Updates: `system.status.resolve.value`
- Bounds check: `resolve.value >= 0`
- Usage types: ignore-psychology, ignore-criticals, remove-condition
- Similar to: Test 4.2 (Spend Fortune Point)

**Example Response**:
```
💪 Resolve Spent!
Test Character spends 1 Resolve point to ignore Psychology effects.

📊 Status:
Previous: 3 Resolve
Spent: 1 (ignore-psychology)
Remaining: 2 / 3 Resolve ●●○

🎯 Psychology Ignored:
For this scene, Test Character automatically passes all Psychology tests and ignores all Psychology-based conditions (Fear, Terror, etc.).
```

**Three Usage Types**:
1. **ignore-psychology**: Automatically pass Psychology tests (Fear, Terror) for scene
2. **ignore-criticals**: Ignore effects of one Critical Wound for round
3. **remove-condition**: Immediately remove one mental/psychological Condition

---

## Test Case 4.8: Add Resilience Point (Rare)

**Tool**: `foundry-add-resilience-point`

**Purpose**: Permanently increase Resilience for nourishing the soul through Motivation.

**Test Prompt**:
```
"Increase Test Character's resilience by 1 for nourishing their soul with their Motivation"
```

**Expected Results**:
- ✅ Resilience permanently increased
- ✅ Resolve maximum automatically increases to match
- ✅ Ceremonial/significant confirmation message
- ✅ Guidance on when to award Resilience

**Success Criteria**: Both Resilience and max Resolve increase

**Technical Details**:
- Updates: `system.status.resilience.value` (permanent)
- Updates: `system.status.resilience.max` (permanent)
- Implicit: Resolve max now = new Resilience value
- Similar to: Test 4.3 (Add Fate Point)

**Example Response**:
```
🌟✨ RESILIENCE INCREASED ✨🌟

Test Character's soul grows stronger!
Their inner strength deepens through acts that nourish their Motivation.

📊 Permanent Increase:
Previous Resilience: 3 → New Resilience: 4 ■■■■
Resolve Maximum: 3 → 4

💎 What This Means:
- Resilience is PERMANENT - represents core inner strength
- Resolve max increases to match Resilience (now 4)
- This is an EXTREMELY RARE reward

🎯 When to Award Resilience:
- Acting on Motivation with profound personal cost
- Overcoming defining character trauma
- Completing personal quest of deep meaning
- Major character growth moments (1-2 times per campaign)
```

---

## Test Case 4.9: Spend Resilience Point

**Tool**: `spend-resilience`

**Purpose**: Permanently spend Resilience to deny Chaos mutations or auto-succeed critical tests.

**Test Prompt**:
```
"Test Character spends a resilience point to deny a Chaos mutation"
```

**Expected Results**:
- ✅ Resilience permanently reduced by 1
- ✅ Resolve maximum permanently reduced to match
- ✅ Dramatic confirmation message
- ✅ Usage type logged (deny-mutation or auto-succeed)

**Success Criteria**: Permanent reduction recorded

**Technical Details**:
- Updates: `system.status.resilience.value` (permanent decrease)
- Updates: `system.status.resilience.max` (permanent decrease)
- Implicit: Resolve max now = new Resilience value
- Usage types: deny-mutation, auto-succeed
- Similar to: Test 4.4 (Burn Fate Point)

**Example Response**:
```
⚡💀 RESILIENCE SPENT - "I DENY YOU!" 💀⚡

Test Character burns their inner strength to defy Chaos!

📊 Permanent Cost:
Previous: Resilience 4/4 ■■■■
New: Resilience 3/3 ■■■□
Resolve Maximum: 4 → 3 (permanently reduced)

🎯 Effect:
Test Character denies the Chaos mutation!
Their willpower proves stronger than corruption - this time.

⚠️ PERMANENT CONSEQUENCES:
- Resilience reduced permanently from 4 to 3
- Maximum Resolve also permanently reduced to 3
- This cannot be undone through normal means
- Physical/mental scars may remain (GM discretion)
```

**Two Usage Types**:
1. **deny-mutation**: Automatically resist one Chaos mutation (spend before rolling)
2. **auto-succeed**: Automatically succeed one critical Test (declare "I Will Not Fail!")

---

## Test Case 4.10: Refresh Resolve Points

**Tool**: `refresh-resolve`

**Purpose**: Restore Resolve to maximum by acting on Motivation.

**Test Prompt**:
```
"Test Character refreshes their resolve points by acting on their Motivation"
```

**Expected Results**:
- ✅ Resolve restored to maximum (Resilience value)
- ✅ Confirmation message
- ✅ Thematic messaging about Motivation
- ✅ Guidance on when Resolve refreshes

**Success Criteria**: Resolve refreshed to maximum

**Technical Details**:
- Updates: `system.status.resolve.value = resilience.value`
- Refresh condition: Acting meaningfully on Motivation
- Similar to: Test 4.5 (Refresh Fortune Points)

**Example Response**:
```
🌅 Resolve Refreshed Through Motivation!

Test Character acts on their Motivation and renews their determination.

📊 Status:
Previous: 1 Resolve ●○○
Refreshed: 3 / 3 Resolve ●●●

💎 Motivation Fulfilled:
By pursuing what drives them, Test Character regains their sense of purpose and inner strength.

🎯 When Resolve Refreshes:
- Acting meaningfully on Motivation
- Between sessions (GM discretion)
- After significant rest/personal time
- Completing personal goals aligned with Motivation

Note: Unlike Fortune (daily), Resolve refreshes through PURPOSE, not rest.
```

---

## Testing Strategy

### Pre-Test Setup
1. Verify Test Character has:
   - Starting Resilience: 3
   - Starting Resolve: 3 (or below 3)
2. Record baseline values
3. Test in sequence (4.6 → 4.10)

### Test Sequence

**Phase 1: Add and Spend (Daily Pool)**
1. **Test 4.6**: Add 1 Resolve → verify increase (3→4 if Resilience is 4+)
2. **Test 4.7**: Spend 1 Resolve → verify decrease

**Phase 2: Permanent Changes**
3. **Test 4.8**: Add 1 Resilience → verify both Resilience and max Resolve increase
4. **Test 4.9**: Spend 1 Resilience → verify permanent reduction of both

**Phase 3: Refresh Mechanic**
5. **Test 4.10**: Refresh Resolve → verify restore to Resilience value

### Validation Checks

For each test, verify in Foundry VTT:
- [ ] Character sheet shows correct Resolve value
- [ ] Character sheet shows correct Resilience value
- [ ] Visual indicators match (●○ for Resolve, ■□ for Resilience)
- [ ] Changes persist after browser refresh
- [ ] Tool responses include appropriate narrative/guidance

### Edge Cases to Test

1. **Resolve at Maximum**: Try adding Resolve when already at max
2. **Resolve at Zero**: Try spending Resolve when at 0
3. **Resilience at 1**: Try spending Resilience when only 1 remains
4. **Refresh at Maximum**: Refresh when Resolve already equals Resilience

---

## Expected Tool Responses

### Success Patterns
All tools should provide:
- ✅ Clear status change (before → after)
- ✅ Visual indicators (●○ for Resolve, ■□ for Resilience)
- ✅ Current/max display (e.g., "2 / 3 Resolve")
- ✅ Mechanical guidance for usage
- ✅ Thematic/narrative context
- ✅ GM advice on when to use/award

### Error Patterns
Tools should catch and report:
- ❌ Cannot add Resolve beyond Resilience maximum
- ❌ Cannot spend Resolve when at 0
- ❌ Cannot spend Resilience when at 0 (would break character)

---

## Key Differences: Fortune vs Resolve

| Aspect | Fortune | Resolve |
|--------|---------|---------|
| **Refresh Condition** | Good night's rest (daily) | Acting on Motivation (story-driven) |
| **Primary Use** | Reroll tests, add SL | Ignore Psychology, resist effects |
| **Thematic Focus** | Luck and destiny | Willpower and determination |
| **Spent On** | Test outcomes | Mental/psychological effects |
| **Permanent Points** | Fate (survive death) | Resilience (deny Chaos, auto-succeed) |

---

## Tools Summary

### Resilience/Resolve Tools (6 total)

1. **get-resilience-resolve-status** - Check current values
2. **spend-resolve** - Spend daily pool (3 usage types)
3. **spend-resilience** - Permanently spend (2 usage types)
4. **refresh-resolve** - Restore via Motivation
5. **foundry-add-resolve-point** - Award bonus Resolve
6. **foundry-add-resilience-point** - Award permanent Resilience

### Fortune/Fate Tools (6 total - for comparison)

1. **get-fortune-fate-status** - Check current values
2. **spend-fortune** - Spend daily pool
3. **burn-fate** - Permanently spend to survive death
4. **refresh-fortune** - Restore via rest
5. **foundry-add-fortune-point** - Award bonus Fortune
6. **foundry-add-fate-point** - Award permanent Fate

---

## Test Results Template

Use this template in `test/test_results.md`:

```markdown
## fate-resilience.ts

Test ID: 4.6
Test Name: Add Resolve Point
Date Tested: [DATE]
Tester: [NAME]
Claude Desktop Version: [VERSION]
Foundry VTT Version: [VERSION]
WFRP4e System Version: [VERSION]
Status: [ ] Pass [ ] Fail [ ] Partial

Results:
[What happened]

Issues Found:
[Any problems]

Error Messages:
[Copy errors if any]

Notes:
[Additional observations]

---
```

**END OF DOCUMENT**
