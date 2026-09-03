# Settings themes compact + footer

- Pin SettingsPanel `navFooter` to bottom of nav column
- Themes: Storybook `ThemeController` + `Toggle` for Dynamic
- Compact `ThemeStoreItem` (name/author one row, icons right)
- Fix Tahti configure controls by passing `themeId` into
  `ThemeVisualizationSettings` (was gating on active theme only)
