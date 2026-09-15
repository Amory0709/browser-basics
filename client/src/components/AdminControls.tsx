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
    <section className="admin-controls" aria-label="Presenter controls">
      <div className="admin-controls-header">
        <strong>Presenter</strong>
      </div>

      <label className="admin-global-toggle">
        <input
          type="checkbox"
          checked={roomMeta.globalFollow}
          onChange={(e) => onGlobalFollowChange(e.target.checked)}
        />
        <span>Everyone follows my view</span>
      </label>

      <p className="admin-hint">
        Scroll to zoom · right-click or Alt+drag to pan. Per-user toggles override the global setting.
      </p>

      {participants.length === 0 ? (
        <p className="admin-empty">No other participants yet</p>
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
                  <span>Follow</span>
                </label>

                {followMap.has(String(user.clientId)) && (
                  <button
                    type="button"
                    className="btn-ghost admin-reset"
                    onClick={() => onUserFollowReset(user.clientId)}
                  >
                    Reset
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
      Synced to <strong>{adminName}</strong>&apos;s view
    </div>
  );
}
