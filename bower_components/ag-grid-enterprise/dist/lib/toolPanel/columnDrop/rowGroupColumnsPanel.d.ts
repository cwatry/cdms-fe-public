// ag-grid-enterprise v14.2.0
import { Column } from "ag-grid/main";
import { AbstractColumnDropPanel } from "./abstractColumnDropPanel";
export declare class RowGroupColumnsPanel extends AbstractColumnDropPanel {
    private columnController;
    private eventService;
    private gridOptionsWrapper;
    private context;
    private loggerFactory;
    private dragAndDropService;
    private columnApi;
    private gridApi;
    constructor(horizontal: boolean);
    private passBeansUp();
    protected isColumnDroppable(column: Column): boolean;
    protected updateColumns(columns: Column[]): void;
    protected getIconName(): string;
    protected getExistingColumns(): Column[];
}
