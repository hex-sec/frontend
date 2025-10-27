export type OptionType = 'switch' | 'select' | 'slider' | 'checkbox' | 'text'

export type SettingsOptionChoice = {
  value: string
  labelKey?: string
  label?: string
  group?: string
  disabled?: boolean
}

export type SettingsOption = {
  key: string
  labelKey?: string
  label?: string
  descriptionKey?: string
  description?: string
  type: OptionType
  choices?: SettingsOptionChoice[]
  min?: number
  max?: number
  step?: number
  placeholderKey?: string
  placeholder?: string
  visibleWhen?: {
    key: string
    equals: boolean | number | string
  }
}

export type SettingsGroup = {
  key: string
  labelKey: string
  descriptionKey?: string
  options: SettingsOption[]
}

export type SettingsCategory = {
  key: string
  labelKey: string
  icon: JSX.Element
  groups: SettingsGroup[]
}

export type SettingsModalProps = {
  open: boolean
  onClose: () => void
  onApply?: (values: Record<string, boolean | number | string>) => void
  onSave?: (values: Record<string, boolean | number | string>) => void
  initialValues?: Record<string, boolean | number | string>
}

export type StructuredCategory = {
  key: string
  label: string
  icon: JSX.Element
  totalMatches: number
  groups: Array<{
    key: string
    label: string
    description?: string
    options: OptionPresentation[]
    matchCount: number
  }>
}

export type OptionPresentationChoice = {
  value: string
  label: string
  group?: string
  disabled?: boolean
}

export type OptionPresentation = {
  option: SettingsOption
  label: string
  description?: string
  choices?: OptionPresentationChoice[]
  placeholder?: string
}
