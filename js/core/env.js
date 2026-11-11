/* Environment facts shared by every module. */

export var root = document.documentElement;

/* True when the visitor asked the OS for less motion. */
export var reduce = !!(window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches);
