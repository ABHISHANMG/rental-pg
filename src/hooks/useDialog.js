/**
 * useDialog — imperative access to the in-app ConfirmDialog, replacing native Alert.
 *
 *   const dialog = useDialog();
 *   dialog.alert({ title: 'Saved', message: '…' });
 *   dialog.confirm({ title: 'Delete?', tone: 'danger', confirmLabel: 'Delete', onConfirm });
 *   // render {dialog.node} once in the screen tree.
 */

import React, { useCallback, useState } from 'react';
import ConfirmDialog from '@/components/common/ConfirmDialog';

export function useDialog() {
  const [cfg, setCfg] = useState(null);
  const close = useCallback(() => setCfg(null), []);

  const alert = useCallback((opts) => setCfg({ mode: 'alert', tone: 'primary', ...opts }), []);
  const confirm = useCallback((opts) => setCfg({ mode: 'confirm', tone: 'danger', ...opts }), []);

  const node = (
    <ConfirmDialog
      visible={!!cfg}
      mode={cfg?.mode}
      tone={cfg?.tone}
      icon={cfg?.icon}
      title={cfg?.title}
      message={cfg?.message}
      confirmLabel={cfg?.confirmLabel}
      cancelLabel={cfg?.cancelLabel}
      onClose={() => {
        const c = cfg;
        close();
        c?.onCancel?.();
      }}
      onConfirm={() => {
        const c = cfg;
        close();
        c?.onConfirm?.();
      }}
    />
  );

  return { alert, confirm, close, node };
}
