# i18n | Foundry Virtual Tabletop - API Documentation - Version 13

**Variable** `i18n` **Const**

`i18n: { searchMinimumCharacterLength: number } = ...`

Localization constants.

**Type declaration**

- **searchMinimumCharacterLength**: *number*  
  In operations involving the document index, search prefixes must have at least this many characters to avoid too large a search space. Languages that have hundreds or thousands of characters will typically have very shallow search trees, so it should be safe to lower this number in those cases.

[Foundry Virtual Tabletop - API Documentation - Version 13](https://foundryvtt.com/api/index.html)  
[Foundry Virtual Tabletop - API Documentation - Version 13 / CONFIG](https://foundryvtt.com/api/modules.html) / [i18n](https://foundryvtt.com/api/variables/CONFIG.i18n.html)