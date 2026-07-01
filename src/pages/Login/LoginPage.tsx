import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Form, Input, Button, Checkbox, message } from 'antd';
import {
  MailOutlined,
  LockOutlined,
} from '@ant-design/icons';
import AuthLayout from '@/components/auth/AuthLayout';
import AlgoVizLogo from '@/components/auth/AlgoVizLogo';
import { useAuthContext } from '@/components/auth/AuthLayout';
import useAutoLogin from '@/hooks/useAutoLogin';
import { authService } from '@/services/authService';
import type { LoginRequest } from '@/types/auth';

interface LoginFormValues {
  email: string;
  password: string;
  rememberMe: boolean;
}

/**
 * LoginPage — 登录页 /login
 */
const LoginPageContent = () => {
  useAutoLogin();
  const navigate = useNavigate();
  const { isDarkMode } = useAuthContext();
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm<LoginFormValues>();

  const onFinish = async (values: LoginFormValues) => {
    setLoading(true);
    try {
      const data: LoginRequest = {
        email: values.email,
        password: values.password,
      };
      const res = await authService.login(data);
      const store = values.rememberMe ? localStorage : sessionStorage;
      store.setItem('access_token', res.access_token);
      store.setItem('refresh_token', res.refresh_token);
      message.success('登录成功');
      navigate('/workspace', { replace: true });
    } catch (err: any) {
      const status = err?.response?.status;
      if (status === 401) {
        message.error('邮箱或密码错误');
      } else if (status === 422) {
        message.error('输入数据有误，请检查');
      } else if (status && status >= 500) {
        message.error('服务器错误，请稍后重试');
      } else if (err?.code === 'ERR_NETWORK') {
        message.error('网络连接失败，请检查网络');
      } else {
        message.error('登录失败，请稍后重试');
      }
    } finally {
      setLoading(false);
    }
  };

  const textColor = isDarkMode ? 'var(--color-text-primary)' : 'var(--color-auth-text-primary)';
  const subColor = isDarkMode ? 'var(--color-text-tertiary)' : 'var(--color-auth-text-tertiary)';

  return (
    <>
      <AlgoVizLogo />
      <h1
        className="text-center mb-1"
        style={{
          fontSize: 28,
          fontWeight: 700,
          color: textColor,
          lineHeight: 1.3,
        }}
      >
        登录 AlgoViz
      </h1>
      <p
        className="text-center mb-8"
        style={{
          fontSize: 14,
          fontWeight: 400,
          color: subColor,
        }}
      >
        上传代码，可视化你的算法
      </p>

      <Form<LoginFormValues>
        form={form}
        layout="vertical"
        initialValues={{ rememberMe: true }}
        onFinish={onFinish}
        autoComplete="off"
        size="large"
      >
        <Form.Item
          name="email"
          label={<span style={{ color: textColor, fontSize: 14 }}>邮箱</span>}
          rules={[
            { required: true, type: 'email', message: '请输入有效的邮箱地址' },
          ]}
        >
          <Input
            prefix={<MailOutlined />}
            placeholder="请输入邮箱"
            style={{
              height: 42,
              borderRadius: 8,
              background: isDarkMode ? 'var(--color-auth-bg-input-dark)' : '#fff',
              borderColor: 'var(--color-auth-border)',
              color: textColor,
            }}
          />
        </Form.Item>

        <Form.Item
          name="password"
          label={<span style={{ color: textColor, fontSize: 14 }}>密码</span>}
          rules={[{ required: true, min: 8, message: '密码至少 8 位' }]}
        >
          <Input.Password
            prefix={<LockOutlined />}
            placeholder="请输入密码"
            style={{
              height: 42,
              borderRadius: 8,
              background: isDarkMode ? 'var(--color-auth-bg-input-dark)' : '#fff',
              borderColor: 'var(--color-auth-border)',
              color: textColor,
            }}
          />
        </Form.Item>

        {/* 辅助行 */}
        <div className="flex items-center justify-between mb-2">
          <Form.Item name="rememberMe" valuePropName="checked" noStyle>
            <Checkbox style={{ color: textColor, fontSize: 14 }}>
              记住我
            </Checkbox>
          </Form.Item>
          <Link
            to="/forgot-password"
            style={{
              fontSize: 14,
              color: 'var(--color-brand-gold-light)',
            }}
          >
            忘记密码？
          </Link>
        </div>

        {/* 提交按钮 */}
        <Form.Item className="mb-4">
          <Button
            type="primary"
            htmlType="submit"
            loading={loading}
            block
            style={{
              height: 42,
              fontSize: 16,
              fontWeight: 500,
              borderRadius: 8,
              background: 'var(--color-brand-gold)',
              borderColor: 'var(--color-brand-gold)',
              color: '#fff',
            }}
          >
            {loading ? '登录中...' : '登录 →'}
          </Button>
        </Form.Item>
      </Form>

      {/* 底部注册入口 */}
      <div className="text-center">
        <p
          className="mb-3"
          style={{ fontSize: 14, color: subColor }}
        >
          还没有账户？
        </p>
        <Button
          block
          ghost
          onClick={() => navigate('/register')}
          style={{
            height: 42,
            fontSize: 16,
            fontWeight: 500,
            borderRadius: 8,
            borderColor: 'var(--color-auth-border)',
            color: textColor,
          }}
        >
          创建账户
        </Button>
      </div>
    </>
  );
};

const LoginPage = () => (
  <AuthLayout>
    <LoginPageContent />
  </AuthLayout>
);

export default LoginPage;
