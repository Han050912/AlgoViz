import { Button, Slider, Tooltip } from 'antd';
import {
  StepBackwardOutlined,
  CaretRightOutlined,
  PauseOutlined,
  StepForwardOutlined,
  FastForwardOutlined,
} from '@ant-design/icons';

interface PlaybackControlsProps {
  currentStep: number;
  totalSteps: number;
  isPlaying: boolean;
  speed: number;
  onStepChange: (step: number) => void;
  onPlay: () => void;
  onPause: () => void;
  onStepForward: () => void;
  onStepBackward: () => void;
  onSpeedChange: (speed: number) => void;
}

/**
 * PlaybackControls — 播放控制栏
 * 极简控制，低调度徘徊，不喧宾夺主
 */
const PlaybackControls = ({
  currentStep,
  totalSteps,
  isPlaying,
  speed,
  onStepChange,
  onPlay,
  onPause,
  onStepForward,
  onStepBackward,
  onSpeedChange,
}: PlaybackControlsProps) => (
  <div
    className="flex items-center gap-3 px-4"
    style={{
      height: 48,
      background: '#111827',
      borderTop: '1px solid var(--color-border)',
    }}
  >
    {/* 步退 */}
    <Tooltip title="后退一步">
      <Button
        size="small"
        type="text"
        icon={<StepBackwardOutlined />}
        onClick={onStepBackward}
        disabled={currentStep <= 0}
        style={{ color: 'var(--color-text-tertiary)' }}
      />
    </Tooltip>

    {/* 播放/暂停 */}
    <Tooltip title={isPlaying ? '暂停' : '播放'}>
      <Button
        size="small"
        type="text"
        icon={isPlaying ? <PauseOutlined /> : <CaretRightOutlined />}
        onClick={isPlaying ? onPause : onPlay}
        style={{ color: 'var(--color-brand-gold)' }}
      />
    </Tooltip>

    {/* 步进 */}
    <Tooltip title="前进一步">
      <Button
        size="small"
        type="text"
        icon={<StepForwardOutlined />}
        onClick={onStepForward}
        disabled={currentStep >= totalSteps - 1}
        style={{ color: 'var(--color-text-tertiary)' }}
      />
    </Tooltip>

    {/* 步骤滑条 */}
    <div className="flex items-center gap-2 flex-1">
      <Slider
        min={0}
        max={totalSteps - 1}
        value={currentStep}
        onChange={onStepChange}
        tooltip={{ formatter: (v) => '第 ' + ((v ?? 0) + 1) + ' 步' }}
        style={{ flex: 1, margin: 0 }}
      />
      <span style={{ fontSize: 12, color: 'var(--color-text-tertiary)', minWidth: 60, textAlign: 'right' }}>
        第 {currentStep + 1}/{totalSteps} 步
      </span>
    </div>

    {/* 速度 */}
    <Tooltip title="速度">
      <Slider
        min={0.25}
        max={4}
        step={0.25}
        value={speed}
        onChange={onSpeedChange}
        tooltip={{ formatter: (v) => (v ?? 1) + 'x' }}
        style={{ width: 80 }}
      />
    </Tooltip>
    <span style={{ fontSize: 12, color: 'var(--color-text-tertiary)', minWidth: 36 }}>{speed}x</span>
  </div>
);

export default PlaybackControls;
