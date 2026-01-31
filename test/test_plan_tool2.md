# Career Advancement Tools Test Plan

**Date**: January 30, 2026  
**Tester**: Claude (Automated)  
**Scope**: Test Cases 2.1 - 2.40 (Career Advancement Tools)  
**Test Character**: To be identified from Foundry

---

## Pre-Test Setup

Before executing tests, the following must be verified:
1. [ ] Foundry VTT is running on port 30000
2. [ ] MCP connection is active
3. [ ] Test character exists with basic stats
4. [ ] Character has at least one career marked as "current"
5. [ ] Character has 5000+ available XP (for advancement tests)
6. [ ] Character has skills (Melee (Basic), Dodge, Perception, etc.)
7. [ ] Character has some talents for testing

---

## XP Cost Reference

### Skill Advancement Costs
| Advances | Tier | XP Cost per Advance |
|----------|------|---------------------|
| 0-4 | 0 | 10 XP |
| 5-9 | 1 | 15 XP |
| 10-14 | 2 | 20 XP |
| 15-19 | 3 | 30 XP |
| 20-24 | 4 | 40 XP |
| 25+ | 5+ | 50+ XP |

**Formula**: `(Math.floor(currentAdvances / 5) + 1) × 5`

### Characteristic Advancement Costs (In-Career)
| Advances | Tier | XP Cost per Advance |
|----------|------|---------------------|
| 0-4 | 0 | 25 XP |
| 5-9 | 1 | 30 XP |
| 10-14 | 2 | 40 XP |
| 15-19 | 3 | 50 XP |
| 20+ | 4 | 70 XP |

**Out-of-Career**: Add 5 XP to each cost (30/35/45/55/75)

### Other Costs
- **Talent**: 100 XP (base) + 100 XP per rank already owned
- **Career Change (Complete)**: 100 XP
- **Career Change (Incomplete)**: 200 XP

---

## Test Execution Plan

### Phase 1: Basic Advancement (2.1 - 2.4)

| Test | Description | Prerequisites |
|------|-------------|---------------|
| 2.1 | Advance Characteristic (XP-Based) | Character has XP |
| 2.2 | Advance Skill | Character has skill, XP |
| 2.3 | Insufficient XP | Character has less XP than needed |
| 2.4 | Career Change | Character has career, 200+ XP |

### Phase 2: Skill Tier Testing (2.5 - 2.13)

| Test | Description | Prerequisites |
|------|-------------|---------------|
| 2.5 | Advance Skill - First Advance | Skill at 0 advances |
| 2.6 | Advance Skill - Tier Boundary (5th) | Skill at 4 advances |
| 2.7 | Advance Skill - Tier Boundary (6th) | Skill at 5 advances |
| 2.8 | Advance Skill - Tier 2 (11th) | Skill at 10 advances |
| 2.9 | Advance Skill - Tier 3 (16th) | Skill at 15 advances |
| 2.10 | Advance Skill - Tier 4 (21st) | Skill at 20 advances |
| 2.11 | Advance Multiple Skills | Character has 3+ skills |
| 2.12 | Advance Skill - Insufficient XP | Set XP to 3, need 10 XP |
| 2.13 | Advance Skill - Exact XP Amount | Set XP to exact amount |

### Phase 3: Characteristic Advancement (2.14 - 2.18)

| Test | Description | Prerequisites |
|------|-------------|---------------|
| 2.14 | Advance Characteristic - In-Career | Characteristic in career |
| 2.15 | Advance Characteristic - Out-of-Career | Characteristic not in career |
| 2.16 | Advance Characteristic - Tier Boundaries | Test tiers 0,1,2 |
| 2.17 | Advance Characteristic - Multiple Advances | Request multiple advances |
| 2.18 | Advance Characteristic - Insufficient XP | Set XP below requirement |

### Phase 4: Talent Advancement (2.19 - 2.20)

| Test | Description | Prerequisites |
|------|-------------|---------------|
| 2.19 | Advance Talent - Basic Talent | Character has 100+ XP |
| 2.20 | Advance Talent - Already Owned | Character has talent |

### Phase 5: Career Management (2.21 - 2.27)

| Test | Description | Prerequisites |
|------|-------------|---------------|
| 2.21 | Career Change - Incomplete Career | Career not complete, 200+ XP |
| 2.22 | Career Change - Complete Career | Career complete, 100+ XP |
| 2.23 | Career Change - Insufficient XP | Less than 100 XP |
| 2.24 | Career Change - Career Not Found | Invalid career name |
| 2.25 | Career Change - No Current Career | Remove current flag first |
| 2.26 | Get Career Advancement Progress | Character has career |
| 2.27 | Get Career Advancement Costs | Character has career |

### Phase 6: Integration Tests (2.28 - 2.32)

| Test | Description | Prerequisites |
|------|-------------|---------------|
| 2.28 | XP Calculation Verification | Test multiple tier costs |
| 2.29 | Full Career Progression Flow | Complete workflow test |
| 2.30 | Career Change Workflow | Multi-step career change |
| 2.31 | Multi-Tier Skill Advancement | Advance 0→11 |
| 2.32 | XP Management Flow | Track XP through advances |

