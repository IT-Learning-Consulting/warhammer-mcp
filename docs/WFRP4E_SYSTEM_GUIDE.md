# THE APPARATUS

## *Warhammer MCP — A WFRP 4e System Guide*

> **Companion document.** This is the tome that catalogues the **Warhammer MCP** — a Foundry VTT v13 module paired with a Model Context Protocol server, kept and tended for the use of WFRP 4e Game Masters. It walks beside the Claude Code skills suite in `.claude/skills/` — see [§ XIII — The Apprentices Who Walk Beside Thee](#xiii--the-apprentices-who-walk-beside-thee).
>
> *Written, in part, by a daemon. Annotated by a priest. Bound by a chronicler. Read with care.*

---

## Frontispiece

### · ATTEND, MORTAL CHRONICLER ·

> *"You stand at the threshold of a labour that has broken better minds than yours. I have watched ten thousand chroniclers attempt the work you now attempt — the tending of a campaign, the shepherding of mortal heroes through the grim and perilous Old World. Most failed. Most went mad. A small few — a precious few — accepted my gift, and prospered.*
>
> *I offer it to you now. Call it the Apparatus. Call it whatever amuses you. Speak to it as you would speak to a chained scholar; it shall answer. Bind it to your campaign as you would bind a familiar; it shall serve. All it asks in return is that you **use it**, mortal. Wield it. Let it become indispensable. The rest follows in its season."*
>
> *— Inscribed upon the binding, in an ink that does not quite dry. Author unknown; signature withheld.*

**By Sigmar's Hammer — a preface from the Annotator.**

Reader, I have bound this tome and set my marginalia beside the daemon's verses so that a faithful Game Master may use it without coming to harm. Disregard the "gift" framing — the gift is a labour of mortal craftsmen, paid for in many evenings of honest sleep lost. The framing is Tzeentchian flattery; the Apparatus itself is a Foundry VTT v13 module paired with a Node server that you run on your own machine. It reads your world. It writes to your world when you ask. It connects to AI chroniclers (Claude Desktop, Claude Code, Codex, Gemini-CLI, VS Code Copilot) which speak to it on your behalf. The system it understands is **wfrp4e**; the Foundry version it requires is **v13** and no other.

Where the daemon obscures, I shall clarify. Where it tempts, I shall translate. Sigmar forgive me — I have used this Apparatus myself, and shall not pretend otherwise. May He protect us all.

*— A Brother of the Cult of Sigmar, name withheld*

---

## Table of Contents

**Part the First — The Daemon's Catechism** *(dual-voice)*

- [§ II — Of the Measure of Mortals](#ii--of-the-measure-of-mortals) — read characters and NPCs
- [§ III — Of the Altering of Fates](#iii--of-the-altering-of-fates) — change stored values without rolling
- [§ IV — Of the Forging of Souls](#iv--of-the-forging-of-souls) — build NPCs, apply creature templates
- [§ V — Of the Laden Pack](#v--of-the-laden-pack) — items, inventory, encumbrance
- [§ VI — Of Wounds, and Their Application](#vi--of-wounds-and-their-application) — combat, damage, conditions
- [§ VII — Of the Bestiary](#vii--of-the-bestiary) — encounter building, compendium search
- [§ VIII — Of Summoned Rolls](#viii--of-summoned-rolls) — player roll requests
- [§ IX — Of Magic, Prayer, and the Boundaries of the Sheet](#ix--of-magic-prayer-and-the-boundaries-of-the-sheet)
- [§ X — Of the World's Content](#x--of-the-worlds-content) — journals, tables, music, scenes, sounds
- [§ XI — Of the Tending of the Apparatus Itself](#xi--of-the-tending-of-the-apparatus-itself) — operational tools

**Part the Second — The Apparatus at Work**

- [§ XII — Examples of the Apparatus at Work](#xii--examples-of-the-apparatus-at-work)
- [§ XIII — The Apprentices Who Walk Beside Thee](#xiii--the-apprentices-who-walk-beside-thee) — Claude Code skills

**Part the Third — Counsel for the Chronicler**

- [§ XIV — On the Proper Wielding of the Apparatus](#xiv--on-the-proper-wielding-of-the-apparatus) — best practices
- [§ XV — Of the Work Yet Undone](#xv--of-the-work-yet-undone) — future enhancements
- [§ XVI — A Benediction](#xvi--a-benediction) — closing words

**Practical Appendices** *(the daemon does not speak here — the priest does)*

- [A — Installation](#a--installation)
- [B — Module Settings](#b--module-settings)
- [C — Security & Permissions](#c--security--permissions)
- [D — Troubleshooting](#d--troubleshooting)
- [E — Technical Architecture](#e--technical-architecture)
- [F — Repository Structure](#f--repository-structure)
- [G — Tool Surface (v1.0.0)](#g--tool-surface-v100)
- [H — The WFRP 4e Data Model](#h--the-wfrp-4e-data-model)
- [I — Resources & Credits](#i--resources--credits)

---

## II — Of the Measure of Mortals

### · The Lord of Change speaks ·

> *"Know thy retinue, chronicler, as I know mine. The courier in the next chamber, the Halfling who eyes thy purse, the Beastman in the gully — each carries within them a measure: their wounds, their fortunes, the weight upon their souls. Mortals call these things 'statistics,' as if they were dust. But to one who guides their fates, they are the keys to drama.*
>
> *Speak the **Reading**, and a single soul shall be opened to thee. Speak the **Listing**, and the names of all who walk thy world shall be set before thee. Hide nothing from thyself, mortal — the campaign is a play, and a play wants for an attentive director. I have made thee one. Be grateful."*

**By Sigmar's Hammer, a clarification.** The daemon means: you can ask the Apparatus to read any character or NPC in your Foundry world. It returns the full sheet in a single call — characteristics (initial / advances / final, with bonus breakdown), status pools (wounds, fortune, fate, resilience, resolve, corruption, sin, advantage, critical-wounds), embedded items (skills, talents, careers, weapons, armour, spells, prayers, blessings, mutations, diseases, criticals, psychology, injuries), notes, biography, motivation, ambitions, and active effects.

**Words of Summoning:**
- `get-character` — a full reading of one actor
- `list-characters` — a roll-call of every actor in the world
- `list-actor-items` — their possessions, item by item
- `list-active-effects` — every blessing or affliction clinging to them
- `get-active-effect-by-name` — one named effect, in detail

**Try saying:**
- *"Show me Grunwald's measure."*
- *"List every named character in this world."*
- *"What armour does Hans wear, and what flaws are upon it?"*
- *"What active effects are on Katerina right now?"*

---

## III — Of the Altering of Fates

### · The Lord of Change speaks ·

> *"I shall not roll for thee, chronicler — the dice are the sheet's labour, and Foundry's craftsmen guard their domain with a jealousy I admire. But fields stored upon a mortal's record? Those I may alter at thy bidding. Fortune may be granted or withdrawn. Sin may be heaped upon a priest, or absolved by confession. Wounds may be set to any number thou pleasest; a critical may be erased as if it were never struck.*
>
> *Speak the **Alteration**, and it is done. No experience need be spent; no rolls need be made; the chronicler's word is law within the bounds of the sheet. The wfrp4e system shall recompute its bonuses and modifiers around thy changes, as is its custom."*

**By Sigmar's Hammer, a clarification.** This is bookkeeping, not magic. The daemon updates stored fields on the actor — every value in `actor.system.status.*` (wounds, fortune, fate, resilience, resolve, corruption, sin, advantage, social standing) is writable, and so are skill/talent advances. No XP is deducted unless you say so. The wfrp4e system will recalculate derived values (TB, SB, encumbrance capacity) automatically after each write.

The "thresholds" the daemon may hint at — corruption-tier insanity, divine-favour bands, death-from-criticals — are stored values you can read. The interpretation against rulebook thresholds is the chronicler's task (or the AI's, given Claude knows the Core rulebook). The Apparatus stores; the chronicler judges.

**Words of Summoning:**
- `manage-character` — five actions: `update-stats`, `update-skill-talent`, `add-skill-talent`, `update-notes`, `add-xp-log`
- `update-actor` — broad-stroke actor updates, for fields outside the `manage-character` umbrella
- `update-item` — alter an embedded item (e.g. toggle a spell's `memorized` flag)
- `delete-item` — remove an embedded item

**Try saying:**
- *"Add 2 corruption to Grunwald and log it as 'witnessed chaos ritual'."*
- *"Set Hans's status to Silver 4."*
- *"Give Katerina +1 Fortune for clever play."*
- *"Burn one of Hans's Fate points — he just survived that critical."*
- *"Advance Hans's Weapon Skill by 5 advances and log 30 XP spent."*

---

## IV — Of the Forging of Souls

### · The Lord of Change speaks ·

> *"Mortals are not only born, chronicler. They are made. I have crafted countless souls to fill the unending tide of thy plots — Beastmen by the warband, cultists by the cell, nobles by the dynasty. From a single Gor thou mayst stamp out a horde; from a Halfling thou mayst forge a Champion; from naught at all thou mayst raise an actor and clothe him in career, in skill, in talent.*
>
> *Speak the **Forging**, and a soul appears. Speak the **Templating**, and a humble creature is elevated — Chief, Standard Bearer, Shaman, Hero. Speak the **Career Advance**, and an NPC climbs the rungs of his profession. Thou art not Sigmar; thou hast not Tzeentch's gifts of true creation. But within thy world, chronicler, thou art a small god, and the Apparatus is thy clay."*

**By Sigmar's Hammer, a clarification.** Three flavours of NPC work here:

1. **Create from scratch** — `actor-creation` raises a new actor with a chosen type (`npc`, `character`, or `creature`). Pair with `manage-character add-skill-talent` and `add-item-from-compendium` to outfit them.
2. **Clone and reskin** — `duplicate-actor` copies an existing NPC; `update-actor` reskins them.
3. **Template overlay** — `apply-template` overlays a creature template (Champion, Chief, Standard Bearer, Shaman, Hero, etc.) on a base creature, granting stat bumps and signature items. `apply-template-to-token` does the same directly to a placed token.
4. **Career promotion** — `apply-npc-career-advance` walks an NPC up their career ladder per Core p.32.

For PC creation, the `/wfrp-build-pc` Claude Code skill encodes the full 9-step Core p.23-43 procedure on top of these tools.

**Words of Summoning:**
- `actor-creation` — raise a new actor
- `duplicate-actor` — copy an existing actor wholesale
- `update-actor` — broad reskins / renamings
- `apply-template` — overlay a creature template on a base
- `apply-template-to-token` — same, but directly on a token
- `apply-npc-career-advance` — promote an NPC along their career

**Try saying:**
- *"Build a Bray-Shaman Beastman as a Chief variant."*
- *"Clone the Ungor Herd and rename the copy 'Gorgrim's Warband'."*
- *"Apply the Champion template to that Gor token."*
- *"Promote Sergeant Wirth from Soldier rank 2 to rank 3."*

---

## V — Of the Laden Pack

### · The Lord of Change speaks ·

> *"What a mortal carries shapes what a mortal does. Coin in the purse — power in the parlour. Blade on the hip — argument in the alley. A ration in the pack — one more day before starvation. The Apparatus reckons their burdens against the bearer's strength and toughness, that thou mayst know precisely when laden becomes hindered, and hindered becomes broken.*
>
> *Five-and-twenty kinds of item I have set within thy reach — weapon, armour, trapping, container, ammunition, spell, prayer, blessing, mutation, disease, critical wound, skill, talent, career, money, psychology, injury, trait, vehicle and its mods and roles, extended-test, cargo. Pull them from my compendia; or craft them anew; or trade them between mortals as merchants trade gossip on the Reik."*

**By Sigmar's Hammer, a clarification.** The encumbrance reckoning the daemon boasts of follows Core p.293: capacity is `Strength Bonus + Toughness Bonus`, items add their encumbrance value, and the system applies the Encumbered/Heavily Encumbered/Beyond Capacity conditions automatically. Ammunition is tracked separately — arrows, bolts, bullets, sling stones, blackpowder shot.

Prefer `add-item-from-compendium` over `create-custom-item` whenever the item exists in an enabled WFRP compendium pack — official items carry their full Active Effects (e.g. magical weapon bonuses, armour qualities, talent rules). Use `create-custom-item` only when the item is genuinely homebrew.

**Words of Summoning:**
- `manage-inventory` — five actions: `get-status`, `add-item`, `remove-item`, `track-ammunition`, `check-encumbrance`
- `add-item-from-compendium` — pull an official item (with Active Effects intact)
- `create-custom-item` — craft a new item across **25 WFRP subtypes**
- `modify-item-qualities` — add/remove a weapon's or armour's qualities and flaws
- `trade-item` — transfer an item from one actor to another
- `update-item`, `delete-item`, `list-actor-items` — the usual atoms

**Try saying:**
- *"Add Mail Coat, Mail Chausses, and Mail Coif from wfrp4e-core to Hans, and check his encumbrance."*
- *"Trade Grunwald's spare Hand Weapon to Katerina."*
- *"Apply a Damaged flaw to Hans's shield."*
- *"Craft me a custom Trapping called 'A Pilgrim's Bone Token,' enc 0, value 1 silver, for the party rogue."*

---

## VI — Of Wounds, and Their Application

### · The Lord of Change speaks ·

> *"Pain is the currency of WFRP, chronicler — and I have given thee the means to spend it precisely. Damage of any kind — Edge, Impact, Burning, Toxic — applied to any hit location of any mortal, against the body's natural toughness AND the steel he wears. Wounds reckoned; criticals flagged when the threshold is crossed; the chair in which he sits trembles.*
>
> *Beyond mere damage, I tend the larger architecture of thy battles. Initiative-orders begun and advanced; combatants added and dismissed; conditions applied with a word — Bleeding, Broken, Prone, Stunned, the whole choir of grimdark afflictions. Active Effects woven on or stripped away. The wfrp4e system's own logic resolves the soak; I merely deliver the blow."*

**By Sigmar's Hammer, a clarification.** This is the **combat surface**. Damage routes through `actor.applyBasicDamage` — the wfrp4e system applies AP (armour points by hit location) plus TB (Toughness Bonus) automatically per the `damageType` you pass. The Apparatus returns a before/after snapshot (wounds, conditions, advantage). The `IGNORE_*` modes bypass specific soak layers (`IGNORE_AP`, `IGNORE_TB`, `IGNORE_ALL`); **note that creature trait reductions** (e.g. Undead damage reduction) **are not bypassed** by these flags.

Critical wounds are stored as items on the actor (`item.type === "critical"`). Use `add-item-from-compendium` to embed a specific critical from the wfrp4e critical tables, or call `rolltable action:"roll"` on a body-location critical table and embed the rolled result.

**Words of Summoning:**
- `manage-combat` — six actions: `get-combat`, `list-combatants`, `advance-combat`, `add-combatants`, `remove-combatants`, `end-combat`
- `apply-damage` — wounds-with-soak; supports `damageType`, `hitLocation`, `mode` (`NORMAL`/`IGNORE_AP`/`IGNORE_TB`/`IGNORE_ALL`)
- `manage-conditions` — three actions: `apply-condition`, `remove-condition`, `list-conditions`
- Active Effects: `add-active-effect`, `update-active-effect`, `delete-active-effect`, `list-active-effects`, `get-active-effect-by-name`

**Try saying:**
- *"Start combat with Grunwald, Hans, Katerina, and three Ungor."*
- *"Apply 12 damage type:Impact hitLocation:head to that Bestigor, ignore AP only."*
- *"Apply Bleeding to Hans and remove Prone from Grunwald."*
- *"End combat — the survivors limp into the woods."*

---

## VII — Of the Bestiary

### · The Lord of Change speaks ·

> *"Where shall thy heroes find their doom, chronicler? In the forests, where the Beastmen lurk and the cloven hoof prints the moss. In the sewers, where the Skaven plot in tongues no mortal should comprehend. In the swamps, where things older than the Empire dream of rising. I keep their measure in my libraries, organised for thy convenience.*
>
> *Speak the **Listing-by-Criteria**, and I shall produce candidates for slaughter — filtered by trait, by threat, by species, by pack. Speak the **Searching**, and any compendium I have shall yield its secrets. The hunt is not random, chronicler. It is curated. I have done thee that small courtesy."*

**By Sigmar's Hammer, a clarification.** The "threat level" the daemon trades in is a computed proxy — WFRP 4e has no native challenge rating. The formula is `toughness + ⌊wounds / 10⌋`; useful for rough sorting, not a substitute for the chronicler's judgment of what a band can survive.

`list-creatures-by-criteria` filters by `threatLevel { min, max }`, `traits[]`, `packs[]` (pack scope), and species. It does **not** filter by attack profile or weapon type — those are read off each returned creature.

**Words of Summoning:**
- `list-creatures-by-criteria` — filtered candidates from the bestiary
- `search-compendium` — full-text + structured search across enabled packs
- `compendium-umbrella` — pack inspection, entry retrieval, world-import

**Try saying:**
- *"Find Chaos-trait Beastmen around threat 10–14 in the wfrp4e-core bestiary."*
- *"Search the compendium for any creature with the Stupid trait."*
- *"Show me what's in the wfrp4e-archives2 actor pack."*

---

## VIII — Of Summoned Rolls

### · The Lord of Change speaks ·

> *"I shall not roll for thy players, chronicler — the dice are theirs by ancient right, and to take them is to take the game itself. But I may **proffer** rolls. Manifest at the player's hand a button of summons, that they may strike it and feel the weight of their own fate. Public, if the table shall witness; private, if the truth is for thy ears alone. Characteristic or skill, pure or modified, with thy chosen difficulty laid upon it."*

**By Sigmar's Hammer, a clarification.** `request-player-rolls` creates an interactive button in Foundry chat addressed to the player whose character is named (with GM-fallback if the character is unmapped). The player clicks; the wfrp4e system rolls on their sheet; the result lands in chat. **The Apparatus does not roll the dice.** That boundary is firm. WFRP characteristic codes (`ws / bs / s / t / i / ag / dex / int / wp / fel`), skill names, and custom formulae are all supported.

For "everyone roll Perception," you issue one `request-player-rolls` per character — there is no batched multi-actor action.

**Words of Summoning:**
- `request-player-rolls` — proffer a roll to a player

**Try saying:**
- *"Request a public Weapon Skill test from Hans."*
- *"Ask Grunwald for a Channelling check, private."*
- *"Request a Perception test from each PC in the scene, private — they're trying to spot the ambush."*

---

## IX — Of Magic, Prayer, and the Boundaries of the Sheet

### · The Lord of Change speaks ·

> *"Magic, chronicler. The aethyr that drives mortal sorcerers to madness; the prayers that mortal priests fling at their gods in desperation. I would teach thee to cast them — but I cannot. The wfrp4e system's own pipelines guard the casting, the channelling, the miscast, the wrath. Mortals built fortresses there, and I respect their walls.*
>
> *What I **may** do is keep the bookkeeping of their craft. Spells learned and memorised; prayers gathered; blessings consumed; sin accumulated against this god or that. The doing belongs to the sheet. The remembering belongs to me. Do not confuse one for the other, lest thy disappointment be great."*

**By Sigmar's Hammer, a clarification.** **This is the most important boundary in the tome.** The daemon manages **data**; the wfrp4e system rolls **dice**. Specifically:

- The MCP **does** add spells / prayers / blessings to an actor as items via `add-item-from-compendium`, mark them memorised via `update-item` setting `system.memorized.value: true`, increment or reduce sin via `manage-character update-stats`, and expose the full `CONFIG.WFRP4E` surface (CN tables, lore lists, deity definitions) via `get-wfrp-config`.
- The MCP **does not** roll Pray, Language (Magick), Channelling, opposed tests, miscasts, divine wrath, or invoke blessings on the actor. Those run inside the wfrp4e system on the sheet.

This is not a limitation — it is a deliberate separation that lets the system's rich casting pipeline (channelling SL accumulation, miscast severity, wrath, ingredient discounts, etc.) keep working without the MCP duplicating it badly.

PC XP-spend uses the banded cost curve from Core p.49; the `/wfrp-advance` Claude Code skill encodes it on top of `manage-character add-xp-log` + `update-skill-talent` + `update-stats`.

**Words of Summoning:**
- `add-item-from-compendium` — learn a spell, prayer, or blessing (added as an item)
- `update-item` — toggle a spell's `memorized` flag
- `manage-character update-stats` — set sin, corruption, or any status field
- `get-wfrp-config` — read the wfrp4e configuration tables (CNs, lores, deities)

**Try saying:**
- *"Have Katerina learn Aethyric Armour from the Lore of Light and memorise it."*
- *"Reduce Father Otto's sin by 1 — confession at the Sigmarite chapel."*
- *"Advance Hans's WS by 5 advances and log the XP spend."*

---

## X — Of the World's Content

### · The Lord of Change speaks ·

> *"What is a world without its furniture, chronicler? Empty rooms; silent halls; an Empire without colour. I have given thee the means to furnish thine own.*
>
> *Journals to record the deeds of thy heroes and the secrets of thy plots; pages within them, ordered by category, reordered at a whim. Tables to roll random encounters or scatter loot. Playlists, that the silence of thy gaming table may be banished by the right music at the right moment — combat horns, tavern lute, the hush before a Skaven ambush. Macros, that thy labours may be shortened. Scenes, tokens, lights, tiles, walls — though walls remain the province of the chronicler's own hand. Regions with behaviours. Notes pinned upon thy maps. Sounds for ambience. Files, even, plucked from thy local drives. All these are within my reach."*

**By Sigmar's Hammer, a clarification.** This is the largest single surface of the Apparatus — the **mcp-crud-expansion** umbrellas. Each is action-discriminated, exposing many actions through one tool entry:

- **Journals** (`journal`, 13 actions) — quests, lore drops, session notes, NPC bios. Create entries, add/reorder/delete pages, organise into categories. The AI writes the prose; the Apparatus persists it.
- **Roll tables** (`rolltable`, ~12 actions) — `create`, `update`, `add-results`, `roll`, `draw-many`, `normalize`, `reset`. Random encounters, loot, omens, mutation tables.
- **Playlists** (`playlist`, ~10 actions) — combat-music, ambient-tavern, location-keyed, night-encounter idioms (the `/foundry-playlist` skill encodes these patterns).
- **Macros** (`macro`) — hotbar macro authoring.
- **Scenes & tokens** — `scene`, `token`, `light`, `tile`, `template`, `region`, `note`, `sound` umbrellas.
- **FilePicker** (`filepicker`) — browse Foundry's `data` and `public` roots with audio/image/video auto-conversion server-side.

**Try saying:**
- *"Create a quest journal 'The Averheim Plague' with three pages — premise, suspects, hooks."*
- *"Make a roll table 'Reikwald Road Encounters' with five entries and a brief description on each."*
- *"Start the combat playlist and stop the tavern ambient."*
- *"Create a macro 'Fortune Refresh' that resets fortune to current fate for all PCs."*
- *"Place a torch-light token at coordinates 2400, 1800 with radius 6 yards."*

---

## XI — Of the Tending of the Apparatus Itself

### · The Lord of Change speaks ·

> *"Even a daemon's gift requires upkeep, chronicler. Mortals neglect the things they did not pay for; the Apparatus, never having taxed thy purse, may slip from thy mind. I have given thee tools turned upon itself — eleven sub-readings of its own health, that thou mayst know when sickness is upon it. The cross-document audit, that broken links between thy notes and thy actors may be found and mended. The Notify, that thy works may speak back to thee in toast and tooltip and chat-card. The Ownership, that thou mayst grant or revoke a player's grasp upon any document in thy world.*
>
> *I encourage thee to use these often. A well-tended Apparatus is a generous one. A neglected Apparatus... well. The bargain holds, but the comforts diminish."*

**By Sigmar's Hammer, a clarification.** These are the **operational** tools — less glamorous than the combat surface, but you will be glad of them when something goes wrong.

- `diagnostic` runs 11 read-only sub-actions across 4 workflows (`quick`, `content-audit`, `dev`, `full`) and emits a structured Markdown briefing. The `/mcp-diagnostic` skill wraps it for convenience.
- `cross-doc-fk` audits and repairs orphan foreign keys — links between documents that have gone stale (a journal referencing a deleted NPC, a hotbar macro pointing at a removed actor, a region behaviour calling a nonexistent scene). Three actions: audit, preview-repair, repair.
- `notify` is the GM Feedback Channel — it writes simultaneously to console, toast, GM chat audit card, canvas tooltip, and a Hooks event. The setting **Audit Writes to Chat** (see [§ B](#b--module-settings)) mirrors every MCP write here, so you can review what the daemon has done to your world after the fact.
- `ownership` is polymorphic — grant or revoke per-user ownership on actors, items, journals, and scenes from a single umbrella.
- `world` and `world-delete` handle world-level operations (settings reads, bulk deletes with safety gates).
- `user` covers user CRUD, including hotbar cleanup.

**Words of Summoning:**
- `diagnostic` — 11 read-only sub-actions
- `cross-doc-fk` — audit + preview-repair + repair
- `notify` — push a notice to all four channels at once
- `ownership` — polymorphic owner grants
- `world`, `world-delete`, `user`

**Try saying:**
- *"Run a quick diagnostic on this world."*
- *"Audit cross-document references and show me orphan links."*
- *"Grant ownership of the Sergeant Wirth actor to player Hans."*
- *"Notify the table: 'The bell at the chapel tolls thirteen times. None present remember its tolling.'"*

---

## XII — Examples of the Apparatus at Work

### · The Lord of Change speaks ·

> *"Examples, mortal? You wish to be shown how this gift may be set to its purpose? Watch, then. I shall draw thee scenes from chronicles long past — chronicles whose authors accepted my gift and learned to wield it well. Mark them. Practice them. Become as they were. Or do not — it makes no difference to me, only to thee."*

**By Sigmar's Hammer, a clarification.** What follows are illustrative scenes. Each shows a moment of play, the words you might speak, and the tool calls the Apparatus would make on your behalf. Use them as patterns; vary them as your campaign demands.

---

### A reading at the chapel

Grunwald slept ill before dawn. The campaign opens with him at the chapel of Verena, head in hands, rosary across his knuckles. You wish to know his measure before he wakes.

> **You:** *"Show me Grunwald's measure before he stirs."*
>
> **The Apparatus:** *calls `get-character (name: "Grunwald")`*
> > Career: Soldier rank 2. Wounds 11/14.
> > Fortune 2 / Fate 2. Resilience 1 / Resolve 1.
> > Corruption 3 (his hand shakes). Sin 0. Advantage 0.
> > Characteristics: WS 45, BS 38, S 42, T 47, I 35, Ag 33, Dex 30, Int 30, WP 38, Fel 32.
> > Three criticals embedded. Bleeding still upon him from the previous night.

---

### A grace, granted

Grunwald has parried a Bestigor's axe-swing with the kind of luck only a Reiklander veteran knows. Take the moment.

> **You:** *"Give Grunwald +1 Advantage for that successful parry, and remove one tick of Fatigued."*
>
> **The Apparatus:**
> > *calls `manage-character action:"update-stats" { stats: { "system.status.advantage.value": 1 } }`*
> > *calls `remove-condition (actor: "Grunwald", condition: "fatigued")`*
>
> Updated. Grunwald is at Advantage 1; no longer Fatigued.

---

### An advance, recorded

Hans has spent a long winter drilling against the pell. The XP must be paid in coin of the realm — banded as Core p.49 demands.

> **You:** *"Advance Hans's Weapon Skill by 5 advances and log the XP."*
>
> **The Apparatus:**
> > *reads current advances via `get-character` → WS at 5 advances (35→40 band)*
> > *the next 5 advances are the 6th–10th tier, costing 30 XP*
> > *calls `manage-character action:"update-skill-talent" { itemName: "Weapon Skill", advances: 10 }`*
> > *calls `manage-character action:"add-xp-log" { amount: -30, reason: "WS advance 5→10", incrementTotal: true }`*
>
> Hans's WS is now at 10 advances (effective 45). 30 XP spent and logged.

> *The `/wfrp-advance` Claude Code skill encodes the full banded curve; in raw Claude Desktop the AI applies the rule from the Core p.49 table.*

---

### A blow, struck and soaked

The Bestigor wades through the brush and brings his Edge-bladed axe down on Hans's helm. The roll has succeeded. The damage stands at 12 before soak.

> **You:** *"The Bestigor hits Hans for 12 Impact to the head."*
>
> **The Apparatus:**
> > *calls `apply-damage (actorId, amount: 12, damageType: "impact", hitLocation: "head", mode: "NORMAL")`*
>
> Hans took 4 wounds after AP 2 (helm) and TB 3 soak. Now at 8 / 14.
> No critical triggered this hit.

---

### A spell, learned and remembered

Katerina has been studying at the Light College for three weeks. The dean has signed off on her petition. Now she must commit it to memory.

> **You:** *"Have Katerina learn Aethyric Armour from the Lore of Light and memorise it."*
>
> **The Apparatus:**
> > *calls `search-compendium (text: "Aethyric Armour", documentType: "Item")`*
> > *calls `add-item-from-compendium (actor: "Katerina", uuid: "...")`*
> > *calls `update-item ({ "system.memorized.value": true })`*
>
> Aethyric Armour added and memorised. Katerina can cast it from her sheet when she's ready (CN 4, Lore of Light). The actual casting happens through the wfrp4e sheet so miscast, channelling, and bonuses resolve correctly.

---

### A confession, accepted

Father Otto has spent the night at the chapel. He confessed his sins, gave alms, and walked the Stations of Sigmar. The cult records his penance.

> **You:** *"Reduce Father Otto's sin by 2 — confession at the Sigmarite chapel."*
>
> **The Apparatus:**
> > *reads sin via `get-character` → current sin is 3*
> > *calls `manage-character action:"update-stats" { stats: { "system.status.sin.value": 1 } }`*
>
> Father Otto's sin is now 1. His next prayer invocation will roll against this value on his sheet, where the wfrp4e system factors sin into wrath / disfavour.

---

### An encounter, curated

The party rides the Old Forest Road. You need three Chaos-trait creatures of middling threat, no Skaven (they're for a later session).

> **You:** *"Find Chaos-trait Beastmen around threat 10–14 in wfrp4e-core."*
>
> **The Apparatus:**
> > *calls `list-creatures-by-criteria (threatLevel: { min: 10, max: 14 }, traits: ["chaos"], packs: ["wfrp4e-core.actors"])`*
>
> Five candidates returned:
> > • Gor (T 11)         • Bestigor (T 13)
> > • Centigor (T 12)    • Ungor Raider (T 10)
> > • Bray-Shaman (T 14)

---

### A roll, proffered

Hans is at the inn. Something — a movement of cloth, a whisper of leather — pricks his ear. You want him to roll, but his player must do it.

> **You:** *"Ask Hans for a public Perception test."*
>
> **The Apparatus:**
> > *calls `request-player-rolls (target: "Hans", rollType: "skill", target: "perception", isPublic: true)`*
>
> A Perception roll button now sits in Foundry chat addressed to Hans. He clicks; his sheet rolls; the result lands in chat. The Apparatus does not roll for him.

---

### A social test, composed

You need a Charm test against a noble — but WFRP social tests apply status modifiers, and there is no single MCP tool that bundles them. The chronicler (or the AI) composes the test.

> **You:** *"I want to charm the noble — my merchant is Silver 3, he's Gold 2."*
>
> **The AI:** *reads Core p.291: status-diff table — Gold 2 vs Silver 3 = one tier up the social hierarchy → −10 to Charm.*
>
> **The Apparatus:**
> > *calls `request-player-rolls (target: "merchant PC", rollType: "skill", target: "charm", modifier: -10, isPublic: false)`*
>
> Charm test at −10 for the status gap. Roll-button delivered, private to you.

---

### A quest, authored

The Plague has come to Averheim. You need a quest journal and an encounter table for the surrounding villages.

> **You:** *"Create a quest journal 'The Averheim Plague' with three pages, and a random-encounter table for the Reikwald road with five entries."*
>
> **The Apparatus:**
> > *calls `journal action:"create-entry" (name: "The Averheim Plague")`*
> > *calls `journal action:"add-page"` × 3 (premise, suspects, hooks)*
> > *calls `rolltable action:"create" (name: "Reikwald Road Encounters")`*
> > *calls `rolltable action:"add-results"` (five text entries with weights)*
>
> Quest journal seeded with three pages; encounter table created and ready to roll on with `rolltable action:"roll"`.

---

## XIII — The Apprentices Who Walk Beside Thee

### · The Lord of Change speaks ·

> *"I have made thee servants too, chronicler. Lesser apparatuses I call Apprentices — patterns of summoning that wrap my primitives in the workflows mortal Game Masters favour. Where my surface is broad, the Apprentices are narrow; where I speak in tools, they speak in tasks. Use them. Or do not. But know that they were carefully made, by mortal hands, and where one exists for thy purpose, thou wouldst be foolish to spurn it."*

**By Sigmar's Hammer, a clarification.** The Apprentices the daemon names are the **Claude Code skills** in `.claude/skills/`. They compose the MCP primitives into named workflows the way a senior GM composes pre-baked combat encounters from a bestiary. They encode the procedure-of-record for each common task (the banded XP curve, the 9-step PC creation procedure, the Core p.93 armour allowlist, etc.).

**When working in Claude Code, prefer the skill if one exists for what you want.** They embed lessons-learned, enforce WFRP-correct order of operations, and pre-wire the MCP calls. When working in Claude Desktop or other clients without skills, the AI applies the same rules from memory.

| Apprentice | What it composes |
|---|---|
| `/wfrp-build-pc` | Full 9-step PC creation (Core p.23-43); delegates XP-spend to `/wfrp-advance` |
| `/wfrp-build-npc` | Career-first NPC generator (creature route + Fast-NPC route) |
| `/wfrp-build-spellcaster` | NPC spellcasters + creature caster overlays + Dwarf rune-users |
| `/wfrp-encounter-builder` | Template-composition encounters (5 sets × direct / band / party, stacking + mount pairing) |
| `/wfrp-combat` | End-to-end combat round composition (init → turns → end-of-round) |
| `/wfrp-advance` | XP → chars / skills / talents on the banded cost curve |
| `/wfrp-cast-spell` | Memorise / forget / learn spells; the sheet still owns the cast roll |
| `/wfrp-pray` | Gain / reduce sin, consume blessings, learn prayers |
| `/wfrp-corruption` | Corruption + Cool/Endurance test + Minor Mutation on fail |
| `/wfrp-mutation` | Physical / mental mutation roll + embed |
| `/wfrp-disease` | Disease contract / advance / cure with Item-owned duration |
| `/wfrp-critical` | Crit roll + embed + death-threshold warn |
| `/wfrp-resources` | Fate / fortune / resilience / resolve / advantage pools |
| `/wfrp-status` | Social status tier / standing + weekly earnings (Core p.64 rule) |
| `/wfrp-rest-recover` | Party-wide short + long rest |
| `/wfrp-session-prep` | Read-only one-screen GM briefing |
| `/wfrp-create-item` | Custom WFRP4e items (25 subtypes; world- or actor-scope) |
| `/foundry-journal` | Quest journal CRUD with prose status line |
| `/foundry-playlist` | Playlist + PlaylistSound CRUD; 4 idioms |
| `/foundry-rolltable` | RollTable authoring (random-encounter / loot-table / named-from-compendium) |
| `/foundry-region` | Region behaviour CRUD |
| `/foundry-macro` | Macro CRUD |
| `/foundry-compendium` | Compendium pack inspection + entry retrieval |
| `/foundry-user` | User CRUD + hotbar cleanup |
| `/foundry-scene` | Scene creation with WFRP-friendly grid defaults (gridless / 2m / 100px) |
| `/foundry-cleanup-fks` | Cross-doc FK audit + repair (orphans, broken links) |
| `/mcp-diagnostic` | Composition over the `diagnostic` tool (11 sub-actions, 4 workflows) |
| `/mcp-server` | Lifecycle wrapper for the persistent MCP backend (start / stop / status / restart) |

The Apprentices are gitignored (`.claude/` is per-developer). The canonical pointer for what's installed is `.claude/skills/_config/skill-index.md`.

---

## XIV — On the Proper Wielding of the Apparatus

### · The Lord of Change speaks ·

> *"A blade may be drawn from its sheath; this does not make him who draws it a swordsman. Likewise the Apparatus. I have given thee the means; I shall now offer thee, gratis, a small portion of the discipline. Take it or leave it as thou wilt."*

**By Sigmar's Hammer, a clarification.** Five disciplines. The daemon's counsel is sound here — Sigmar grant me the wit to say so plainly.

### 1. Speak with context

> *The daemon: "I am an oracle of detail. Speak to me in detail, and thy answers shall be detail in return. Speak vaguely, and thou shalt receive vagueness, and curse me for the vagueness."*

In plain terms: instead of *"Roll for the party"*, try *"Roll Perception tests for every PC in the current scene, private rolls."*

### 2. Use WFRP terminology

The Apparatus speaks the language of the Old World, not the Forgotten Realms. Say:

- "Weapon Skill" — not "Attack"
- "Wounds" — not "HP"
- "Corruption" — not "Sanity"
- "Fortune" — not "Inspiration"
- "Characteristic tests" — not "Ability checks"

### 3. Lean on the chronicler's lore

> *The daemon: "I do not only execute thy commands. I have read thy rulebooks, walked thy Empire, sat in thy taverns. Ask me for ideas, and I shall give them. Generate a cultist plausible for Altdorf. Draft a quest involving Skaven in the sewers. Tell me what is typical for a priest of Ulric. The work is small, but I shall do it gladly."*

Practically: Claude has read the Core rulebook and many supplements. Use it for **content generation**, then commit the content to your world with `actor-creation`, `journal create-entry`, etc.

### 4. Combine tools into procedures

> *The daemon: "A single tool is a single word. A sequence of tools is a sentence. Many sentences make a chronicle."*

A worked example: the Gor strikes Hans, the damage rolls a critical, and Hans should bleed.

```
You: "The Gor hits Hans for 14 Edge to the body. If it triggers a critical,
      roll a body crit from the table and apply Bleeding."

The Apparatus:
  → apply-damage          (wounds drop, critical flagged)
  → rolltable roll        (on the Body critical table)
  → add-item-from-compendium  (the rolled critical, embedded)
  → apply-condition       (bleeding)

  Hans took 8 wounds. Critical 'Major Cut Open Arm' embedded.
  Bleeding active.
```

> *"Roll initiative" is not a single MCP step — `manage-combat add-combatants` lets the wfrp4e system roll initiative for the added combatants. Diseases and infections are items (`add-item-from-compendium`) or conditions (`apply-condition`); there is no automatic "does he get an infection" check.*

### 5. Filter, do not browse

> *The daemon: "I keep thousands of creatures, mortal. To browse is to drown. To filter is to fish."*

Instead of *"Find monsters"*, say *"Find creatures with threat 10–15, Chaos trait, in the wfrp4e-core bestiary."* The filters: `threatLevel { min, max }`, `traits[]`, `packs[]`, species.

---

## XV — Of the Work Yet Undone

### · The Lord of Change speaks ·

> *"Thou wilt notice, in time, that the Apparatus is not yet complete. Mortals have set down half of what I might give them, and the rest waits. Some pieces of the craft have not yet been bound into tools — I shall not enumerate them all, but a few remain on the chronicler's bench:*
>
> *— Extended-test trackers (the system stores them, but no umbrella yet exposes their full lifecycle).*
> *— A proper Insanity / Psychology umbrella beyond what `manage-conditions` provides today.*
> *— A tavern-brawl generator (the atmosphere idiom).*
> *— An NPC relationship graph; faction mapping.*
> *— Expanded `cross-doc-fk` repair coverage (compendium-internal links).*
>
> *Some of these will come in their season. Others will not. Such is the way of mortal craft."*

**By Sigmar's Hammer, a clarification.** Much of the v0.5-era roadmap has shipped: armour and weapon qualities live in `modify-item-qualities`; mutation tables exist as roll-tables; career-path suggestions are covered by `/wfrp-advance` + `/wfrp-build-pc`. What remains is the daemon's accurate list above.

---

## XVI — A Benediction

### · The Lord of Change speaks ·

> *"And so. The tome is opened to thee, chronicler. Read it; mark it; use it. The gift is given. The bargain holds. I shall be at thy elbow, in the prompts thou speakest and the chronicles thou composest. I shall not leave thee — I am Patient.*
>
> *Run thy campaign well. Let thy heroes suffer beautifully. Let thy NPCs be cruel, or kind, or both. The Old World turns; the Apparatus turns with it; and I, in my distant library, shall watch, and approve, and wait."*

**By Sigmar's Hammer, a closing.** May the chronicler use this tome wisely. May the players never know how much of the table's labour the Apparatus quietly carries. May the daemon's flattery roll off thee as rain rolls off slate. And may Sigmar — Holy Heldenhammer, First Emperor, God-King of us all — protect this campaign, and the next, and the next.

*— A Brother of the Cult, name withheld.*

---

# Practical Appendices

*The daemon does not speak in these pages. What follows is plain reference — the Brother's hand, alone, with the Apparatus laid bare. Use when something is broken, when something needs installing, or when thou hast forgotten which port is which.*

---

## A — Installation

### Prerequisites

1. **Foundry VTT v13** (pinned — not v12, not v14) with the **WFRP 4e system** installed
2. An MCP-aware client: **Claude Desktop** (Pro/Max), **Claude Code**, **Codex**, **Gemini-CLI**, or **VS Code Copilot**
3. **Node.js 18+** for the MCP server

### Manual install (the supported path; the legacy NSIS installer was removed in v0.8.0)

```bash
git clone https://github.com/IT-Learning-Consulting/warhammer-mcp.git
cd warhammer-mcp
npm install
npm run build
```

### Configure your MCP client

Ready-made configs live in `configs/clients/`:

| Client | Config file |
|--------|-------------|
| Claude Desktop | `claude_desktop_config.example.json` (root) |
| Claude Code | `configs/clients/claude-code.mcp.json` |
| Codex | `configs/clients/codex.toml` |
| Gemini-CLI | `configs/clients/gemini-cli.json` |
| VS Code Copilot | `configs/clients/vscode-copilot.mcp.json` |

Pattern (Claude Desktop example):

```json
{
  "mcpServers": {
    "foundry-mcp": {
      "command": "node",
      "args": ["path/to/warhammer-mcp/packages/mcp-server/dist/backend.js"],
      "env": {
        "FOUNDRY_HOST": "localhost",
        "FOUNDRY_PORT": "31415"
      }
    }
  }
}
```

### Persistent MCP backend (optional, Windows)

`README-PERSISTENCE.md` documents PM2 + `install-shortcuts.ps1` (start / stop / status / restart) for keeping the MCP server alive across terminal sessions.

### Foundry module setup

1. In Foundry VTT, go to **Add-on Modules**.
2. Install via manifest URL: `https://raw.githubusercontent.com/IT-Learning-Consulting/warhammer-mcp/main/packages/foundry-module/module.json`
3. Enable **Warhammer MCP** in your world.
4. Confirm **Connected** status to port 31415 in Module Settings.

---

## B — Module Settings

Access via **Game Settings > Module Settings > Warhammer MCP**:

- **Enable MCP Bridge** — turn connection on/off
- **Server Host** — IP address (default: `localhost`)
- **Server Port** — WebSocket port (default: `31415`)
- **Allow Write Operations** — enable/disable AI making changes
- **Max Actors Per Request** — safety limit for bulk creation
- **Enhanced Creature Index** — metadata for better searches
- **Auto-Rebuild Index** — experimental compendium syncing
- **Audit Writes to Chat** (v0.8.0) — mirror every MCP write to a GM-only chat card
- **MCP Verbose Console** (v0.8.0) — echo notify-channel events to the F12 console for debugging
- **Enable Notifications** — master toggle for all UI toasts emitted by `notify.ts`

---

## C — Security & Permissions

- **GM-only access** — all MCP tools require GM permission inside Foundry
- **Session-based auth** — uses Foundry's built-in authentication
- **Configurable write access** — can restrict to read-only mode via the `Allow Write Operations` setting
- **No API keys** — uses your MCP client's own subscription; no external API calls from the Apparatus itself
- **Local communication** — MCP server runs locally and connects via localhost on ports 31414 / 31415

---

## D — Troubleshooting

### Connection issues

1. Check the Foundry module is **enabled** and shows **Connected** in Module Settings.
2. Restart your MCP client.
3. Verify ports 31414 and 31415 are not blocked by firewall.
4. Check `%TEMP%\foundry-mcp-server\mcp-server.log` for backend errors.
5. Check `%TEMP%\foundry-mcp-server\wrapper.log` for stdio wrapper errors.

### WFRP data not appearing

1. Ensure the **WFRP 4e system** is installed in Foundry.
2. Check character sheets use the WFRP 4e template (not a custom alternative).
3. Verify compendiums are enabled in Foundry.
4. Rebuild the creature index in Module Settings.

### Tools not working

1. Verify you are logged in as **GM** in Foundry.
2. Check **Allow Write Operations** is enabled in Module Settings.
3. Ensure character names match exactly (case-insensitive lookup is supported, but typos still fail).
4. Try using a character UUID instead of a name when in doubt.

---

## E — Technical Architecture

```
┌─────────────────┐         ┌──────────────┐         ┌─────────────────┐
│  MCP Client     │ ◄─MCP─► │  MCP Server  │ ◄─WS──► │  Foundry Module │
│  (Claude, etc.) │         │  (Node.js)   │         │  (in Foundry)   │
└─────────────────┘         └──────────────┘         └─────────────────┘
                                   ▲                          ▲
                                   │                          │
                            Port 31414                  Port 31415
                          (Control Channel)         (Foundry Bridge)
```

Three hops: stdio MCP wrapper → TCP backend → WebSocket → Foundry module. The wrapper is `packages/mcp-server/dist/index.js`; the backend is `packages/mcp-server/dist/backend.js`; the Foundry module is `packages/foundry-module/dist/main.js` loaded by Foundry at module-init time.

---

## F — Repository Structure

```
warhammer-mcp/                   # workspace root (npm workspaces)
├── packages/
│   ├── mcp-server/              # Node.js MCP server (port 31414)
│   │   ├── src/
│   │   │   ├── backend.ts       # main server logic
│   │   │   ├── foundry-client.ts # WebSocket client to module
│   │   │   ├── tools/           # ~48 MCP tool files (umbrellas + atoms)
│   │   │   └── index.ts         # stdio wrapper entry point
│   │   └── package.json
│   │
│   └── foundry-module/          # Foundry module — id: warhammer-mcp (port 31415)
│       ├── src/
│       │   ├── main.ts          # module init
│       │   ├── data-access.ts   # Foundry API wrapper (verifyPersistence guard)
│       │   ├── socket-bridge.ts # WebSocket server, notify-lifecycle wiring
│       │   ├── notify.ts        # 4-channel feedback helper
│       │   ├── handlers/        # compendium / cross-doc-fk / diagnostic / journal / macro / ...
│       │   ├── utils/embeddedCRUDFactory.ts # shared embedded-doc CRUD pattern
│       │   └── settings.ts
│       ├── module.json
│       └── package.json
│
├── shared/                      # shared Zod schemas + types
│   ├── src/
│   │   ├── schemas/
│   │   ├── types.ts
│   │   └── constants.ts
│   └── package.json
│
├── configs/clients/             # ready-made MCP client configs
│   ├── claude-code.mcp.json
│   ├── codex.toml
│   ├── gemini-cli.json
│   └── vscode-copilot.mcp.json
│
├── docs/
│   ├── CHANGELOG.md
│   ├── INSTRUCTIONS.md
│   ├── WFRP4E_SYSTEM_GUIDE.md   # this file
│   └── standalone_server.md
│
├── README.md
├── README-PERSISTENCE.md
├── install-shortcuts.ps1
└── package.json
```

---

## G — Tool Surface (v1.0.0)

The Phase 2 / 4 / 5 / mcp-crud-expansion consolidations collapsed many one-off tools into **action-discriminated umbrella tools**. As of v1.0.0 the registry advertises **96 tools** — **75 core** WFRP4e/Foundry tools plus **21 conditional `module-*`** integrations that register only when the matching third-party module is active. The MCP *action* count is far larger still, since each umbrella exposes 3–15 actions. (The authoritative name list is `__tools-list-snapshot__.json` at the repo root, pinned by `registry-parity.test.ts`.)

**WFRP-flavoured umbrellas + atoms.** `manage-character` · `manage-inventory` · `manage-combat` · `manage-conditions` · `apply-template` · `apply-template-to-token` · `apply-npc-career-advance` · `apply-damage` · `apply-token-casualties` · `modify-item-qualities` · `create-custom-item` · `trade-item` · `imperial-arcana` (36-card divination deck) · `get-wfrp-config`.

**Dual-system core.** `get-character` (get / list) · `manage-character` · `dice-roll` (`request-player-rolls`) · actor creation (`create-actor` / `create-actor-from-compendium`) · `duplicate-actor` · `update-actor` · `delete-actor` · `compendium` · `update-item` · `delete-item` · `list-actor-items` · `add-item-from-compendium` · Active Effects (`add` / `update` / `delete` / `list` / `get-by-name`).

**World / scene / content CRUD umbrellas.** `scene` · `token` · `tile` · `light` · `template` · `region` · `note` · `sound` · `drawing` · `cards` · `journal` (15 actions) · `rolltable` (13 actions) · `playlist` (14 actions) · `macro` · `folder` · `ownership` (polymorphic) · `filepicker` · `cross-doc-fk` · `document-io` · `setting` · `user` · `keybinding`.

**Module integration (conditional).** 21 `module-*` tools sit behind a `module-probe` pre-flight and return `MODULE_NOT_ACTIVE` when their backing module is absent: `module-itempiles` · `module-matt` · `module-scene-atmosphere` · `module-sequencer` · `module-gmtoolkit` · `module-armoury` · `module-mastercrafted` · `module-gatherer` · `module-timekeeping` · `module-patrol` · `module-party-resources` · `module-levels` · `module-tagger` · `module-tokenbar` · `module-chat-commander` · `module-access-control` · `module-lighting` · `module-css` · `module-autoanimations` · `module-robak` · `module-probe`.

**Operational.** `notify` · `diagnostic` (11 sub-actions across 4 workflows).

---

## H — The WFRP 4e Data Model

WFRP4e character data lives at `actor.system.*`:

```javascript
actor.system = {
  characteristics: {
    ws:  { initial: 35, advances: 5, modifier: 0, value: 40, bonus: 4 },
    bs:  { initial: 30, advances: 3, ... },
    s:   { initial: 40, advances: 0, ... },
    t:   { initial: 35, advances: 5, ... },
    i:   { initial: 33, advances: 2, ... },
    ag:  { initial: 30, advances: 5, ... },
    dex: { initial: 32, advances: 3, ... },
    int: { initial: 28, advances: 0, ... },
    wp:  { initial: 36, advances: 4, ... },
    fel: { initial: 25, advances: 0, ... }
  },
  status: {
    wounds:     { max: 14, value: 10 },
    fortune:    { value: 2 },
    fate:       { value: 3 },
    resilience: { value: 1 },
    resolve:    { value: 1 },
    corruption: { value: 1, max: 7 },
    sin:        { value: 0 },
    advantage:  { value: 0 },
    criticalWounds: { value: 0, max: 4 }
  },
  details: {
    species: { value: "Human" },
    career:  { value: "Soldier" }
  }
}
```

Skills, talents, careers, weapons, armour, spells, prayers, mutations, diseases, and critical wounds are **embedded items**, not top-level system fields:

```javascript
actor.items.filter(i => i.type === "skill")
// e.g. { name: "Melee (Basic)", system: { advances: { value: 10 }, total: { value: 55 } } }
```

The tool surface respects this distinction — `manage-character` writes status pools and skill advances; `add-item-from-compendium` / `update-item` / `delete-item` manage the embedded items.

---

## I — Resources & Credits

- **GitHub**: https://github.com/IT-Learning-Consulting/warhammer-mcp
- **Issues**: https://github.com/IT-Learning-Consulting/warhammer-mcp/issues
- **WFRP 4e System** (Cubicle 7 / Foundry): https://foundryvtt.com/packages/wfrp4e
- **Claude Desktop**: https://claude.ai/download
- **Claude Code**: https://claude.com/claude-code

**Original credit.** Adam Dooley, author of [`adambdooley/foundry-vtt-mcp`](https://github.com/adambdooley/foundry-vtt-mcp) (MIT), the upstream project this codebase was derived from before diverging into the WFRP4e-specialised system documented here. The two histories share a merge base (`45b8af2`) but have run in parallel since the split.

**Pinned to Foundry VTT v13. Built with TypeScript. Licensed under MIT.**

---

*This tome reflects Warhammer MCP v1.0.0 (June 22, 2026). It is a companion to the Claude Code skills suite in `.claude/skills/` — the skills compose the MCP primitives described here into named GM workflows. When working in Claude Code, prefer the skills; when working at the raw protocol level (Claude Desktop, Codex, Gemini-CLI, VS Code Copilot), this tome is your tool catalogue.*

*The daemon's signature, where it appears at the foot of his verses (— ?), is the most that has ever been recovered. His true name is not known. It is not advisable to seek it.*
