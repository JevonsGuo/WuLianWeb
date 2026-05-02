import { Quill } from 'react-quill-new';
import TableUp from 'quill-table-up';
import 'quill-table-up/index.css';
import 'quill-table-up/table-creator.css';

Quill.register({ [`modules/${TableUp.moduleName}`]: TableUp }, true);

export { Quill, TableUp };