### Phase 7: Technical Validation (2.33 - 2.40)

| Test | Description | Prerequisites |
|------|-------------|---------------|
| 2.33 | UUID Construction for Career Change | Technical verification |
| 2.34 | Career Completion Status Check | Test completion detection |
| 2.35 | In-Career vs Out-of-Career Detection | Verify cost difference |
| 2.36 | Advances vs Initial Separation | Verify data structure |
| 2.37 | Concurrent Advancement Prevention | Test race conditions |
| 2.38 | Career History Preservation | Verify old careers kept |
| 2.39 | XP Total Recalculation | Verify XP accounting |
| 2.40 | Maximum Advancement Limits | Test high advance levels |

---

## Comprehensive Test Execution Plan - Career Advancement Tools (Tests 2.1-2.40)

### Test Execution Strategy

**Character State Management**
- **Character**: Test Character (ETtf7pzbyuNUzy8Q)
- **Initial XP**: 5000
- **Approach**: Sequential testing with state preservation (no resets between tests except where explicitly needed)
- **XP Tracking**: Document XP before/after each test for verification

---

### Phase 1: Basic Advancement (2.1-2.4)

#### Test 2.1: Advance Characteristic (XP-Based)
**Setup**: None (use current state)

**Execution**:
1. Get current WS advances (currently 5)
2. Call `advance-characteristic` with `characteristic: "ws"`
3. Verify advances increased by 1
4. Verify XP deducted based on tier formula

**XP Calculation**:
- Current advances: 5 → Tier 1 (advances 5-9)
- Expected cost: 30 XP in-career

---

#### Test 2.2: Advance Skill
**Setup**: None (use current Melee Basic at 15 advances)

**Execution**:
1. Call `advance-skill` with `skillName: "Melee (Basic)"`
2. Verify advances increased by 1 (15→16)
3. Verify XP deducted

**XP Calculation**:
- Current advances: 15 → Tier 3 (advances 15-19)
- Expected cost: 30 XP

---

#### Test 2.3: Insufficient XP
**Setup**:
1. Get current XP
2. Calculate XP needed to reduce to 3 XP
3. Use `foundry-add-experience-log-entry` with negative amount (`type: "total"`) to reduce total XP
4. Verify current XP = 3

**Execution**:
1. Attempt `advance-skill` with any skill (cost will be 10-40 XP)
2. Should receive error about insufficient XP
3. Verify no changes to skill advances

**Cleanup**: Add back the XP removed (use positive amount, `type: "total"`)

---

#### Test 2.4: Career Change
**Setup**: Verify current career is "Recruit" with `current: true` flag

**Execution**:
1. Call `change-career` with `newCareerName: "Soldier"` (PC career)
2. Verify XP deducted (200 XP for incomplete career)
3. Check career items list
4. Verify old career preserved
5. Verify new career marked as current

**Expected**:
- New career added from wfrp4e-core.careers (NOT NPC template)
- Old career kept with `current: false`
- Career advancement shows new career as current

---

### Phase 2: Skill Tier Testing (2.5-2.13)

**Note**: Tests 2.5-2.10 form a sequential progression testing tier boundaries. Will use a fresh skill (Stealth) starting at 0 advances to test cumulative XP costs.

#### Test 2.5: Advance Skill - First Advance (Tier 0, advance 0→1)
**Setup**:
1. Use `foundry-update-skill-talent` to set Stealth advances to 0
2. Note starting XP

**Execution**:
1. Call `advance-skill` with `skillName: "Stealth"`, `advances: 1`
2. Verify advances 0→1
3. Verify XP cost: 10 XP (Tier 0)

**Cumulative XP from 0**: 10 XP total

---

#### Test 2.6: Advance Skill - Tier Boundary (5th Advance, still Tier 0)
**Setup**: Continue from 2.5 (Stealth at 1 advance)

**Execution**:
1. Call `advance-skill` with `skillName: "Stealth"`, `advances: 4`
2. Verify advances 1→5
3. Verify XP cost: 4 × 10 = 40 XP (still Tier 0)

**Cumulative XP from 0**: 10 + 40 = 50 XP total

**Verification**: Message should indicate next advance enters Tier 1

---

#### Test 2.7: Advance Skill - Tier Boundary (6th Advance, entering Tier 1)
**Setup**: Continue from 2.6 (Stealth at 5 advances)

**Execution**:
1. Call `advance-skill` with `skillName: "Stealth"`, `advances: 1`
2. Verify advances 5→6
3. Verify XP cost: 15 XP (Tier 1)

**Cumulative XP from 0**: 50 + 15 = 65 XP total

**Verification**: Message should indicate "Entered Tier 1"

---

#### Test 2.8: Advance Skill - Tier 2 (11th Advance)
**Setup**: Continue from 2.7 (Stealth at 6 advances)

