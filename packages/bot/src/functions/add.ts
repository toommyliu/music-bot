import type { Addable } from '#struct/Queue';

export function add(tracks: Addable | Addable[]) {
	// eslint-disable-next-line no-param-reassign
	tracks = Array.isArray(tracks) ? tracks : [tracks];
}
