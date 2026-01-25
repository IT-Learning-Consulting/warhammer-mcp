Test Case 1.1: Basic Character Retrieval    -                   ✅ Pass
Test Case 1.2: Non-Existent Character       -                   ✅ Pass
Test Case 1.3: Update Single Characteristic -                   ✅ Pass
Test Case 1.3b: Advance Characteristic (no xp)                  ✅ Pass
Test Case 1.3b: Advance Characteristic (xp) -                   ✅ Pass
Test Case 1.4: Update Multiple Stats        -                   ✅ Pass
Test Case 1.5: Invalid Stat Update          -                   ✅ Pass
Test Case 1.6: Update Multiple Characteristics                  ✅ Pass
Test Case 1.7: Update Status Values                             ✅ Pass
Test Case 1.8: Update Single Characteristic to Zero             ✅ Pass
Test Case 1.8: ⚠️ !OBS! The warning message inside foundry is not showing the message, instead it looks like this https://i.imgur.com/fwSCJeD.png, It should be a clear warning message instead of random numbers
Test Case 1.9: Update Characteristic Below Zero                 ✅ Pass
Test Case 1.10: Update Wounds Above Maximum                     ✅ Pass
Test Case 1.10: ⚠️ !OBS! The warning message inside foundry is not showing the message, instead it does something similar like in test case 1.8, where is a weird number but no real human description
Test Case 1.11: Update Fortune Above Fate Maximum               ✅ Pass
Test Case 1.12: Update Resolve Above Resilience Maximum         ✅ Pass
Test Case 1.13: Get Character Info - Complete Details           ❌ Fail (Most is showing but missing many details, Biography not showing, Movement not showing, Motivation not Showing, Personal Ambitions not showing, Gender, Age, Height, Weight, Hair Colour, Eye Colour, Distinguih mark not showing, Experience Log not showing)
Test Case 1.14: Get Character Info - Specific Sections          ✅ Pass
Test Case 1.15: Get Character With No Items                     ✅ Pass
Test Case 1.16: Get Character With Conditions                   ❌ Fail (Gets conditions but not the number of conditions, so for example if character have two fatigue points it only show as fatigue, it should also show how many conditions the character have)
Test Case 1.17: Update Characteristic - Partial Name Match      ✅ Pass
Test Case 1.18: Update Multiple Stats - Some Invalid            ✅ Pass
Test Case 1.18: ⚠️ !OBS! The warning message inside foundry is not showing the message, instead it looks like this https://i.imgur.com/GyihBc0.png It should be a clear warning message instead of random numbers
Test Case 1.19: Get Character - Case Insensitive Name           ✅ Pass
Test Case 1.20: Update Character - Verify Persistence           ✅ Pass

⚠️ Big OBS ⚠️ The info and warnings are not giving clear messages, must be better done please
Test 1.21 to 1.30 skipped until error fixed