**Execution**:
1. Call `advance-skill` with `skillName: "Stealth"`, `advances: 5`
2. Verify advances 6→10 (cost: 5 × 15 = 75 XP)
3. Then call `advance-skill` with `advances: 1`
4. Verify advances 10→11
5. Verify XP cost for 11th advance: 20 XP (Tier 2, NOT 220 XP)

**Cumulative XP from 0**: 65 + 75 + 20 = 160 XP total

**Critical**: This verifies bug fix - should cost 20 XP, not 220 XP

---

#### Test 2.9: Advance Skill - Tier 3 (16th Advance)
**Setup**: Continue from 2.8 (Stealth at 11 advances)

**Execution**:
1. Call `advance-skill` with `advances: 5`
2. Verify advances 11→15 (cost: 5 × 20 = 100 XP)
3. Then call `advance-skill` with `advances: 1`
4. Verify advances 15→16
5. Verify XP cost: 30 XP (Tier 3)

**Cumulative XP from 0**: 160 + 100 + 30 = 290 XP total

---

#### Test 2.10: Advance Skill - Tier 4 (21st Advance)
**Setup**: Continue from 2.9 (Stealth at 16 advances)

**Execution**:
1. Call `advance-skill` with `advances: 5`
2. Verify advances 16→20 (cost: 5 × 30 = 150 XP)
3. Then call `advance-skill` with `advances: 1`
4. Verify advances 20→21
5. Verify XP cost: 40 XP (Tier 4)

**Cumulative XP from 0**: 290 + 150 + 40 = 480 XP total

**Verification**: Should show warning about high skill level

---

#### Test 2.11: Advance Multiple Skills
**Setup**: Identify 3 skills at different tiers (e.g., Gamble at 0, Charm at 0, Navigation at 0)

**Execution**:
1. Call `advance-skill` for Gamble (`advances: 1`)
2. Call `advance-skill` for Charm (`advances: 1`)
3. Call `advance-skill` for Navigation (`advances: 1`)
4. Verify all three advanced by 1
5. Verify individual XP costs calculated (3 × 10 = 30 XP total if all Tier 0)

---

#### Test 2.12: Advance Skill - Insufficient XP
**Setup**:
1. Save current XP
2. Set XP to 3 using `foundry-add-experience-log-entry` (negative total)

**Execution**:
1. Attempt `advance-skill` on any skill (needs 10+ XP)
2. Should receive "Insufficient XP" error
3. Verify skill advances unchanged

**Cleanup**: Restore XP

---

#### Test 2.13: Advance Skill - Exact XP Amount
**Setup**:
1. Save current XP
2. Calculate XP needed for 1 skill advance (e.g., 10 XP for Tier 0)
3. Set total XP to exactly that amount

**Execution**:
1. Call `advance-skill` with skill at Tier 0
2. Should succeed
3. Verify XP goes to 0
4. Message: "All available XP spent"

**Cleanup**: Restore XP

---

### Phase 3: Characteristic Advancement (2.14-2.18)

#### Test 2.14: Advance Characteristic - In-Career
**Setup**: Identify in-career characteristic (check current career characteristics)

**Execution**:
1. Get current career advancement to identify in-career characteristics
2. Advance an in-career characteristic (e.g., WS, S, T for Soldier)
3. Verify cost is lower (25 XP base for Tier 0)

---

#### Test 2.15: Advance Characteristic - Out-of-Career
**Setup**: Identify out-of-career characteristic (e.g., Int, Fel)

**Execution**:
1. Advance an out-of-career characteristic
2. Verify cost is higher (30 XP base for Tier 0)
3. Verify 5 XP difference from in-career

---

#### Test 2.16: Advance Characteristic - Tier Boundaries
**Multi-Step Test**:

**Step 1**: Reset BS to 0 advances using `foundry-update-skill-talent`
- Advance BS 0→1: Expected 25 XP (in-career Tier 0)
- Cumulative: 25 XP

**Step 2**:
- Advance BS 1→4 (3 more advances): Expected 3 × 25 = 75 XP
- Cumulative: 100 XP

**Step 3**:
- Advance BS 4→5: Expected 25 XP (still Tier 0)
- Cumulative: 125 XP

**Step 4**:
- Advance BS 5→6: Expected 30 XP (Tier 1)
- Cumulative: 155 XP

**Step 5**:
- Advance BS 6→10 (4 advances): Expected 4 × 30 = 120 XP
- Cumulative: 275 XP

**Step 6**:
- Advance BS 10→11: Expected 40 XP (Tier 2)
- Cumulative: 315 XP

**Verification**: All tier transitions clear, costs match formula

---

#### Test 2.17: Advance Characteristic - Multiple Advances
**Setup**: Choose characteristic at 0 advances

**Execution**:
1. Call `advance-characteristic` with `advances: 3`
2. Verify 3 advances applied at once
3. Verify total XP cost (3 × 25 = 75 if Tier 0 in-career)

---

#### Test 2.18: Advance Characteristic - Insufficient XP Mid-Advancement
**Setup**:
1. Save current XP
2. Set XP to exactly 60

