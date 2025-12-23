import type { Dispatch, SetStateAction } from "react";

/** Alias type for the setState function from useState hook */
export type SetState<T> = Dispatch<SetStateAction<T>>;
