import Quill from 'quill';
import TableUp, { defaultCustomSelect, TableSelection, TableMenuContextmenu, TableResizeLine } from 'quill-table-up';
import 'quill-table-up/index.css';
import 'quill-table-up/table-creator.css';

Quill.register({ [`modules/${TableUp.moduleName}`]: TableUp }, true);

export { TableUp, defaultCustomSelect, TableSelection, TableMenuContextmenu, TableResizeLine };