**Execution**:
1. Attempt `advance-characteristic` with `advances: 3` (needs 75 XP)
2. Should receive "Insufficient XP" error
3. Verify NO partial advances applied (all-or-nothing)

**Cleanup**: Restore XP

---

### Phase 4: Talent Advancement (2.19-2.20)

#### Test 2.19: Advance Talent - Basic Talent
**Setup**: Ensure character doesn't have "Strong Back" talent

**Execution**:
1. Call `add-skill-talent` with `itemName: "Strong Back"`, `itemType: "talent"`
2. Verify talent added from compendium
3. Verify XP deducted (100 XP)
4. Verify talent appears in talents list with effects

---

#### Test 2.20: Advance Talent - Already Owned
**Setup**: Character already has "Diceman" talent

**Execution**:
1. Attempt `advance-talent` with `talentName: "Diceman"`
2. Should either:
   - Error: "Already has this talent", OR
   - Increase rank by 1 (if talent supports ranks)
3. Verify appropriate XP cost (100 XP for rank 2)

---

### Phase 5: Career Management (2.21-2.27)

#### Test 2.21: Career Change - Incomplete Career
**Setup**:
1. Verify current career (Soldier from test 2.4) is NOT complete
2. Check career advancement progress < 100%

**Execution**:
1. Call `change-career` with `newCareerName: "Sergeant"`
2. Verify XP cost: 200 XP (incomplete penalty)
3. Verify warning message about incomplete career
4. Verify new career added, old preserved

---

#### Test 2.22: Career Change - Complete Career
**Setup**:
1. Complete current career by advancing all required characteristics/skills/talents
2. Use `get-career-advancement` to identify remaining advances
3. Purchase all remaining advances until career shows 100% complete

**Execution**:
1. Call `change-career` with `newCareerName: "Knight"`
2. Verify XP cost: 100 XP (completion discount)
3. Verify message: "Completed career - reduced cost"
4. Verify both careers in history

---

#### Test 2.23: Career Change - Insufficient XP
**Setup**:
1. Save current XP
2. Set XP to 50

**Execution**:
1. Attempt `change-career` to any career
2. Should receive "Insufficient XP" error (need 100/200)
3. Verify no changes made

**Cleanup**: Restore XP

---

#### Test 2.24: Career Change - Career Not Found
**Execution**:
1. Call `change-career` with `newCareerName: "NonExistentCareerXYZ"`
2. Should receive error: "Career not found in compendium"
3. Suggestions shown (if available)
4. No changes made

---

#### Test 2.25: Career Change - No Current Career
**Setup**:
- This test may not be executable if we can't remove current flag
- Alternative: Verify current career detection works by checking `get-career-advancement`

**Execution (if possible)**:
1. Manually remove current flag from all careers (if tool available)
2. Attempt `change-career`
3. Should receive "No current career found" error

**Alternative**: Document that current career detection is working based on previous tests

---

#### Test 2.26: Get Career Advancement Progress
**Execution**:
1. Call `get-career-advancement` with characterName
2. Verify shows:
   - Current career name
   - Career level
   - Characteristics progress (which ones, advances in each)
   - Skills progress (advances in each)
   - Talents acquired
   - Completion percentage
   - XP spent on career

---

#### Test 2.27: Get Career Advancement Costs
**Execution**:
1. Call `get-career-advancement` with characterName
2. Verify shows:
   - Available advances with costs
   - Characteristics (25 XP in-career shown)
   - Skills (tier costs shown)
   - Talents (100 XP shown)
   - Total XP needed for full completion
   - Current XP available
   - Recommendations

---

### Phase 6: Integration Tests (2.28-2.32)

#### Test 2.28: XP Calculation Verification
**Multi-Step Verification**:

**Step 1**: Use fresh skill (Animal Care at 3 advances)
- Reset to 0 advances
- Advance 0→1: Verify 10 XP (Tier 0)

**Step 2**:
- Advance to 5 total advances
- Verify cumulative cost: 5 × 10 = 50 XP

**Step 3**:
- Advance 5→6: Verify 15 XP (Tier 1)

**Step 4**:
- Advance to 10 total advances
- Verify cost from 6→10: 5 × 15 = 75 XP

**Step 5**:
- Advance 10→11: Verify 20 XP (Tier 2, NOT 220 XP bug)

**Step 6**:
- Advance to 15 total
- Verify cost from 11→15: 5 × 20 = 100 XP

**Step 7**:
- Advance 15→16: Verify 30 XP (Tier 3)

**Step 8**:
- Advance to 20 total
- Verify cost from 16→20: 5 × 30 = 150 XP

**Step 9**:
- Advance 20→21: Verify 40 XP (Tier 4)

**Verification**: All costs match formula `(Math.floor(advances / 5) + 1) × 5`

---

#### Test 2.29: Full Career Progression Flow
**Multi-Step Workflow**:
1. Call `get-career-advancement` → Record current state
2. Call `advance-characteristic` for in-career characteristic → Verify XP deduction
3. Call `advance-skill` for career skill → Verify XP deduction
4. Call `advance-skill` for another career skill → Verify XP deduction
5. Call `add-skill-talent` for career talent → Verify XP deduction
6. Call `get-career-advancement` → Verify progress increased
7. Compare XP: Initial - (sum of costs) = Final

