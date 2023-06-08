// ABK: obviate this entire collection


/** Alternative to `any` with stronger encouragement to be corrected. */
export type FixThisType = any;

/** A function which is not replaceable by its return value, failing the Liskov Substitution Principle. */
export type ImpureFunction = () => FixThisType;

export type DispatchFunction = (action: FixThisType) => void;

export type DispatchFunctionWithReturn = (action: FixThisType) => FixThisType;
