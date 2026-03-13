let activeBlock = null;
let offsetX = 0;
let offsetY = 0;
let connections = [];
let activeLine = null;
let startBlock = null;
let executionInProgress = false;
let variables = {};
let varTypes = {};

let debugMode = false;
let debugCurrentBlock = null;
let debugTimeoutId = null;
let debugStepResolve = null;
let debugHighlightInterval = null;
let debugIndicator = null;

let tryCatchStack = [];
let currentError = null;
let errorCaught = false;