**Verification**: All changes persist, XP tracking accurate

---

#### Test 2.30: Career Change Workflow
**Multi-Step Workflow**:
1. Call `get-career-advancement` → Record Soldier career progress
2. Complete all remaining advances (loop through each required advance)
3. Call `get-career-advancement` → Verify career shows complete
4. Call `change-career` to Sergeant → Verify 100 XP cost
5. Call `get-character` → Verify both careers in items list
6. Verify Soldier has `current: false`, Sergeant has `current: true`

---

#### Test 2.31: Multi-Tier Skill Advancement
**Setup**: Use fresh skill (Evaluate at 5 advances)
- Reset to 0 advances

**Execution**:
1. Call `advance-skill` with `advances: 11`
2. Should process all 11 advances in one call
3. Verify final advances: 11
4. Verify XP cost:
   - Tier 0 (0-4): 5 × 10 = 50 XP
   - Tier 1 (5-9): 5 × 15 = 75 XP
   - Tier 2 (10): 1 × 20 = 20 XP
   - **Total**: 145 XP

---

#### Test 2.32: XP Management Flow
**Multi-Step XP Tracking**:
1. Call `get-character` → Record initial XP (e.g., 500)
2. Call `advance-characteristic` (WS) → Record XP after (e.g., 500-25=475)
3. Call `get-character` → Verify XP = 475
4. Call `advance-skill` (Melee Basic) → Record XP after (e.g., 475-10=465)
5. Call `get-character` → Verify XP = 465
6. Call `add-skill-talent` → Record XP after (e.g., 465-100=365)
7. Call `get-character` → Verify XP = 365
8. Verify all XP: total unchanged, spent increased, current = total - spent

---

### Phase 7: Technical Validation (2.33-2.40)

#### Test 2.33: UUID Construction for Career Change
**Setup**: Create new test for career change

**Execution**:
1. Call `change-career` to a known PC career (e.g., "Soldier")
2. Call `get-character` to examine items list
3. Inspect career item added:
   - Verify `type = "career"` (not "template")
   - Verify ID format matches Foundry pattern
   - Check description/source for compendium reference
   - Should reference `Compendium.wfrp4e-core.careers.*` NOT NPC packs

**Verification**: Career from correct PC compendium

---

#### Test 2.34: Career Completion Status Check
**Multi-Step**:

**Step 1**: Get character with partial career
- Call `get-career-advancement`
- Verify shows progress < 100% (incomplete)

**Step 2**: Attempt career change
- Call `change-career`
- Verify XP cost: 200 XP (incomplete penalty)

**Step 3**: Complete the career
- Purchase all remaining advances
- Call `get-career-advancement`
- Verify shows progress = 100% (complete)

**Step 4**: Attempt career change from complete career
- Call `change-career` to different career
- Verify XP cost: 100 XP (completion discount)

**Verification**: Completion detection affects XP cost correctly

---

#### Test 2.35: In-Career vs Out-of-Career Detection
**Multi-Step**:

**Step 1**: Identify in-career characteristic
- Call `get-career-advancement`
- Note which characteristics are in career

**Step 2**: Advance in-career characteristic at Tier 0
- Call `advance-characteristic` for in-career (e.g., WS for Soldier)
- Record XP cost (should be 25 XP)

**Step 3**: Advance out-of-career characteristic at Tier 0
- Call `advance-characteristic` for out-of-career (e.g., Int for Soldier)
- Record XP cost (should be 30 XP)

**Step 4**: Verify difference
- Cost difference = 5 XP
- Confirms in-career vs out-of-career detection working

---

#### Test 2.36: Advances vs Initial Separation
**Execution**:
1. Call `get-character`
2. Examine any characteristic (e.g., WS)
3. Verify structure shows:
   - `initial`: [base value]
   - `advances`: [xp purchases]
   - `value`: [calculated total]
4. Advance characteristic by 1
5. Call `get-character` again
6. Verify `initial` unchanged, `advances` increased by 1

**Verification**: Data structure correct

---

#### Test 2.37: Concurrent Advancement Prevention
**Execution**:
1. Record current XP
2. Make two simultaneous `advance-skill` calls in parallel
3. Wait for both to complete
4. Examine results:
   - If both show same "Remaining XP": FAIL (race condition)
   - If second shows lower XP: PASS (sequential processing)
5. Call `get-character` to verify final XP
6. Calculate: Initial - (cost1 + cost2) should = Final

**Verification**: No duplicate XP spending

---

#### Test 2.38: Career History Preservation
**Multi-Step**:

**Step 1**: Note starting careers
- Call `get-character`
- Count careers in items list
- Note which is marked `current: true`

**Step 2**: Change career
- Call `change-career` to new career
- Record career change confirmation

**Step 3**: Verify preservation
- Call `get-character`
- Check items list for career items
- Should have:
  - Old career with `current: false`
  - New career with `current: true`
  - Count should be +1 from start

