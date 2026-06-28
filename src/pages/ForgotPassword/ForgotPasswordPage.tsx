import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Form, Input, Button, message } from 'antd';
import {
  MailOutlined,
  LockOutlined,
  NumberOutlined,
  SendOutlined,
} from '@ant-design/icons';
import AuthLayout from '@/components/auth/AuthLayout';
import AlgoVizLogo from '@/components/auth/AlgoVizLogo';
import { useAuthContext } from '@/components/auth/AuthLayout';
import useAutoLogin from '@/hooks/useAutoLogin';
import { authService } from '@/services/authService';
import type { ResetPasswordRequest } from '@/types/auth';

interface ForgotPasswordFormValues {
  email: string;
  verificationCode: string;
  newPassword: string;
  confirmPassword: string;
}

/**
 * ForgotPasswordPage — 忘记密码页 /forgot-password
 */
const ForgotPasswordPageContent = () => {
  useAutoLogin();
  const navigate = useNavigate();
  const { isDarkMode } = useAuthContext();
  const [loading, setLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [sendingCode, setSendingCode] = useState(false);
  const [form] = Form.useForm<ForgotPasswordFormValues>();

  // 倒计时
  useEffect(() => {
    if (countdown <= 0) return;
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) return 0;
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [countdown]);

  const handleSendCode = useCallback(async () => {
    try {
      await form.validateFields(['email']);
    } catch {
      return;
    }
    const email = form.getFieldValue('email');
    setSendingCode(true);
    try {
      await authService.sendResetCode(email);
      message.success('验证码已发送');
      setCountdown(60);
    } catch (err: any) {
      const status = err?.response?.status;
      if (status === 404) {
        message.warning('该邮箱未注册');
      } else if (err?.code === 'ERR_NETWORK') {
        message.error('网络连接失败，请检查网络');
      } else {
        message.error('发送失败，请稍后重试');
      }
    } finally {
      setSendingCode(false);
    }
  }, [form]);

  const onFinish = useCallback(
    async (values: ForgotPasswordFormValues) => {
      setLoading(true);
      try {
        const data: ResetPasswordRequest = {
          email: values.email,
          verification_code: values.verificationCode,
          new_password: values.newPassword,
          confirm_password: values.confirmPassword,
        };
        await authService.resetPassword(data);
        message.success('密码重置成功，请重新登录');
        setTimeout(() => navigate('/login', { replace: true }), 1500);
      } catch (err: any) {
        const status = err?.response?.status;
        if (status === 401) {
          message.error('验证码无效或已过期');
        } else if (status === 400) {
          message.error(err?.response?.data?.message || '请求有误');
        } else if (status && status >= 500) {
          message.error('服务器错误，请稍后重试');
        } else if (err?.code === 'ERR_NETWORK') {
          message.error('网络连接失败，请检查网络');
        } else {
          message.error('重置失败，请稍后重试');
        }
      } finally {
        setLoading(false);
      }
    },
    [navigate]
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
        忘记密码
      </h1>
      <p
        className="text-center mb-8"
        style={{ fontSize: 14, fontWeight: 400, color: subColor }}
      >
        我们将向您的邮箱发送验证码
      </p>

      <Form<ForgotPasswordFormValues>
        form={form}
        layout="vertical"
        onFinish={onFinish}
        autoComplete="off"
        size="large"
      >
        {/* 邮箱 */}
        <Form.Item
          name="email"
          label={<span style={{ color: textColor, fontSize: 14 }}>邮箱</span>}
          rules={[{ required: true, type: 'email', message: '请输入有效的邮箱地址' }]}
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

        {/* 验证码（输入框 + 发送按钮同行） */}
        <Form.Item
          label={<span style={{ color: textColor, fontSize: 14 }}>验证码</span>}
          required
        >
          <div style={{ display: 'flex', gap: 8 }}>
            <Form.Item
              name="verificationCode"
              noStyle
              rules={[{ required: true, message: '请输入验证码' }]}
            >
              <Input
                prefix={<NumberOutlined />}
                placeholder="请输入验证码"
                style={{
                  flex: 1,
                  height: 42,
                  borderRadius: 8,
                  background: isDarkMode
                    ? 'var(--color-auth-bg-input-dark)'
                    : '#fff',
                  borderColor: 'var(--color-auth-border)',
                  color: textColor,
                }}
              />
            </Form.Item>
            <Button
              icon={<SendOutlined />}
              onClick={handleSendCode}
              disabled={countdown > 0}
              className="captcha-send-btn"
              style={{
                height: 42,
                minWidth: 130,
                borderRadius: 8,
                fontSize: 14,
                fontWeight: 500,
              }}
            >
              {countdown > 0 ? countdown + 's 后重试' : '发送验证码'}
            </Button>
          </div>
        </Form.Item>

        {/* 新密码 */}
        <Form.Item
          name="newPassword"
          label={<span style={{ color: textColor, fontSize: 14 }}>新密码</span>}
          rules={[{ required: true, min: 8, message: '密码至少 8 位' }]}
        >
          <Input.Password
            prefix={<LockOutlined />}
            placeholder="请输入新密码"
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
          dependencies={['newPassword']}
          rules={[
            { required: true, message: '请再次输入新密码' },
            ({ getFieldValue }) => ({
              validator(_, value) {
                if (!value || getFieldValue('newPassword') === value) {
                  return Promise.resolve();
                }
                return Promise.reject(new Error('两次输入的密码不一致'));
              },
            }),
          ]}
        >
          <Input.Password
            prefix={<LockOutlined />}
            placeholder="请再次输入新密码"
            style={{
              height: 42,
              borderRadius: 8,
              background: isDarkMode ? 'var(--color-auth-bg-input-dark)' : '#fff',
              borderColor: 'var(--color-auth-border)',
              color: textColor,
            }}
          />
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
            {loading ? '重置中...' : '重置密码 →'}
          </Button>
        </Form.Item>
      </Form>

      {/* 底部登录入口 */}
      <div className="text-center">
        <p className="mb-3" style={{ fontSize: 14, color: subColor }}>
          想起密码？
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

const ForgotPasswordPage = () => (
  <AuthLayout>
    <ForgotPasswordPageContent />
  </AuthLayout>
);

export default ForgotPasswordPage;
