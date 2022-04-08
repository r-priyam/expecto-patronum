import { centerAlign } from '#utils/util';

export class TabularData {
	private _widths: number[] = [];
	private _columns: string[] = [];
	private _rows: string[][] = [];

	public setColumns(columns: string[]) {
		this._columns = columns;
		this._widths = columns.map((c) => c.length + 2);
	}

	public addRow(row: any[]) {
		const rows = row.map((r) => String(r));
		this._rows.push(rows);

		rows.forEach((e, i) => {
			const width = e.length + 2;
			if (width > this._widths[i]) {
				this._widths[i] = width;
			}
		});
	}

	public addRows(rows: any[]) {
		for (const row of rows) {
			this.addRow(row);
		}
	}

	public clearRows = () => (this._rows = []);

	public renderTable() {
		let sep = this._widths.map((w) => '-'.repeat(w)).join('+');
		sep = `+${sep}+`;

		const toDraw = [sep];

		function getEntry(widths: number[], data: string[]) {
			const element = data.map((e, i) => centerAlign(e, widths[i])).join('|');
			return `|${element}|`;
		}

		toDraw.push(getEntry(this._widths, this._columns));
		toDraw.push(sep);

		for (const row of this._rows) {
			toDraw.push(getEntry(this._widths, row));
		}

		toDraw.push(sep);
		return toDraw.join('\n');
	}
}