**Verification**: History preserved

---

#### Test 2.39: XP Total Recalculation
**Execution**:
1. Call `get-character`
2. Extract XP values:
   - `details.experience.total` (lifetime)
   - `details.experience.spent` (total spent)
   - `details.experience.current` (available)
3. Verify: `current = total - spent`
4. Make several advances
5. Call `get-character` again
6. Verify formula still holds
7. Verify `total` unchanged, `spent` increased, `current` decreased

**Verification**: XP accounting accurate

---

#### Test 2.40: Maximum Advancement Limits
**Multi-Step**:

**Step 1**: Choose fresh skill
- Use Lore (Reikland) at 3 advances
- Record starting XP

**Step 2**: Advance to 30
- Call `advance-skill` with `advances: 27` (from 3→30)
- Verify advances = 30
- Record XP spent

**Step 3**: Advance to 35
- Call `advance-skill` with `advances: 5` (from 30→35)
- Verify advances = 35 (NOT going backwards)
- Record XP spent
- Verify tier costs applied correctly (Tier 6+)

**Step 4**: Verify no rollback
- Call `get-character`
- Confirm skill at 35 advances
- No data corruption

**Verification**: High advances work correctly, no backwards movement

---

### Summary Statistics

- **Total Tests**: 40
- **Requires Setup**: 25 tests
- **Multi-Step**: 10 tests
- **Simple Execution**: 5 tests

**Tools Required**:
- `advance-characteristic`
- `advance-skill`
- `advance-talent`
- `add-skill-talent`
- `change-career`
- `get-career-advancement`
- `get-character`
- `foundry-update-skill-talent` (for setting advance levels)
- `foundry-add-experience-log-entry` (for XP manipulation)
- `foundry-update-character-info` (for direct updates if needed)

**Estimated Total XP Required**: ~3000-4000 XP for all tests (character has 5000 available)

---

## Test Case Details

### Test 2.1: Advance Characteristic (XP-Based)
**Prompt**: "Advance [Character]'s Weapon Skill characteristic"  
**Expected**: WS advances +1, XP deducted (25 in-career or 30 out-of-career), initial value unchanged  
**Tool**: `advance-characteristic`

---

### Test 2.2: Advance Skill
**Prompt**: "Advance [Character]'s Melee (Basic) skill"  
**Expected**: Skill advances +1, XP deducted based on tier, confirmation message  
**Tool**: `advance-skill`

---

### Test 2.3: Insufficient XP
**Setup**: Set character XP to 3  
**Prompt**: "Advance [Character]'s Melee (Basic) skill"  
**Expected**: Error "Insufficient XP", no changes made  
**Tool**: `advance-skill`

---

### Test 2.4: Career Change
**Prompt**: "Change [Character]'s career to Soldier"  
**Expected**: New career added, old career preserved, XP deducted (100 or 200), confirmation message  
**Tool**: `change-career`  
**Note**: Requires current career marked with `current: true`

---

### Test 2.5: Advance Skill - First Advance
**Setup**: Ensure skill "Melee (Basic)" has 0 advances  
**Prompt**: "Advance [Character]'s Melee (Basic) skill"  
**Expected**: Advances 0→1, XP cost 10 (Tier 0), total skill = characteristic + 1  
**Tool**: `advance-skill`

---

### Test 2.6: Advance Skill - Tier Boundary (5th Advance)
**Setup**: Advance Melee (Basic) to 4 advances (using tests 2.5 or direct setup)  
**Prompt**: "Advance [Character]'s Melee (Basic) skill"  
**Expected**: Advances 4→5, XP cost 10 (still Tier 0), message about next advance entering Tier 1  
**Tool**: `advance-skill`

---

### Test 2.7: Advance Skill - Tier Boundary (6th Advance)
**Setup**: Skill now at 5 advances (from 2.6)  
**Prompt**: "Advance [Character]'s Melee (Basic) skill"  
**Expected**: Advances 5→6, XP cost 15 (Tier 1), message "Entered Tier 1"  
**Tool**: `advance-skill`

---

### Test 2.8: Advance Skill - Tier 2 (11th Advance)
**Setup**: Advance Melee (Basic) to 10 advances  
**Prompt**: "Advance [Character]'s Melee (Basic) skill"  
**Expected**: Advances 10→11, XP cost 20 (Tier 2), NOT 220 XP (bug check)  
**Tool**: `advance-skill`  
**Critical**: Verify bug fix from v0.2.2.1 - should cost 20 XP not 220 XP

---

### Test 2.9: Advance Skill - Tier 3 (16th Advance)
**Setup**: Advance Melee (Basic) to 15 advances  
**Prompt**: "Advance [Character]'s Melee (Basic) skill"  
**Expected**: Advances 15→16, XP cost 30 (Tier 3)  
**Tool**: `advance-skill`

---

### Test 2.10: Advance Skill - Tier 4 (21st Advance)
**Setup**: Advance Melee (Basic) to 20 advances  
**Prompt**: "Advance [Character]'s Melee (Basic) skill"  
**Expected**: Advances 20→21, XP cost 40 (Tier 4), warning about high skill level  
**Tool**: `advance-skill`

