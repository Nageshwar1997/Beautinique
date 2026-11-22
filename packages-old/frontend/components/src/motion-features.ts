// Motion's features for layout, exit and drag animations, in a chunk of their own: LazyMotion
// loads it once something animates, so a page without a toast never downloads it.
import { domMax } from 'motion/react';

export default domMax;
