export function centerAlign(value: string, width: number) {
	const padding = Math.floor((width - value.length) / 2);
	return `${' '.repeat(padding)}${value}${' '.repeat(padding)}`;
}