---

### Test 2.11: Advance Multiple Skills
**Prompt**: "Advance [Character]'s Melee (Basic), Dodge, and Perception skills"  
**Expected**: All three skills advanced by 1, individual XP costs calculated, total XP shown  
**Tool**: `advance-skill` (called multiple times or batch operation)

---

### Test 2.12: Advance Skill - Insufficient XP
**Setup**: Set character XP to 3  
**Prompt**: "Advance [Character]'s Melee (Basic) skill"  
**Expected**: Error "Insufficient XP" (need 10, have 3), no changes  
**Tool**: `advance-skill`

---

### Test 2.13: Advance Skill - Exact XP Amount
**Setup**: Set character XP to exactly 10  
**Prompt**: "Advance [Character]'s Melee (Basic) skill"  
**Expected**: Skill advanced, XP 10→0, message "All available XP spent"  
**Tool**: `advance-skill`

---

### Test 2.14: Advance Characteristic - In-Career
**Setup**: Verify Weapon Skill is in current career advances  
**Prompt**: "Advance [Character]'s Weapon Skill"  
**Expected**: WS advances +1, XP cost 25 (in-career), message "in-career advance"  
**Tool**: `advance-characteristic`

---

### Test 2.15: Advance Characteristic - Out-of-Career
**Setup**: Verify Intelligence is NOT in current career  
**Prompt**: "Advance [Character]'s Intelligence"  
**Expected**: Int advances +1, XP cost 30 (out-of-career), message "out-of-career (higher cost)"  
**Tool**: `advance-characteristic`

---

### Test 2.16: Advance Characteristic - Tier Boundaries
**Test Sequence**:
1. WS 0→1 advances (25 XP, Tier 0)
2. WS 4→5 advances (25 XP, still Tier 0)
3. WS 5→6 advances (30 XP, Tier 1)
4. WS 10→11 advances (40 XP, Tier 2)  
**Expected**: Costs match tier formula, tier transitions clear  
**Tool**: `advance-characteristic`

---

### Test 2.17: Advance Characteristic - Multiple Advances
**Prompt**: "Advance [Character]'s Strength by 3"  
**Expected**: 3 advances applied, costs calculated per advance, total XP shown (75 if Tier 0)  
**Tool**: `advance-characteristic` with `advances: 3`

---

### Test 2.18: Advance Characteristic - Insufficient XP Mid-Advancement
**Setup**: Set character XP to 60  
**Prompt**: "Advance [Character]'s Strength by 3"  
**Expected**: Error "Insufficient XP" (need 75, have 60), no partial advances, all-or-nothing  
**Tool**: `advance-characteristic`

---

### Test 2.19: Advance Talent - Basic Talent
**Prompt**: "Purchase Combat Reflexes talent for [Character]"  
**Expected**: Talent added from compendium, XP cost 100, talent appears in character sheet with effects  
**Tool**: `advance-talent`

---

### Test 2.20: Advance Talent - Already Owned
**Setup**: Character already has Combat Reflexes  
**Prompt**: "Purchase Combat Reflexes talent for [Character]"  
**Expected**: Error "Already has this talent" OR rank increased (if talent supports ranks)  
**Tool**: `advance-talent`

---

### Test 2.21: Career Change - Incomplete Career
**Setup**: Current career is NOT complete  
**Prompt**: "Change [Character]'s career to Sergeant"  
**Expected**: XP cost 200 (incomplete penalty), warning message, career changed, old career preserved  
**Tool**: `change-career`

---

### Test 2.22: Career Change - Complete Career
**Setup**: Complete all advances in current career  
**Prompt**: "Change [Character]'s career to Sergeant"  
**Expected**: XP cost 100 (completion discount), confirmation message, career changed  
**Tool**: `change-career`

---

### Test 2.23: Career Change - Insufficient XP
**Setup**: Set character XP to 50  
**Prompt**: "Change [Character]'s career to Sergeant"  
**Expected**: Error "Insufficient XP" (need 100/200), no changes  
**Tool**: `change-career`

---

### Test 2.24: Career Change - Career Not Found
**Prompt**: "Change [Character]'s career to NonExistentCareer"  
**Expected**: Error "Career not found in compendium", suggestions shown, no changes  
**Tool**: `change-career`

---

### Test 2.25: Career Change - No Current Career
**Setup**: Remove `current: true` flag from all careers  
**Prompt**: "Change [Character]'s career to Sergeant"  
**Expected**: Error "No current career found", instructions to set current career  
**Tool**: `change-career`

---

### Test 2.26: Get Career Advancement Progress
**Prompt**: "Show [Character]'s career advancement progress"  
**Expected**: Current career, level, characteristics/skills/talents progress, completion %, XP spent  
**Tool**: `get-career-advancement`

---

### Test 2.27: Get Career Advancement Costs
**Prompt**: "What would it cost to advance [Character]'s career?"  
**Expected**: Available advances, characteristics (25 XP), skills (tier costs), talents (100 XP), total to complete  
**Tool**: `get-career-advancement`

