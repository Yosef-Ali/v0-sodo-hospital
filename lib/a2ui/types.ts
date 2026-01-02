/**
 * A2UI Types - Agent-to-User Interface Protocol
 * Pure Google A2UI implementation for React/Next.js
 * Based on A2UI v0.8 specification
 */

// =============================================================================
// CORE A2UI MESSAGE TYPES
// =============================================================================

export interface A2UIMessage {
  beginRendering?: BeginRendering
  surfaceUpdate?: SurfaceUpdate
  dataModelUpdate?: DataModelUpdate
  deleteSurface?: DeleteSurface
}

export interface BeginRendering {
  surfaceId: string
  root: string
  styles?: A2UIStyles
}

export interface A2UIStyles {
  font?: string
  primaryColor?: string
  backgroundColor?: string
  textColor?: string
}

export interface SurfaceUpdate {
  surfaceId: string
  components: ComponentDefinition[]
}

export interface DataModelUpdate {
  surfaceId: string
  path: string
  contents: DataContent[]
}

export interface DeleteSurface {
  surfaceId: string
}

// =============================================================================
// COMPONENT DEFINITIONS
// =============================================================================

export interface ComponentDefinition {
  id: string
  weight?: number
  component: ComponentType
}

export type ComponentType =
  | { Text: TextComponent }
  | { Button: ButtonComponent }
  | { Card: CardComponent }
  | { Column: ColumnComponent }
  | { Row: RowComponent }
  | { List: ListComponent }
  | { Image: ImageComponent }
  | { TextField: TextFieldComponent }
  | { Select: SelectComponent }
  | { Checkbox: CheckboxComponent }
  | { Divider: DividerComponent }
  | { Icon: IconComponent }
  | { Badge: BadgeComponent }
  | { Progress: ProgressComponent }
  | { Chip: ChipComponent }

// =============================================================================
// COMPONENT PROPERTIES
// =============================================================================

export interface TextComponent {
  text: TextValue
  usageHint?: "h1" | "h2" | "h3" | "body" | "caption" | "label"
  color?: string
  align?: "left" | "center" | "right"
}

export interface ButtonComponent {
  child: string
  primary?: boolean
  variant?: "default" | "outline" | "ghost" | "destructive"
  action?: ButtonAction
  disabled?: boolean
}

export interface ButtonAction {
  name: string
  context?: ActionContext[]
}

export interface ActionContext {
  key: string
  value: TextValue
}

export interface CardComponent {
  child: string
  elevation?: number
  padding?: number
}

export interface ColumnComponent {
  children: ChildrenRef
  gap?: number
  align?: "start" | "center" | "end" | "stretch"
}

export interface RowComponent {
  children: ChildrenRef
  gap?: number
  align?: "start" | "center" | "end" | "stretch"
}

export interface ListComponent {
  direction: "vertical" | "horizontal"
  children: ChildrenRef
  gap?: number
}

export interface ImageComponent {
  url: TextValue
  alt?: string
  width?: number
  height?: number
  fit?: "cover" | "contain" | "fill"
}

export interface TextFieldComponent {
  label?: string
  placeholder?: string
  value?: TextValue
  type?: "text" | "email" | "password" | "number" | "tel"
  required?: boolean
  multiline?: boolean
  rows?: number
  binding?: string
}

export interface SelectComponent {
  label?: string
  options: SelectOption[]
  value?: TextValue
  binding?: string
}

export interface SelectOption {
  label: string
  value: string
}

export interface CheckboxComponent {
  label?: string
  checked?: boolean
  binding?: string
}

export interface DividerComponent {
  orientation?: "horizontal" | "vertical"
}

export interface IconComponent {
  name: string
  size?: number
  color?: string
}

export interface BadgeComponent {
  text: TextValue
  variant?: "default" | "success" | "warning" | "error" | "info"
}

export interface ProgressComponent {
  value: number
  max?: number
  label?: string
}

export interface ChipComponent {
  text: TextValue
  variant?: "default" | "outline"
  removable?: boolean
}

// =============================================================================
// VALUE TYPES
// =============================================================================

export type TextValue =
  | { literalString: string }
  | { path: string }

export type ChildrenRef =
  | { explicitList: string[] }
  | { template: TemplateRef }

export interface TemplateRef {
  componentId: string
  dataBinding: string
}

// =============================================================================
// DATA MODEL TYPES
// =============================================================================

export type DataContent =
  | { key: string; valueString: string }
  | { key: string; valueNumber: number }
  | { key: string; valueBoolean: boolean }
  | { key: string; valueMap: DataContent[] }
  | { key: string; valueList: DataContent[] }

// =============================================================================
// CLIENT EVENT TYPES (for button actions)
// =============================================================================

export interface A2UIClientEvent {
  actionName: string
  context: Record<string, any>
}

// =============================================================================
// CHAT TYPES
// =============================================================================

export interface A2UIChatMessage {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: Date
  a2ui?: A2UIMessage[]
  isStreaming?: boolean
}

export interface A2UIChatState {
  messages: A2UIChatMessage[]
  isTyping: boolean
  isOpen: boolean
  surfaces: Map<string, A2UISurface>
}

export interface A2UISurface {
  id: string
  root: string
  styles: A2UIStyles
  components: Map<string, ComponentDefinition>
  dataModel: Record<string, any>
}
