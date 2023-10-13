import { load } from "loader";

export interface Asset {
    load(url: string): Promise<this>;
}

export class Text implements Asset {
    private _content: string = '';
    public get content(): string {
        return this._content;
    }

    async load(url: string): Promise<this> {
        this._content = await load(url, 'text');
        return this;
    }
}