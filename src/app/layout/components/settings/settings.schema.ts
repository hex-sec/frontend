import type { SettingsCategory } from './settings.types'

export const BASE_SETTINGS_SCHEMA: SettingsCategory[] = [
  {
    key: 'account',
    labelKey: 'settings.categories.account',
    icon: null, // Will be populated dynamically
    groups: [
      {
        key: 'profile',
        labelKey: 'settings.account.profile.title',
        descriptionKey: 'settings.account.profile.description',
        options: [
          {
            key: 'profileVisibility',
            labelKey: 'settings.account.profile.profileVisibility.label',
            descriptionKey: 'settings.account.profile.profileVisibility.description',
            type: 'switch',
          },
          {
            key: 'digestLanguage',
            labelKey: 'settings.account.profile.digestLanguage.label',
            descriptionKey: 'settings.account.profile.digestLanguage.description',
            type: 'select',
            choices: [
              { value: 'es', labelKey: 'languages.es' },
              { value: 'en', labelKey: 'languages.en' },
              { value: 'pt', labelKey: 'languages.pt' },
            ],
          },
          {
            key: 'defaultLanding',
            labelKey: 'settings.account.profile.defaultLanding.label',
            descriptionKey: 'settings.account.profile.defaultLanding.description',
            type: 'select',
            choices: [
              {
                value: 'enterpriseDashboard',
                labelKey: 'settings.account.profile.defaultLanding.choices.enterpriseDashboard',
              },
              {
                value: 'sitesOverview',
                labelKey: 'settings.account.profile.defaultLanding.choices.sitesOverview',
              },
              {
                value: 'site',
                labelKey: 'settings.account.profile.defaultLanding.choices.site',
              },
            ],
          },
          {
            key: 'defaultLandingSite',
            labelKey: 'settings.account.profile.defaultLandingSite.label',
            descriptionKey: 'settings.account.profile.defaultLandingSite.description',
            placeholderKey: 'settings.account.profile.defaultLandingSite.placeholder',
            type: 'select',
            visibleWhen: {
              key: 'account.profile.defaultLanding',
              equals: 'site',
            },
          },
        ],
      },
      {
        key: 'privacy',
        labelKey: 'settings.account.privacy.title',
        descriptionKey: 'settings.account.privacy.description',
        options: [
          {
            key: 'auditTrail',
            labelKey: 'settings.account.privacy.auditTrail.label',
            descriptionKey: 'settings.account.privacy.auditTrail.description',
            type: 'switch',
          },
          {
            key: 'sessionTimeout',
            labelKey: 'settings.account.privacy.sessionTimeout.label',
            descriptionKey: 'settings.account.privacy.sessionTimeout.description',
            type: 'select',
            choices: [
              { value: '15', labelKey: 'settings.account.privacy.sessionTimeout.choices.15' },
              { value: '30', labelKey: 'settings.account.privacy.sessionTimeout.choices.30' },
              { value: '60', labelKey: 'settings.account.privacy.sessionTimeout.choices.60' },
            ],
          },
        ],
      },
    ],
  },
  {
    key: 'notifications',
    labelKey: 'settings.categories.notifications',
    icon: null,
    groups: [
      {
        key: 'alerts',
        labelKey: 'settings.notifications.alerts.title',
        descriptionKey: 'settings.notifications.alerts.description',
        options: [
          {
            key: 'criticalIncidents',
            labelKey: 'settings.notifications.alerts.criticalIncidents.label',
            descriptionKey: 'settings.notifications.alerts.criticalIncidents.description',
            type: 'switch',
          },
          {
            key: 'visitorArrivals',
            labelKey: 'settings.notifications.alerts.visitorArrivals.label',
            descriptionKey: 'settings.notifications.alerts.visitorArrivals.description',
            type: 'switch',
          },
        ],
      },
      {
        key: 'channels',
        labelKey: 'settings.notifications.channels.title',
        descriptionKey: 'settings.notifications.channels.description',
        options: [
          {
            key: 'channelEmail',
            labelKey: 'settings.notifications.channels.channelEmail.label',
            descriptionKey: 'settings.notifications.channels.channelEmail.description',
            type: 'switch',
          },
          {
            key: 'channelSms',
            labelKey: 'settings.notifications.channels.channelSms.label',
            descriptionKey: 'settings.notifications.channels.channelSms.description',
            type: 'switch',
          },
          {
            key: 'channelPush',
            labelKey: 'settings.notifications.channels.channelPush.label',
            descriptionKey: 'settings.notifications.channels.channelPush.description',
            type: 'switch',
          },
        ],
      },
    ],
  },
  {
    key: 'security',
    labelKey: 'settings.categories.security',
    icon: null,
    groups: [
      {
        key: 'auth',
        labelKey: 'settings.security.auth.title',
        descriptionKey: 'settings.security.auth.description',
        options: [
          {
            key: 'mfa',
            labelKey: 'settings.security.auth.mfa.label',
            descriptionKey: 'settings.security.auth.mfa.description',
            type: 'switch',
          },
          {
            key: 'passwordRotation',
            labelKey: 'settings.security.auth.passwordRotation.label',
            descriptionKey: 'settings.security.auth.passwordRotation.description',
            type: 'select',
            choices: [
              { value: '30', labelKey: 'settings.security.auth.passwordRotation.choices.30' },
              { value: '60', labelKey: 'settings.security.auth.passwordRotation.choices.60' },
              { value: '90', labelKey: 'settings.security.auth.passwordRotation.choices.90' },
            ],
          },
        ],
      },
      {
        key: 'sessions',
        labelKey: 'settings.security.sessions.title',
        descriptionKey: 'settings.security.sessions.description',
        options: [
          {
            key: 'sessionLimit',
            labelKey: 'settings.security.sessions.sessionLimit.label',
            descriptionKey: 'settings.security.sessions.sessionLimit.description',
            type: 'slider',
            min: 1,
            max: 10,
            step: 1,
          },
          {
            key: 'geoLock',
            labelKey: 'settings.security.sessions.geoLock.label',
            descriptionKey: 'settings.security.sessions.geoLock.description',
            type: 'switch',
          },
        ],
      },
    ],
  },
  {
    key: 'appearance',
    labelKey: 'settings.categories.appearance',
    icon: null,
    groups: [
      {
        key: 'generalLook',
        labelKey: 'settings.appearance.generalLook.title',
        descriptionKey: 'settings.appearance.generalLook.description',
        options: [
          {
            key: 'themeMode',
            labelKey: 'settings.appearance.generalLook.themeMode.label',
            descriptionKey: 'settings.appearance.generalLook.themeMode.description',
            type: 'select',
            choices: [
              { value: 'auto', labelKey: 'settings.appearance.generalLook.themeMode.choices.auto' },
              {
                value: 'light',
                labelKey: 'settings.appearance.generalLook.themeMode.choices.light',
              },
              { value: 'dark', labelKey: 'settings.appearance.generalLook.themeMode.choices.dark' },
            ],
          },
          {
            key: 'density',
            labelKey: 'settings.appearance.generalLook.density.label',
            descriptionKey: 'settings.appearance.generalLook.density.description',
            type: 'select',
            choices: [
              {
                value: 'comfortable',
                labelKey: 'settings.appearance.generalLook.density.choices.comfortable',
              },
              {
                value: 'standard',
                labelKey: 'settings.appearance.generalLook.density.choices.standard',
              },
              {
                value: 'compact',
                labelKey: 'settings.appearance.generalLook.density.choices.compact',
              },
            ],
          },
        ],
      },
      {
        key: 'topbar',
        labelKey: 'settings.appearance.topbar.title',
        descriptionKey: 'settings.appearance.topbar.description',
        options: [
          {
            key: 'topbarBlur',
            labelKey: 'settings.appearance.topbar.topbarBlur.label',
            descriptionKey: 'settings.appearance.topbar.topbarBlur.description',
            type: 'slider',
            min: 0,
            max: 20,
            step: 1,
          },
          {
            key: 'topbarBadges',
            labelKey: 'settings.appearance.topbar.topbarBadges.label',
            descriptionKey: 'settings.appearance.topbar.topbarBadges.description',
            type: 'switch',
          },
          {
            key: 'topbarPatternEnabled',
            labelKey: 'settings.appearance.topbar.topbarPatternEnabled.label',
            descriptionKey: 'settings.appearance.topbar.topbarPatternEnabled.description',
            type: 'switch',
          },
          {
            key: 'topbarPatternKind',
            labelKey: 'settings.appearance.topbar.topbarPatternKind.label',
            descriptionKey: 'settings.appearance.topbar.topbarPatternKind.description',
            type: 'select',
            choices: [
              {
                value: 'subtle-diagonal',
                labelKey: 'settings.appearance.topbar.topbarPatternKind.choices.subtle-diagonal',
              },
              {
                value: 'subtle-dots',
                labelKey: 'settings.appearance.topbar.topbarPatternKind.choices.subtle-dots',
              },
              {
                value: 'geometry',
                labelKey: 'settings.appearance.topbar.topbarPatternKind.choices.geometry',
              },
              {
                value: 'none',
                labelKey: 'settings.appearance.topbar.topbarPatternKind.choices.none',
              },
            ],
          },
          {
            key: 'topbarPatternOpacity',
            labelKey: 'settings.appearance.topbar.topbarPatternOpacity.label',
            descriptionKey: 'settings.appearance.topbar.topbarPatternOpacity.description',
            type: 'slider',
            min: 0,
            max: 0.4,
            step: 0.01,
          },
          {
            key: 'topbarPatternScale',
            labelKey: 'settings.appearance.topbar.topbarPatternScale.label',
            descriptionKey: 'settings.appearance.topbar.topbarPatternScale.description',
            type: 'slider',
            min: 8,
            max: 64,
            step: 1,
          },
        ],
      },
      {
        key: 'charts',
        labelKey: 'settings.appearance.charts.title',
        descriptionKey: 'settings.appearance.charts.description',
        options: [
          {
            key: 'chartPalette',
            labelKey: 'settings.appearance.charts.chartPalette.label',
            descriptionKey: 'settings.appearance.charts.chartPalette.description',
            type: 'select',
            choices: [
              { value: 'brand', labelKey: 'settings.appearance.charts.chartPalette.choices.brand' },
              { value: 'viz', labelKey: 'settings.appearance.charts.chartPalette.choices.viz' },
              { value: 'mono', labelKey: 'settings.appearance.charts.chartPalette.choices.mono' },
            ],
          },
          {
            key: 'chartAnimation',
            labelKey: 'settings.appearance.charts.chartAnimation.label',
            descriptionKey: 'settings.appearance.charts.chartAnimation.description',
            type: 'switch',
          },
        ],
      },
    ],
  },
]
