export var Align;
(function (Align) {
    Align[Align["Auto"] = 0] = "Auto";
    Align[Align["FlexStart"] = 1] = "FlexStart";
    Align[Align["Center"] = 2] = "Center";
    Align[Align["FlexEnd"] = 3] = "FlexEnd";
    Align[Align["Stretch"] = 4] = "Stretch";
    Align[Align["Baseline"] = 5] = "Baseline";
    Align[Align["SpaceBetween"] = 6] = "SpaceBetween";
    Align[Align["SpaceAround"] = 7] = "SpaceAround";
    Align[Align["SpaceEvenly"] = 8] = "SpaceEvenly";
})(Align || (Align = {}));
export var Dimension;
(function (Dimension) {
    Dimension[Dimension["Width"] = 0] = "Width";
    Dimension[Dimension["Height"] = 1] = "Height";
})(Dimension || (Dimension = {}));
export var Direction;
(function (Direction) {
    Direction[Direction["Inherit"] = 0] = "Inherit";
    Direction[Direction["LTR"] = 1] = "LTR";
    Direction[Direction["RTL"] = 2] = "RTL";
})(Direction || (Direction = {}));
export var Display;
(function (Display) {
    Display[Display["Flex"] = 0] = "Flex";
    Display[Display["None"] = 1] = "None";
})(Display || (Display = {}));
export var Edge;
(function (Edge) {
    Edge[Edge["Left"] = 0] = "Left";
    Edge[Edge["Top"] = 1] = "Top";
    Edge[Edge["Right"] = 2] = "Right";
    Edge[Edge["Bottom"] = 3] = "Bottom";
    Edge[Edge["Start"] = 4] = "Start";
    Edge[Edge["End"] = 5] = "End";
    Edge[Edge["Horizontal"] = 6] = "Horizontal";
    Edge[Edge["Vertical"] = 7] = "Vertical";
    Edge[Edge["All"] = 8] = "All";
})(Edge || (Edge = {}));
export var Errata;
(function (Errata) {
    Errata[Errata["None"] = 0] = "None";
    Errata[Errata["StretchFlexBasis"] = 1] = "StretchFlexBasis";
    Errata[Errata["PositionStaticBehavesLikeRelative"] = 2] = "PositionStaticBehavesLikeRelative";
    Errata[Errata["AbsolutePositioning"] = 4] = "AbsolutePositioning";
    Errata[Errata["All"] = 2147483647] = "All";
    Errata[Errata["Classic"] = 2147483646] = "Classic";
})(Errata || (Errata = {}));
export var ExperimentalFeature;
(function (ExperimentalFeature) {
    ExperimentalFeature[ExperimentalFeature["WebFlexBasis"] = 0] = "WebFlexBasis";
    ExperimentalFeature[ExperimentalFeature["AbsolutePercentageAgainstPaddingEdge"] = 1] = "AbsolutePercentageAgainstPaddingEdge";
})(ExperimentalFeature || (ExperimentalFeature = {}));
export var FlexDirection;
(function (FlexDirection) {
    FlexDirection[FlexDirection["Column"] = 0] = "Column";
    FlexDirection[FlexDirection["ColumnReverse"] = 1] = "ColumnReverse";
    FlexDirection[FlexDirection["Row"] = 2] = "Row";
    FlexDirection[FlexDirection["RowReverse"] = 3] = "RowReverse";
})(FlexDirection || (FlexDirection = {}));
export var Gutter;
(function (Gutter) {
    Gutter[Gutter["Column"] = 0] = "Column";
    Gutter[Gutter["Row"] = 1] = "Row";
    Gutter[Gutter["All"] = 2] = "All";
})(Gutter || (Gutter = {}));
export var Justify;
(function (Justify) {
    Justify[Justify["FlexStart"] = 0] = "FlexStart";
    Justify[Justify["Center"] = 1] = "Center";
    Justify[Justify["FlexEnd"] = 2] = "FlexEnd";
    Justify[Justify["SpaceBetween"] = 3] = "SpaceBetween";
    Justify[Justify["SpaceAround"] = 4] = "SpaceAround";
    Justify[Justify["SpaceEvenly"] = 5] = "SpaceEvenly";
})(Justify || (Justify = {}));
export var LogLevel;
(function (LogLevel) {
    LogLevel[LogLevel["Error"] = 0] = "Error";
    LogLevel[LogLevel["Warn"] = 1] = "Warn";
    LogLevel[LogLevel["Info"] = 2] = "Info";
    LogLevel[LogLevel["Debug"] = 3] = "Debug";
    LogLevel[LogLevel["Verbose"] = 4] = "Verbose";
    LogLevel[LogLevel["Fatal"] = 5] = "Fatal";
})(LogLevel || (LogLevel = {}));
export var MeasureMode;
(function (MeasureMode) {
    MeasureMode[MeasureMode["Undefined"] = 0] = "Undefined";
    MeasureMode[MeasureMode["Exactly"] = 1] = "Exactly";
    MeasureMode[MeasureMode["AtMost"] = 2] = "AtMost";
})(MeasureMode || (MeasureMode = {}));
export var NodeType;
(function (NodeType) {
    NodeType[NodeType["Default"] = 0] = "Default";
    NodeType[NodeType["Text"] = 1] = "Text";
})(NodeType || (NodeType = {}));
export var Overflow;
(function (Overflow) {
    Overflow[Overflow["Visible"] = 0] = "Visible";
    Overflow[Overflow["Hidden"] = 1] = "Hidden";
    Overflow[Overflow["Scroll"] = 2] = "Scroll";
})(Overflow || (Overflow = {}));
export var PositionType;
(function (PositionType) {
    PositionType[PositionType["Static"] = 0] = "Static";
    PositionType[PositionType["Relative"] = 1] = "Relative";
    PositionType[PositionType["Absolute"] = 2] = "Absolute";
})(PositionType || (PositionType = {}));
export var PrintOptions;
(function (PrintOptions) {
    PrintOptions[PrintOptions["Layout"] = 1] = "Layout";
    PrintOptions[PrintOptions["Style"] = 2] = "Style";
    PrintOptions[PrintOptions["Children"] = 4] = "Children";
})(PrintOptions || (PrintOptions = {}));
export var Unit;
(function (Unit) {
    Unit[Unit["Undefined"] = 0] = "Undefined";
    Unit[Unit["Point"] = 1] = "Point";
    Unit[Unit["Percent"] = 2] = "Percent";
    Unit[Unit["Auto"] = 3] = "Auto";
})(Unit || (Unit = {}));
export var Wrap;
(function (Wrap) {
    Wrap[Wrap["NoWrap"] = 0] = "NoWrap";
    Wrap[Wrap["Wrap"] = 1] = "Wrap";
    Wrap[Wrap["WrapReverse"] = 2] = "WrapReverse";
})(Wrap || (Wrap = {}));
