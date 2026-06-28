import { Select, Button, Upload, Tooltip } from 'antd';
import {
  CodeOutlined,
  FileTextOutlined,
  UploadOutlined,
} from '@ant-design/icons';
import { templates } from './templates';

interface EditorToolbarProps {
  language: string;
  onLanguageChange: (lang: string) => void;
  onTemplateSelect: (code: string) => void;
  onFileUpload: (code: string) => void;
}

const languages = ['python', 'javascript', 'java', 'cpp', 'go', 'rust'];

/**
 * EditorToolbar — 编辑器顶栏（语言选择 + 模板 + 上传）
 */
const EditorToolbar = ({
  language,
  onLanguageChange,
  onTemplateSelect,
  onFileUpload,
}: EditorToolbarProps) => (
  <div
    className="flex items-center gap-3 px-3"
    style={{
      height: 40,
      background: '#111827',
      borderBottom: '1px solid var(--color-border)',
    }}
  >
    {/* 语言选择 */}
    <Select
      value={language}
      onChange={onLanguageChange}
      options={languages.map((l) => ({ value: l, label: l.charAt(0).toUpperCase() + l.slice(1) }))}
      style={{ width: 130 }}
      size="small"
      suffixIcon={<CodeOutlined style={{ color: 'var(--color-text-tertiary)' }} />}
    />

    {/* 模板选择 */}
    <Select
      placeholder="模板"
      onChange={(key) => {
        const tpl = templates.find((t) => t.key === key);
        if (tpl) {
          onLanguageChange(tpl.language);
          onTemplateSelect(tpl.code);
        }
      }}
      options={templates.map((t) => ({
        value: t.key,
        label: t.label,
      }))}
      style={{ width: 150 }}
      size="small"
      suffixIcon={<FileTextOutlined style={{ color: 'var(--color-text-tertiary)' }} />}
    />

    <div className="flex-1" />

    {/* 上传文件 */}
    <Upload
      accept=".py,.js,.java,.cpp,.go,.rs,.txt"
      showUploadList={false}
      beforeUpload={(file) => {
        const reader = new FileReader();
        reader.onload = (e) => {
          onFileUpload(e.target?.result as string);
        };
        reader.readAsText(file);
        return false;
      }}
    >
      <Tooltip title="上传文件">
        <Button
          size="small"
          icon={<UploadOutlined />}
          style={{
            background: 'transparent',
            border: '1px solid var(--color-border)',
            color: 'var(--color-text-tertiary)',
          }}
        />
      </Tooltip>
    </Upload>
  </div>
);

export default EditorToolbar;
