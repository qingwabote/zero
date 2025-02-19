export enum Align {
  Auto = 0,
  FlexStart = 1,
  Center = 2,
  FlexEnd = 3,
  Stretch = 4,
  Baseline = 5,
  SpaceBetween = 6,
  SpaceAround = 7,
  SpaceEvenly = 8,
}

export enum Dimension {
  Width = 0,
  Height = 1,
}

export enum Direction {
  Inherit = 0,
  LTR = 1,
  RTL = 2,
}

export enum Display {
  Flex = 0,
  None = 1,
}

export enum Edge {
  Left = 0,
  Top = 1,
  Right = 2,
  Bottom = 3,
  Start = 4,
  End = 5,
  Horizontal = 6,
  Vertical = 7,
  All = 8,
}

export enum Errata {
  None = 0,
  StretchFlexBasis = 1,
  PositionStaticBehavesLikeRelative = 2,
  AbsolutePositioning = 4,
  All = 2147483647,
  Classic = 2147483646,
}

export enum ExperimentalFeature {
  WebFlexBasis = 0,
  AbsolutePercentageAgainstPaddingEdge = 1,
}

export enum FlexDirection {
  Column = 0,
  ColumnReverse = 1,
  Row = 2,
  RowReverse = 3,
}

export enum Gutter {
  Column = 0,
  Row = 1,
  All = 2,
}

export enum Justify {
  FlexStart = 0,
  Center = 1,
  FlexEnd = 2,
  SpaceBetween = 3,
  SpaceAround = 4,
  SpaceEvenly = 5,
}

export enum LogLevel {
  Error = 0,
  Warn = 1,
  Info = 2,
  Debug = 3,
  Verbose = 4,
  Fatal = 5,
}

export enum MeasureMode {
  Undefined = 0,
  Exactly = 1,
  AtMost = 2,
}

export enum NodeType {
  Default = 0,
  Text = 1,
}

export enum Overflow {
  Visible = 0,
  Hidden = 1,
  Scroll = 2,
}

export enum PositionType {
  Static = 0,
  Relative = 1,
  Absolute = 2,
}

export enum PrintOptions {
  Layout = 1,
  Style = 2,
  Children = 4,
}

export enum Unit {
  Undefined = 0,
  Point = 1,
  Percent = 2,
  Auto = 3,
}

export enum Wrap {
  NoWrap = 0,
  Wrap = 1,
  WrapReverse = 2,
}