'use client';

import { useMemo } from 'react';
import dynamic from 'next/dynamic';
import 'react-quill-new/dist/quill.snow.css';

const ReactQuill = dynamic(() => import('react-quill-new'), { ssr: false });

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  style?: React.CSSProperties;
}

export default function RichTextEditor({ value, onChange, placeholder, style }: RichTextEditorProps) {
  const modules = useMemo(() => {
    let TableUp: any;
    let defaultCustomSelect: any;
    let TableSelection: any;
    let TableMenuContextmenu: any;
    let TableResizeLine: any;
    try {
      const tableUpModule = require('quill-table-up');
      TableUp = tableUpModule.default;
      defaultCustomSelect = tableUpModule.defaultCustomSelect;
      TableSelection = tableUpModule.TableSelection;
      TableMenuContextmenu = tableUpModule.TableMenuContextmenu;
      TableResizeLine = tableUpModule.TableResizeLine;

      const Quill = require('quill').default || require('quill');
      Quill.register({ [`modules/${TableUp.moduleName}`]: TableUp }, true);
    } catch {
      return {
        toolbar: [
          [{ header: [1, 2, 3, false] }],
          ['bold', 'italic', 'underline', 'strike'],
          [{ list: 'ordered' }, { list: 'bullet' }],
          ['link', 'image'],
          ['clean'],
        ],
      };
    }

    return {
      toolbar: [
        [{ header: [1, 2, 3, false] }],
        ['bold', 'italic', 'underline', 'strike'],
        [{ list: 'ordered' }, { list: 'bullet' }],
        [{ [TableUp.toolName]: [] }],
        ['link', 'image'],
        ['clean'],
      ],
      [TableUp.moduleName]: {
        customSelect: defaultCustomSelect,
        texts: {
          fullCheckboxText: '插入全宽表格',
          customBtnText: '自定义',
          confirmText: '确认',
          cancelText: '取消',
          rowText: '行',
          colText: '列',
          InsertTop: '上方插入行',
          InsertRight: '右侧插入列',
          InsertBottom: '下方插入行',
          InsertLeft: '左侧插入列',
          MergeCell: '合并单元格',
          SplitCell: '拆分单元格',
          DeleteRow: '删除行',
          DeleteColumn: '删除列',
          DeleteTable: '删除表格',
          BackgroundColor: '设置背景色',
          BorderColor: '设置边框色',
          SwitchWidth: '切换表格宽度',
        },
        modules: [
          { module: TableSelection },
          { module: TableResizeLine },
          { module: TableMenuContextmenu },
        ],
      },
    };
  }, []);

  const formats = [
    'header', 'bold', 'italic', 'underline', 'strike',
    'list', 'bullet', 'link', 'image',
    'table-up', 'table-up-cell-inner',
  ];

  return (
    <div style={style}>
      <ReactQuill
        theme="snow"
        value={value}
        onChange={onChange}
        modules={modules}
        formats={formats}
        placeholder={placeholder || '请输入内容...'}
      />
    </div>
  );
}
