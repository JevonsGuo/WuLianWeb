'use client';

import { useEffect, useState } from 'react';
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
  const [ready, setReady] = useState(false);

  useEffect(() => {
    import('@/lib/quillTableUp').then(() => {
      setReady(true);
    }).catch(() => {
      setReady(true);
    });
  }, []);

  const modules = {
    toolbar: [
      [{ header: [1, 2, 3, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ list: 'ordered' }, { list: 'bullet' }],
      [{ 'table-up': [] }],
      ['link', 'image'],
      ['clean'],
    ],
    'table-up': {
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
    },
  };

  if (!ready) {
    return (
      <div style={style} className="h-40 flex items-center justify-center text-surface-400 text-sm">
        加载编辑器...
      </div>
    );
  }

  return (
    <div style={style}>
      <ReactQuill
        theme="snow"
        value={value}
        onChange={onChange}
        modules={modules}
        placeholder={placeholder || '请输入内容...'}
      />
    </div>
  );
}
