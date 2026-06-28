import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Form, Input, Select, Button, message } from 'antd';
import {
  MailOutlined,
  LockOutlined,
  CheckCircleOutlined,
} from '@ant-design/icons';
import AuthLayout from '@/components/auth/AuthLayout';
import AlgoVizLogo from '@/components/auth/AlgoVizLogo';
import { useAuthContext } from '@/components/auth/AuthLayout';
import useAutoLogin from '@/hooks/useAutoLogin';
import { authService } from '@/services/authService';
import type { RegisterRequest } from '@/types/auth';

interface RegisterFormValues {
  emailPrefix: string;
  emailDomain: string;
  password: string;
  confirmPassword: string;
  captchaVerified: boolean;
}

const domainOptions = ['gmail.com', 'outlook.com', 'qq.com', '163.com', 'yahoo.com'];

/**
 * RegisterPage — 注册页 /register
 */
const RegisterPageContent = () => {
  useAutoLogin();
  const navigate = useNavigate();
  const { isDarkMode } = useAuthContext();
  const [loading, setLoading] = useState(false);
  const [captchaVerified, setCaptchaVerified] = useState(false);
  const [captchaChecking, setCaptchaChecking] = useState(true);
  const [form] = Form.useForm<RegisterFormValues>();

  // 人机验证 3 秒模拟
  useEffect(() => {
    const timer = setTimeout(() => {
      setCaptchaChecking(false);
      setCaptchaVerified(true);
      form.setFieldsValue({ captchaVerified: true });
    }, 3000);
    return () => clearTimeout(timer);
  }, [form]);

  const onFinish = useCallback(
    async (values: RegisterFormValues) => {
      setLoading(true);
      try {
        const email = values.emailPrefix + '@' + values.emailDomain;
        const data: RegisterRequest = { email, password: values.password };
        await authService.register(data);
        message.success('注册成功，即将跳转登录页');
        setTimeout(() => navigate('/login', { replace: true }), 1500);
      } catch (err: any) {
        const status = err?.response?.status;
        if (status === 409) {
          form.setFields([
            {
              name: 'emailPrefix',
              errors: ['该邮箱已注册'],
            },
          ]);
          message.warning('该邮箱已注册');
        } else if (status === 422) {
          message.error('输入数据有误，请检查');
        } else if (status && status >= 500) {
          message.error('服务器错误，请稍后重试');
        } else if (err?.code === 'ERR_NETWORK') {
          message.error('网络连接失败，请检查网络');
        } else {
          message.error('注册失败，请稍后重试');
        }
      } finally {
        setLoading(false);
      }
    },
    [form, navigate]
  );

  const textColor = isDarkMode ? '#E0E0E0' : 'var(--color-auth-text-primary)';
  const subColor = isDarkMode ? '#9CA3AF' : 'var(--color-auth-text-tertiary)';

  return (
    <>
      <AlgoVizLogo />
      <h1
        className="text-center mb-1"
        style={{ fontSize: 28, fontWeight: 700, color: textColor, lineHeight: 1.3 }}
      >
        创建账户
      </h1>
      <p
        className="text-center mb-8"
        style={{ fontSize: 14, fontWeight: 400, color: subColor }}
      >
        上传代码，可视化你的算法
      </p>

      <Form<RegisterFormValues>
        form={form}
        layout="vertical"
        initialValues={{ emailDomain: 'gmail.com', captchaVerified: false }}
        onFinish={onFinish}
        autoComplete="off"
        size="large"
      >
        {/* 邮箱（域名下拉） */}
        <Form.Item
          label={<span style={{ color: textColor, fontSize: 14 }}>邮箱</span>}
          required
        >
          <Input.Group compact style={{ display: 'flex' }}>
            <Form.Item
              name="emailPrefix"
              noStyle
              rules={[{ required: true, message: '请输入邮箱前缀' }]}
            >
              <Input
                prefix={<MailOutlined />}
                placeholder="请输入邮箱"
                style={{
                  width: '55%',
                  height: 42,
                  borderRadius: '8px 0 0 8px',
                  background: isDarkMode ? 'var(--color-auth-bg-input-dark)' : '#fff',
                  borderColor: 'var(--color-auth-border)',
                  color: isDarkMode ? '#E0E0E0' : 'var(--color-auth-text-primary)',
                }}
                className={isDarkMode ? 'auth-input-dark-placeholder' : 'auth-input-light-placeholder'}
              />
            </Form.Item>
            <Form.Item name="emailDomain" noStyle>
              <Select
                showSearch
                options={domainOptions.map((d) => ({ value: d, label: '@' + d }))}
                dropdownClassName={isDarkMode ? 'auth-select-dropdown-dark' : 'auth-select-dropdown-light'}
                style={{
                  width: '45%',
                  height: 42,
                  borderRadius: '0 8px 8px 0',
                  background: isDarkMode ? 'var(--color-auth-bg-input-dark)' : '#fff',
                  color: isDarkMode ? '#E0E0E0' : undefined,
                }}
              />
            </Form.Item>
          </Input.Group>
        </Form.Item>

        {/* 密码 */}
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

        {/* 确认密码 */}
        <Form.Item
          name="confirmPassword"
          label={<span style={{ color: textColor, fontSize: 14 }}>确认密码</span>}
          dependencies={['password']}
          rules={[
            { required: true, message: '请再次输入密码' },
            ({ getFieldValue }) => ({
              validator(_, value) {
                if (!value || getFieldValue('password') === value) {
                  return Promise.resolve();
                }
                return Promise.reject(new Error('两次输入的密码不一致'));
              },
            }),
          ]}
        >
          <Input.Password
            prefix={<LockOutlined />}
            placeholder="请再次输入密码"
            style={{
              height: 42,
              borderRadius: 8,
              background: isDarkMode ? 'var(--color-auth-bg-input-dark)' : '#fff',
              borderColor: 'var(--color-auth-border)',
              color: textColor,
            }}
          />
        </Form.Item>

        {/* 人机验证 */}
        <Form.Item
          name="captchaVerified"
          label={<span style={{ color: textColor, fontSize: 14 }}>人机验证</span>}
          rules={[
            {
              validator: (_, value) =>
                value ? Promise.resolve() : Promise.reject(new Error('请完成人机验证')),
            },
          ]}
        >
          <div
            className="flex items-center justify-between"
            style={{
              background: 'var(--color-captcha-bg)',
              borderRadius: 8,
              padding: '12px 16px',
            }}
          >
            <div className="flex items-center gap-3">
              {captchaChecking ? (
                <span
                  className="inline-block rounded-full animate-pulse"
                  style={{
                    width: 12,
                    height: 12,
                    background: '#22C55E',
                  }}
                />
              ) : captchaVerified ? (
                <CheckCircleOutlined
                  className="animate-scale-in"
                  style={{ color: '#22C55E', fontSize: 16 }}
                />
              ) : (
                <span
                  className="inline-block rounded-full"
                  style={{ width: 12, height: 12, background: '#EF4444' }}
                />
              )}
              <span style={{ color: '#FFFFFF', fontSize: 14 }}>
                {captchaChecking
                  ? '正在验证...'
                  : captchaVerified
                  ? '验证通过'
                  : '验证失败'}
              </span>
            </div>
            <span style={{ color: '#666', fontSize: 12 }}>Cloudflare</span>
          </div>
        </Form.Item>

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
            {loading ? '注册中...' : '注册 →'}
          </Button>
        </Form.Item>
      </Form>

      {/* 底部登录入口 */}
      <div className="text-center">
        <p className="mb-3" style={{ fontSize: 14, color: subColor }}>
          已有账户？
        </p>
        <Button
          block
          ghost
          onClick={() => navigate('/login')}
          style={{
            height: 42,
            fontSize: 16,
            fontWeight: 500,
            borderRadius: 8,
            borderColor: 'var(--color-auth-border)',
            color: textColor,
          }}
        >
          登录
        </Button>
      </div>
    </>
  );
};

const RegisterPage = () => (
  <AuthLayout>
    <RegisterPageContent />
  </AuthLayout>
);

export default RegisterPage;