---

### Test 2.28: XP Calculation Verification
**Test Sequence**: Verify formula at different advance levels
1. Skill at 0 → 10 XP (Tier 0)
2. Skill at 5 → 15 XP (Tier 1)
3. Skill at 10 → 20 XP (Tier 2)
4. Skill at 15 → 30 XP (Tier 3)
5. Skill at 20 → 40 XP (Tier 4)  
**Expected**: All costs match formula: `(Math.floor(advances / 5) + 1) × 5`  
**Critical**: Bug fix verification - 11th advance = 20 XP, not 220 XP

---

### Test 2.29: Full Career Progression Flow
**Sequence**:
1. "Show [Character]'s career progress"
2. "Advance [Character]'s Weapon Skill" (in-career)
3. "Advance [Character]'s Melee (Basic) skill"
4. "Advance [Character]'s Dodge skill"
5. "Purchase Combat Reflexes for [Character]"
6. "Show [Character]'s career progress" (verify changes)  
**Expected**: Complete workflow, progressive XP deduction, career progress increases  
**Tools**: `get-career-advancement`, `advance-characteristic`, `advance-skill`, `advance-talent`

---

### Test 2.30: Career Change Workflow
**Sequence**:
1. "Show [Character]'s Soldier career progress"
2. [Complete all required advances]
3. "Check if [Character]'s career is complete"
4. "Change [Character]'s career to Sergeant" (100 XP)
5. "Show [Character]'s career history"  
**Expected**: Career completion tracked, correct XP cost, both careers in history  
**Tools**: `get-career-advancement`, `change-career`

---

### Test 2.31: Multi-Tier Skill Advancement
**Prompt**: "Advance [Character]'s Melee (Basic) skill 11 times"  
**Expected**: Advances 0→11, costs through tiers (Tier 0: 5×10=50, Tier 1: 5×15=75, Tier 2: 1×20=20, Total: 145 XP), all advances applied  
**Tool**: `advance-skill` with `advances: 11`

---

### Test 2.32: XP Management Flow
**Sequence**:
1. "Show [Character]'s XP" → e.g., 500 available
2. "Advance WS" → 500-25=475
3. "Advance Melee (Basic)" → 475-10=465
4. "Purchase Combat Reflexes" → 465-100=365
5. "Show [Character]'s XP" → verify 365 available  
**Expected**: Accurate XP tracking, spent accumulates, available decreases, math correct  
**Tools**: `get-character`, `advance-characteristic`, `advance-skill`, `advance-talent`

---

### Test 2.33: UUID Construction for Career Change
**Technical Check**: Verify career UUID pattern  
**Prompt**: "Change [Character]'s career to Sergeant"  
**Expected**: UUID format `Compendium.wfrp4e-core.careers.${id}`, career added successfully, no UUID errors  
**Tool**: `change-career`  
**Verification**: Check Foundry console logs

---

### Test 2.34: Career Completion Status Check
**Test Sequence**:
1. Career with partial advances → incomplete
2. Career with all advances → complete
3. Verify completion affects XP cost (100 vs 200)  
**Expected**: Completion detected accurately, correct XP cost applied  
**Tool**: `get-career-advancement`, `change-career`

---

### Test 2.35: In-Career vs Out-of-Career Detection
**Test Sequence**:
1. Advance in-career characteristic → 25 XP
2. Advance out-of-career characteristic → 30 XP
3. Verify 5 XP difference  
**Expected**: Career membership detected correctly, cost difference applied  
**Tool**: `advance-characteristic`

---

### Test 2.36: Advances vs Initial Separation
**Technical Check**: Verify data structure  
**Prompt**: "Advance [Character]'s Strength" then "Get [Character]'s info"  
**Expected**: `system.characteristics.s.initial` unchanged, `system.characteristics.s.advances` increased  
**Tools**: `advance-characteristic`, `get-character`

---

### Test 2.37: Concurrent Advancement Prevention
**Test**: Attempt multiple simultaneous advances  
**Expected**: Race condition handling, sequential processing, no data corruption  
**Tool**: Multiple tool calls

---

### Test 2.38: Career History Preservation
**Test Sequence**:
1. Change from Soldier to Sergeant
2. Verify both careers in items list
3. Only Sergeant marked as `current: true`  
**Expected**: Old careers preserved, history intact, current flag correct  
**Tool**: `change-career`, `get-character`

---

### Test 2.39: XP Total Recalculation
**Test**: After multiple advances, verify:
- `details.experience.total` = lifetime XP (unchanged)
- `details.experience.spent` = total XP spent
- `details.experience.current` = total - spent  
**Expected**: XP accounting accurate, formula correct  
**Tool**: `get-character`

---

### Test 2.40: Maximum Advancement Limits
**Test**: Advance skill to 30+ advances  
**Expected**: High tier costs applied, no cap errors, advancement works at extreme levels  
**Tool**: `advance-skill` with multiple advances

---

---


