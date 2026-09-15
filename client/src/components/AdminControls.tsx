import * as Y from 'yjs';
import type { AwarenessUser, RoomMeta } from '../lib/types';
import { getUserFollowState } from '../lib/useYjsRoom';

type AdminControlsProps = {
  users: AwarenessUser[];
  adminName: string;
  roomMeta: RoomMeta;
  followMap: Y.Map<boolean>;
  onGlobalFollowChange: (enabled: boolean) => void;
  onUserFollowChange: (clientId: number, enabled: boolean) => void;
  onUserFollowReset: (clientId: number) => void;
};

export function AdminControls({
  users,
  adminName,
  roomMeta,
  followMap,
  onGlobalFollowChange,
  onUserFollowChange,
  onUserFollowReset,
}: AdminControlsProps) {
  const participants = users.filter((user) => user.name !== adminName);

  return (
    <section className="admin-controls" aria-label="管理员跟随控制">
      <div className="admin-controls-header">
        <strong>跟随控制</strong>
        <span className="admin-badge">管理员</span>
      </div>

      <label className="admin-global-toggle">
        <input
          type="checkbox"
          checked={roomMeta.globalFollow}
          onChange={(e) => onGlobalFollowChange(e.target.checked)}
        />
        <span>全体跟随我的视角</span>
      </label>

      <p className="admin-hint">滚轮缩放 · Alt+拖拽平移画布。单独开关覆盖全体设置。</p>

      {participants.length === 0 ? (
        <p className="admin-empty">暂无其他成员</p>
      ) : (
        <ul className="admin-user-list">
          {participants.map((user) => {
            const followState = getUserFollowState(user.clientId, roomMeta, followMap);
            const following = followState ?? roomMeta.globalFollow;

            return (
              <li key={user.clientId} className="admin-user-item">
                <span
                  className="presence-chip"
                  style={{
                    background: user.color.bg,
                    color: user.color.text,
                    borderColor: user.color.cursor,
                  }}
                >
                  {user.name}
                </span>

                <label className="admin-user-toggle">
                  <input
                    type="checkbox"
                    checked={following}
                    onChange={(e) => onUserFollowChange(user.clientId, e.target.checked)}
                  />
                  <span>跟随</span>
                </label>

                {followMap.has(String(user.clientId)) && (
                  <button
                    type="button"
                    className="btn-ghost admin-reset"
                    onClick={() => onUserFollowReset(user.clientId)}
                  >
                    恢复默认
                  </button>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}

type FollowBannerProps = {
  adminName: string;
  following: boolean;
};

export function FollowBanner({ adminName, following }: FollowBannerProps) {
  if (!following) return null;

  return (
    <div className="follow-banner" role="status">
      正在跟随 <strong>{adminName}</strong> 的视角
    </div>
  );
}
